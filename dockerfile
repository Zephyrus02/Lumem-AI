FROM golang:1.23-bullseye

# Install build tools, curl, Node.js 18.x, and Wails Linux GUI dependencies
RUN apt-get update && \
    apt-get install -y build-essential curl pkg-config libgtk-3-dev libwebkit2gtk-4.0-dev libglib2.0-dev libgdk-pixbuf2.0-dev libpango1.0-dev libatk1.0-dev libcairo2-dev && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app
COPY . .

RUN npm install --prefix frontend
RUN go install github.com/wailsapp/wails/v2/cmd/wails@latest
RUN wails build