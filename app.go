package main

import (
	"context"
	"fmt"
	"myproject/connectors"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx           context.Context
	modelConfigs  map[string]ModelConfig
	configMutex   sync.RWMutex
	authToken     string
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
	return &App{
		modelConfigs: make(map[string]ModelConfig),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

//export StartLogin
//export StartLogin
func (a *App) StartLogin() {
    loginURL := "https://lumen-website-mauve.vercel.app/login?desktop=1"
    fmt.Println("Opening login URL:", loginURL)
    runtime.BrowserOpenURL(a.ctx, loginURL)
}


// Store the token from the deep link
func (a *App) SetAuthToken(token string) {
	fmt.Println("🔐 Clerk token stored:", token)
	a.authToken = token
}

//export GetAuthToken
func (a *App) GetAuthToken() string {
	return a.authToken
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
	default:
		return "", fmt.Errorf("unsupported provider: %s", provider)
	}
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
