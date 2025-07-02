package connectors

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// OllamaModel represents Ollama API response structure
type OllamaModel struct {
    Name       string `json:"name"`
    Size       int64  `json:"size"`
    ModifiedAt string `json:"modified_at"`
    Digest     string `json:"digest,omitempty"`
    Details    struct {
        Format            string `json:"format,omitempty"`
        Family            string `json:"family,omitempty"`
        Families          []string `json:"families,omitempty"`
        ParameterSize     string `json:"parameter_size,omitempty"`
        QuantizationLevel string `json:"quantization_level,omitempty"`
    } `json:"details,omitempty"`
}

// OllamaResponse represents Ollama API response
type OllamaResponse struct {
    Models []OllamaModel `json:"models"`
}

// OllamaConnector handles Ollama model operations
type OllamaConnector struct {
    endpoint string
}

// NewOllamaConnector creates a new Ollama connector
func NewOllamaConnector(endpoint string) *OllamaConnector {
    return &OllamaConnector{
        endpoint: endpoint,
    }
}

// ScanModels scans for available Ollama models using the API
func (c *OllamaConnector) ScanModels() ScanResult {
    // Create a client with a very short timeout to quickly detect if Ollama is offline
    client := &http.Client{
        Timeout: 3 * time.Second,
    }

    url := c.endpoint + "/api/tags"
    fmt.Printf("Scanning Ollama at: %s\n", url)
    
    // Create request with context for better cancellation
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()
    
    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        fmt.Printf("Error creating Ollama request: %s\n", err.Error())
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("Failed to create request: %s", err.Error()),
            Success: false,
        }
    }
    
    // Add headers to prevent caching
    req.Header.Set("Cache-Control", "no-cache, no-store, must-revalidate")
    req.Header.Set("Pragma", "no-cache")
    req.Header.Set("Expires", "0")
    
    resp, err := client.Do(req)
    if err != nil {
        // More specific error messages based on error type
        errorMsg := fmt.Sprintf("Cannot connect to Ollama at %s. ", c.endpoint)
        
        if strings.Contains(err.Error(), "connection refused") {
            errorMsg += "Connection refused - Ollama is not running. Please start Ollama first."
        } else if strings.Contains(err.Error(), "timeout") || strings.Contains(err.Error(), "context deadline exceeded") {
            errorMsg += "Connection timeout - Ollama may be starting up or not responding."
        } else if strings.Contains(err.Error(), "no such host") {
            errorMsg += "Host not found - check if Ollama is installed and the endpoint is correct."
        } else if strings.Contains(err.Error(), "network is unreachable") {
            errorMsg += "Network unreachable - check your network connection."
        } else {
            errorMsg += fmt.Sprintf("Error: %s", err.Error())
        }
        
        fmt.Printf("Ollama connection error: %s\n", err.Error())
        
        return ScanResult{
            Models:  []Model{},
            Error:   errorMsg,
            Success: false,
        }
    }
    defer resp.Body.Close()

    // Check for HTTP errors
    if resp.StatusCode != http.StatusOK {
        errorMsg := fmt.Sprintf("HTTP %d: %s", resp.StatusCode, resp.Status)
        
        switch resp.StatusCode {
        case 404:
            errorMsg += " - Ollama API endpoint not found. Make sure you're using the correct Ollama version."
        case 500:
            errorMsg += " - Ollama server error. Try restarting Ollama."
        case 503:
            errorMsg += " - Ollama service unavailable. The service may be starting up."
        default:
            if resp.StatusCode >= 500 {
                errorMsg += " - Ollama server is experiencing issues."
            }
        }
        
        fmt.Printf("Ollama HTTP error: %d %s\n", resp.StatusCode, resp.Status)
        
        return ScanResult{
            Models:  []Model{},
            Error:   errorMsg,
            Success: false,
        }
    }

    // Read response body
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        fmt.Printf("Error reading Ollama response body: %s\n", err.Error())
        return ScanResult{
            Models:  []Model{},
            Error:   "Failed to read response from Ollama",
            Success: false,
        }
    }

    // Log the actual response for debugging
    fmt.Printf("Ollama API response: %s\n", string(body))

    // Check if response is empty
    if len(body) == 0 {
        return ScanResult{
            Models:  []Model{},
            Error:   "Received empty response from Ollama API",
            Success: false,
        }
    }

    // Parse JSON response
    var ollamaResp OllamaResponse
    if err := json.Unmarshal(body, &ollamaResp); err != nil {
        fmt.Printf("Error parsing Ollama JSON response: %s\n", err.Error())
        fmt.Printf("Raw response body: %s\n", string(body))
        return ScanResult{
            Models:  []Model{},
            Error:   fmt.Sprintf("Failed to parse Ollama response: %s", err.Error()),
            Success: false,
        }
    }

    // Check if models array exists but is empty
    if len(ollamaResp.Models) == 0 {
        return ScanResult{
            Models:  []Model{},
            Error:   "No models found in Ollama. Pull some models using 'ollama pull <model-name>'",
            Success: false,
        }
    }

    // Convert Ollama models to our standard format
    var models []Model
    for _, model := range ollamaResp.Models {
        formattedModel := Model{
            Name:     model.Name,
            Size:     formatBytes(model.Size),
            Modified: formatDate(model.ModifiedAt),
        }
        models = append(models, formattedModel)
    }

    fmt.Printf("Successfully found %d Ollama models\n", len(models))

    // Return successful result
    return ScanResult{
        Models:  models,
        Success: true,
    }
}

// IsOllamaRunning checks if Ollama service is running
func (c *OllamaConnector) IsOllamaRunning() bool {
    client := &http.Client{
        Timeout: 2 * time.Second,
    }
    
    // Try to hit the root endpoint for a quick health check
    resp, err := client.Get(c.endpoint)
    if err != nil {
        return false
    }
    defer resp.Body.Close()
    
    return resp.StatusCode < 500
}