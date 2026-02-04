#!/bin/bash
# Run email consumer
# Usage: ./run_email_consumer.sh

cd "$(dirname "$0")"
poetry run python email_consumer.py
