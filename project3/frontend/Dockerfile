# Build stage
FROM python:3.12-slim AS builder

WORKDIR /tmp

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Runtime stage
FROM python:3.12-slim

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /root/.local

# Add local pip installation to PATH
ENV PATH=/root/.local/bin:$PATH

# Copy application files
COPY app.py .
COPY static/ static/
COPY templates/ templates/
COPY utils/ utils/

EXPOSE 5000

CMD ["python", "app.py"]
