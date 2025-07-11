#!/bin/bash
set -e

echo "🏗️  Building Lumen AI for macOS only..."

# Clean previous builds
rm -rf build/bin/*

# Build for macOS (Universal Binary)
echo "📱 Building for macOS..."
wails build -platform darwin/universal -clean

# Organize build
mkdir -p build/bin/darwin
if [ -d "build/bin/Lumen AI.app" ]; then
    mv "build/bin/Lumen AI.app" "build/bin/darwin/Lumen-AI.app"
fi

echo "✅ macOS build completed!"