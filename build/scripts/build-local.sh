#!/bin/bash
# filepath: /Users/aneesh/Desktop/Lumen/build/scripts/build-local.sh
set -e

echo "🏗️  Building Lumen AI for current platform..."

# Clean previous builds
rm -rf build/bin/*

# Detect current platform
PLATFORM=$(uname -s)
case $PLATFORM in
    Darwin)
        echo "📱 Building for macOS..."
        wails build -platform darwin/universal -clean
        mkdir -p build/bin/darwin
        if [ -f "build/bin/Lumen AI.app" ]; then
            mv "build/bin/Lumen AI.app" "build/bin/darwin/Lumen-AI.app"
            echo "✅ macOS build completed"
        fi
        ;;
    Linux)
        echo "🐧 Building for Linux..."
        wails build -platform linux/amd64 -clean
        mkdir -p build/bin/linux
        if [ -f "build/bin/Lumen AI" ]; then
            mv "build/bin/Lumen AI" "build/bin/linux/Lumen-AI"
            echo "✅ Linux build completed"
        fi
        ;;
    MINGW*|MSYS*|CYGWIN*)
        echo "🪟 Building for Windows..."
        wails build -platform windows/amd64 -clean
        mkdir -p build/bin/windows
        if [ -f "build/bin/Lumen AI.exe" ]; then
            mv "build/bin/Lumen AI.exe" "build/bin/windows/Lumen-AI.exe"
            echo "✅ Windows build completed"
        fi
        ;;
    *)
        echo "❌ Unsupported platform: $PLATFORM"
        exit 1
        ;;
esac

echo "✅ Build completed for $PLATFORM!"