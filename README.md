# Med-Tech-EMR

Electronic Medical Records system

## Create Database

```sql
CREATE DATABASE medtech;
CREATE USER medtech WITH ENCRYPTED PASSWORD 'medtech';
ALTER ROLE medtech SET client_encoding TO 'utf8';
ALTER ROLE medtech SET default_transaction_isolation TO 'read committed';
ALTER ROLE medtech SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE medtech TO medtech;
```


## Run Migrations
```bash
npx sequelize-cli db:migrate
```


## Seed Data
```bash
npx sequelize-cli db:seed:all
```


## Run Server
```bash
npm run dev
```