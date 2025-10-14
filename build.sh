#!/bin/bash

set -e

# Install dependencies
pnpm install

# Run linting
pnpm run lint

# Type check
pnpm run check-types

# Run tests
pnpm run test

# Build the extension
pnpm run bundle

# Package into .vsix file
pnpm run vsix