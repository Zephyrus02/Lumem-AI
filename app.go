package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// App struct
type App struct {
    ctx context.Context
}

// Model represents a local model
type Model struct {
    Name     string `json:"name"`
    Size     string `json:"size,omitempty"`
    Modified string `json:"modified,omitempty"`
}

// ScanResult represents the result of model scanning
type ScanResult struct {
    Models  []Model `json:"models"`
    Error   string  `json:"error,omitempty"`
    Success bool    `json:"success"`
}

// OllamaModel represents Ollama API response structure
type OllamaModel struct {
    Name       string `json:"name"`
    Size       int64  `json:"size"`
    ModifiedAt string `json:"modified_at"`
}

// OllamaResponse represents Ollama API response
type OllamaResponse struct {
    Models []OllamaModel `json:"models"`
}

// LMStudioModel represents LM Studio API response structure (OpenAI compatible)
type LMStudioModel struct {
    ID      string `json:"id"`
    Object  string `json:"object"`
    Created int64  `json:"created"`
    OwnedBy string `json:"owned_by"`
}

// LMStudioResponse represents LM Studio API response
type LMStudioResponse struct {
    Object string          `json:"object"`
    Data   []LMStudioModel `json:"data"`
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
    "docker": {
        Endpoint: "http://localhost:8080",
        APIPath:  "/models",
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
func (a *App) ScanLocalModels(provider string) ScanResult {
    switch provider {
    case "ollama":
        config := providerConfigs[provider]
        return a.scanOllamaModels(config.Endpoint)
    case "lmstudio":
        config := providerConfigs[provider]
        return a.scanLMStudioModels(config.Endpoint)
    case "docker":
        return a.scanDockerModels()
    case "huggingface":
        return a.scanHuggingFaceModels()
    default:
        return ScanResult{
            Models:  []Model{},
            Error:   "Unsupported provider",
            Success: false,
        }
    }
}

// scanOllamaModels scans for Ollama models
func (a *App) scanOllamaModels(endpoint string) ScanResult {
    client := &http.Client{
        Timeout: 10 * time.Second,
    }

    url := endpoint + "/api/tags"
    resp, err := client.Get(url)
    if err != nil {
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("Cannot connect to Ollama at %s. Make sure Ollama is running.", endpoint),
            Success: false,
        }
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("HTTP %d: %s", resp.StatusCode, resp.Status),
            Success: false,
        }
    }

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return ScanResult{
            Models:  []Model{},
            Error:   "Failed to read response body",
            Success: false,
        }
    }

    var ollamaResp OllamaResponse
    if err := json.Unmarshal(body, &ollamaResp); err != nil {
        return ScanResult{
            Models:  []Model{},
            Error:   "Failed to parse response",
            Success: false,
        }
    }

    var models []Model
    for _, model := range ollamaResp.Models {
        models = append(models, Model{
            Name:     model.Name,
            Size:     formatBytes(model.Size),
            Modified: formatDate(model.ModifiedAt),
        })
    }

    return ScanResult{
        Models:  models,
        Success: true,
    }
}

// scanLMStudioModels scans for LM Studio models via API
func (a *App) scanLMStudioModels(endpoint string) ScanResult {
    client := &http.Client{
        Timeout: 10 * time.Second,
    }

    url := endpoint + "/v1/models"
    fmt.Printf("Scanning LM Studio at: %s\n", url)
    
    resp, err := client.Get(url)
    if err != nil {
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("Cannot connect to LM Studio at %s. Make sure LM Studio is running with a model loaded.", endpoint),
            Success: false,
        }
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("HTTP %d: %s. Make sure a model is loaded in LM Studio.", resp.StatusCode, resp.Status),
            Success: false,
        }
    }

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return ScanResult{
            Models:  []Model{},
            Error:   "Failed to read response body",
            Success: false,
        }
    }

    fmt.Printf("LM Studio API response: %s\n", string(body))

    var lmStudioResp LMStudioResponse
    if err := json.Unmarshal(body, &lmStudioResp); err != nil {
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("Failed to parse response: %s", err.Error()),
            Success: false,
        }
    }

    if len(lmStudioResp.Data) == 0 {
        return ScanResult{
            Models:  []Model{},
            Error:   "No models loaded in LM Studio. Please load a model in LM Studio first.",
            Success: false,
        }
    }

    var models []Model
    for _, model := range lmStudioResp.Data {
        models = append(models, Model{
            Name: model.ID,
        })
    }

    fmt.Printf("Found %d LM Studio models\n", len(models))

    return ScanResult{
        Models:  models,
        Success: true,
    }
}

// scanDockerModels scans for Docker-based models (placeholder implementation)
func (a *App) scanDockerModels() ScanResult {
    // This is a placeholder - you'll need to implement based on your Docker setup
    return ScanResult{
        Models:  []Model{},
        Error:   "Docker model scanning not yet implemented",
        Success: false,
    }
}

// scanHuggingFaceModels scans for Hugging Face models (placeholder implementation)
func (a *App) scanHuggingFaceModels() ScanResult {
    // This is a placeholder - you'll need to implement based on your HF setup
    return ScanResult{
        Models:  []Model{},
        Error:   "Hugging Face model scanning not yet implemented",
        Success: false,
    }
}

// formatBytes converts bytes to human readable format
func formatBytes(bytes int64) string {
    if bytes == 0 {
        return "0 Bytes"
    }

    const unit = 1024
    if bytes < unit {
        return fmt.Sprintf("%d Bytes", bytes)
    }

    div, exp := int64(unit), 0
    for n := bytes / unit; n >= unit; n /= unit {
        div *= unit
        exp++
    }

    sizes := []string{"Bytes", "KB", "MB", "GB", "TB"}
    return fmt.Sprintf("%.2f %s", float64(bytes)/float64(div), sizes[exp+1])
}

// formatDate formats the date string
func formatDate(dateStr string) string {
    if dateStr == "" {
        return ""
    }

    // Parse and format the date - adjust format as needed
    if t, err := time.Parse(time.RFC3339, dateStr); err == nil {
        return t.Format("2006-01-02")
    }

    return dateStr
}