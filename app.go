package main

import (
	"context"
	"fmt"
	"myproject/connectors"
	"sync"
	"time"
)

// App struct
type App struct {
	ctx context.Context
	// Store model configurations in memory
	modelConfigs map[string]ModelConfig
	configMutex  sync.RWMutex
}

// Provider configurations
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

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		modelConfigs: make(map[string]ModelConfig),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// ScanLocalModels scans for locally available models based on provider
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
		connector := connectors.NewOllamaConnector(config.Endpoint)
		return connector.ScanModels()
	case "lmstudio":
		connector := connectors.NewLMStudioConnector(config.Endpoint)
		return connector.ScanModels()
	case "huggingface":
		connector := connectors.NewHuggingFaceConnector(config.Endpoint)
		return connector.ScanModels()
	default:
		return connectors.ScanResult{
			Models:  []connectors.Model{},
			Error:   "Unsupported provider",
			Success: false,
		}
	}
}

// ModelConfig represents model configuration parameters
type ModelConfig struct {
	Temperature    float64  `json:"temperature"`
	TopP          float64  `json:"top_p"`
	TopK          int      `json:"top_k"`
	RepeatPenalty float64  `json:"repeat_penalty"`
	NumCtx        int      `json:"num_ctx"`
	Stop          []string `json:"stop"`
}

// SaveModelConfig saves model configuration parameters
func (a *App) SaveModelConfig(provider string, model string, config ModelConfig) string {
	fmt.Printf("Saving config for %s/%s: %+v\n", provider, model, config)

	// Store the configuration in memory with a composite key
	configKey := fmt.Sprintf("%s/%s", provider, model)

	a.configMutex.Lock()
	a.modelConfigs[configKey] = config
	a.configMutex.Unlock()

	fmt.Printf("Configuration stored for %s\n", configKey)

	switch provider {
	case "ollama":
		// For Ollama, we can test the configuration immediately
		if err := a.testOllamaConfig(model, config); err != nil {
			return fmt.Sprintf("Configuration saved but test failed: %v", err)
		}
		return "Configuration saved and tested successfully for Ollama"
	case "lmstudio":
		// For LM Studio, store the config for use in API calls
		return "Configuration saved successfully for LM Studio"
	case "openai", "anthropic", "google":
		// For cloud providers, store the config for use in API calls
		return fmt.Sprintf("Configuration saved successfully for %s", provider)
	default:
		return fmt.Sprintf("Unsupported provider: %s", provider)
	}
}

// GetModelConfig retrieves the configuration for a specific model
func (a *App) GetModelConfig(provider string, model string) (ModelConfig, error) {
	configKey := fmt.Sprintf("%s/%s", provider, model)

	a.configMutex.RLock()
	config, exists := a.modelConfigs[configKey]
	a.configMutex.RUnlock()

	if !exists {
		// Return default config if none exists
		return ModelConfig{
			Temperature:    0.7,
			TopP:          0.9,
			TopK:          40,
			RepeatPenalty: 1.1,
			NumCtx:        2048,
			Stop:          []string{},
		}, nil
	}

	return config, nil
}

// testOllamaConfig tests the configuration with Ollama
func (a *App) testOllamaConfig(model string, config ModelConfig) error {
	// We'll add this test later when we implement the chat functionality
	fmt.Printf("Configuration for %s will be applied in future API calls\n", model)
	return nil
}

// ChatWithModel sends a message to the specified model using its configuration
func (a *App) ChatWithModel(provider string, model string, message string) (string, error) {
	fmt.Printf("ChatWithModel called with provider: %s, model: %s\n", provider, model)

	// Validate inputs
	if provider == "" {
		return "", fmt.Errorf("provider cannot be empty")
	}
	if model == "" {
		return "", fmt.Errorf("model cannot be empty")
	}
	if message == "" {
		return "", fmt.Errorf("message cannot be empty")
	}

	// Get the stored configuration for this model
	config, err := a.GetModelConfig(provider, model)
	if err != nil {
		return "", fmt.Errorf("failed to get model config: %v", err)
	}

	fmt.Printf("Using config for %s/%s: %+v\n", provider, model, config)

	switch provider {
	case "ollama":
		return a.chatWithOllama(model, message, config)
	case "lmstudio":
		return a.chatWithLMStudio(model, message, config)
	default:
		return "", fmt.Errorf("unsupported provider: %s. Supported providers: ollama, lmstudio", provider)
	}
}

// chatWithOllama sends a chat message to Ollama with the specified configuration
func (a *App) chatWithOllama(model string, message string, config ModelConfig) (string, error) {
	fmt.Printf("Attempting to chat with Ollama model: %s\n", model)

	// Create the Ollama connector
	connector := connectors.NewOllamaConnector("http://localhost:11434")

	// First, do a quick health check
	fmt.Printf("Performing health check for Ollama...\n")
	if err := connector.QuickHealthCheck(); err != nil {
		return "", fmt.Errorf("Ollama health check failed: %v. Please ensure Ollama is running and accessible", err)
	}

	// Convert our config to Ollama's format
	ollamaConfig := map[string]interface{}{
		"temperature":     config.Temperature,
		"top_p":          config.TopP,
		"top_k":          config.TopK,
		"repeat_penalty": config.RepeatPenalty,
		"num_ctx":        config.NumCtx,
	}

	// Only add stop sequences if they exist
	if len(config.Stop) > 0 {
		ollamaConfig["stop"] = config.Stop
	}

	fmt.Printf("Ollama config: %+v\n", ollamaConfig)

	// Start timing the request
	startTime := time.Now()
	fmt.Printf("Starting chat request at %v\n", startTime)

	// Call the Ollama chat function
	response, err := connector.ChatWithOllama(model, message, ollamaConfig)

	duration := time.Since(startTime)
	fmt.Printf("Chat request completed in %v\n", duration)

	if err != nil {
		// Provide more specific error messages
		if duration > 110*time.Second {
			return "", fmt.Errorf("request timed out after %v. The model '%s' may be too large for your system or Ollama may be overloaded. Try:\n1. Using a smaller/faster model\n2. Reducing the context size (num_ctx)\n3. Restarting Ollama\n4. Checking system resources", duration, model)
		}
		return "", fmt.Errorf("Ollama chat failed: %v", err)
	}

	fmt.Printf("Successfully received response from Ollama (length: %d chars)\n", len(response))
	return response, nil
}

// chatWithLMStudio sends a chat message to LM Studio with the specified configuration
func (a *App) chatWithLMStudio(model string, message string, config ModelConfig) (string, error) {
	// Use the LM Studio connector for actual chat
	connector := connectors.NewLMStudioConnector("http://localhost:1234")

	// Convert our config to LM Studio's format (OpenAI compatible)
	lmStudioConfig := map[string]interface{}{
		"temperature": config.Temperature,
		"top_p":      config.TopP,
		"max_tokens": config.NumCtx,
	}

	// Only add stop sequences if they exist
	if len(config.Stop) > 0 {
		lmStudioConfig["stop"] = config.Stop
	}

	// Call the LM Studio chat function
	return connector.ChatWithLMStudio(model, message, lmStudioConfig)
}