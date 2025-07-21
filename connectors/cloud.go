package connectors

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// CloudConnector handles API validation for cloud models.
type CloudConnector struct {
	Provider string
	APIKey   string
}

// NewCloudConnector creates a new connector for cloud models.
func NewCloudConnector(provider, apiKey string) *CloudConnector {
	return &CloudConnector{
		Provider: provider,
		APIKey:   apiKey,
	}
}

// TestConnection sends a test request to validate the API key.
func (c *CloudConnector) TestConnection() error {
	switch c.Provider {
	case "openai":
		return c.testOpenAI()
	case "anthropic":
		return c.testAnthropic()
	case "google":
		return c.testGoogle()
	// Add other providers here
	default:
		return fmt.Errorf("unsupported provider: %s", c.Provider)
	}
}

// ListModels fetches the available models from the cloud provider.
func (c *CloudConnector) ListModels() ([]Model, error) {
	switch c.Provider {
	case "openai":
		return c.listOpenAIModels()
	case "anthropic":
		return c.listAnthropicModels()
	case "google":
		return c.listGoogleModels()
	default:
		return nil, fmt.Errorf("unsupported provider for listing models: %s", c.Provider)
	}
}

func (c *CloudConnector) testOpenAI() error {
	req, _ := http.NewRequest("GET", "https://api.openai.com/v1/models", nil)
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	return c.sendTestRequest(req)
}

func (c *CloudConnector) testAnthropic() error {
	req, _ := http.NewRequest("GET", "https://api.anthropic.com/v1/messages", nil)
	req.Header.Set("x-api-key", c.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")
	return c.sendTestRequest(req)
}

func (c *CloudConnector) testGoogle() error {
	// Google uses API keys in the URL, so we'll use a simple list models request
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models?key=%s", c.APIKey)
	req, _ := http.NewRequest("GET", url, nil)
	return c.sendTestRequest(req)
}

func (c *CloudConnector) sendTestRequest(req *http.Request) error {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("API key validation failed with status: %s", resp.Status)
	}
	return nil
}

// --- Model Listing Implementations ---

func (c *CloudConnector) listOpenAIModels() ([]Model, error) {
	req, _ := http.NewRequest("GET", "https://api.openai.com/v1/models", nil)
	req.Header.Set("Authorization", "Bearer "+c.APIKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request to OpenAI: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("OpenAI API error: %s", resp.Status)
	}

	var openAIResp struct {
		Data []struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return nil, fmt.Errorf("failed to decode OpenAI response: %w", err)
	}

	var models []Model
	for _, m := range openAIResp.Data {
		models = append(models, Model{Name: m.ID})
	}
	return models, nil
}

func (c *CloudConnector) listAnthropicModels() ([]Model, error) {
	// Anthropic does not have a public models API. We return a static list.
	// This can be updated if they release a models API endpoint.
	return []Model{
		{Name: "claude-3-opus-20240229"},
		{Name: "claude-3-sonnet-20240229"},
		{Name: "claude-3-haiku-20240307"},
	}, nil
}

func (c *CloudConnector) listGoogleModels() ([]Model, error) {
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models?key=%s", c.APIKey)
	req, _ := http.NewRequest("GET", url, nil)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request to Google: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Google API error: %s", resp.Status)
	}

	var googleResp struct {
		Models []struct {
			Name string `json:"name"`
		} `json:"models"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&googleResp); err != nil {
		return nil, fmt.Errorf("failed to decode Google response: %w", err)
	}

	var models []Model
	for _, m := range googleResp.Models {
		// The name from Google API is "models/gemini-pro", we need to strip "models/"
		modelName := strings.TrimPrefix(m.Name, "models/")
		models = append(models, Model{Name: modelName})
	}
	return models, nil
}