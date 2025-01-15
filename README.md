# Med-Tech-EMR

> A modern Electronic Medical Records (EMR) system designed to streamline healthcare operations and improve patient care.

![Screenshot from 2024-01-27 00-44-27](https://github.com/user-attachments/assets/a91d0715-aa93-488d-bf4e-a6b2c2ebad8e)
![Screenshot from 2024-01-27 00-44-50](https://github.com/user-attachments/assets/9c9026dd-7496-4067-804b-80c522933bbe)
![Screenshot from 2024-01-27 00-45-01](https://github.com/user-attachments/assets/cf154e83-7ce1-47cf-825b-84d1ad583d54)
![Screenshot from 2024-01-27 00-45-38](https://github.com/user-attachments/assets/b2507318-0ba3-4cf4-bf44-99ca7bfff0bf)
![Screenshot from 2024-01-27 00-45-45](https://github.com/user-attachments/assets/4144c298-0d44-4b3f-a5b9-bad9d80299fe)
![Screenshot from 2024-01-27 00-46-06](https://github.com/user-attachments/assets/b1c3a7e0-b5be-4d69-b9d7-e527db1df162)
![Screenshot from 2024-01-27 00-46-18](https://github.com/user-attachments/assets/01490777-01ce-4a17-abeb-6af4df904beb)
![Screenshot from 2024-01-27 00-46-29](https://github.com/user-attachments/assets/a58df2b8-c1e5-46c8-aa0f-769e074db6d4)
![Screenshot from 2024-01-27 00-46-53](https://github.com/user-attachments/assets/ca9aa2cb-2d1f-40c7-8d5a-4ac5736e2cde)
![Screenshot from 2024-01-27 00-47-06](https://github.com/user-attachments/assets/a5e00f39-0f7f-4e25-8ffd-2013ac9e3421)
![Screenshot from 2024-01-27 00-47-12](https://github.com/user-attachments/assets/08c64a36-717a-4a9c-976f-a4df885b1276)
![Screenshot from 2024-01-27 00-47-16](https://github.com/user-attachments/assets/5f57f9ca-45b2-4701-920e-ce7695c83b0a)
![Screenshot from 2024-01-27 00-47-42](https://github.com/user-attachments/assets/4b72a72a-a964-4a56-80a4-3a43b5bedc94)
![Screenshot from 2024-01-27 00-47-47](https://github.com/user-attachments/assets/dfd4c9ff-580f-4472-b3ad-ce39d2887a82)
![Screenshot from 2024-01-27 00-48-59](https://github.com/user-attachments/assets/c8fc8ca0-4607-40d1-a48e-cd7b84cd04d6)
![Screenshot from 2024-01-27 00-49-18](https://github.com/user-attachments/assets/e4e538df-a981-43cc-956c-c6c55fbf8e91)




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
