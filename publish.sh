#!/bin/bash

# Publish script for @plexus ui-aerospace monorepo
# Usage:
#   ./publish.sh all          - Build and publish all packages
#   ./publish.sh earth        - Build and publish just earth
#   ./publish.sh earth mars   - Build and publish earth and mars

set -e  # Exit on error

PACKAGES=("earth" "mars" "mercury" "venus" "moon" "jupiter" "saturn" "uranus" "neptune" "gantt")

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to publish a single package
publish_package() {
    local package=$1
    echo -e "${BLUE}📦 Building and publishing @plexus/$package...${NC}"

    cd "packages/$package"

    # Build
    npm run build

    # Publish
    if npm publish --access public; then
        echo -e "${GREEN}✅ Successfully published @plexus/$package${NC}"
    else
        echo -e "${RED}❌ Failed to publish @plexus/$package${NC}"
        exit 1
    fi

    cd ../..
}

# Main logic
if [ "$1" == "all" ] || [ -z "$1" ]; then
    echo -e "${BLUE}🚀 Publishing all packages...${NC}"
    for package in "${PACKAGES[@]}"; do
        publish_package "$package"
    done
    echo -e "${GREEN}✅ All packages published successfully!${NC}"
else
    # Publish specified packages
    for package in "$@"; do
        if [[ " ${PACKAGES[@]} " =~ " ${package} " ]]; then
            publish_package "$package"
        else
            echo -e "${RED}❌ Unknown package: $package${NC}"
            echo "Available packages: ${PACKAGES[*]}"
            exit 1
        fi
    done
    echo -e "${GREEN}✅ Selected packages published successfully!${NC}"
fi
