package connectors

import (
	"fmt"
	"net/http"
	"time"
)

// CheckConnectivity performs a quick health check on the given endpoint
func CheckConnectivity(endpoint string, healthPath string) error {
    client := &http.Client{
        Timeout: 3 * time.Second,
    }
    
    url := endpoint + healthPath
    resp, err := client.Get(url)
    if err != nil {
        return fmt.Errorf("connection failed: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode >= 400 {
        return fmt.Errorf("server returned HTTP %d", resp.StatusCode)
    }
    
    return nil
}