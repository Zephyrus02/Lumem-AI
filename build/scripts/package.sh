#!/bin/bash
set -e

VERSION=${1:-"v1.0.0"}
echo "📦 Packaging Lumen AI $VERSION for distribution..."

# Create release directory
mkdir -p build/release

# Package macOS (DMG)
echo "📱 Creating macOS DMG..."
if [ -f "build/bin/darwin/Lumen-AI.app" ] || [ -f "build/bin/darwin/Lumen AI.app" ]; then
    if command -v create-dmg &> /dev/null; then
        create-dmg \
          --volname "Lumen AI Installer" \
          --window-pos 200 120 \
          --window-size 600 400 \
          --icon-size 100 \
          --icon "Lumen*.app" 175 190 \
          --hide-extension "Lumen*.app" \
          --app-drop-link 425 190 \
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
fi

# Package Windows (ZIP)
echo "🪟 Creating Windows package..."
if [ -f "build/bin/windows/Lumen-AI.exe" ] || [ -f "build/bin/windows/Lumen AI.exe" ]; then
    cd build/bin/windows/
    zip -r "../../release/Lumen-AI-${VERSION}-windows-amd64.zip" *.exe
    cd ../../../
else
    echo "❌ Windows build not found!"
fi

# Package Linux (AppImage)
echo "🐧 Creating Linux AppImage..."
if [ -f "build/bin/linux/Lumen-AI" ] || [ -f "build/bin/linux/Lumen AI" ]; then
    ./build/scripts/create-appimage.sh $VERSION
else
    echo "❌ Linux build not found!"
fi

echo "✅ All packages created in build/release/"