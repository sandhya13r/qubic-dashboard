# QUBIC COMMAND CENTER — Real-Time Telemetry & Analytics Dashboard

A modern, neon-styled analytics dashboard that visualizes Qubic blockchain activity through live telemetry, fraud monitoring, analytics, leaderboards, and EasyConnect automation workflows.

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
- Vercel (Frontend)  
- Render (Backend)

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



