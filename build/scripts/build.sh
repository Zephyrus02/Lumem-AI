#!/bin/bash
set -e

echo "🏗️  Building Lumen AI for macOS only..."

# Load environment variables from .env file if it exists at the project root
if [ -f ".env" ]; then
    echo "Found .env file, loading environment variables..."
    set -a
    source .env
    set +a
fi

# Clean previous builds
rm -rf build/bin/*

# Build for macOS (Universal Binary)
echo "📱 Building for macOS..."
wails build -platform darwin/universal -clean -ldflags="-X main.buildTimeEncryptionKey=$ENCRYPTION_KEY"

# Organize build
mkdir -p build/bin/darwin
if [ -d "build/bin/Lumen AI.app" ]; then
    mv "build/bin/Lumen AI.app" "build/bin/darwin/Lumen-AI.app"
fi

echo "✅ macOS build completed!"