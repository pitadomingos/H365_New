# H365 Database Schema & Data Models

This document defines the core data structures for the H365 platform, serving as the blueprint for the MySQL/PostgreSQL migration.

## 1. Core Entities

### `patients`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `national_id` | String | Unique Identifier |
| `full_name` | String | |
| `dob` | Date | |
| `gender` | Enum | Male, Female, Other |
| `photo_url` | String | Storage link |
| `chronic_conditions` | JSONB | Array of conditions |
| `allergies` | JSONB | Array of allergens |

### `consultations`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `patient_id` | UUID | Foreign Key |
| `doctor_id` | UUID | Foreign Key |
| `vitals` | JSONB | {temp, bp, weight, height, bmi} |
| `symptoms` | Text | |
| `ai_suggestions` | JSONB | {diagnosis, prescription, tips} |
| `final_diagnosis` | Text | |
| `status` | Enum | Draft, Completed |

### `maternity_profiles`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | |
| `patient_id` | UUID | |
| `lmp` | Date | Last Menstrual Period |
| `edd` | Date | Estimated Delivery Date |
| `gravida` | Integer | |
| `para` | Integer | |
| `risk_factors` | JSONB | |

### `vaccination_records`
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | |
| `patient_id` | UUID | |
| `vaccine_name` | String | |
| `dose_number` | Integer | |
| `administered_at` | Timestamp | |
| `batch_number` | String | |

## 2. Infrastructure Tables

### `sync_queue` (Offline Persistence)
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | |
| `facility_id` | String | |
| `payload` | JSONB | The data to be synced |
| `status` | Enum | Pending, Synced, Failed |
| `retry_count` | Integer | |

### `inventory` (Pharmacy/Lab)
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | |
| `item_name` | String | |
| `current_stock` | Integer | |
| `min_threshold` | Integer | Triggers low-stock alert |
| `unit` | String | e.g., "Sachets", "Vials" |

## 3. Relationships
*   **1:N**: Patient -> Consultations.
*   **1:1**: Patient -> Maternity Profile.
*   **1:N**: Ward -> Beds.
*   **N:M**: User -> Roles/Permissions.
