#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env file
if [[ -f .env ]]; then
  echo "📝  Loading environment variables from .env file..."
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
  echo "🔑  Authenticating with Heroku using API key from .env..."
  
  # Check if HEROKU_API_KEY is set
  if [[ -z "${HEROKU_API_KEY:-}" ]]; then
    echo -e "${RED}❌  HEROKU_API_KEY not found in environment variables${NC}"
    echo "💡  Please add HEROKU_API_KEY to your .env file"
    exit 1
  fi
  
  # Set API key for heroku CLI
  export HEROKU_API_KEY
  
  # Verify login worked
  if ! heroku auth:whoami >/dev/null 2>&1; then
    echo -e "${RED}❌  Heroku authentication failed${NC}"
    echo "💡  Please check your HEROKU_API_KEY in .env file"
    exit 1
  fi
  
  local user=$(heroku auth:whoami 2>/dev/null || echo "unknown")
  echo -e "${GREEN}✅  Successfully authenticated as: ${user}${NC}"
}

# Function to check if app exists
app_exists() {
  local app="$1"
  heroku apps:info -a "$app" >/dev/null 2>&1
}

# Function to safely scale down dynos
scale_down_app() {
  local app="$1"
  echo "→ Scaling down $app"
  
  if app_exists "$app"; then
    if heroku ps:scale web=0 -a "$app" >/dev/null 2>&1; then
      echo -e "   ${GREEN}✅ Successfully scaled down $app${NC}"
    else
      echo -e "   ${YELLOW}⚠️ Could not scale down $app (may already be at 0)${NC}"
    fi
  else
    echo -e "   ${YELLOW}⚠️ App $app does not exist${NC}"
  fi
}

# Function to safely destroy app
destroy_app() {
  local app="$1"
  echo "🔥 Deleting $app…"
  
  if app_exists "$app"; then
    if heroku apps:destroy -a "$app" --confirm "$app" >/dev/null 2>&1; then
      echo -e "   ${GREEN}✅ Successfully deleted $app${NC}"
      return 0
    else
      echo -e "   ${RED}❌ Failed to delete $app${NC}"
      return 1
    fi
  else
    echo -e "   ${YELLOW}⚠️ App $app does not exist or already deleted${NC}"
    return 0
  fi
}

# Main execution
main() {
  echo -e "${BLUE}🚀 Heroku App Removal Script${NC}"
  echo "================================================"
  
  # Login first
  login
  
  ###############################################
  # 1. Pause billing by scaling dynos to zero
  ###############################################
  echo -e "\n⏸  ${BLUE}Scaling web dynos to 0 (stops charges)…${NC}"
  
  scale_down_app "$DJANGO_APP"
  scale_down_app "$FLASK_APP"
  scale_down_app "$FRONT_APP"
  
  echo -e "\n${GREEN}✅  All web dynos stopped.${NC}"
  
  ###############################################
  # 2. Confirmation before irreversible deletion
  ###############################################
  echo -e "\n${RED}⚠️  About to delete all three apps (this cannot be undone).${NC}"
  echo "Apps to be deleted:"
  echo "  • $DJANGO_APP"
  echo "  • $FLASK_APP"
  echo "  • $FRONT_APP"
  echo ""
  
  read -p "Are you sure you want to continue? (type 'DELETE' to confirm): " confirmation
  
  if [[ "$confirmation" != "DELETE" ]]; then
    echo -e "${YELLOW}❌ Deletion cancelled. Apps are still scaled down to avoid charges.${NC}"
    exit 0
  fi
  
  ###############################################
  # 3. Irreversibly destroy the apps (continue even if one fails)
  ###############################################
  echo -e "\n${RED}🔥 Proceeding with app deletion...${NC}"
  
  # Track results
  declare -a FAILED_DELETIONS=()
  declare -a SUCCESSFUL_DELETIONS=()
  
  # Try to delete each app, continue even if one fails
  if destroy_app "$DJANGO_APP"; then
    SUCCESSFUL_DELETIONS+=("$DJANGO_APP")
  else
    FAILED_DELETIONS+=("$DJANGO_APP")
  fi
  
  if destroy_app "$FLASK_APP"; then
    SUCCESSFUL_DELETIONS+=("$FLASK_APP")
  else
    FAILED_DELETIONS+=("$FLASK_APP")
  fi
  
  if destroy_app "$FRONT_APP"; then
    SUCCESSFUL_DELETIONS+=("$FRONT_APP")
  else
    FAILED_DELETIONS+=("$FRONT_APP")
  fi
  
  # Summary of results
  echo -e "\n${BLUE}📊 Deletion Summary:${NC}"
  echo "================================================"
  
  if [[ ${#SUCCESSFUL_DELETIONS[@]} -gt 0 ]]; then
    echo -e "${GREEN}✅ Successfully deleted:${NC}"
    for app in "${SUCCESSFUL_DELETIONS[@]}"; do
      echo "   • $app"
    done
  fi
  
  if [[ ${#FAILED_DELETIONS[@]} -gt 0 ]]; then
    echo -e "${RED}❌ Failed to delete:${NC}"
    for app in "${FAILED_DELETIONS[@]}"; do
      echo "   • $app"
    done
  fi
  
  # Final status check
  echo -e "\n${BLUE}📋 Final Status Check:${NC}"
  echo "================================================"
  
  for app in "$DJANGO_APP" "$FLASK_APP" "$FRONT_APP"; do
    if app_exists "$app"; then
      echo -e "   ${RED}❌ $app still exists${NC}"
    else
      echo -e "   ${GREEN}✅ $app successfully deleted${NC}"
    fi
  done
  
  # Overall result
  if [[ ${#FAILED_DELETIONS[@]} -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 All apps successfully deleted!${NC}"
  else
    echo -e "\n${YELLOW}⚠️ Some apps could not be deleted. Check the summary above.${NC}"
  fi
  
  echo -e "\n${GREEN}✅ Cleanup process completed!${NC}"
}

# Run main function
main "$@"