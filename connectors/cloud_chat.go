package connectors

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Generic request and response structures, adaptable for different providers.

type CloudChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type CloudChatRequest struct {
	Model       string             `json:"model"`
	Messages    []CloudChatMessage `json:"messages"`
	Stream      bool               `json:"stream"`
	MaxTokens   *int               `json:"max_tokens,omitempty"`
	Temperature *float64           `json:"temperature,omitempty"`
	TopP        *float64           `json:"top_p,omitempty"`
}

type CloudChatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// Chat sends a chat request to the specified cloud provider.
func (c *CloudConnector) Chat(model string, message string, config map[string]interface{}) (string, error) {
	switch c.Provider {
	case "openai":
		return c.chatOpenAI(model, message, config)
	case "anthropic":
		return c.chatAnthropic(model, message, config)
	case "google":
		return c.chatGoogle(model, message, config)
	default:
		return "", fmt.Errorf("unsupported provider for chat: %s", c.Provider)
	}
}

func (c *CloudConnector) chatOpenAI(model string, message string, config map[string]interface{}) (string, error) {
	requestBody := CloudChatRequest{
		Model:    model,
		Messages: []CloudChatMessage{{Role: "user", Content: message}},
		Stream:   false,
	}
	// Apply config if provided
	if temp, ok := config["temperature"].(float64); ok {
		requestBody.Temperature = &temp
	}
	if topP, ok := config["top_p"].(float64); ok {
		requestBody.TopP = &topP
	}
	if maxTokens, ok := config["max_tokens"].(int); ok && maxTokens > 0 {
		requestBody.MaxTokens = &maxTokens
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	return c.sendChatRequest(req)
}

func (c *CloudConnector) chatAnthropic(model string, message string, config map[string]interface{}) (string, error) {
	// Anthropic has a different request structure
	type AnthropicRequest struct {
		Model         string             `json:"model"`
		Messages      []CloudChatMessage `json:"messages"`
		MaxTokens     int                `json:"max_tokens"`
		Temperature   *float64           `json:"temperature,omitempty"`
		TopP          *float64           `json:"top_p,omitempty"`
		TopK          *int               `json:"top_k,omitempty"`
		StopSequences []string           `json:"stop_sequences,omitempty"`
	}
	requestBody := AnthropicRequest{
		Model:     model,
		Messages:  []CloudChatMessage{{Role: "user", Content: message}},
		MaxTokens: 4096, // Default, can be overridden by config
	}
	if max, ok := config["max_tokens"].(int); ok && max > 0 {
		requestBody.MaxTokens = max
	}
	if temp, ok := config["temperature"].(float64); ok {
		requestBody.Temperature = &temp
	}
	if topP, ok := config["top_p"].(float64); ok {
		requestBody.TopP = &topP
	}
	if topK, ok := config["top_k"].(int); ok {
		requestBody.TopK = &topK
	}
	if stop, ok := config["stop"].([]string); ok && len(stop) > 0 {
		requestBody.StopSequences = stop
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	req, _ := http.NewRequest("POST", "https://api.anthropic.com/v1/messages", bytes.NewBuffer(jsonData))
	req.Header.Set("x-api-key", c.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")
	req.Header.Set("Content-Type", "application/json")

	// Custom response handling for Anthropic
	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	var anthropicResp struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
		Error *struct {
			Message string `json:"message"`
		} `json:"error,omitempty"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&anthropicResp); err != nil {
		return "", fmt.Errorf("failed to decode anthropic response: %w", err)
	}

	if anthropicResp.Error != nil {
		return "", fmt.Errorf("anthropic API error: %s", anthropicResp.Error.Message)
	}
	if len(anthropicResp.Content) > 0 {
		return anthropicResp.Content[0].Text, nil
	}

	return "", fmt.Errorf("no response content from anthropic")
}

func (c *CloudConnector) chatGoogle(model string, message string, config map[string]interface{}) (string, error) {
	// Google has a different request structure
	type GoogleRequest struct {
		Contents         []struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"contents"`
		GenerationConfig *struct {
			Temperature     *float64 `json:"temperature,omitempty"`
			TopP            *float64 `json:"topP,omitempty"`
			TopK            *int     `json:"topK,omitempty"`
			MaxOutputTokens *int     `json:"maxOutputTokens,omitempty"`
			StopSequences   []string `json:"stopSequences,omitempty"`
		} `json:"generationConfig,omitempty"`
	}
	requestBody := GoogleRequest{
		Contents: []struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		}{
			{
				Parts: []struct {
					Text string `json:"text"`
				}{
					{Text: message},
				},
			},
		},
	}

	genConfig := struct {
		Temperature     *float64 `json:"temperature,omitempty"`
		TopP            *float64 `json:"topP,omitempty"`
		TopK            *int     `json:"topK,omitempty"`
		MaxOutputTokens *int     `json:"maxOutputTokens,omitempty"`
		StopSequences   []string `json:"stopSequences,omitempty"`
	}{}
	configApplied := false

	if temp, ok := config["temperature"].(float64); ok {
		genConfig.Temperature = &temp
		configApplied = true
	}
	if topP, ok := config["top_p"].(float64); ok {
		genConfig.TopP = &topP
		configApplied = true
	}
	if topK, ok := config["top_k"].(int); ok {
		genConfig.TopK = &topK
		configApplied = true
	}
	if max, ok := config["max_tokens"].(int); ok && max > 0 {
		genConfig.MaxOutputTokens = &max
		configApplied = true
	}
	if stop, ok := config["stop"].([]string); ok && len(stop) > 0 {
		genConfig.StopSequences = stop
		configApplied = true
	}

	if configApplied {
		requestBody.GenerationConfig = &genConfig
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, c.APIKey)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	// Custom response handling for Google
	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read google response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("google API error (%s): %s", resp.Status, string(body))
	}

	var googleResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
			FinishReason string `json:"finishReason"`
		} `json:"candidates"`
		Error *struct {
			Message string `json:"message"`
		} `json:"error,omitempty"`
	}

	if err := json.Unmarshal(body, &googleResp); err != nil {
		return "", fmt.Errorf("failed to decode google response: %w. Response: %s", err, string(body))
	}

	if googleResp.Error != nil {
		return "", fmt.Errorf("google API error: %s", googleResp.Error.Message)
	}
	if len(googleResp.Candidates) > 0 && len(googleResp.Candidates[0].Content.Parts) > 0 {
		return googleResp.Candidates[0].Content.Parts[0].Text, nil
	}

	if len(googleResp.Candidates) > 0 && googleResp.Candidates[0].FinishReason != "" {
		return "", fmt.Errorf("google model finished with reason: '%s'. This can be due to safety filters or an invalid request", googleResp.Candidates[0].FinishReason)
	}

	return "", fmt.Errorf("no response content from google. Raw response: %s", string(body))
}

func (c *CloudConnector) sendChatRequest(req *http.Request) (string, error) {
	client := &http.Client{Timeout: 120 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	var chatResp CloudChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if chatResp.Error != nil {
		return "", fmt.Errorf("API error: %s", chatResp.Error.Message)
	}
	if len(chatResp.Choices) > 0 {
		return chatResp.Choices[0].Message.Content, nil
	}

	return "", fmt.Errorf("no response choices from provider")
}