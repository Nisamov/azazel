#!/bin/bash
# Build script for aarch64 (ARM64) architecture
# This script builds the project for ARM64 servers

set -e

echo "=========================================="
echo "Hikarune Build Script for aarch64"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're on aarch64 or can cross-compile
ARCH=$(uname -m)
echo -e "${GREEN}Detected architecture: $ARCH${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v npm &> /dev/null; then
    npm install
else
    echo -e "${RED}Error: pnpm or npm is required${NC}"
    exit 1
fi

# Build client
echo -e "${YELLOW}Building client...${NC}"
cd client
npm run build:aarch64
cd ..

# Build server
echo -e "${YELLOW}Building server...${NC}"
cd server
npm run build:aarch64
cd ..

echo -e "${GREEN}=========================================="
echo "Build completed successfully!"
echo "=========================================="
echo ""
echo "To run the application:"
echo "  Development: pnpm dev"
echo "  Production:  pnpm start"
echo ""
echo "Docker for aarch64:"
echo "  docker buildx build --platform linux/arm64 -f docker/Dockerfile.server ."
echo "  docker-compose -f docker/docker-compose.yml up"