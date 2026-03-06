# 🚀 CivicPulse AI – Urban Crisis Intelligence System

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Express-4.x-black?style=for-the-badge&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/AI-Gemini-orange?style=for-the-badge&logo=google" alt="Gemini">
  <img src="https://img.shields.io/badge/Maps-Leaflet-green?style=for-the-badge&logo=leaflet" alt="Leaflet">
</p>

---

## 📌 Overview

**CivicPulse AI** is an intelligent Urban Crisis Intelligence System designed to manage citizen-reported city issues such as infrastructure damage, service disruptions, sanitation problems, and public safety concerns.

The system enables:
- **Citizens** to report issues with AI-powered categorization and severity scoring
- **Authorities** to track, manage, and update issue status in real-time
- **Administrators** to monitor city health, detect crisis clusters, and balance officer workloads

---

## ✨ Key Features

### 1️⃣ AI-Powered Issue Reporting
- **Intelligent Classification**: Gemini 3 Flash model automatically categorizes reports (Infrastructure, Sanitation, Roads, Water Supply, Electricity, Public Safety)
- **Severity Scoring**: Assigns severity levels (Low, Medium, High, Critical) based on analysis
- **Image AI Verification**: Verifies uploaded images match the reported issue
- **Sentiment & Multilingual Support**: Detects citizen frustration levels and supports Hindi, Marathi, and other languages

### 2️⃣ Real-Time Intelligence Dashboard
- **Live Updates**: WebSocket (Socket.io) powered instant updates across all connected clients
- **D3.js Heatmaps**: Animated visualization of issue density by ward
- **Crisis Cluster Detection**: Automatic alerts when multiple issues reported in small radius within 6-hour window

### 3️⃣ Citizen Self-Service & Tracking
- **No-Login Tracking**: Track submissions using phone number
- **Unique ID System**: Every issue receives professional ID (e.g., CIV-2026-XJ92K1)
- **QR Code Generation**: Mobile-friendly tracking via unique QR codes
- **Timeline View**: Full lifecycle visualization from Reported to Resolved

### 4️⃣ Admin Intelligence Panel
- **Officer Workload Balancing**: Real-time tracking to prevent burnout
- **Ward Health Scoring**: Composite 0-100 score based on resolution speed and recurrence
- **Lifecycle Management**: Status updates instantly notify citizens

---

## 🛠 Technical Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Tailwind CSS 4, Lucide React, Motion, D3.js, Recharts |
| **Backend** | Express.js, Socket.io, Better-SQLite3 |
| **AI** | Google Gemini API (@google/genai) |
| **Maps** | Leaflet.js with OpenStreetMap |
| **Build** | Vite, TypeScript |

---

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Gemini API Key

### Installation

```bash
# Install dependencies
npm install

# Start development server (runs both frontend & backend)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

---

## 🔄 Core Features

### Issue Reporting
Citizens can submit:
- Title
- Description  
- Location (via interactive map)
- Phone number (for tracking)
- Photo (optional)

Each issue receives a unique ID: `CIV-YYYY-XXXXXX`

### AI-Based Classification
When an issue is submitted:
- Automatically categorized
- Severity score calculated
- Language and sentiment detected
- Resolution time estimated

### Issue Lifecycle
Issues move through statuses:
```
reported → verified → assigned → in_progress → resolved → closed
                        ↓
                     escalated
```

### Crisis Cluster Detection
System detects crisis clusters when:
- Multiple issues
- Within small geographic radius (<200m)
- In recent time window (last 6 hours)

---

## 🏗 System Architecture

```
CivicPulse-AI/
├── src/                      # Frontend React application
│   ├── components/          # React components
│   │   ├── MapPicker.tsx    # Interactive map component
│   │   └── WardHeatmap.tsx  # D3.js heatmap visualization
│   ├── services/            # API services
│   │   └── geminiService.ts # Gemini AI integration
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   └── types.ts             # TypeScript definitions
├── server.ts                # Express backend server
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

---

## 🌐 API Endpoints

### Issues

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Get dashboard statistics |
| `POST` | `/api/issues` | Create new issue |
| `GET` | `/api/issues/track/:phone` | Track issues by phone |
| `POST` | `/api/issues/:id/status` | Update issue status |
| `GET` | `/api/crisis` | Get crisis clusters |

### WebSocket Events

| Event | Description |
|-------|-------------|
| `new_issue` | Broadcast when new issue is created |
| `issue_updated` | Broadcast when issue status changes |

---

## 📱 Usage Guide

### For Citizens

1. **Report an Issue**
   - Navigate to "Report" tab
   - Fill in issue details
   - Select location on map
   - Submit and receive tracking ID

2. **Track Your Issue**
   - Go to "Track" tab
   - Enter your phone number
   - View all your submitted issues
   - Scan QR code for mobile tracking

### For Administrators

1. **Monitor Dashboard**
   - View real-time statistics
   - See ward health scores
   - Identify crisis clusters

2. **Manage Issues**
   - Update issue status
   - Assign to officers
   - Monitor workload distribution

---

## 🔥 Advanced Intelligence Layer

- **AI-based category prediction** using Gemini
- **Severity scoring** with keyword weighting
- **Time-sensitive severity adjustments**
- **Estimated resolution SLA calculation**
- **Geo-cluster crisis detection**
- **Multilingual support** (Hindi, Marathi, English)

---

## 🎯 Submission Summary

- ✅ Backend Issue Management System
- ✅ Category & Location Organization
- ✅ Status Lifecycle Tracking
- ✅ AI-Powered Classification (Gemini)
- ✅ Severity Scoring
- ✅ Crisis Cluster Detection
- ✅ Citizen Tracking Portal
- ✅ Real-time Dashboard with WebSocket
- ✅ Interactive Maps & Heatmaps

---

## 👨‍💻 Team

Developed as part of Hackathon submission for **Citizen Issue Processing System**

---


