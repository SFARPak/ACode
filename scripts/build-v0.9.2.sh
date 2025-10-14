#!/bin/bash

set -e

# Trap to handle errors and provide failure summary
trap 'echo "Build failed at step $STEP"' ERR

echo "Starting complete build process for extension v0.9.2..."

STEP=1
echo "Step $STEP: Installing dependencies..."
pnpm install

STEP=2
echo "Step $STEP: Running linter..."
pnpm run lint

STEP=3
echo "Step $STEP: Checking types..."
pnpm run check-types

STEP=4
echo "Step $STEP: Running tests..."
pnpm run test

STEP=5
echo "Step $STEP: Bundling application..."
pnpm run bundle

STEP=6
echo "Step $STEP: Generating VSIX package..."
pnpm run vsix

echo "All steps completed successfully! Extension build process finished."