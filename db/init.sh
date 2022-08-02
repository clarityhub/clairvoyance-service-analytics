#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE "clairvoyance_analytics_development";
  CREATE DATABASE "clairvoyance_analytics_test";

  GRANT ALL PRIVILEGES ON DATABASE clairvoyance_analytics_development to postgres;
  GRANT ALL PRIVILEGES ON DATABASE clairvoyance_analytics_test to postgres;
EOSQL
