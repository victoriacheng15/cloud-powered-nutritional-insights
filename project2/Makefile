.PHONY: help freeze install format run clean docker-build docker-run

help:
	@echo "Available commands:"
	@echo "  make freeze        - Freeze current dependencies to requirements.txt"
	@echo "  make install       - Install dependencies"
	@echo "  make run           - Run Flask app"
	@echo "  make clean         - Remove __pycache__ and .pyc files"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-run    - Run Docker container"

freeze:
	pip freeze > requirements.txt

install:
	pip install -r requirements.txt

run:
	python3 app.py

format:
	ruff format .

js-format:
	npx @biomejs/biome format --write static/

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

docker-build:
	docker build -t nutritional-insights:latest .

docker-run:
	docker run -p 5000:5000 nutritional-insights:latest
