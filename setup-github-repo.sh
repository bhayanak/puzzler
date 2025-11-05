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

# Update remote URL
print_info "Updating remote URL to: $NEW_REPO_URL"
git remote set-url origin "$NEW_REPO_URL"

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
    
    # Ask about pushing to remote
    echo ""
    read -p "Do you want to push to the remote repository? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Pushing to remote repository..."
        git branch -M main
        git push -u origin main
        print_success "Successfully pushed to remote repository!"
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