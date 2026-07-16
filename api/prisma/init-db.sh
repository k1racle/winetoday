#!/bin/bash
set -e

DB_NAME="${API_POSTGRES_DB:-winetoday_api}"

exists=$(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | xargs)

if [ "$exists" != "1" ]; then
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "CREATE DATABASE \"$DB_NAME\";"
fi
