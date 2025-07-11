package main

import (
	"embed"
	"fmt"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	// Check if the app was launched via a deep link
	if len(os.Args) > 1 && strings.HasPrefix(os.Args[1], "lumenai://") {
		handleDeepLink(os.Args[1], app)
	}

	err := wails.Run(&options.App{
		Title:  "Lumen AI",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

// Parse and handle the deep link
func handleDeepLink(uri string, app *App) {
    fmt.Println("📦 Deep link received:", uri)
    if strings.HasPrefix(uri, "lumenai://auth-callback?token=") {
        token := strings.TrimPrefix(uri, "lumenai://auth-callback?token=")
        app.SetAuthToken(token)
        fmt.Println("✅ Stored token from deep link:", token)
    }
}
