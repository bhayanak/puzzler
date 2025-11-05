#!/bin/bash

# GitHub Repository Setup Script
# Automates the process of setting up a new GitHub repository with existing git config
# Usage: ./setup-github-repo.sh <new-repo-url> [reference-repo-path]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 <new-repo-url> [reference-repo-path]"
    echo ""
    echo "Arguments:"
    echo "  new-repo-url        The URL of your new GitHub repository (e.g., https://github.com/username/repo-name.git)"
    echo "  reference-repo-path Optional path to reference repository (defaults to ../BrainBuzz)"
    echo ""
    echo "Examples:"
    echo "  $0 https://github.com/bhayanak/puzzler.git"
    echo "  $0 https://github.com/bhayanak/puzzler.git ../my-other-project"
    echo ""
    echo "Note: Make sure you're authenticated with the correct GitHub account before running this script."
    echo "      You can check with: gh auth status"
    echo "      Login if needed: gh auth login"
}

# Function to check GitHub authentication
check_github_auth() {
    local repo_url="$1"
    local repo_owner=$(echo "$repo_url" | sed -n 's|.*github\.com[/:]\([^/]*\)/.*|\1|p')
    
    if command -v gh >/dev/null 2>&1; then
        print_info "Checking GitHub authentication..."
        local current_user=$(gh auth status 2>&1 | grep -o "Logged in to github.com as [^ ]*" | cut -d' ' -f6 || echo "unknown")
        
        if [[ "$current_user" != "unknown" ]]; then
            if [[ "$current_user" == "$repo_owner" ]]; then
                print_success "Authenticated as $current_user (matches repository owner)"
            else
                print_warning "Authenticated as $current_user but repository owner is $repo_owner"
                echo "This might cause push permission issues."
            fi
        else
            print_warning "GitHub authentication status unclear"
        fi
    else
        print_warning "GitHub CLI (gh) not found. Cannot verify authentication."
        print_info "Consider installing it: brew install gh"
    fi
}

# Check if help was requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_usage
    exit 0
fi

# Check if new repo URL is provided
if [[ -z "$1" ]]; then
    print_error "New repository URL is required!"
    show_usage
    exit 1
fi

NEW_REPO_URL="$1"
REFERENCE_REPO_PATH="${2:-../BrainBuzz}"

# Get current directory
CURRENT_DIR=$(pwd)
PROJECT_NAME=$(basename "$CURRENT_DIR")

print_info "Setting up GitHub repository for project: $PROJECT_NAME"
print_info "New repository URL: $NEW_REPO_URL"
print_info "Reference repository: $REFERENCE_REPO_PATH"

# Check GitHub authentication
check_github_auth "$NEW_REPO_URL"

# Check if already a git repository
if [[ -d ".git" ]]; then
    print_warning "This directory is already a git repository!"
    read -p "Do you want to reinitialize it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing existing .git directory..."
        rm -rf .git
    else
        print_info "Exiting without changes."
        exit 0
    fi
fi

# Check if reference repository exists
if [[ ! -f "$REFERENCE_REPO_PATH/.git/config" ]]; then
    print_error "Reference repository git config not found at: $REFERENCE_REPO_PATH/.git/config"
    print_info "Available git repositories in parent directory:"
    find .. -maxdepth 2 -name "config" -path "*/.git/config" 2>/dev/null | sed 's|/.git/config||' | sed 's|../||' || echo "No git repositories found"
    exit 1
fi

# Initialize git repository
print_info "Initializing git repository..."
git init

# Copy git config from reference repository
print_info "Copying git config from reference repository..."
cp "$REFERENCE_REPO_PATH/.git/config" ".git/config"

# Extract username and email from reference config
USERNAME=$(git config user.name)
EMAIL=$(git config user.email)

print_info "Using git user: $USERNAME <$EMAIL>"

# Extract authentication details from reference repository
REF_REMOTE_URL=$(git config --file "$REFERENCE_REPO_PATH/.git/config" remote.origin.url)
REPO_NAME=$(basename "$NEW_REPO_URL" .git)

