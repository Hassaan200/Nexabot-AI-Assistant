# 🤖 Veloxa — AI Customer Assistant Platform

> Add a 24/7 AI assistant to any business website in 60 seconds.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://Veloxa-ai-assistant-seven.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Vercel-black)](https://Veloxa-ai-assistant.vercel.app)

---

## 🚀 What is Veloxa?

Veloxa is a **multi-tenant SaaS platform** that gives any business a 
24/7 AI-powered customer assistant. One script tag — instant chatbot.

**Real problems it solves:**
- Customers ask questions at 2AM — no one replies → they leave
- Appointment booking wastes staff time → bot handles it automatically  
- Website visitors leave without info — Veloxa captures every lead

---

## ✨ Features

- 🤖 **AI-Powered Chat** — Gemini 2.5 Flash, context-aware responses
- 📅 **Smart Booking Flow** — Collects name, date, time, phone step by step
- 🔄 **Appointment Rescheduling** — Customer can update existing bookings
- 🏢 **Multi-Tenant** — Each business gets isolated data + custom bot
- 🎨 **Fully Customizable** — Bot name, color, personality per client
- 📊 **Live Dashboard** — Conversations, bookings, stats in real time
- 💳 **Subscription Plans** — Trial, Starter, Business tiers
- 🔌 **One Line Install** — Paste script tag anywhere

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| AI | Google Gemini 2.5 Flash |
| Database | MySQL (Aiven.io) |
| Frontend | React + Tailwind CSS |
| Deployment | Vercel |
| Auth | JWT + bcrypt |

---

## 📁 Project Structure
Veloxa/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, error handling
│   │   ├── routes/        # API endpoints
│   │   └── services/      # AI, booking logic
│   ├── public/
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios setup
│   │   ├── components/    # Sidebar, navbar
│   │   ├── context/       # Auth context
│   │   └── pages/         # Dashboard, bookings, etc
│   └── index.html
└── database/
└── Nexa-schema.sql

---

## 🔌 How Client Integration Works

Client pastes ONE line on their website:

```html
<script 
  src="https://Veloxa-ai-assistant.vercel.app/widget.js?key=CLIENT_API_KEY" 
  data-api-key="CLIENT_API_KEY">
</script>
```

Instantly gets a fully functional AI chatbot — no setup, no coding.

---

## 📡 API Endpoints

POST   /api/auth/register          # New client signup
POST   /api/auth/login             # Login + JWT
GET    /api/auth/profile           # Client profile
PUT    /api/auth/settings          # Update bot settings
POST   /api/chat                   # Widget chat endpoint
GET    /api/dashboard/stats        # Usage statistics
GET    /api/dashboard/bookings     # All bookings
PATCH  /api/dashboard/bookings/:id/status  # Update status
GET    /api/dashboard/conversations        # Chat history
POST   /api/admin/upgrade          # Upgrade client plan (admin)
GET    /api/admin/clients          # All clients (admin)

---

## 💰 Business Model

| Plan | Price | Messages | Use Case |
|------|-------|----------|----------|
| Trial | Free | 100/month | Testing |
| Starter | $99/mo | 2,000/month | Small business |
| Business | $199/mo | 10,000/month | High traffic |

---

## 🏃 Run Locally

```bash
# Clone
git clone https://github.com/username/Veloxa.git

# Backend
cd backend
npm install
cp .env.example .env    # Fill your credentials
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

**Required .env variables:**

DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
GEMINI_API_KEY=
JWT_SECRET=
SERVER_URL=
ADMIN_SECRET_KEY=

---

## 🎯 Target Market

Pakistani small businesses:
- Medical/Dental Clinics
- Restaurants & Food Delivery  
- Salons & Beauty Parlors
- Driving Schools
- Tuition Academies
- Property Dealers

---

## 👨‍💻 Built By

**Hassan** — Full Stack Developer  
[GitHub](https://github.com/Hassaan200) · [LinkedIn](https://www.linkedin.com/in/hassaan-khaliq-a93921281)

---

> *"Give your business a 24/7 AI receptionist. One line of code. Done."*