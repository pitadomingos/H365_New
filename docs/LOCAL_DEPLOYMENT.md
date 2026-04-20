# HealthFlow H365: Local Facility Deployment Guide

This guide outlines the setup of the "Local Edge Node" for the H365 SaaS platform.

## 1. Hardware Requirements
* **Standard Facility Server:** Mini-PC (e.g., Intel NUC) or repurposed workstation.
* **CPU:** 4+ Cores (Modern i5 or equivalent).
* **RAM:** 8GB Minimum (16GB recommended for imaging cached storage).
* **Storage:** 500GB SSD (RAID 1 recommended for clinical data safety).
* **Network:** Local static IP on the Facility LAN.

## 2. Software Architecture
The local instance runs as a **Containerized Mirror** of the cloud environment.

### Components:
1. **Application Proxy (Nginx):** Handles local requests (e.g., `http://h365.local`).
2. **App Node (React/Next.js):** The interface you see here.
3. **Local Database (PostgreSQL/MongoDB):** Stores immediate facility data.
4. **Sync Agent:** A background service that manages bidirectional cloud sync.

## 3. Local Deployment via Docker Compose

```yaml
version: '3.8'
services:
  app-frontend:
    image: h365/healthflow-ui:latest
    ports:
      - "80:3000"
    environment:
      - NEXT_PUBLIC_MODE=local
      - SYNC_SERVER_URL=https://cloud.h365.gov.na
    restart: always

  local-db:
    image: postgres:15-alpine
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=facility_secure_pass

  sync-service:
    image: h365/sync-agent:latest
    depends_on:
      - local-db
    environment:
      - CLOUD_API_KEY=${FACILITY_SYNC_KEY}
```

## 4. Synchronization Strategy
* **Eventual Consistency:** Data is committed locally first. The `sync-service` maintains a "Sync Queue."
* **Conflict Resolution:** "Cloud-as-Master" policy for global records (e.g., updated protocols). "Local-as-Source" for clinical observations.
* **Low-Bandwidth Optimization:** Uses Delta-Sync (only sending changes, not full records) and Gzip compression.
