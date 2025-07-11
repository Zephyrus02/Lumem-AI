#!/bin/bash
set -e

VERSION=${1:-"v1.0.0"}
echo "📦 Packaging Lumen AI $VERSION for macOS..."

# Create release directory
mkdir -p build/release

# Package macOS (DMG)
echo "📱 Creating macOS DMG..."
if [ -d "build/bin/darwin/Lumen-AI.app" ]; then
    if command -v create-dmg &> /dev/null; then
        create-dmg \
        --volname "Lumen AI Installer" \
        --window-pos 200 120 \
        --window-size 600 400 \
        --icon-size 100 \
        --icon "Lumen-AI.app" 175 190 \
        --app-drop-link 425 190 \
        --background "build/assets/dmg-background.png" \
        --hide-extension "Lumen-AI.app" \
        "build/release/Lumen-AI-${VERSION}-darwin-universal.dmg" \
        "build/bin/darwin/"

    else
        echo "create-dmg not found, creating ZIP instead..."
        cd build/bin/darwin/
        zip -r "../../release/Lumen-AI-${VERSION}-darwin-universal.zip" *.app
        cd ../../../
    fi
else
    echo "❌ macOS build not found!"
    exit 1
fi

echo "✅ macOS package created!"