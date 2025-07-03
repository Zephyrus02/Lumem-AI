#!/bin/bash
set -e

VERSION=${1:-"v1.0.0"}
APPDIR="build/tmp/Lumen-AI.AppDir"

# Create AppDir structure
mkdir -p "$APPDIR/usr/bin"
mkdir -p "$APPDIR/usr/share/applications"
mkdir -p "$APPDIR/usr/share/icons/hicolor/256x256/apps"

# Copy binary (handle both possible names)
if [ -f "build/bin/linux/Lumen-AI" ]; then
    cp "build/bin/linux/Lumen-AI" "$APPDIR/usr/bin/Lumen-AI"
elif [ -f "build/bin/linux/Lumen AI" ]; then
    cp "build/bin/linux/Lumen AI" "$APPDIR/usr/bin/Lumen-AI"
else
    echo "❌ Linux binary not found!"
    exit 1
fi

# Make binary executable
chmod +x "$APPDIR/usr/bin/Lumen-AI"

# Create desktop file
cat > "$APPDIR/usr/share/applications/lumen-ai.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Lumen AI
Comment=AI-powered coding assistant
Exec=Lumen-AI
Icon=lumen-ai
Categories=Development;Utility;
Terminal=false
EOF

# Copy icon (create a placeholder if missing)
if [ -f "build/assets/icon.png" ]; then
    cp build/assets/icon.png "$APPDIR/usr/share/icons/hicolor/256x256/apps/lumen-ai.png"
elif [ -f "build/appicon.png" ]; then
    cp build/appicon.png "$APPDIR/usr/share/icons/hicolor/256x256/apps/lumen-ai.png"
else
    echo "Warning: No icon found, creating placeholder"
    # Create a simple placeholder icon
    convert -size 256x256 xc:transparent -fill "#4F46E5" -draw "circle 128,128 128,200" "$APPDIR/usr/share/icons/hicolor/256x256/apps/lumen-ai.png" 2>/dev/null || echo "ImageMagick not available, skipping icon"
fi

# Create AppRun
cat > "$APPDIR/AppRun" << 'EOF'
#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export PATH="${HERE}/usr/bin/:${PATH}"
exec "${HERE}/usr/bin/Lumen-AI" "$@"
EOF
chmod +x "$APPDIR/AppRun"

# Download appimagetool if not exists
if [ ! -f "build/tools/appimagetool" ]; then
    mkdir -p build/tools
    wget -O build/tools/appimagetool "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage"
    chmod +x build/tools/appimagetool
fi

# Create release directory
mkdir -p build/release

# Create AppImage
ARCH=x86_64 build/tools/appimagetool "$APPDIR" "build/release/Lumen-AI-${VERSION}-linux-amd64.AppImage"

# Cleanup
rm -rf build/tmp

echo "✅ Linux AppImage created successfully"