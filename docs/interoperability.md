# Interoperability & OpenHIE Standards
## Overview
HealthFlow H365 is designed to be a key node in the National Health Information Exchange.

## Standards Compliance
- **FHIR R4:** Standard for health data exchange.
- **HL7 v2.x:** Support for legacy laboratory and imaging systems.
- **OpenHIE:** Aligned with the national health architecture blueprint.
# Interoperability & DHIS2 Mapping Strategy

This document outlines the strategy for mapping clinical data from the HealthFlow platform to the National DHIS2 instance, following OpenHIE standards.

## 1. Architectural Approach
HealthFlow uses an **Aggregate Reporting** pattern for DHIS2. While individual patient records are stored locally and in the central SaaS, only anonymized, aggregated indicators are pushed to DHIS2.

- **Source**: `clinical_records` table on the LAN/Central server.
- **Transform**: Aggregation engine counts events (e.g., "Malaria Cases (Confirmed)") filtered by date and facility.
- **Destination**: DHIS2 `api/dataValueSets` endpoint.

## 2. Core Mappings (Example)

| Clinical Event | Source Code (ICD-10/Concept) | DHIS2 Data Element ID | DHIS2 Name |
|----------------|-----------------------------|-----------------------|------------|
| Malaria (RDT+) | `B50` - `B54` | `H1234567890` | Malaria confirmed (RDT+) |
| Severe Malaria | `B50.0` | `M9988776655` | Severe Malaria hospitalized |
| HIV (New Cases)| `Z21`, `B20-B24` | `T5544332211` | HIV newly diagnosed positive |
| ANC 1st Visit  | `Z34.0`, `Z34.9` | `A9876543210` | ANC 1st Visit attendance |
| BCG Vaccine    | `Z23.2` | `V1122334455` | BCG Doses Administered |
| Hypertension   | `I10` | `NCD112233` | Hypertension newly diagnosed |

### 3. Organizational Mapping
Every facility in HealthFlow must have a registered `Dhis2OrgUnitId`.
- **Level 1**: National (Federal Ministry of Health)
- **Level 2**: State/Province
- **Level 3**: LGA/District
- **Level 4**: Facility (HealthFlow Sync Point)

### 4. Implementation Logic: The Mapping Registry
The system utilizes a `mapping-registry.js` fallback mechanism:
1. **Explicit Code Match**: The aggregation engine primarily looks for standardized codes (ICD-10 for diagnoses, LOINC for labs).
2. **Collection Fallback**: If no specific code is found, it maps based on the internal `collection` name (e.g., `MaternityVisits`).
3. **Regex Wildcards**: Codes like `B50` will capture all sub-codes (e.g., `B50.1`, `B50.8`) to ensure robust aggregation.
3. Format as `JSON DataValueSet`:
   ```json
   {
     "dataSet": "p8df23v8s",
     "orgUnit": "vI73fsv2",
     "period": "202401",
     "dataValues": [
       { "dataElement": "f78s2v", "value": "42" },
       { "dataElement": "b8v2sc", "value": "12" }
     ]
   }
   ```
