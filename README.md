# Med-Tech-EMR
Electronic Medical Records platform


#Create Database
CREATE DATABASE medtech;
CREATE USER medtech WITH ENCRYPTED PASSWORD 'medtech';
ALTER ROLE medtech SET client_encoding TO 'utf8';
ALTER ROLE medtech SET default_transaction_isolation TO 'read committed';
ALTER ROLE medtech SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE medtech TO medtech;


#Run Migrations
npx sequelize-cli db:migrate


#Seed Data
npx sequelize-cli db:seed:all


#Run System in Development Mode
npm run dev
