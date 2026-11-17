# SmartDisposal ♻️🌍

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://smart-disposal.vercel.app/)
[![Render Deployment](https://img.shields.io/badge/Backend-Live%20on%20Render-informational?style=for-the-badge&logo=render)](https://smart-disposal.onrender.com/api/health)
[![System Status](https://img.shields.io/badge/Status-Production%20v1.0-blue?style=for-the-badge)](https://smart-disposal.vercel.app/)

**Know what you throw. Choose what returns to earth.**

**SmartDisposal** is a full-stack, interactive web application that helps users check whether everyday products and packaging are biodegradable, inspect how long they take to break down, understand what biological or chemical byproducts they leave behind, and switch to greener alternatives.

It combines a curated material science database, live camera and barcode scanning, and Gemini-powered visual identification to turn a simple "can I throw this away?" question into a clear, actionable eco-decision.

---

## 🌐 Live Production Deployments

- 🖥️ **Live Web Application**: [https://smart-disposal.vercel.app/](https://smart-disposal.vercel.app/)
- ⚙️ **Live Backend REST API**: [https://smart-disposal.onrender.com/](https://smart-disposal.onrender.com/)
- 🩺 **API Health Check**: [https://smart-disposal.onrender.com/api/health](https://smart-disposal.onrender.com/api/health)

> ⏳ **Note:** The backend runs on Render, so the first photo-identification request after a period of inactivity may take a few seconds while the service wakes up.

---

## 🌟 Core System Features

1. **🔍 Product & Material Checker**: Search everyday items or retail UPC/EAN barcodes to get instant biodegradability verdicts, logarithmic decomposition timelines (days to centuries+), environmental breakdown outputs, and verified material science explanations.
2. **📸 Camera Capture & Visual Material Identification**: Live browser camera preview with front/back switching, shutter capture (**Take Picture**), retake flow, and image upload fallback. Includes real-time browser `BarcodeDetector` lookup on live video frames and snapped photos.
3. **🤖 AI-Powered Photo Identification**: Server-side identification via `POST /api/identify-product` using the `@google/genai` SDK (`gemini-4-hydrogen`) that recognizes photographed items, matches known catalog entries, or generates a complete biodegradability profile with a greener swap.
4. **🗂️ Interactive Material Database**: Browse categorized materials (*Plastics, Paper, Food Waste, Textiles, Metals, Glass, Packaging, Electronics*) and compare options inside a curved 3D showcase carousel.
5. **🌱 Greener Alternatives Engine**: Direct reusable or compostable swaps for every analyzed item, so every verdict ends with a better choice.
6. **📊 Personal Switch Tracker**: Persistent browser-local history, saved items, and tracked eco-friendly switches across the `Dashboard` and `Admin` registry views.
7. **🫧 Liquid-Glass UI & Animated Navigation**: Custom `.liquid-glass` design system with a collapsible navigation bar driven by the signature `"o"` power-leaf toggle, viewport-safe scroll masking, smooth page cross-fades, and `prefers-reduced-motion` support.

---

## 💻 Architecture & Tech Stack

| Layer | Technology | Role / Benefit |
|---|---|---|
| **Frontend UI** | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 | Fast, responsive, liquid-glass styled interface |
| **Icons** | Lucide Icons | Lightweight, consistent iconography |
| **Barcode Scanning** | Browser `BarcodeDetector` API | Client-side live UPC/EAN detection |
| **AI Vision** | `@google/genai` (`gemini-4-hydrogen`) | Photo-based material identification and profile generation |
| **Backend API** | Node.js 22+ + Express 4 | Image identification service with private API key handling |
| **Config** | `dotenv` | Secure environment variable management |
| **Deployment** | Vercel (Frontend) + Render (Backend) | Global edge CDN and cloud Node execution |

SmartDisposal can run either as a **unified full-stack Node/Express server** or split across **Vercel** (static CDN frontend) and **Render** (Express API backend):

- **Frontend (Vercel)**: `npm run build` → `dist/`. Uses `VITE_API_URL` to forward camera photo analysis requests to the Render backend.
- **Backend (Render)**: `server.ts` exposes `POST /api/identify-product` and `GET /api/health` with CORS headers (`FRONTEND_ORIGIN`), keeping `GEMINI_API_KEY` private on the server.

---

## 🧭 Application Modules

| Module | Purpose |
|---|---|
| **Product Checker** | Text, barcode, camera, and upload search with instant biodegradability verdicts and timelines. |
| **Materials Database** | Categorized material browser with a 3D showcase carousel for side-by-side comparison. |
| **Greener Alternatives** | Reusable and compostable swap suggestions for analyzed items. |
| **How It Works** | Step-by-step science walkthrough of decomposition. |
| **Dashboard** | Personal history, saved items, and tracked eco-friendly switches. |
| **Admin** | Registry view of tracked items and switches. |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v22+)
- npm
- A Gemini API key

### Installation & Run
```bash
# 1. Clone repository
git clone https://github.com/Debjit-prime/Smart-Disposal.git
cd Smart-Disposal

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY inside .env

# 4. Start the full-stack development server
npm run dev
```

*(The repository includes `.npmrc` with `legacy-peer-deps=true` for clean resolution across Vite 8 and Tailwind CSS v4.)*

- App + API: `http://localhost:3000`

### Useful Scripts
- `npm run dev` — Run full-stack development server (`tsx server.ts`)
- `npm run build` — Build production frontend bundle into `dist/`
- `npm start` — Run production Express server (`node server.ts`)
- `npm run lint` — Run TypeScript type checking (`tsc --noEmit`)

---

## 🔐 Environment Variables

| Variable | Where Used | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Backend (Render / Local `.env`) | Authenticates server-side image identification calls to Gemini |
| `NODE_ENV` | Backend (Render) | Set to `production` to serve built assets cleanly |
| `NODE_VERSION` | Backend (Render) | Set to `22` for native TypeScript execution via `node server.ts` |
| `FRONTEND_ORIGIN` | Backend (Render, optional) | Restricts CORS to your Vercel URL: `https://smart-disposal.vercel.app` (defaults to `*`) |
| `VITE_API_URL` | Frontend (Vercel) | Render backend base URL: `https://smart-disposal.onrender.com` |

---

## ☁️ Deployment Notes

### ⚙️ Backend on Render
- **Service URL**: `https://smart-disposal.onrender.com`
- **Build Command**: `npm install --include=dev && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**: `GEMINI_API_KEY`, `NODE_ENV=production`, `NODE_VERSION=22` (plus optional `FRONTEND_ORIGIN=https://smart-disposal.vercel.app`)

### 🖥️ Frontend on Vercel
- **Site URL**: `https://smart-disposal.vercel.app`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: `VITE_API_URL=https://smart-disposal.onrender.com`
