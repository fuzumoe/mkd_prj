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



# Generate .env file if it doesn't exist
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    print_status "Generating .env file template..."
    cat > "$PROJECT_ROOT/.env" << 'EOF'
# Heroku API Key - Get from https://dashboard.heroku.com/account
# Go to Account Settings -> API Key -> Reveal
HEROKU_API_KEY=your-heroku-api-key-here

# Stripe Secret Key - Get from https://dashboard.stripe.com/apikeys
# Use test key for development, live key for production
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
 
EOF
    print_status "Created .env file template at $PROJECT_ROOT/.env"
    print_warning "Please update the .env file with your actual credentials:"
    echo -e "${YELLOW}    1. Add your Heroku API Key${NC}"
    echo -e "${YELLOW}    2. Add your Stripe Secret Key${NC}"
    echo ""
    print_status "To get your Heroku API Key:"
    echo -e "${YELLOW}    Visit https://dashboard.heroku.com/account and reveal your API key${NC}"
    echo ""
    print_status "To get your Stripe Secret Key:"
    echo -e "${YELLOW}    Visit https://dashboard.stripe.com/apikeys and copy your secret key${NC}"
else
    print_status ".env file already exists - skipping generation"
fi

echo ""
print_status "Setup completed successfully! 🎉"
