#!/bin/bash

# Stop script execution on any error
set -e

echo "🚀 Deploying to GitHub..."

# Add all changes
git add .

# Commit changes (use provided argument as message, or default to "Update profile page")
msg="${1:-Update profile page}"
git commit -m "$msg"

# Push to main branch
git push origin main

echo "✅ Done! Changes pushed to main."
