#!/bin/bash

# Fix GitHub Authentication Script
# Updates existing git repository to use authentication from reference repository
# Usage: ./fix-github-auth.sh [reference-repo-path]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

REFERENCE_REPO_PATH="${1:-../BrainBuzz}"

# Check if this is a git repository
if [[ ! -d ".git" ]]; then
    print_error "This directory is not a git repository!"
    exit 1
fi

# Check if reference repository exists
if [[ ! -f "$REFERENCE_REPO_PATH/.git/config" ]]; then
    print_error "Reference repository git config not found at: $REFERENCE_REPO_PATH/.git/config"
    exit 1
fi

# Get current remote URL
CURRENT_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ -z "$CURRENT_URL" ]]; then
    print_error "No origin remote found!"
    exit 1
fi

print_info "Current remote URL: $CURRENT_URL"

# Extract authentication details from reference repository
REF_REMOTE_URL=$(git config --file "$REFERENCE_REPO_PATH/.git/config" remote.origin.url)
print_info "Reference remote URL format detected"

# Check if reference repo uses authentication token
if [[ "$REF_REMOTE_URL" =~ https://([^:]+):([^@]+)@github\.com/ ]]; then
    REF_USERNAME="${BASH_REMATCH[1]}"
    REF_TOKEN="${BASH_REMATCH[2]}"
    
    # Create authenticated URL for current repository
    if [[ "$CURRENT_URL" =~ https://github\.com/([^/]+)/(.+) ]]; then
        CURRENT_OWNER="${BASH_REMATCH[1]}"
        CURRENT_REPO="${BASH_REMATCH[2]}"
        AUTHENTICATED_URL="https://${REF_USERNAME}:${REF_TOKEN}@github.com/${CURRENT_OWNER}/${CURRENT_REPO}"
        
        print_info "Updating remote URL with authentication token..."
        git remote set-url origin "$AUTHENTICATED_URL"
        print_success "Remote URL updated with authentication"
        
        # Test the connection
        print_info "Testing connection..."
        if git ls-remote origin main >/dev/null 2>&1; then
            print_success "Authentication test successful!"
            
            # Check if there are unpushed commits
            if git status --porcelain | grep -q .; then
                print_warning "Working directory has uncommitted changes"
            elif git rev-list --count origin/main..HEAD 2>/dev/null | grep -q "^[1-9]"; then
                print_info "Found unpushed commits"
                read -p "Do you want to push now? (Y/n): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                    git push
                    print_success "Successfully pushed to remote!"
                fi
            else
                print_success "Repository is up to date with remote"
            fi
        else
            print_error "Authentication test failed"
        fi
    else
        print_error "Could not parse current repository URL format: $CURRENT_URL"
        exit 1
    fi
else
    print_warning "Reference repository doesn't use token authentication"
    print_info "You may need to set up authentication manually"
    echo ""
    echo "Options:"
    echo "1. Use SSH: git remote set-url origin git@github.com:owner/repo.git"
    echo "2. Use personal access token: git remote set-url origin https://username:token@github.com/owner/repo.git"
    echo "3. Use GitHub CLI: gh auth login"
fi