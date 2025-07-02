package main

import (
	"context"
	"fmt"
	"myproject/connectors"
)

// App struct
type App struct {
    ctx context.Context
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
    return &App{}
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