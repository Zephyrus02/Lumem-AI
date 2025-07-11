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
    *)
        echo "❌ Unsupported platform: $PLATFORM"
        exit 1
        ;;
esac

echo "✅ Build completed for $PLATFORM!"