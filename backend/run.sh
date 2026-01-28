#!/bin/bash
# Quick start script for the Flask backend

echo "Starting Flask backend..."
poetry run flask --app "app:create_app()" run --port 5000
