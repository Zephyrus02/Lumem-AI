package connectors

import (
	"fmt"
	"time"
)

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

// ModelConnector interface for all model connectors
type ModelConnector interface {
    ScanModels() ScanResult
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