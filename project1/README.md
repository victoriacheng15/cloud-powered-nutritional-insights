# Project Deliverables Checklist

## Task 1: Dataset Analysis and Insights
- [ ] `data_analysis.py` — Python script for data processing, metrics calculation, and visualizations
- [ ] Screenshots of bar charts, heatmaps, and scatter plots
- [ ] Screenshots must display **date and time** to capture data processing and calculations

## Task 2: Docker Containerization
- [ ] `Dockerfile`
- [ ] Screenshots with date and time visible demonstrating:
  - Docker containers run locally and process data
  - Docker image pushed to Docker Hub or local registry
  - Docker container deployment simulated via Docker Compose or Minikube

## Task 3: Serverless Function & Cloud Storage Simulation
- [ ] Serverless function code (e.g., `lambda_function.py`) demonstrating Azure Blob Storage access via Azurite
- [ ] Screenshots with date and time visible showing:
  - Azurite Blob Storage running and `All_Diets.csv` uploaded
  - Function running locally and processing data from Azurite
  - Results saved in your simulated NoSQL storage (JSON file, MongoDB, etc.)
- [ ] Explanation of how you simulated cloud storage with Azurite and the serverless processing workflow

## Task 4: CI/CD Pipeline
- [ ] CI/CD config file: `.github/workflows/deploy.yml`
- [ ] Screenshots of GitHub Actions with date and time visible run logs showing successful build/test
- [ ] Evidence of simulated deployment (e.g., running container output)

## Task 5: Enhancement Report
- [ ] A 1-page report explaining:
  - Which two options you chose
  - What research you conducted
  - The improvements you applied
  - The impact or expected benefits
