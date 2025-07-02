package connectors

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// LMStudioChatRequest represents the request structure for LM Studio chat API (OpenAI compatible)
type LMStudioChatRequest struct {
	Model       string                 `json:"model"`
	Messages    []LMStudioMessage      `json:"messages"`
	Stream      bool                   `json:"stream"`
	Temperature *float64               `json:"temperature,omitempty"`
	TopP        *float64               `json:"top_p,omitempty"`
	MaxTokens   *int                   `json:"max_tokens,omitempty"`
	Stop        []string               `json:"stop,omitempty"`
}

type LMStudioMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// LMStudioChatResponse represents the response structure for LM Studio chat API
type LMStudioChatResponse struct {
	Choices []LMStudioChoice `json:"choices"`
	Error   *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error,omitempty"`
}

type LMStudioChoice struct {
	Message      LMStudioMessage `json:"message"`
	FinishReason string          `json:"finish_reason"`
}

// ChatWithLMStudio sends a chat request to LM Studio with specific parameters
func (c *LMStudioConnector) ChatWithLMStudio(model string, message string, config map[string]interface{}) (string, error) {
	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	// Prepare the request payload
	requestBody := LMStudioChatRequest{
		Model: model,
		Messages: []LMStudioMessage{
			{
				Role:    "user",
				Content: message,
			},
		},
		Stream: false,
	}

	// Add configuration options
	if temp, ok := config["temperature"].(float64); ok {
		requestBody.Temperature = &temp
	}
	if topP, ok := config["top_p"].(float64); ok {
		requestBody.TopP = &topP
	}
	if maxTokens, ok := config["max_tokens"].(int); ok {
		requestBody.MaxTokens = &maxTokens
	}
	if stop, ok := config["stop"].([]string); ok && len(stop) > 0 {
		requestBody.Stop = stop
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	url := c.endpoint + "/v1/chat/completions"
	fmt.Printf("Sending chat request to LM Studio at: %s\n", url)
	fmt.Printf("Request body: %s\n", string(jsonData))

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request to LM Studio: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("LM Studio API error (HTTP %d): %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	var chatResp LMStudioChatResponse
	if err := json.Unmarshal(body, &chatResp); err != nil {
		return "", fmt.Errorf("failed to parse response: %v", err)
	}

	if chatResp.Error != nil {
		return "", fmt.Errorf("LM Studio error: %s", chatResp.Error.Message)
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("no response from LM Studio")
	}

	return chatResp.Choices[0].Message.Content, nil
}