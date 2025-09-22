# Task 3: Cloud Storage and Serverless Function Simulation Explanation

## Overview
This task demonstrates cloud-native data processing using simulated Azure services running locally. We used Azurite as a local Azure Blob Storage emulator and created a Python-based serverless function to process nutritional data.

## Architecture Components

### 1. Azurite Blob Storage Emulator
- **Purpose**: Simulates Azure Blob Storage locally for development and testing
- **Configuration**: 
  - Running via Docker container on `http://127.0.0.1:10000`
  - Uses development account: `devstoreaccount1`
  - Container name: `datasets`
  - Blob file: `All_Diets.csv`

### 2. Serverless Function (`lambda_function.py`)
- **Functionality**: 
  - Connects to Azurite using Azure Blob Storage SDK
  - Downloads and processes the CSV file from blob storage
  - Calculates average nutritional values per diet type
  - Stores results in simulated NoSQL database (JSON file)

### 3. Simulated NoSQL Storage
- **Implementation**: Local JSON file storage in `simulated_nosql/` directory
- **Data Structure**: Structured JSON with processing metadata and calculated results
- **File**: `nutritional_analysis_results.json`

## Workflow Process

1. **Data Upload**: CSV file uploaded to Azurite blob container using Azure CLI
2. **Function Trigger**: Serverless function manually invoked (simulating event-driven trigger)
3. **Data Processing**: Function downloads data from Azurite, performs calculations
4. **Result Storage**: Processed results saved to local JSON file (simulating NoSQL database)

## Cloud-Native Benefits Demonstrated

- **Serverless Processing**: Function-based architecture for scalable data processing
- **Cloud Storage Integration**: Separation of storage and compute resources
- **Event-Driven Architecture**: Simulated event triggers for automatic processing
- **NoSQL Data Storage**: Flexible JSON-based result storage
- **Microservices Pattern**: Isolated function with single responsibility

## Local Development Advantages

- **Cost-Effective**: No Azure resource charges during development
- **Fast Iteration**: Quick testing and debugging without cloud deployment delays
- **Offline Development**: Works without internet connectivity
- **Consistent Environment**: Reproducible setup across different development machines

## Results Summary

Successfully processed 7,806 nutritional records across 5 diet types:
- **DASH**: Avg - Protein: 69.3g, Carbs: 160.5g, Fat: 101.2g
- **Keto**: Avg - Protein: 101.3g, Carbs: 58.0g, Fat: 153.1g
- **Mediterranean**: Avg - Protein: 101.1g, Carbs: 152.9g, Fat: 101.4g
- **Paleo**: Avg - Protein: 88.7g, Carbs: 129.6g, Fat: 135.7g
- **Vegan**: Avg - Protein: 56.2g, Carbs: 254.0g, Fat: 103.3g