FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy files into container
COPY datasets /app/datasets
COPY data_analysis.py /app
COPY requirements.txt /app

RUN mkdir /app/screenshots

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run the main analysis script
CMD ["python", "data_analysis.py"]
