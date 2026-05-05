# HealthFlow: Public Hospital Digital SaaS Platform

HealthFlow is a production-ready, local-first SaaS platform designed for public hospitals in low-resource and developing-country environments. It aligns with WHO Digital Health Guidelines and OpenHIE architecture.

## 🚀 Key Modules

### 🏥 Clinical & Patient Management
- **Local-First Patient Registration**: Zero-latency entry even during server downtime.
- **Consultation & Waiting List**: Real-time triage and doctor-specific queue management.
- **AI-Powered Treatment Recommendations**: Assistive AI (Gemini) providing SOP-aligned diagnosis and prescription suggestions with full clinical auditability.
- **Chronic Care Messaging (HIV/TB)**: Automated medication adherence monitoring with SMS-based patient interaction and response tracking.

### 📦 Logistics & Infrastructure
- **Smart Inventory Management**: Real-time stock tracking with automated reorder alerts for consumables and PPE.
- **Biomedical Engineering (BME)**: Asset lifecycle tracking, maintenance scheduling, and downtime monitoring.

### 🏗️ Technical Architecture (L-LAN First)
- **Local-First Synchronization**: Uses `IndexedDB` for local persistence, ensuring data survives browser refreshes and machine restarts.
- **Offline-to-Online Sync**: Background workers manage data reconciliation between individual workstations and the hospital's central LAN server.
- **Multilingual Support**: Dynamic translation layer (i18n) supporting English, Portuguese, and local dialects.

## 📁 Documentation
- [Architecture Blueprint](./docs/blueprint.md)
- [Offline vs LAN Sync Architecture](./docs/OFFLINE_ARCHITECTURE.md)
- [Local Deployment Guide](./docs/LOCAL_DEPLOYMENT.md)
- [API Reference](./docs/api_endpoints.md)

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Local Database**: IndexedDB (via LocalDB)
- **Icons**: Lucide React
- **Animations**: Motion (framer-motion)
