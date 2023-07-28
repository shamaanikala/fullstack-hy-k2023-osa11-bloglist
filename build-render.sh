#!/usr/bin/env bash
# Script basis from:
# https://render.com/blog/it-works-fine-locally

ME=$(basename "$0")

# exit on error
set -o errexit

echo "${ME}: running 'npm install'..."
npm install

echo "${ME}: running 'npm run build'..."
npm run build
