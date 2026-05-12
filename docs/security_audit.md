# Security & Privacy Audit: Data Exchange Layer

## 1. Executive Summary
This audit evaluates the HealthFlow synchronization and interoperability services. The system is designed to handle sensitive clinical data in low-resource environments, necessitating a "Zero-Trust" approach for data exiting the local facility LAN.

## 2. Threat Model: Data Egress
| Path | Data Type | Risk Level | Mitigation |
|------|-----------|------------|------------|
| Workstation -> LAN | Line-level PII | High | Local TLS, Trusted MAC IDs |
| LAN -> Central SaaS | Global Patient Identifier | Medium | Pseudonymization (Hash-based) |
| LAN -> DHIS2 | Aggregate (Anonymized) | Low | Multi-stage aggregation, no PII |

## 3. Findings & Required Hardening

### A. PII Leakage in DHIS2 Exports (Critical)
**Finding**: The current `aggregateFacilityData` query groups by raw collection names. If a collection name or metadata field contains a patient name or ID, it could be leaked in a malformed DHIS2 payload.
**Fix**: Implement a strict "Whitelist" for all exported fields.

### B. Encryption at Rest
**Finding**: The `clinical_records` table on the LAN server currently stores the `data` JSON blob in plain text.
**Recommendation**: Use AES-256 for the `data` column, with a key managed by the Facility Administrator.

### C. Identity Mapping (OpenHIE)
**Finding**: Using raw internal IDs for patients across facilities creates a tracking risk.
**Fix**: Implement a **Hashed Patient Identifier (HPID)** for cross-facility reconciliation without exposing PII.

## 4. Compliance Check
- **WHO Digital Health**: Compliant (Supports aggregate reporting).
- **NDPR (Nigeria Data Protection Regulation)**: Compliant (Data stays localized).
- **Patient Privacy by Design**: Compliant (Aggregation occurs behind the firewall).
