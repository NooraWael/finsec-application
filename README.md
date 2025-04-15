# Vulnerable Mobile Application for Security Hackathon

Welcome to the official repository for our Security Hackathon Challenge App!

This mobile application has been intentionally developed with multiple security vulnerabilities and misconfigurations across its entire stack — from insecure coding practices to poor configuration choices. It is designed specifically for educational and ethical hacking purposes within the scope of our hackathon event.

## 🎯 Purpose

The goal of this application is to challenge participants to:

- Analyze the app from a security perspective
- Identify and document all potential vulnerabilities
- Suggest effective remediations and security best practices
- Learn about common mobile security pitfalls through hands-on experience

This is a realistic, intentionally broken mobile app designed to test your penetration testing, reverse engineering, and secure development skills.

## Prerequisites

- Docker and Docker Compose
- Node.js and npm
- GitHub Codespaces (recommended)

## Project Structure

```
finsec-api/
├── backend/          # Backend API code
└── mobile/           # Mobile frontend code
```

## Setup and Running the Application

### 1. Backend Setup

1. Open the project in GitHub Codespaces
2. Navigate to the project directory:
   ```bash
   chmod -R 755 ./
   cd finsec-api
   ```
3. Start the Docker containers:
   ```bash
   docker-compose up --build
   ```
4. Wait for all Docker containers to be fully running
5. Make the backend ports public in Codespaces
6. Copy the application URL

### 2. Mobile Frontend Setup

1. Open a new terminal
2. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
3. Update the API URL in `mobile/config/api.ts` with the URL copied from step 5
4. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
5. Make the mobile frontend port public in Codespaces

### 3. Testing the Application

1. Open the mobile frontend URL in your browser
2. Use browser developer tools to:
   - Open device emulation (F12 or right-click -> Inspect)
   - Select iPhone or Galaxy S20 view for optimal mobile experience

## Test Credentials

The following test accounts are available for testing the application:

| First Name | Last Name   | Email                        | Password    |
| ---------- | ----------- | ---------------------------- | ----------- |
| Ahmed      | Al-Mansour  | ahmed.al-mansour@example.com | password123 |
| Fatima     | Al-Fahad    | fatima.al-fahad@example.com  | password123 |
| Omar       | Bin Khalid  | omar.bin.khalid@example.com  | password123 |
| Layla      | Hassan      | layla.hassan@example.com     | password123 |
| Youssef    | Al-Saleh    | youssef.al-saleh@example.com | password123 |
| Amina      | Zahran      | amina.zahran@example.com     | password123 |
| Khalid     | Nour        | khalid.nour@example.com      | password123 |
| Huda       | Al-Hashimi  | huda.al-hashimi@example.com  | password123 |
| Tariq      | El-Sayed    | tariq.el-sayed@example.com   | password123 |
| Mona       | Abdelrahman | mona.abdelrahman@example.com | password123 |

## ⚠️ Pages Without Backend APIs

Pages that do not connected to backend APIs (e.g., Send Money, Request, Top Up) are considered out of scope.

## ⚠️ Disclaimer

This application is not meant for production and should only be used in a controlled environment for ethical hacking and learning purposes.
Please do not reuse or repurpose this code in real-world applications.

## License

This project was developed for the BBK Finsec Hackathon.

## Troubleshooting

- If Docker containers fail to start, ensure all ports are available
- If the mobile frontend can't connect to the backend, verify the API URL in `mobile/config/api.ts`
- For Codespaces issues, check GitHub documentation for troubleshooting steps
