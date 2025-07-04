#!/bin/bash

set -e  # Exit on any error

echo "🚀 Setting up Aurora Organics Project..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed."
    exit 1
fi

# Install uv if not present
if ! command -v uv &> /dev/null; then
    print_status "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # Add uv to PATH for current session
    export PATH="$HOME/.cargo/bin:$PATH"
    
    # Verify installation
    if ! command -v uv &> /dev/null; then
        print_error "Failed to install uv. Please install it manually: https://docs.astral.sh/uv/getting-started/installation/"
        exit 1
    fi
    print_status "uv installed successfully!"
else
    print_status "uv is already installed"
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Setup backend virtual environment
setup_backend_env() {
    print_status "Setting up Django backend environment..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Generate lock file if it doesn't exist or is empty
    if [ ! -s "uv.lock" ]; then
        print_status "Generating uv.lock for backend..."
        uv lock
    fi
    
    # Create virtual environment only if it doesn't exist
    if [ ! -d ".venv" ]; then
        print_status "Creating backend virtual environment with uv..."
        uv venv .venv
    else
        print_status "Backend virtual environment already exists, skipping creation"
    fi
    
    print_status "Installing backend dependencies..."
    uv sync --no-install-project
    
    print_status "Django backend environment setup complete!"
}

# Setup AI model API virtual environment
setup_ai_model_env() {
    print_status "Setting up AI Model API environment..."
    
    cd "$PROJECT_ROOT/ai-model-api"
    
    # Generate lock file if it doesn't exist or is empty
    if [ ! -s "uv.lock" ]; then
        print_status "Generating uv.lock for AI Model API..."
        uv lock
    fi
    
    # Create virtual environment only if it doesn't exist
    if [ ! -d ".venv" ]; then
        print_status "Creating AI Model API virtual environment with uv..."
        uv venv .venv
    else
        print_status "AI Model API virtual environment already exists, skipping creation"
    fi
    
    print_status "Installing AI Model API dependencies..."
    uv sync --no-install-project
    
    print_status "AI Model API environment setup complete!"
}

# Setup both environments
setup_backend_env
setup_ai_model_env

# Return to project root
cd "$PROJECT_ROOT"

# Create backend activation script
cat > activate_backend.sh << EOF
#!/bin/bash
echo "Activating Django backend environment..."
cd "$PROJECT_ROOT/backend"
source .venv/bin/activate
echo "Django backend environment activated!"
echo "Run server: cd myproject && python manage.py runserver"
echo "To deactivate: deactivate"
EOF
chmod +x activate_backend.sh

# Create AI model activation script
cat > activate_ai_model.sh << EOF
#!/bin/bash
echo "Activating AI Model API environment..."
cd "$PROJECT_ROOT/ai-model-api"
source .venv/bin/activate
echo "AI Model API environment activated!"
echo "Run server: python app.py"
echo "To deactivate: deactivate"
EOF
chmod +x activate_ai_model.sh

print_status "Created activation scripts: activate_backend.sh and activate_ai_model.sh"

# Setup frontend if Node.js is available
if command -v node &> /dev/null; then
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    if [ -d "$FRONTEND_DIR" ]; then
        print_status "Installing frontend dependencies..."
        cd "$FRONTEND_DIR"
        npm install
    fi
else
    print_warning "Node.js not found - skipping frontend setup"
fi

print_status "Don't forget to set up Git hooks to prevent committing secrets:"
echo -e "${YELLOW}    ./setup_git_hooks.sh${NC}"
echo ""
print_status "Setup completed successfully! 🎉"
