# AI Integration, Ethics & Safety Policy

H365 integrates Artificial Intelligence to support clinicians in low-resource environments. This document outlines the technical implementation, ethical boundaries, and safety protocols for our AI Decision Support System (DSS).

## 1. Technical Framework
*   **Engine**: Google Gemini 2.0 Flash via the **Genkit** framework.
*   **Deployment**: Hybrid. Inference happens in the cloud when connected, or via local facility models (planned) in complete isolation.
*   **Data Minimization**: Only relevant clinical parameters (vitals, symptoms, anonymized lab values) are sent to the AI. Patient PII (Names, National IDs) is **never** sent to the LLM.

## 2. Ethical Principles
*   **Human-in-the-Loop**: The AI never makes autonomous clinical decisions. Every suggestion (diagnosis, prescription) must be explicitly reviewed and "Signed Off" by a licensed clinician.
*   **Transparency**: AI-generated content is clearly marked with a specific badge and color-coding to distinguish it from human-entered data.
*   **Auditability**: Every AI interaction is logged with a timestamp, clinician ID, and the outcome (Accepted/Rejected/Modified), creating a clear audit trail for quality assurance.

## 3. Safety Protocols
### Clinical Guardrails
*   **Prescription Safety**: AI-suggested prescriptions are cross-referenced with the hospital's local drug formulary.
*   **Risk Interpretation**: The system uses deterministic logic (not AI) for critical vitals (e.g., Hypertensive Crisis) to ensure 100% reliability for life-threatening alerts.

### Bias Mitigation
*   The system is prompted to follow international standards (WHO Protocols) to minimize regional or demographic biases in diagnostic suggestions.

## 4. Clinician Guidance
*   **Treat as a Peer, not an Authority**: The AI is intended to provide a "second pair of eyes," especially useful during high-volume shifts or in remote posts where specialists are unavailable.
*   **Verification**: Always verify the suggested medication dosage against the patient's weight and history before dispensing.
