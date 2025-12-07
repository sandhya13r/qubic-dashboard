# QUBIC COMMAND CENTER — Real-Time Telemetry & Analytics Dashboard

A modern analytics dashboard that visualizes Qubic blockchain activity through live telemetry, fraud monitoring, analytics, leaderboards, and EasyConnect automation workflows.

This project demonstrates how Qubic events can be streamed, analyzed, automated, and visualized using a frontend dashboard combined with n8n and EasyConnect pipelines.

---

## Features

### 1. Real-Time Telemetry Overview
- Live feed of smart-contract events  
- Bid, Ask, Fill, Cancel event display  
- System health indicators  
- Dynamic statistics and counters  

### 2. Analytics Engine
- Live updating line and bar charts (Chart.js)  
- Volume analysis  
- Active sender participation overview  

### 3. Transactions Explorer
- Searchable and sortable table  
- Pagination  
- Professional UI design  

### 4. Fraud Detection Engine
- Real-time anomaly score  
- Suspicious pattern detection  
- High-risk event monitoring  
- Mini fraud score widget  

### 5. Gamified Leaderboard
- Levels, XP, badges  
- Volume and trade-based ranking  
- Discord and Telegram integration tiles  
- Summary insights  

### 6. Notification System
- In-dashboard notification center  
- EasyConnect-triggered alerts  
- Persistent notification history  

### 7. Pipeline Settings
- Configure API endpoint  
- Supports switching to real event streams  
- Local storage persistence  

---

## Architecture Overview

### EasyConnect → n8n → Render Backend → Qubic Command Center (Frontend)

Event Flow:
1. EasyConnect triggers or workflows  
2. n8n processes events and dispatches webhooks  
3. Backend formats and exposes event endpoints  
4. Dashboard visualizes and updates live data  

---

## Tech Stack

### Frontend
- HTML5  
- CSS3 (Custom Neon Theme)  
- JavaScript  
- Chart.js  

### Backend (Hosted)
- Node.js on Render  
- Express mock event pipeline  

### Automation Layer
- EasyConnect  
- n8n (webhooks, automations)  

### Integrations
- Telegram alert integration (UI placeholder)  
- Discord alert integration (UI placeholder)  
- Notification center  

### Deployment
- Vercel (Frontend) - https://qubic-command-center.vercel.app/  
- Render (Backend)  - https://qubic-fraud-backend.onrender.com  ( Github repo: https://github.com/sandhya13r/qubic-fraud-backend )

---

## Project Purpose

Qubic currently does not expose a public, real-time event stream.  
This dashboard demonstrates how a full-scale event pipeline would operate once live data becomes available.

The system showcases:
- A production-level dashboard architecture  
- Real-time UI components  
- Proper automation flow with EasyConnect and n8n  
- Fraud monitoring and analytics design  
- Gamified ecosystem features  

---

## Future Enhancements

- Connect to official Qubic live event stream when released  
- Real contract event listeners  
- Deeper analytics with time-based comparisons  
- Wallet profile pages  
- ML-based fraud scoring  
- Export analytics reports  
- Multi-chain support  

---

# Live Demo:
## Frontend: https://qubic-command-center.vercel.app/


# Qubic Fraud Detection Backend

A lightweight, high-performance backend powering the **Qubic Command Center Dashboard**.  
It processes incoming Qubic-style transactions, performs real-time fraud scoring, stores wallet analytics, and exposes REST APIs for dashboards, automation engines, and EasyConnect → n8n workflows.

---

## Features

### Real-Time Risk Scoring Engine
- Multi-rule fraud detection  
- Amount anomaly scoring  
- Procedure-based risk evaluation  
- Wallet behavior modeling  
- Burst/timing pattern detection  
- Risk levels: **LOW / MEDIUM / HIGH / CRITICAL**

### Wallet Intelligence Engine
- Tracks wallet transaction history  
- Computes average risk score  
- Monitors total volume moved  
- Tracks last tick/time  
- Detects behavioral patterns

### Event Analytics
- Recent transactions  
- Top wallets  
- Risk distribution  
- Volume aggregation

### REST API Endpoints for Dashboards
- Transaction feed  
- Latest transaction snapshot  
- Summary analytics  
- Wallet insights

### EasyConnect / n8n Compatible
- Accepts webhook POST events  
- Fits into automation workflows  
- Real-time event pipeline ready

---

## Architecture Overview

EasyConnect → n8n Workflow → Render Backend API → Qubic Command Center Dashboard
↓
Risk Engine + Wallet Intelligence Engine
↓
Analytics + Summary + Fraud Scoring


The backend acts as the **intelligence & scoring layer** for the dashboard.

---

## Tech Stack

- Node.js  
- Express.js  
- CORS, BodyParser  
- In-memory datastore  
- Render deployment  
- GitHub version control

---

## API Documentation

---

## 1. **POST /api/transactions**

Submit a transaction to the fraud engine.

### Request
```json
{
  "data": {
    "amount": 250000,
    "source": "0xA1B2",
    "dest": "0xC3D4",
    "tick": 12045,
    "procedure": "QxAddToBidOrder"
  }
}
```

Response:

```json
{
  "status": "ok",
  "transaction": {
    "id": 15,
    "amount": 250000,
    "source": "0xA1B2",
    "dest": "0xC3D4",
    "tick": 12045,
    "riskScore": 65,
    "riskLevel": "HIGH",
    "reasons": ["Large amount", "High-risk procedure"],
    "time": "2025-01-01T11:45:00.230Z"
  }
}
```

2. GET /api/transactions

Returns all transactions (latest first).

3. GET /api/transactions/latest

Returns the most recent incoming transaction.

4. GET /api/summary

Provides system-wide analytics.

```json
{
  "totalTransactions": 142,
  "totalVolume": 9120000,
  "uniqueWallets": 32,
  "byLevel": {
    "LOW": 68,
    "MEDIUM": 42,
    "HIGH": 20,
    "CRITICAL": 12
  }
}
```

## Live Backend

Base URL:  
https://qubic-fraud-backend.onrender.com

### API Endpoints
GET /api/transactions  
GET /api/transactions/latest  
GET /api/summary  
POST /api/transactions  

## Qubic Command Center is built as a complete end-to-end prototype demonstrating how Qubic events can be monitored, analyzed, and automated in real time. The system is modular and ready for future expansion once public event streams become accessible. Thank you for reviewing this project!





