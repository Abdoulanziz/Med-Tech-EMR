# Med-Tech-EMR

> A modern Electronic Medical Records (EMR) system designed to streamline healthcare operations and improve patient care.

![EMR System Interface](https://drive.google.com/uc?id=1_NoHUZMLcsn-ilbab09iYbmIn2xWnlmb)
![Patient Dashboard](https://drive.google.com/uc?id=1-YM6TW9MvABZHGM8Tpf6ur3zDfOxAIx_)
![Appointment Calendar](https://drive.google.com/uc?id=1Gj_yOWpqdDMwB4V6bhJbn_NosOI7t1-H)
![Medical Records View](https://drive.google.com/uc?id=1lYMdHxXgoUocMm3fSG-CqocQOE82VO1p)
![Patient Profile](https://drive.google.com/uc?id=1LrL5sFvoKFyA1_XiFWg-b5atS0FA03SL)



## 📋 Overview

Med-Tech-EMR is a comprehensive electronic medical records system that helps healthcare providers manage patient information, appointments, and medical records efficiently. Built with modern technologies, it offers a secure and user-friendly interface for managing healthcare operations.

## 🚀 Features

- Secure patient records management
- Appointment scheduling
- Electronic prescriptions
- Medical history tracking
- Role-based access control
- Report generation
- Audit logging

## 🔧 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL 12
- npm or yarn package manager

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Abdoulanziz/med-tech-emr.git
cd med-tech-emr
```

### 2. Install Dependencies

```bash
npm install
```

### 3. PostgreSQL Setup

#### Installing PostgreSQL 12 on Ubuntu

1. **Update System Packages**
```bash
sudo apt update
```

2. **Add PostgreSQL Repository**
```bash
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
```

3. **Install PostgreSQL**
```bash
sudo apt update
sudo apt install postgresql-12
```

4. **Verify Installation**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
psql --version
```

### 4. Database Configuration

1. **Create Database and User**
```sql
sudo -u postgres psql

CREATE DATABASE <db_name>;
CREATE USER <username> WITH ENCRYPTED PASSWORD '<password>';
ALTER ROLE <username> SET client_encoding TO 'utf8';
ALTER ROLE <username> SET default_transaction_isolation TO 'read committed';
ALTER ROLE <username> SET timezone TO '<timezone>';
GRANT ALL PRIVILEGES ON DATABASE <db_name> TO <username>;
```

2. **Environment Setup**
```bash
cp .env.example .env
```
Edit `.env` file with your database credentials and other configuration options.

### 5. Database Migration and Seeding

```bash
# Run migrations
npx sequelize-cli db:migrate

# Seed initial data
npx sequelize-cli db:seed:all
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:<PORT>` (or your configured port).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PostgreSQL](https://www.postgresql.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)

## 📞 Support

For support, email abdoulanzizally@outlook.com or create an issue in the GitHub repository.
