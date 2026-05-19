#!/bin/bash
set -euo pipefail

# Install local LLM inference server on getupsoft-lan
# Supports: Ollama (default), vLLM, or both
# Hardware: 16GB RAM -> can run 3B models (~3GB) or 7B models (~7GB)

TARGET_HOST="${1:-getupsoft-lan}"
INSTALL_METHOD="${2:-ollama}"  # ollama, vllm, or both
MODELS_TO_PULL="${3:-3b}"      # 3b, 7b, or all

echo "=== Local LLM Server Installer ==="
echo "Target: ssh://$TARGET_HOST"
echo "Method: $INSTALL_METHOD"
echo "Models: $MODELS_TO_PULL"
echo ""

# Ollama installation function
install_ollama() {
    echo "[1/3] Installing Ollama on $TARGET_HOST..."
    ssh "$TARGET_HOST" << 'EOF'
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
    echo "Ollama installed"
else
    echo "Ollama already installed at $(ollama --version)"
fi
EOF

    echo "[2/3] Starting Ollama service..."
    ssh "$TARGET_HOST" << 'EOF'
# Ensure systemd service is enabled and started
sudo systemctl enable ollama || true
sudo systemctl start ollama || true
sleep 2
# Verify it's running
curl -s http://localhost:11434/api/tags > /dev/null && echo "Ollama service is running" || echo "Warning: Ollama may not be responding"
EOF

    echo "[3/3] Downloading models..."
    case "$MODELS_TO_PULL" in
        3b)
            echo "Downloading 3B models (good for CPU with 16GB RAM)..."
            ssh "$TARGET_HOST" << 'EOF'
echo "Pulling llama3.2:3b-instruct-q4_K_M (~2GB)..."
ollama pull llama3.2:3b-instruct-q4_K_M
echo "Pulling phi3:mini-4k-instruct-q4 (~2.2GB)..."
ollama pull phi3:mini-4k-instruct-q4
echo "Pulling gemma2:2b-instruct-q4_K_M (~1.6GB)..."
ollama pull gemma2:2b-instruct-q4_K_M
echo "Pulling qwen2.5:3b-instruct-q4_K_M (~2GB)..."
ollama pull qwen2.5:3b-instruct-q4_K_M
EOF
            ;;
        7b)
            echo "Downloading 7B models (use if you have 16GB+ RAM and want better quality)..."
            ssh "$TARGET_HOST" << 'EOF'
echo "Pulling llama2:7b-chat-q4_K_M (~4GB)..."
ollama pull llama2:7b-chat-q4_K_M
echo "Pulling mistral:7b-instruct-q4_K_M (~4.4GB)..."
ollama pull mistral:7b-instruct-q4_K_M
EOF
            ;;
        all)
            echo "Downloading all recommended models..."
            ssh "$TARGET_HOST" << 'EOF'
echo "3B models..."
ollama pull llama3.2:3b-instruct-q4_K_M
ollama pull phi3:mini-4k-instruct-q4
ollama pull gemma2:2b-instruct-q4_K_M
ollama pull qwen2.5:3b-instruct-q4_K_M
echo "7B models..."
ollama pull llama2:7b-chat-q4_K_M
ollama pull mistral:7b-instruct-q4_K_M
EOF
            ;;
    esac
}

# vLLM installation function
install_vllm() {
    echo "[1/2] Installing vLLM on $TARGET_HOST..."
    ssh "$TARGET_HOST" << 'EOF'
# Check if vllm is installed
if ! python3 -c "import vllm" 2>/dev/null; then
    pip install vllm
    echo "vLLM installed"
else
    echo "vLLM already installed"
fi
EOF

    echo "[2/2] Creating systemd service for vLLM (CPU mode)..."
    ssh "$TARGET_HOST" << 'EOF'
cat > /tmp/vllm-service.service << 'SVCEOF'
[Unit]
Description=vLLM Inference Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/tmp
ExecStart=python3 -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Llama-2-7b-chat-hf \
    --device cpu \
    --dtype float32 \
    --host 0.0.0.0 \
    --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF

echo "vLLM service configuration created at /tmp/vllm-service.service"
echo "To install as systemd service, run:"
echo "  sudo cp /tmp/vllm-service.service /etc/systemd/system/"
echo "  sudo systemctl daemon-reload && sudo systemctl enable vllm-service"
EOF
}

# Verify network connectivity
echo "Verifying SSH connectivity to $TARGET_HOST..."
if ! ssh "$TARGET_HOST" "echo ok" > /dev/null 2>&1; then
    echo "Error: Cannot connect to $TARGET_HOST via SSH"
    echo "Make sure:"
    echo "  1. SSH key is configured for $TARGET_HOST"
    echo "  2. Host is reachable on the network"
    exit 1
fi

# Execute installation based on method
case "$INSTALL_METHOD" in
    ollama)
        install_ollama
        ;;
    vllm)
        install_vllm
        ;;
    both)
        install_ollama
        echo ""
        install_vllm
        ;;
    *)
        echo "Error: Unknown install method '$INSTALL_METHOD'"
        echo "Use: ollama, vllm, or both"
        exit 1
        ;;
esac

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Next steps:"
echo "1. Connect to Orca and update environment:"
echo "   export AI_ORCHESTRATOR_CONFIG_PATH=config/models.local-lan.json"
echo ""
if [ "$INSTALL_METHOD" = "ollama" ] || [ "$INSTALL_METHOD" = "both" ]; then
    echo "2. Test Ollama endpoint:"
    echo "   curl http://$TARGET_HOST:11434/api/tags"
    echo ""
fi
if [ "$INSTALL_METHOD" = "vllm" ] || [ "$INSTALL_METHOD" = "both" ]; then
    echo "2. Start vLLM service on $TARGET_HOST and test:"
    echo "   curl http://$TARGET_HOST:8000/v1/models"
    echo ""
fi
echo "3. Run Orca with local models:"
echo "   python -m uvicorn ai_automation_orchestrator.webapp:app --reload"
