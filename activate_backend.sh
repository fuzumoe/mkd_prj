#!/bin/bash
echo "Activating Django backend environment..."
cd "/opt/adam/mkd_prj/backend"
source .venv/bin/activate
echo "Django backend environment activated!"
echo "Run server: cd myproject && python manage.py runserver"
echo "To deactivate: deactivate"
