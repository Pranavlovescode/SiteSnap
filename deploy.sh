#!/bin/bash
# This script will run on the EC2 instance to deploy the latest code

# Exit immediately if a command exits with a non-zero status.
set -e

# Define variables
PROJECT_DIR="/home/ubuntu/SiteSnap" # <-- IMPORTANT: Change this to your project's directory
APP_NAME="sitesnap-ws"                     # <-- IMPORTANT: Change this to your pm2 app name

# Navigate to the project directory
cd $PROJECT_DIR

git pull origin main

# 2. Install/update dependencies
echo "Installing dependencies..."
cd backend/
npm i
cd ../client/
npm install  # Use --only=production for backend Node.js apps

# 3. Build the application (if you have a build step, e.g., for React, Vue, etc.)
# The --if-present flag means it will only run if a "build" script is in your package.json
echo "Building the application..."
npm run build --if-present

# 4. Restart the application using PM2
# pm2 reload will achieve a zero-downtime reload.
# The '||' part will start the app if it's not already running.
echo "Restarting application with PM2..."
pm2 reload $APP_NAME || pm2 start npm --name "$APP_NAME" -- start

echo "✅ Deployment finished successfully!"