#!/bin/bash

echo "Starting Firebase Emulators..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Install functions dependencies if needed
if [ ! -d "functions/node_modules" ]; then
    echo "Installing functions dependencies..."
    cd functions && npm install && cd ..
fi

# Build functions
echo "Building functions..."
cd functions && npm run build && cd ..

# Start emulators
echo "Starting emulators..."
firebase emulators:start --import=./emulator-data --export-on-exit

echo "Emulators started successfully!"
echo "Emulator UI: http://localhost:4000"
echo "Functions: http://localhost:5001"
echo "Firestore: http://localhost:8080"
echo "Auth: http://localhost:9099"
echo "Storage: http://localhost:9199"