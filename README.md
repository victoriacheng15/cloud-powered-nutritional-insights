# Cloud Powered Nutritional Insights

An academic project from **SAIT** (Southern Alberta Institute of Technology) learning how to evolve from local Docker development to Azure cloud deployment and security hardening through three progressive phases.

## 🛠 Tech Stack Overview

| Layer | Technology |
|-------|------------|
| **Language** | Python 3.10+ |
| **Web Framework** | Flask, Jinja2 |
| **Backend** | Azure Functions |
| **Frontend** | Chart.js, Tailwind CSS |
| **Data Processing** | Pandas, NumPy, scikit-learn |
| **Authentication** | OAuth 2.0, TOTP (pyotp), JWT |
| **Cloud Services** | Azure Key Vault, Azure Blob Storage, Azure Container Registry, GitHub Container Registry |
| **Containerization** | Docker, Gunicorn (production WSGI) |
| **Server Runtime** | Flask (dev), Gunicorn 23.0.0 (production) |

---

## 📁 Project Structure

### [Project 1: Data Analysis (Docker Foundation)](./project1/)

**Purpose**: Foundation phase - containerized data analysis with Docker, runs locally

**Learning Objectives**:

- Containerize Python applications with Docker
- Analyze nutritional data using pandas
- Build and run Docker containers locally
- Work with CSV datasets and multi-stage builds

**Deployment**: Local Docker container only

**Files**:

- `data_analysis.py` - Main analysis script
- `lambda_function.py` - Local function handler for testing
- `Dockerfile` & `Dockerfile.multi-stage` - Container configurations
- `requirements.txt` - Python dependencies
- `datasets/` - CSV files for different diet types

---

### [Project 2: Frontend Integration (Azure Functions)](./project2/)

**Purpose**: Integration phase - add web frontend and deploy to Azure Functions with container registries

**Learning Objectives**:

- Build Flask web applications with Jinja2 templating
- Create Azure Functions for serverless APIs
- Integrate Chart.js visualizations
- Implement API proxying patterns
- Manage pagination and data filtering
- Deploy containers to Azure Container Registry (ACR) and GitHub Container Registry (GHCR)
- Use Azure Blob Storage for datasets

**Deployment**: Azure Functions + ACR + GHCR + Azure Blob Storage

**Registry Exploration**: Project 2 uses both Azure Container Registry (ACR) and GitHub Container Registry (GHCR) to explore and compare container registry solutions. This demonstrates hands-on evaluation of different registry platforms available in Azure and GitHub ecosystems.

**Endpoints**:

- `/api/greeting` - Test connectivity
- `/api/nutritional-insights` - Aggregated statistics
- `/api/recipes` - Paginated recipe retrieval
- `/api/clusters` - K-means clustering

**Files**:

- `app.py` - Flask application entry point
- `api/function_app.py` - Azure Functions host
- `static/` - CSS and JavaScript
- `templates/` - HTML pages
- `utils/proxy.py` - API proxy logic

---

### [Project 3: Production & Security (Cloud Deployment)](./project3/)

**Purpose**: Production phase - deploy to GitHub Container Registry with OAuth 2.0, 2FA, and security compliance

**Learning Objectives**:

- Deploy containerized applications to GitHub Container Registry (GHCR)
- Implement OAuth 2.0 authentication flows
- Add TOTP-based two-factor authentication
- Integrate Azure Key Vault for secrets management
- Implement security and compliance checks
- Use Gunicorn for production-grade WSGI servers
- Centralize backend module exports and documentation

**Deployment**: GHCR only + OAuth 2.0 + 2FA + Security compliance

**Architecture**:

#### Frontend (`frontend/`)

- Flask web server with production WSGI (Gunicorn)
- Tailwind CSS styling
- Chart.js visualizations
- Proxy endpoints to backend

**Key Files**:

- `app.py` - Flask application with 11 proxy endpoints
- `utils/proxy.py` - Smart endpoint routing decorator
- `static/` - CSS/JavaScript assets
- `templates/` - HTML templates
- `Dockerfile` - Multi-stage production build
- `Makefile` - Development and deployment commands

**Features**:

- Environment-based configuration (dev/production)
- Request proxying to Azure Functions
- OAuth callback handling
- Error handling and logging

#### Backend API (`api/`)

- Azure Functions v2 with Python
- Centralized function exports via `__init__.py`
- Security and compliance checks
- Azure Key Vault integration
- Azure Blob Storage for datasets

**Core Functions** (11 total):

1. `greeting()` - Health check
2. `get_nutritional_insights()` - Statistics aggregation
3. `get_recipes()` - Paginated retrieval with filtering
4. `get_clusters()` - K-means clustering
5. `get_security_status()` - Security compliance validation *(Project 3 only)*
6. `get_oauth_login_url()` - OAuth initialization *(Project 3 only)*
7. `handle_oauth_callback()` - OAuth token exchange *(Project 3 only)*
8. `setup_two_factor()` - TOTP secret generation *(Project 3 only)*
9. `verify_two_factor()` - 2FA code validation *(Project 3 only)*
10. `list_resources_in_group()` - Azure resource enumeration *(Project 3 only)*
11. `delete_resources()` - Resource cleanup *(Project 3 only)*

**Utilities**:

- `utils/dataset_utils.py` - Data loading and filtering
- `utils/keyvault_utils.py` - Azure Key Vault operations
- `blob_storage.py` - Azure Blob Storage access

#### Frontend Web (`frontend/`)

- Standalone Flask app for UI rendering
- Connects to backend API
- Local and cloud deployment support

---

## 🔐 Security & Authentication

### OAuth 2.0 + TOTP 2FA

- Supported providers: GitHub, Google, Azure AD
- TOTP-based two-factor authentication
- JWT token generation and validation
- Secrets managed via Azure Key Vault

### Compliance Checks

- Encryption status validation
- Access control verification
- Key Vault accessibility tests
- Azure resource compliance audits

---

## 📊 Data & Analytics

### Datasets

All projects use consistent diet-type CSV files:

- All diets combined
- Keto
- Vegan
- Mediterranean
- Paleo
- DASH

### Analytics Features

- Nutritional statistics (min/avg/max for protein, carbs, fat)
- K-means clustering for recipe similarity
- Cuisine type categorization
- Paginated data retrieval

---

## 🛠 API Endpoints (Project 3)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/greeting` | GET | Health check |
| `/api/nutritional-insights` | GET | Aggregate statistics |
| `/api/recipes` | GET | Paginated recipes |
| `/api/clusters` | GET | Recipe clustering |
| `/api/security-status` | GET | Compliance status |
| `/api/auth/oauth/login` | GET | OAuth initiation |
| `/api/auth/oauth/callback` | GET | OAuth callback |
| `/api/auth/2fa-setup` | POST | 2FA secret generation |
| `/api/auth/2fa-verify` | POST | 2FA code verification |
| `/api/cleanup/list` | GET | Resource enumeration |
| `/api/cleanup/delete` | POST | Resource deletion |

---

## 📈 Project Evolution

| Aspect | Project 1 | Project 2 | Project 3 |
|--------|-----------|-----------|----------|
| **Deployment** | Local Docker | Azure Functions + ACR + GHCR | GHCR only |
| **Frontend** | CLI/Jupyter | Flask | Flask + Gunicorn |
| **Auth** | None | None | OAuth + 2FA |
| **Security** | None | None | Full compliance |
| **Storage** | Local CSV | Azure Blob | Azure Blob + Key Vault |
| **Production Ready** | ❌ | ⚠️ | ✅ |
