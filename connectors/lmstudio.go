package connectors

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

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

// LMStudioConnector handles LM Studio model operations
type LMStudioConnector struct {
    endpoint string
}

// NewLMStudioConnector creates a new LM Studio connector
func NewLMStudioConnector(endpoint string) *LMStudioConnector {
    return &LMStudioConnector{
        endpoint: endpoint,
    }
}

// ScanModels scans for available LM Studio models
func (c *LMStudioConnector) ScanModels() ScanResult {
    client := &http.Client{
        Timeout: 10 * time.Second,
    }

    url := c.endpoint + "/v1/models"
    fmt.Printf("Scanning LM Studio at: %s\n", url)
    
    resp, err := client.Get(url)
    if err != nil {
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("Cannot connect to LM Studio at %s. Make sure LM Studio is running with a model loaded.", c.endpoint),
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