# Check if reference repo uses authentication token
if [[ "$REF_REMOTE_URL" =~ https://([^:]+):([^@]+)@github\.com/ ]]; then
    REF_USERNAME="${BASH_REMATCH[1]}"
    REF_TOKEN="${BASH_REMATCH[2]}"
    
    # Create authenticated URL for new repository
    if [[ "$NEW_REPO_URL" =~ https://github\.com/([^/]+)/(.+) ]]; then
        NEW_OWNER="${BASH_REMATCH[1]}"
        NEW_REPO="${BASH_REMATCH[2]}"
        AUTHENTICATED_URL="https://${REF_USERNAME}:${REF_TOKEN}@github.com/${NEW_OWNER}/${NEW_REPO}"
        
        print_info "Using authenticated URL with token from reference repository"
        git remote set-url origin "$AUTHENTICATED_URL"
        print_success "Remote URL updated with authentication"
    else
        print_warning "Could not parse new repository URL format"
        git remote set-url origin "$NEW_REPO_URL"
    fi
else
    print_info "Reference repository doesn't use token authentication, using provided URL"
    git remote set-url origin "$NEW_REPO_URL"
fi

# Check if user wants to switch to SSH for authentication
if [[ "$NEW_REPO_URL" == https://github.com/* ]]; then
    SSH_URL=$(echo "$NEW_REPO_URL" | sed 's|https://github.com/|git@github.com:|')
    echo ""
    print_info "Option: You can use SSH instead of HTTPS for authentication"
    print_info "SSH URL would be: $SSH_URL"
    read -p "Do you want to use SSH instead of HTTPS? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Switching to SSH URL..."
        git remote set-url origin "$SSH_URL"
        NEW_REPO_URL="$SSH_URL"
    fi
fi

# Create .gitignore to exclude markdown files
print_info "Creating .gitignore to exclude markdown files..."
cat > .gitignore << 'EOF'
# Markdown files
*.md
*.MD

# Common system files
.DS_Store
Thumbs.db

# Editor files
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# Logs
*.log
npm-debug.log*

# Dependency directories
node_modules/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
EOF

print_success ".gitignore created successfully"

# Show status of files to be added
print_info "Files to be committed (excluding markdown files):"
git add .
git status --porcelain | grep -v "\.md$" | sed 's/^../  /' || echo "  (no files to commit)"

# Confirm before committing
echo ""
read -p "Do you want to commit these files? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    # Commit files
    COMMIT_MESSAGE="Initial commit for $PROJECT_NAME

- Exclude markdown files from version control
- Set up basic project structure"

    print_info "Committing files..."
    git commit -m "$COMMIT_MESSAGE"
    
    print_success "Files committed successfully!"
    
    # Set up main branch properly
    print_info "Setting up main branch..."
    git branch -M main
    
    # Ask about pushing to remote
    echo ""
    read -p "Do you want to push to the remote repository? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Pushing to remote repository..."
        
        # Try to push and handle authentication errors gracefully
        if git push -u origin main; then
            print_success "Successfully pushed to remote repository!"
        else
            print_error "Failed to push to remote repository!"
            echo ""
            print_info "This might be due to authentication issues. Here are some solutions:"
            echo ""
            echo "1. Check if you're logged into the correct GitHub account:"
            echo "   gh auth status"
            echo ""
            echo "2. Login to the correct GitHub account:"
            echo "   gh auth login"
            echo ""
            echo "3. Or update the remote URL to use SSH instead of HTTPS:"
            echo "   git remote set-url origin git@github.com:bhayanak/puzzler.git"
            echo ""
            echo "4. Or manually push later:"
            echo "   git push -u origin main"
            echo ""
            print_warning "Repository is set up locally but not pushed to remote yet."
        fi
    else
        print_info "You can push later using: git push -u origin main"
    fi
else
    print_info "Files staged but not committed. You can commit later using: git commit -m 'Initial commit'"
fi

print_success "Repository setup complete!"
print_info "Repository URL: $NEW_REPO_URL"
print_info "Local path: $CURRENT_DIR"

# Show final git status
echo ""
print_info "Current git status:"
git status --short