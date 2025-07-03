#!/bin/bash
set -e

echo "🏗️  Building Lumen AI for all platforms..."

# Clean previous builds
rm -rf build/bin/*

# Create organized directory structure
mkdir -p build/bin/{darwin,windows,linux}

# Build for macOS (Universal Binary) - this works fine on macOS
echo "� Building for macOS..."
wails build -platform darwin/universal -clean
if [ -f "build/bin/Lumen AI.app" ]; then
    mv "build/bin/Lumen AI.app" "build/bin/darwin/Lumen-AI.app"
    echo "✅ macOS build completed successfully"
else
    echo "❌ macOS build failed"
fi

# For Windows and Linux, we'll use GitHub Actions or separate build environments
echo "🪟 Skipping Windows build on macOS (use GitHub Actions for cross-platform builds)"
echo "🐧 Skipping Linux build on macOS (use GitHub Actions for cross-platform builds)"

echo "✅ Local macOS build completed!"
echo "💡 For Windows and Linux builds, push to GitHub and use the release workflow"