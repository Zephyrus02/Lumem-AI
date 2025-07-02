package connectors

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// HuggingFaceModel represents Hugging Face API response structure
type HuggingFaceModel struct {
    ID         string `json:"id"`
    ModelIndex string `json:"model_index,omitempty"`
    Object     string `json:"object"`
    Created    int64  `json:"created"`
    OwnedBy    string `json:"owned_by"`
}

// HuggingFaceResponse represents Hugging Face API response
type HuggingFaceResponse struct {
    Object string             `json:"object"`
    Data   []HuggingFaceModel `json:"data"`
}

// HuggingFaceConnector handles Hugging Face model operations
type HuggingFaceConnector struct {
    endpoint string
}

// NewHuggingFaceConnector creates a new Hugging Face connector
func NewHuggingFaceConnector(endpoint string) *HuggingFaceConnector {
    return &HuggingFaceConnector{
        endpoint: endpoint,
    }
}

// ScanModels scans for available Hugging Face models
func (c *HuggingFaceConnector) ScanModels() ScanResult {
    client := &http.Client{
        Timeout: 10 * time.Second,
    }

    url := c.endpoint + "/models"
    fmt.Printf("Scanning Hugging Face at: %s\n", url)
    
    resp, err := client.Get(url)
    if err != nil {
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("Cannot connect to Hugging Face at %s. Make sure your Hugging Face service is running.", c.endpoint),
            Success: false,
        }
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("HTTP %d: %s. Make sure your Hugging Face service is properly configured.", resp.StatusCode, resp.Status),
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

    fmt.Printf("Hugging Face API response: %s\n", string(body))

    var hfResp HuggingFaceResponse
    if err := json.Unmarshal(body, &hfResp); err != nil {
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("Failed to parse response: %s", err.Error()),
            Success: false,
        }
    }

    if len(hfResp.Data) == 0 {
        return ScanResult{
            Models:  []Model{},
            Error:   "No models available in Hugging Face service. Make sure models are loaded.",
            Success: false,
        }
    }

    var models []Model
    for _, model := range hfResp.Data {
        models = append(models, Model{
            Name: model.ID,
        })
    }

    fmt.Printf("Found %d Hugging Face models\n", len(models))

    return ScanResult{
        Models:  models,
        Success: true,
    }
}