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
