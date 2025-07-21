# Lumen AI - Illuminate your digital world with AI at your fingertips.

<div align="center">
  <img src="https://img.shields.io/badge/Built%20with-Wails-blue?style=for-the-badge&logo=go" alt="Built with Wails">
  <img src="https://img.shields.io/badge/Frontend-React%20TypeScript-61DAFB?style=for-the-badge&logo=react" alt="React TypeScript">
  <img src="https://img.shields.io/badge/Backend-Go-00ADD8?style=for-the-badge&logo=go" alt="Go Backend">
  <img src="https://img.shields.io/badge/Platform-Desktop-success?style=for-the-badge" alt="Desktop Platform">
</div>

## 🌟 Overview

Lumen AI is a powerful, native desktop application that brings AI-powered coding assistance directly to your workflow. Built with modern web technologies and packaged as a native desktop app using Wails, Lumen provides seamless integration with both local and cloud-based AI models for enhanced developer productivity.

## ✨ Key Features

### 🤖 AI Model Integration
- **Local Model Support**: Connect to Ollama and LM Studio for privacy-focused, offline AI assistance
- **Cloud Model Support**: Integrate with OpenAI (GPT), Anthropic (Claude), and Google (Gemini) APIs
- **Real-time Model Scanning**: Automatically detect and connect to available local models
- **Dynamic Model Configuration**: Customize temperature, top-p, context length, and other parameters per model

### 💬 Advanced Chat Interface
- **Multi-Model Conversations**: Switch between different AI models within the same conversation
- **File Attachment Support**: Upload and discuss code files, documents, and other content
- **Conversation Management**: Organize, save, and revisit previous conversations
- **Real-time Response Streaming**: See AI responses as they're generated
- **Thinking Process Filtering**: Automatically clean and format AI responses

### ⚙️ Comprehensive Settings
- **AI Assistant Configuration**: Fine-tune AI behavior and suggestion levels
- **Editor Preferences**: Customize font size, themes, tab size, and word wrap
- **Interface Customization**: Adjust dock position, animations, and accent colors
- **Keyboard Shortcuts**: Full customization of editor and application shortcuts
- **Privacy Controls**: Manage data collection, telemetry, and AI training preferences

### 🔧 Model Configuration
- **Parameter Tuning**: Adjust creativity vs consistency with temperature and top-p controls
- **Context Management**: Configure context window sizes for optimal performance
- **Stop Sequences**: Set custom stop patterns for better response control
- **Real-time Testing**: Test configuration changes immediately

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful translucent interface with backdrop blur effects
- **Smooth Animations**: Framer Motion-powered transitions and micro-interactions
- **Responsive Layout**: Adaptive interface that works on various screen sizes
- **Dark Theme**: Eye-friendly dark interface with gradient accents
- **Collapsible Sidebar**: Maximize workspace when needed

## 🚀 Quick Start

### Download & Install

