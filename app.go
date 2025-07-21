package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"myproject/connectors"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/joho/godotenv"
)

//go:embed version.json
var versionJSON []byte

// VersionInfo matches the structure of version.json
type VersionInfo struct {
	Version     string `json:"version"`
	BuildNumber int    `json:"buildNumber"`
	ReleaseDate string `json:"releaseDate"`
}

// AppInfo holds metadata about the application state.
type AppInfo struct {
	Version        string    `json:"version"`
	BuildNumber    int       `json:"buildNumber"`
	ReleaseDate    string    `json:"releaseDate"`
	InstallDate    time.Time `json:"install_date"`
	LastUpdateDate time.Time `json:"last_update_date"`
}

// AppConfig defines the structure of our configuration file.
type AppConfig struct {
	AppDetails   AppInfo              `json:"app_details"`
	CloudAPIKeys map[string]string    `json:"cloud_api_keys"`
	ModelConfigs map[string]ModelConfig `json:"model_configs"`
}

type App struct {
	ctx           context.Context
	configMutex   sync.RWMutex
	configPath    string
	encryptionKey string

	// In-memory representation of the config
	appInfo      AppInfo
	cloudAPIKeys map[string]string
	modelConfigs map[string]ModelConfig
}

type ProviderConfig struct {
	Endpoint string
	APIPath  string
}

var providerConfigs = map[string]ProviderConfig{
	"ollama": {
		Endpoint: "http://localhost:11434",
		APIPath:  "/api/tags",
	},
	"lmstudio": {
		Endpoint: "http://localhost:1234",
		APIPath:  "/v1/models",
	},
	"huggingface": {
		Endpoint: "http://localhost:8000",
		APIPath:  "/models",
	},
}

func NewApp() *App {
	// Load .env file from the root directory.
	// It's okay if it fails, we'll have a fallback.
	err := godotenv.Load()
	if err != nil {
		log.Println("Info: .env file not found. This is normal for production builds.")
	}

	// Get encryption key from environment variable.
	// It MUST be 32 bytes for AES-256.
	encryptionKey := os.Getenv("ENCRYPTION_KEY")
	if len(encryptionKey) != 32 {
		log.Fatalf("Fatal: ENCRYPTION_KEY environment variable must be 32 bytes long, but got %d bytes.", len(encryptionKey))
	}

	app := &App{
		encryptionKey: encryptionKey,
	}

	// Determine config path
	home, err := os.UserHomeDir()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Warning: could not find user home directory: %v. Config will not be saved.\n", err)
	} else {
		app.configPath = filepath.Join(home, ".lumen", "config.json")
	}

	return app
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	if err := a.loadConfig(); err != nil {
		fmt.Fprintf(os.Stderr, "Fatal error managing config: %v\n", err)
	}
}

// loadConfig loads the configuration from disk or creates a new one on first launch.
func (a *App) loadConfig() error {
	// Parse the embedded version.json to get current app version details
	var currentVersionInfo VersionInfo
	if err := json.Unmarshal(versionJSON, &currentVersionInfo); err != nil {
		return fmt.Errorf("failed to parse embedded version.json: %w", err)
	}

	if a.configPath == "" {
		a.cloudAPIKeys = make(map[string]string)
		a.modelConfigs = make(map[string]ModelConfig)
		a.appInfo = AppInfo{
			Version:        currentVersionInfo.Version,
			BuildNumber:    currentVersionInfo.BuildNumber,
			ReleaseDate:    currentVersionInfo.ReleaseDate,
			InstallDate:    time.Now(),
			LastUpdateDate: time.Now(),
		}
		return nil
	}

	data, err := os.ReadFile(a.configPath)
	// Handle new installation (config file doesn't exist)
	if os.IsNotExist(err) {
		fmt.Println("No config file found, creating a new one at:", a.configPath)
		a.cloudAPIKeys = make(map[string]string)
		a.modelConfigs = make(map[string]ModelConfig)
		a.appInfo = AppInfo{
			Version:        currentVersionInfo.Version,
			BuildNumber:    currentVersionInfo.BuildNumber,
			ReleaseDate:    currentVersionInfo.ReleaseDate,
			InstallDate:    time.Now(),
			LastUpdateDate: time.Now(),
		}
		return a.saveConfig()
	}
	if err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// Handle existing installation (config file exists)
	var config AppConfig
	if err := json.Unmarshal(data, &config); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: could not parse config file, creating a fresh one: %v\n", err)
		a.cloudAPIKeys = make(map[string]string)
		a.modelConfigs = make(map[string]ModelConfig)
		a.appInfo = AppInfo{
			Version:        currentVersionInfo.Version,
			BuildNumber:    currentVersionInfo.BuildNumber,
			ReleaseDate:    currentVersionInfo.ReleaseDate,
			InstallDate:    time.Now(), // Treat as a new install if config was corrupt
			LastUpdateDate: time.Now(),
		}
		return a.saveConfig()
	}

	// Load existing config into memory
	a.configMutex.Lock()
	a.appInfo = config.AppDetails
	a.cloudAPIKeys = config.CloudAPIKeys
	a.modelConfigs = config.ModelConfigs
	if a.cloudAPIKeys == nil {
		a.cloudAPIKeys = make(map[string]string)
	}
	if a.modelConfigs == nil {
		a.modelConfigs = make(map[string]ModelConfig)
	}
	a.configMutex.Unlock()

	// Check if the app has been updated by comparing build numbers
	if a.appInfo.BuildNumber < currentVersionInfo.BuildNumber {
		fmt.Printf("App updated from v%s (build %d) to v%s (build %d)\n", a.appInfo.Version, a.appInfo.BuildNumber, currentVersionInfo.Version, currentVersionInfo.BuildNumber)
		a.appInfo.Version = currentVersionInfo.Version
		a.appInfo.BuildNumber = currentVersionInfo.BuildNumber
		a.appInfo.ReleaseDate = currentVersionInfo.ReleaseDate
		a.appInfo.LastUpdateDate = time.Now()
		if err := a.saveConfig(); err != nil {
			fmt.Fprintf(os.Stderr, "Error saving updated config: %v\n", err)
		}
	}

	fmt.Println("Configuration loaded from", a.configPath)
	return nil
}

