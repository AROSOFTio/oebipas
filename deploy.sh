#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting deployment for OEBIPAS..."

# Navigate to the deployment directory
cd /www/wwwroot/oebipas.arosoft.io

# Pull the latest changes from the main branch
echo "Pulling latest changes from git..."
git pull origin main

# Build and recreate the containers in detached mode
echo "Rebuilding and restarting Docker containers..."
docker-compose up -d --build

# Clean up dangling images to save disk space
echo "Pruning unused Docker images..."
docker image prune -f

echo "Deployment completed successfully!"
