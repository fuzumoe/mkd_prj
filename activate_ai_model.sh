#!/bin/bash
echo "Activating AI Model API environment..."
cd "/opt/adam/mkd_prj/ai-model-api"
source .venv/bin/activate
echo "AI Model API environment activated!"
echo "Run server: python app.py"
echo "To deactivate: deactivate"
