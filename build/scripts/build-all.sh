#!/bin/bash
set -e

echo "🏗️  Building Lumen AI for all platforms..."

# Clean previous builds
rm -rf build/bin/*

# Create organized directory structure
mkdir -p build/bin/{darwin,windows,linux}
mkdir -p build/appicon.iconset
mkdir -p build/windows

# Prepare icons for different platforms
echo "🎨 Preparing icons..."

# Check if app.png exists
if [ ! -f "app.png" ]; then
    echo "❌ app.png not found! Please ensure app.png is in the root directory."
    exit 1
fi

# Create iconset for macOS
echo "Creating macOS icon..."
sips -z 16 16 app.png --out build/appicon.iconset/icon_16x16.png
sips -z 32 32 app.png --out build/appicon.iconset/icon_16x16@2x.png
sips -z 32 32 app.png --out build/appicon.iconset/icon_32x32.png
sips -z 64 64 app.png --out build/appicon.iconset/icon_32x32@2x.png
sips -z 128 128 app.png --out build/appicon.iconset/icon_128x128.png
sips -z 256 256 app.png --out build/appicon.iconset/icon_128x128@2x.png
sips -z 256 256 app.png --out build/appicon.iconset/icon_256x256.png
sips -z 512 512 app.png --out build/appicon.iconset/icon_256x256@2x.png
sips -z 512 512 app.png --out build/appicon.iconset/icon_512x512.png
sips -z 1024 1024 app.png --out build/appicon.iconset/icon_512x512@2x.png

# Convert to icns
iconutil -c icns build/appicon.iconset -o build/appicon.icns
echo "✅ macOS icon created: build/appicon.icns"

# Create Windows ICO (if ImageMagick is available)
if command -v convert &> /dev/null; then
    convert app.png -define icon:auto-resize=256,128,64,48,32,16 build/windows/icon.ico
    echo "✅ Windows icon created: build/windows/icon.ico"
else
    echo "⚠️  ImageMagick not found. Windows icon will use default."
fi

# Copy original icon for other uses
cp app.png build/appicon.png

# Build for macOS (Universal Binary) with icon
echo "🍎 Building for macOS..."
wails build -platform darwin/universal -clean

# Check if build was successful and move to organized location
if [ -f "build/bin/Lumen-AI.app" ]; then
    mv "build/bin/Lumen-AI.app" "build/bin/darwin/Lumen-AI.app"
    echo "✅ macOS build completed successfully"
elif [ -f "build/bin/Lumen AI.app" ]; then
    mv "build/bin/Lumen AI.app" "build/bin/darwin/Lumen-AI.app"
    echo "✅ macOS build completed successfully"
else
    echo "❌ macOS build failed - no .app file found"
    echo "Files in build/bin:"
    ls -la build/bin/
fi

echo "✅ Local macOS build completed!"
echo "💡 For Windows and Linux builds, push to GitHub and use the release workflow"