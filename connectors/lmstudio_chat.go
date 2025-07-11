package connectors

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
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

// cleanModelResponse removes thinking tags and other unwanted content from model responses
func cleanModelResponse(response string) string {
	// Remove <think>...</think> blocks (multiline)
	thinkRegex := regexp.MustCompile(`(?s)<think>.*?</think>`)
	cleaned := thinkRegex.ReplaceAllString(response, "")

	// Remove other common thinking patterns - using Go-compatible regex
	patterns := []string{
		`(?s)<thinking>.*?</thinking>`,     // <thinking> tags
		`(?s)<thought>.*?</thought>`,       // <thought> tags
		`(?s)<reasoning>.*?</reasoning>`,   // <reasoning> tags
		`(?s)\[thinking\].*?\[/thinking\]`, // [thinking] tags
		`(?s)\[thought\].*?\[/thought\]`,   // [thought] tags
		`(?s)<!-- thinking:.*?-->`,         // HTML comment thinking
	}

	for _, pattern := range patterns {
		regex := regexp.MustCompile(pattern)
		cleaned = regex.ReplaceAllString(cleaned, "")
	}

	// Handle lines starting with "Thinking:" or "Let me think" - using line-by-line approach
	lines := strings.Split(cleaned, "\n")
	filteredLines := make([]string, 0, len(lines))
	skipUntilBlank := false

	for _, line := range lines {
		trimmedLine := strings.TrimSpace(line)

		// Check if this line starts a thinking block
		if strings.HasPrefix(strings.ToLower(trimmedLine), "thinking:") ||
			strings.HasPrefix(strings.ToLower(trimmedLine), "let me think") {
			skipUntilBlank = true
			continue
		}

		// If we're in skip mode, continue until we hit a blank line or uppercase letter start
		if skipUntilBlank {
			if trimmedLine == "" {
				skipUntilBlank = false
				continue
			}
			// Check if line starts with uppercase (likely new paragraph/section)
			if len(trimmedLine) > 0 && trimmedLine[0] >= 'A' && trimmedLine[0] <= 'Z' {
				skipUntilBlank = false
				filteredLines = append(filteredLines, line)
			}
			continue
		}

		filteredLines = append(filteredLines, line)
	}

	cleaned = strings.Join(filteredLines, "\n")

	// Clean up extra whitespace and newlines
	cleaned = strings.TrimSpace(cleaned)

	// Remove multiple consecutive newlines
	multiNewlineRegex := regexp.MustCompile(`\n{3,}`)
	cleaned = multiNewlineRegex.ReplaceAllString(cleaned, "\n\n")

	return cleaned
}

// ChatWithLMStudio sends a chat request to LM Studio with specific parameters
func (c *LMStudioConnector) ChatWithLMStudio(model string, message string, config map[string]interface{}) (string, error) {
	client := &http.Client{
		Timeout: 300 * time.Second,
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

	rawResponse := chatResp.Choices[0].Message.Content
	fmt.Printf("Raw response from LM Studio: %s\n", rawResponse)

	// Clean the response to remove thinking tags and unwanted content
	cleanedResponse := cleanModelResponse(rawResponse)
	fmt.Printf("Cleaned response: %s\n", cleanedResponse)

	return cleanedResponse, nil
}