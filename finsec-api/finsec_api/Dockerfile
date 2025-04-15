FROM python:3.9-slim

WORKDIR /app

# Install MySQL development libraries required for mysqlclient
RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev build-essential pkg-config netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x wait-for-it.sh
RUN chmod +x start.sh

CMD ["./start.sh"] 