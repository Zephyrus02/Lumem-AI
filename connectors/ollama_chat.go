package connectors

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// OllamaChatRequest represents the request structure for Ollama chat API
type OllamaChatRequest struct {
	Model   string                 `json:"model"`
	Prompt  string                 `json:"prompt"`
	Stream  bool                   `json:"stream"`
	Options map[string]interface{} `json:"options,omitempty"`
}

// OllamaChatResponse represents the response structure for Ollama chat API
type OllamaChatResponse struct {
	Response string `json:"response"`
	Done     bool   `json:"done"`
	Error    string `json:"error,omitempty"`
}

// ChatWithOllama sends a chat request to Ollama with specific parameters
func (c *OllamaConnector) ChatWithOllama(model string, message string, config map[string]interface{}) (string, error) {
	// Increase timeout significantly for chat operations
	client := &http.Client{
		Timeout: 120 * time.Second, // 2 minutes timeout
	}

	// Prepare the request payload
	requestBody := OllamaChatRequest{
		Model:   model,
		Prompt:  message,
		Stream:  false,
		Options: config,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	url := c.endpoint + "/api/generate"
	fmt.Printf("Sending chat request to Ollama at: %s\n", url)
	fmt.Printf("Request payload: %s\n", string(jsonData))

	// Create request with custom context for better timeout control
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Send the request
	fmt.Printf("Sending request to Ollama with model: %s\n", model)
	resp, err := client.Do(req)
	if err != nil {
		// Check if it's a timeout error
		if ctx.Err() == context.DeadlineExceeded {
			return "", fmt.Errorf("request timed out after 2 minutes. The model '%s' may be too large or your system may be under heavy load. Try using a smaller model or increasing system resources", model)
		}
		return "", fmt.Errorf("failed to send request to Ollama: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Ollama API error (HTTP %d): %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	fmt.Printf("Ollama response: %s\n", string(body))

	var chatResp OllamaChatResponse
	if err := json.Unmarshal(body, &chatResp); err != nil {
		return "", fmt.Errorf("failed to parse response: %v", err)
	}

	if chatResp.Error != "" {
		return "", fmt.Errorf("Ollama error: %s", chatResp.Error)
	}

	if chatResp.Response == "" {
		return "", fmt.Errorf("received empty response from Ollama")
	}

	return chatResp.Response, nil
}

