#!/usr/bin/env bash
set -Eeuo pipefail

# Load environment variables from .env file
if [[ -f .env ]]; then
  export $(grep -v '^#' .env | xargs)
fi

# App names
DJANGO_APP="mkd-django-backend"
FLASK_APP="mkd-flask-api"
FRONT_APP="mkd-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Login function
login() {
  echo "🔑 Authenticating with Heroku..."
  
  # Check if HEROKU_API_KEY is set
  if [[ -z "${HEROKU_API_KEY:-}" ]]; then
    echo -e "${RED}❌ HEROKU_API_KEY not found in environment variables${NC}"
    echo "💡 Please add HEROKU_API_KEY to your .env file"
    exit 1
  fi
  
  # Set API key for heroku CLI
  export HEROKU_API_KEY
  
  # Verify login worked
  if ! heroku auth:whoami >/dev/null 2>&1; then
    echo -e "${RED}❌ Heroku authentication failed${NC}"
    echo "💡 Please check your HEROKU_API_KEY in .env file"
    exit 1
  fi
  
  local user=$(heroku auth:whoami 2>/dev/null || echo "unknown")
  echo -e "${GREEN}✅ Successfully authenticated as: ${user}${NC}"
}

echo "🔍 Checking deployed Heroku applications..."
echo "================================================"

# Login first
login

# Function to get app URL
get_app_url() {
  local app="$1"
  if heroku apps:info -a "$app" >/dev/null 2>&1; then
    heroku info -a "$app" | grep "Web URL" | awk '{print $3}'
  else
    echo "NOT_DEPLOYED"
  fi
}

# Function to check app status
get_app_status() {
  local app="$1"
  if heroku apps:info -a "$app" >/dev/null 2>&1; then
    if heroku ps -a "$app" | grep -q "web.*up\|web.*idle"; then
      echo "RUNNING"
    else
      echo "DOWN"
    fi
  else
    echo "NOT_DEPLOYED"
  fi
}

# Check Django Backend
echo -e "\n📱 ${BLUE}Django Backend${NC} (${DJANGO_APP}):"
django_url=$(get_app_url "$DJANGO_APP")
django_status=$(get_app_status "$DJANGO_APP")

if [[ "$django_url" != "NOT_DEPLOYED" ]]; then
  if [[ "$django_status" == "RUNNING" ]]; then
    echo -e "   Status: ${GREEN}✅ Running${NC}"
    echo -e "   URL: ${django_url}"
    echo -e "   Health: ${django_url}health/"
    echo -e "   API: ${django_url}api/"
  else
    echo -e "   Status: ${YELLOW}⚠️ Deployed but not running${NC}"
    echo -e "   URL: ${django_url}"
  fi
else
  echo -e "   Status: ${RED}❌ Not deployed${NC}"
fi

# Check Flask API
echo -e "\n🔬 ${BLUE}Flask API${NC} (${FLASK_APP}):"
flask_url=$(get_app_url "$FLASK_APP")
flask_status=$(get_app_status "$FLASK_APP")

if [[ "$flask_url" != "NOT_DEPLOYED" ]]; then
  if [[ "$flask_status" == "RUNNING" ]]; then
    echo -e "   Status: ${GREEN}✅ Running${NC}"
    echo -e "   URL: ${flask_url}"
    echo -e "   Health: ${flask_url}health"
    echo -e "   API: ${flask_url}api/"
  else
    echo -e "   Status: ${YELLOW}⚠️ Deployed but not running${NC}"
    echo -e "   URL: ${flask_url}"
  fi
else
  echo -e "   Status: ${RED}❌ Not deployed${NC}"
fi

# Check React Frontend
echo -e "\n⚛️ ${BLUE}React Frontend${NC} (${FRONT_APP}):"
react_url=$(get_app_url "$FRONT_APP")
react_status=$(get_app_status "$FRONT_APP")

if [[ "$react_url" != "NOT_DEPLOYED" ]]; then
  if [[ "$react_status" == "RUNNING" ]]; then
    echo -e "   Status: ${GREEN}✅ Running${NC}"
    echo -e "   URL: ${react_url}"
  else
    echo -e "   Status: ${YELLOW}⚠️ Deployed but not running${NC}"
    echo -e "   URL: ${react_url}"
  fi
else
  echo -e "   Status: ${RED}❌ Not deployed${NC}"
fi

echo -e "\n================================================"

# Summary section
echo -e "\n📋 ${BLUE}Quick Copy URLs:${NC}"
echo "================================================"

if [[ "$django_url" != "NOT_DEPLOYED" ]]; then
  echo "Django Health: ${django_url}health/"
fi

if [[ "$flask_url" != "NOT_DEPLOYED" ]]; then
  echo "Flask Health:  ${flask_url}health"
fi

if [[ "$react_url" != "NOT_DEPLOYED" ]]; then
  echo "React App:     ${react_url}"
fi

echo ""

# JSON output option
if [[ "${1:-}" == "--json" ]]; then
  echo -e "\n📄 ${BLUE}JSON Output:${NC}"
  echo "{"
  echo "  \"django\": {"
  echo "    \"app_name\": \"$DJANGO_APP\","
  echo "    \"url\": \"$django_url\","
  echo "    \"status\": \"$django_status\","
  echo "    \"health_endpoint\": \"${django_url}health/\""
  echo "  },"
  echo "  \"flask\": {"
  echo "    \"app_name\": \"$FLASK_APP\","
  echo "    \"url\": \"$flask_url\","
  echo "    \"status\": \"$flask_status\","
  echo "    \"health_endpoint\": \"${flask_url}health\""
  echo "  },"
  echo "  \"react\": {"
  echo "    \"app_name\": \"$FRONT_APP\","
  echo "    \"url\": \"$react_url\","
  echo "    \"status\": \"$react_status\""
  echo "  }"
  echo "}"
fi

# Test connectivity option
if [[ "${1:-}" == "--test" ]]; then
  echo -e "\n🔄 ${BLUE}Testing Connectivity:${NC}"
  echo "================================================"
  
  if [[ "$django_url" != "NOT_DEPLOYED" ]]; then
    echo -n "Testing Django health endpoint... "
    if curl -f "${django_url}health/" --max-time 10 >/dev/null 2>&1; then
      echo -e "${GREEN}✅ OK${NC}"
    else
      echo -e "${RED}❌ Failed${NC}"
    fi
  fi
  
  if [[ "$flask_url" != "NOT_DEPLOYED" ]]; then
    echo -n "Testing Flask health endpoint... "
    if curl -f "${flask_url}health" --max-time 10 >/dev/null 2>&1; then
      echo -e "${GREEN}✅ OK${NC}"
    else
      echo -e "${RED}❌ Failed${NC}"
    fi
  fi
  
  if [[ "$react_url" != "NOT_DEPLOYED" ]]; then
    echo -n "Testing React frontend... "
    if curl -f "${react_url}" --max-time 10 >/dev/null 2>&1; then
      echo -e "${GREEN}✅ OK${NC}"
    else
      echo -e "${RED}❌ Failed${NC}"
    fi
  fi
fi

echo -e "\n${GREEN}✅ URL check completed!${NC}"
echo ""
echo "Usage options:"
echo "  ./heroku_urls.sh          - Basic URL display"
echo "  ./heroku_urls.sh --json   - JSON format output"
echo "  ./heroku_urls.sh --test   - Test connectivity"