// saveConfig saves the current in-memory configuration to a file on disk.
func (a *App) saveConfig() error {
	if a.configPath == "" {
		return fmt.Errorf("config path not set, cannot save")
	}

	a.configMutex.Lock()
	defer a.configMutex.Unlock()

	a.appInfo.LastUpdateDate = time.Now()

	config := AppConfig{
		AppDetails:   a.appInfo,
		CloudAPIKeys: a.cloudAPIKeys,
		ModelConfigs: a.modelConfigs,
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	dir := filepath.Dir(a.configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	if err := os.WriteFile(a.configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	fmt.Println("Configuration saved to", a.configPath)
	return nil
}

// SaveAPIKey encrypts and saves a cloud provider's API key.
func (a *App) SaveAPIKey(provider string, apiKey string) {
	if apiKey == "" {
		a.configMutex.Lock()
		delete(a.cloudAPIKeys, provider)
		a.configMutex.Unlock()
	} else {
		encryptedKey, err := EncryptString(apiKey, a.encryptionKey)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error encrypting API key for %s: %v\n", provider, err)
			return
		}
		a.configMutex.Lock()
		a.cloudAPIKeys[provider] = encryptedKey
		a.configMutex.Unlock()
	}

	if err := a.saveConfig(); err != nil {
		fmt.Fprintf(os.Stderr, "Error saving config after updating API key: %v\n", err)
	}
}

// GetAPIKey retrieves and decrypts a cloud provider's API key.
func (a *App) GetAPIKey(provider string) (string, error) {
	a.configMutex.RLock()
	encryptedKey, ok := a.cloudAPIKeys[provider]
	a.configMutex.RUnlock()

	if !ok {
		return "", fmt.Errorf("API key for %s not found", provider)
	}
	if encryptedKey == "" {
		return "", nil
	}

	decryptedKey, err := DecryptString(encryptedKey, a.encryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt API key for %s", provider)
	}

	return decryptedKey, nil
}

// Model scanning logic
func (a *App) ScanLocalModels(provider string) connectors.ScanResult {
	config, exists := providerConfigs[provider]
	if !exists {
		return connectors.ScanResult{
			Models:  []connectors.Model{},
			Error:   "Unsupported provider",
			Success: false,
		}
	}

	switch provider {
	case "ollama":
		return connectors.NewOllamaConnector(config.Endpoint).ScanModels()
	case "lmstudio":
		return connectors.NewLMStudioConnector(config.Endpoint).ScanModels()
	case "huggingface":
		return connectors.NewHuggingFaceConnector(config.Endpoint).ScanModels()
	default:
		return connectors.ScanResult{
			Models:  []connectors.Model{},
			Error:   "Unsupported provider",
			Success: false,
		}
	}
}

// ConnectCloudModel tests and saves the API key for a cloud provider.
func (a *App) ConnectCloudModel(provider string, apiKey string) error {
	connector := connectors.NewCloudConnector(provider, apiKey)
	if err := connector.TestConnection(); err != nil {
		return err
	}

	a.configMutex.Lock()
	a.cloudAPIKeys[provider] = apiKey
	a.configMutex.Unlock()

	return nil
}

// ModelConfig defines model parameters
type ModelConfig struct {
	Temperature    float64  `json:"temperature"`
	TopP           float64  `json:"top_p"`
	TopK           int      `json:"top_k"`
	RepeatPenalty  float64  `json:"repeat_penalty"`
	NumCtx         int      `json:"num_ctx"`
	Stop           []string `json:"stop"`
}

func (a *App) SaveModelConfig(provider string, model string, config ModelConfig) string {
	key := fmt.Sprintf("%s/%s", provider, model)
	a.configMutex.Lock()
	a.modelConfigs[key] = config
	a.configMutex.Unlock()

	if err := a.saveConfig(); err != nil {
		fmt.Fprintf(os.Stderr, "Error saving model config: %v\n", err)
	}

	switch provider {
	case "ollama":
		if err := a.testOllamaConfig(model, config); err != nil {
			return fmt.Sprintf("Config saved but test failed: %v", err)
		}
		return "Config saved and tested for Ollama"
	default:
		return fmt.Sprintf("Config saved for %s", provider)
	}
}

func (a *App) GetModelConfig(provider string, model string) (ModelConfig, error) {
	key := fmt.Sprintf("%s/%s", provider, model)
	a.configMutex.RLock()
	config, exists := a.modelConfigs[key]
	a.configMutex.RUnlock()

	if !exists {
		return ModelConfig{
			Temperature:    0.7,
			TopP:           0.9,
			TopK:           40,
			RepeatPenalty:  1.1,
			NumCtx:         2048,
			Stop:           []string{},
		}, nil
	}
	return config, nil
}

func (a *App) ChatWithModel(provider string, model string, message string) (string, error) {
	if provider == "" || model == "" || message == "" {
		return "", fmt.Errorf("missing input")
	}

	config, err := a.GetModelConfig(provider, model)
	if err != nil {
		return "", err
	}

	switch provider {
	case "ollama":
		return a.chatWithOllama(model, message, config)
	case "lmstudio":
		return a.chatWithLMStudio(model, message, config)
	case "openai", "anthropic", "google":
		apiKey, err := a.GetAPIKey(provider)
		if err != nil {
			return "", err
		}
		connector := connectors.NewCloudConnector(provider, apiKey)

		configMap := map[string]interface{}{
			"temperature": config.Temperature,
			"top_p":       config.TopP,
			"top_k":       config.TopK,
			"max_tokens":  config.NumCtx,
			"stop":        config.Stop,
		}

		return connector.Chat(model, message, configMap)
	default:
		return "", fmt.Errorf("unsupported provider: %s", provider)
	}
}

// ListCloudModels lists models for a given cloud provider.
func (a *App) ListCloudModels(provider string, apiKey string) ([]connectors.Model, error) {
    if provider == "" || apiKey == "" {
        return nil, fmt.Errorf("provider and API key are required")
    }
    connector := connectors.NewCloudConnector(provider, apiKey)
    return connector.ListModels()
}

func (a *App) testOllamaConfig(model string, config ModelConfig) error {
	fmt.Printf("Config for %s will be applied in future API calls\n", model)
	return nil
}

func (a *App) chatWithOllama(model string, message string, config ModelConfig) (string, error) {
	connector := connectors.NewOllamaConnector("http://localhost:11434")
	if err := connector.QuickHealthCheck(); err != nil {
		return "", fmt.Errorf("ollama unavailable: %v", err)
	}

	ollamaConfig := map[string]interface{}{
		"temperature":     config.Temperature,
		"top_p":           config.TopP,
		"top_k":           config.TopK,
		"repeat_penalty":  config.RepeatPenalty,
		"num_ctx":         config.NumCtx,
	}
	if len(config.Stop) > 0 {
		ollamaConfig["stop"] = config.Stop
	}

	start := time.Now()
	response, err := connector.ChatWithOllama(model, message, ollamaConfig)
	duration := time.Since(start)

	if err != nil {
		return "", fmt.Errorf("ollama chat failed after %v: %v", duration, err)
	}
	return response, nil
}

func (a *App) chatWithLMStudio(model string, message string, config ModelConfig) (string, error) {
	connector := connectors.NewLMStudioConnector("http://localhost:1234")
	lmStudioConfig := map[string]interface{}{
		"temperature": config.Temperature,
		"top_p":       config.TopP,
	}
	if config.NumCtx > 0 {
		lmStudioConfig["max_tokens"] = config.NumCtx
	}
	if len(config.Stop) > 0 {
		lmStudioConfig["stop"] = config.Stop
	}
	return connector.ChatWithLMStudio(model, message, lmStudioConfig)
}
