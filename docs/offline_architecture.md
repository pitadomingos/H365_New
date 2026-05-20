# Offline-First & LAN-local Architecture

This application is designed for low-resource environments (Public Hospitals) where internet connectivity might be unstable, but a Local Area Network (LAN) is available.

## Core Identity: Local-First SaaS

The platform operates on a "Local-First" principle:
1.  **Immediate UI Response**: Every user action is instantly committed to the local machine's memory and disk.
2.  **Volatile Memory Cache**: All active data is kept in memory for zero-latency interactions.
3.  **Persistent Local Storage**: Data is saved to the local hard drive using `LocalDB` (IndexedDB/localStorage). This ensures that **data survives machine restarts, browser refreshes, and power outages**.
4.  **Background LAN Sync**: A background process (`OfflineManager`) monitors the local queue and pushes updates to the LAN server whenever the connection is stable.

## How it works

### 1. `OfflineManager.ts`
The brain of the system. It manages the two-tier storage:
- **Tier 1 (Memory)**: Fast, non-persistent cache for the current session.
- **Tier 2 (LocalDB)**: Persistent on the hard drive. 

### 2. `OfflineProvider.tsx`
A React Context that wraps the entire application. It:
- Monitors `online`/`offline` navigator events.
- Triggers initial hydration from disk to memory on app load.
- Orchestrates the periodic sync (every 5 minutes or on connection recovery).

### 3. Data Flow
- **Reading**: UI requests data -> `OfflineManager` checks Memory -> then Disk.
- **Writing**: UI submits form -> `OfflineManager` updates Memory -> Persists to Disk -> Adds to Sync Queue -> Attempts LAN Push.

## Clinical Safety & Reliability
- **Restart Resilience**: Since we use `LocalDB`, a mechanical failure or reboot will not result in data loss for already-committed entries.
- **Auditability**: All local transformations are queued with timestamps, ensuring the server can reconstruct the clinical timeline accurately once synced.

---

## 4. H365 Public Health & Campaign Offline Buffering

H365 extends the offline-first framework with dedicated support for **mobile outreach campaigns and vaccination brigades** operating in remote environments with zero network access:

### A. Mobile Brigade Local Observation Cache
When mobile teams record a vaccination or mosquito net distribution report in the field, H365:
1. Validates quantities locally (ensuring absolute doses do not conflict with expected target populations).
2. Formats the local entry into a standard **HL7 FHIR Observation** on-the-fly.
3. Automatically queues the payload in an in-memory queue, incrementing the pending synchronization queue counter shown in the top header.

### B. Cold Chain Efficacy Verification Locks
Because biological vaccine stocks are highly sensitive to thermal shocks, H365 locks all offline entry submissions through a **Cold Chain Quality Assurance Checker**:
* **Thermometer Audit**: Verifies vaccine carriers remain within the safe $+2^\circ\text{C}$ to $+8^\circ\text{C}$ window.
* **Ice Pack Checks**: Monitors freezer blocks within active carriers.
* **Vial Monitor (VVM) Guard**: Blocks data entries if a degraded **Stage 3 VVM (Rejected)** is selected, preventing the administration and logging of inactive or compromised vaccine doses.

### C. Forced Sync & Dynamic Dashboard Aggregation
When the field team returns to network boundaries, clicking the **"Sincronizar"** icon merges the buffered observations directly into the stateful database:
* The dashboard recalculates and aggregates all charts (CPN4 retention funnels, measles coverages, TB cures, and malaria cases) instantly.
* The synchronized data is immediately translated into the global D2A framework and logged in the district SIS-MA (DHIS2) schema.