1. **Go to Releases**
   - Visit our [GitHub Releases page](https://github.com/Zephyrus02/Lumem-AI/releases)
   - Download the latest version for your operating system
   
   **macOS** 📱
   ```
   Download: Lumen-AI-v1.0.0.dmg
   Install: Double-click the DMG and drag Lumen to Applications
   ```

### First Time Setup

1. **Launch Lumen**: Start the application after installation
2. **Connect Models**: Navigate to "Connect Models" to set up your AI providers
   - For **Local Models**: Ensure Ollama or LM Studio is running
   - For **Cloud Models**: Add your API keys (OpenAI, Anthropic, Google)
3. **Configure Settings**: Customize your experience in the Settings panel
4. **Start Chatting**: Begin your first conversation with an AI model

### Prerequisites for Local Models

**For Ollama Support:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull your first model
ollama pull llama3.2
```

**For LM Studio Support:**
- Download and install [LM Studio](https://lmstudio.ai/)
- Load a model and start the local server on port 1234

## 🔌 Supported AI Providers

### Local Providers 🏠
- **Ollama**: Connect to locally running Ollama instance
  - Automatic model detection
  - Support for all Ollama-compatible models
  - Custom parameter configuration
  
- **LM Studio**: Integration with LM Studio's local server
  - OpenAI-compatible API support
  - Model switching capabilities
  - Custom inference parameters

### Cloud Providers ☁️
- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku
- **Google**: Gemini 2.0 Flash, Gemini 1.5 Pro

## 🛠️ For Developers

Want to contribute or build from source? Here's how:

### Prerequisites
- Go 1.18 or later
- Node.js 16 or later
- Wails v2 CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/lumen-ai.git
cd lumen-ai

# Install dependencies
go mod tidy
cd frontend && npm install && cd ..

# Run in development mode
wails dev

# Build for production
wails build
```

## 🎯 Use Cases

### For Developers 👨‍💻
- **Code Review**: Get AI assistance for code optimization and bug detection
- **Documentation**: Generate comments and documentation for your code
- **Learning**: Ask questions about programming concepts and best practices
- **Debugging**: Get help troubleshooting complex issues

### For Teams 👥
- **Knowledge Sharing**: Centralized AI assistance for team collaboration
- **Code Standards**: Consistent coding practices with AI guidance
- **Onboarding**: Help new team members learn codebases faster

### For Privacy-Conscious Users 🔐
- **Local Processing**: Keep sensitive code on your machine with local models
- **No Data Sharing**: Option to disable telemetry and data collection
- **Offline Capability**: Work without internet connection using local models

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.13+, Linux (Ubuntu 18.04+)
- **RAM**: 4GB (8GB recommended for local models)
- **Storage**: 500MB for application, additional space for local models
- **Network**: Internet connection for cloud models (optional for local models)

### Recommended Specifications
- **RAM**: 16GB+ for optimal local model performance
- **CPU**: Multi-core processor for faster AI inference
- **GPU**: CUDA/Metal support for accelerated local models

## 🔒 Privacy & Security

- **Local First**: Support for completely offline AI models
- **Data Control**: Granular controls over data collection and sharing
- **No Logging**: Conversations stay on your device by default
- **Secure API**: Encrypted communication with cloud providers
- **Session Management**: Configurable session timeouts and device management

### AI Behavior
- Temperature and creativity controls
- Response length preferences
- Context window management
- Custom stop sequences

## 🐛 Troubleshooting

### Installation Issues

**macOS: "App can't be opened because it is from an unidentified developer"**
```bash
# Allow the app to run
sudo xattr -r -d com.apple.quarantine /Applications/Lumen.app
```

### Common Runtime Issues

**Ollama Connection Failed**
```bash
# Ensure Ollama is running
ollama serve

# Check available models
ollama list

# Pull a model if none exist
ollama pull llama3.2
```

**LM Studio Connection Issues**
- Ensure LM Studio server is running on port 1234
- Verify a model is loaded in LM Studio
- Check firewall settings

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute
- 🐛 **Report Bugs**: Found an issue? [Open an issue](https://github.com/Zephyrus02/Lumem-AI/issues)
- 💡 **Feature Requests**: Have ideas? [Start a discussion](https://github.com/Zephyrus02/Lumem-AI/discussions)
- 📖 **Documentation**: Help improve our docs
- 🔧 **Code**: Submit pull requests with improvements

### Development Process
```bash
# Fork the repository on GitHub
# Clone your fork
git https://github.com/Zephyrus02/Lumem-AI.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and test
wails dev

# Commit your changes
git commit -m "Add amazing feature"

# Push to your fork and submit a pull request
git push origin feature/amazing-feature
```



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Wails](https://wails.io/) for the amazing desktop app framework
- [Ollama](https://ollama.ai/) for local AI model support
- [LM Studio](https://lmstudio.ai/) for local model inference
- The open-source community for inspiration and contributions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Zephyrus02/Lumem-AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Zephyrus02/Lumem-AI/discussions)
- **Documentation**: [docs.lumen-ai.com](https://docs.lumen-ai.com)

---

<div align="center">
  <p>Built with ❤️ by the Aneesh Raskar</p>
  <p>⭐ Star this project if you find it useful!</p>
  
  **[Download Latest Release](https://github.com/Zephyrus02/Lumem-AI/releases/latest)**
</div>