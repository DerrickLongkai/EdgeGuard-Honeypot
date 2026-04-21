# EdgeGuard: Threat Intelligence Situation Awareness Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

A full-stack, real-time threat intelligence dashboard designed to visualize SSH/Telnet brute-force attacks captured by a Cowrie honeypot. 

## Key Features
* **Real-Time Global Tracking:** Maps attacker IP addresses to geographic coordinates using the MaxMind GeoLite2 engine.
* **Threat Analytics:** Identifies high-frequency attack source IPs dynamically.
* **Credential Intelligence:** Visualizes explosive password attempts (weak credentials) via a dynamic word cloud.
* **Automated Data Pipeline:** A robust Python daemon that parses honeypot logs, enriches them with GeoIP data, and stores them in MySQL.

## Architecture
1. **Sensor:** Cowrie Honeypot intercepts unauthorized access attempts.
2. **ETL Engine:** Python script extracts telemetry, resolves IP geolocation, and persists data to a MySQL relational database.
3. **Backend API:** Lightweight Flask REST API serves threat intelligence to the frontend.
4. **Frontend Dashboard:** React.js + Vite application utilizing `react-simple-maps` for interactive threat visualization.

## Dashboard Preview
![EdgeGuard Dashboard](./docs/screenshot.png)

## How to start
### 1. Database Setup
Execute the SQL schema to initialize the `attacks` table:
```sql
CREATE DATABASE edgeguard;
-- (Add your table creation SQL here)
