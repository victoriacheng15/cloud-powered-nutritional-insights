.PHONY: help freeze install format clean

help:
	@echo "Available commands:"
	@echo "  make freeze        - Freeze current dependencies to requirements.txt"
	@echo "  make install       - Install dependencies"
	@echo "  make format        - Format code with ruff"
	@echo "  make clean         - Remove __pycache__ and .pyc files"


freeze:
	pip freeze > requirements.txt

install:
	pip install -r requirements.txt

format:
	ruff format .

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete