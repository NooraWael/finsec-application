#!/bin/bash
# wait-for-it.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

# Maximum number of attempts
max_attempts=30
attempt=0

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready at $host:$port..."

until nc -z "$host" "$port" || [ $attempt -ge $max_attempts ]; do
  attempt=$((attempt+1))
  echo "Attempt $attempt/$max_attempts: MySQL is not ready yet..."
  sleep 2
done

if [ $attempt -ge $max_attempts ]; then
  echo "Could not connect to MySQL after $max_attempts attempts!"
  exit 1
fi

echo "MySQL is available at $host:$port"

# Give MySQL a moment to complete initialization
echo "Waiting a bit more for MySQL to complete initialization..."
sleep 10

echo "Executing command: $cmd"
exec $cmd 