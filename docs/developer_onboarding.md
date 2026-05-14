# H365 Developer Onboarding & Architecture Guide

Welcome to the H365 development team. This guide will help you set up your environment and understand our "Offline-First" architecture.

## 1. Local Environment Setup
### Prerequisites
*   **Node.js**: v18.x or higher.
*   **Package Manager**: npm or yarn.
*   **Docker**: Required for local facility node simulation.

### Getting Started
1.  **Clone the Repo**: `git clone <repo-url>`
2.  **Install Dependencies**: `npm install`
3.  **Environment Variables**: Create a `.env.local` file with:
    ```env
    GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    ```
4.  **Run Development Server**: `npm run dev`

## 2. Core Architecture: Offline-First (L-LAN)
H365 is designed to survive internet outages in remote hospitals.

### Data Flow
1.  **UI Interaction**: Handled by React Client Components.
2.  **Persistence**: Every write operation passes through the `OfflineManager`. Data is instantly saved to `localStorage` (Disk) and kept in a memory cache.
3.  **Synchronization**: The `OfflineProvider` monitors network status. When online, it pushes the local "Sync Queue" to the central server via the API.

## 3. Global Contexts
*   **`UserContext`**: Manages RBAC (Role-Based Access Control) and user identity.
*   **`LocaleContext`**: Handles internationalization (i18n) for EN, PT, IT, and DE.
*   **`OfflineContext`**: Tracks connectivity and sync status.

## 4. UI & Design System
We use a **Glassmorphic Design System** built on:
*   **Tailwind CSS**: For all styling.
*   **Shadcn UI**: For base components (Buttons, Cards, Modals).
*   **Lucide React**: For consistent iconography.
*   **Framer Motion**: For micro-animations and page transitions.

### Guidelines
*   Use the `glass-card` utility for container surfaces.
*   Always implement `dark mode` support using Tailwind's `dark:` classes.
*   Every interactive element must have an `id` for automated testing.

## 5. AI Integration (Genkit)
Our clinical decision support uses **Google Genkit** with Gemini 2.0.
*   Logic is located in `src/ai/genkit.ts`.
*   AI features are typically triggered via Server Actions or dedicated API routes to keep API keys secure.
