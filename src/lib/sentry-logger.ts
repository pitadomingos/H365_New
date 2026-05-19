/**
 * Mock Sentry Logger Utility
 */

export interface LogEntry {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

const STORAGE_KEY = 'h365_system_activity_log';

const defaultLogs = [
  { id: "sa001", user: "Dr. Smith", action: "updated patient chart for Alice Johnson.", timestamp: "2024-08-15 10:30:00 AM", details: "Added new medication: Aspirin 75mg" },
  { id: "sa002", user: "Reception", action: "registered new patient: Bob Williams.", timestamp: "2024-08-15 10:15:00 AM", details: "National ID: BW12345" },
  { id: "sa003", user: "LabTech01", action: "uploaded results for patient ID #7890.", timestamp: "2024-08-15 09:00:00 AM", details: "Test: CBC, Glucose. All normal." },
  { id: "sa004", user: "Nurse Eva", action: "scheduled follow-up for Mike Brown.", timestamp: "2024-08-15 07:00:00 AM", details: "Appointment on 2024-08-22." },
  { id: "sa005", user: "Ward A Admin", action: "discharged patient: Charlie Davis.", timestamp: "2024-08-15 05:00:00 AM" },
  { id: "sa006", user: "System", action: "Automated backup completed.", timestamp: "2024-08-15 03:00:00 AM" },
  { id: "sa007", user: "Dr. Jones", action: "ordered lab tests for patient: Sarah Miller.", timestamp: "2024-08-14 04:30:00 PM", details: "Tests: Lipid Panel, TSH" },
  { id: "sa008", user: "Pharmacist02", action: "dispensed medication for RX00123.", timestamp: "2024-08-14 03:15:00 PM", details: "Medication: Amoxicillin 250mg" },
  { id: "sa009", user: "AdminUser", action: "updated user role for 'nurse_eva'.", timestamp: "2024-08-14 02:00:00 PM", details: "Role changed to 'Senior Nurse'" },
  { id: "sa010", user: "ImagingTech", action: "uploaded X-Ray report for patient ID #5678.", timestamp: "2024-08-14 01:00:00 PM" },
  { id: "sa011", user: "Dr. Smith", action: "viewed patient record: Bob Williams.", timestamp: "2024-08-14 12:00:00 PM" },
  { id: "sa012", user: "System", action: "Low stock alert for Paracetamol triggered.", timestamp: "2024-08-14 11:00:00 AM" },
];

export class SentryLogger {
  static getLogs(): LogEntry[] {
    if (typeof window === 'undefined') return defaultLogs;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLogs));
        return defaultLogs;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error reading system logs from localStorage:", e);
      return defaultLogs;
    }
  }

  static logError(error: Error, context?: Record<string, any>): void {
    console.warn("[Mock Sentry] Error captured:", error.message, context);
    
    if (typeof window === 'undefined') return;

    try {
      const logs = this.getLogs();
      
      const newEntry: LogEntry = {
        id: `err-${Math.random().toString(36).substring(7)}`,
        user: "System (Sentry Logger)",
        action: `encountered critical error: ${error.name || "Error"}`,
        timestamp: new Date().toISOString(),
        details: `${error.message}${context ? ` | Context: ${JSON.stringify(context)}` : ''}`
      };

      logs.unshift(newEntry);
      
      if (logs.length > 50) {
        logs.splice(50);
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error("Error writing system logs to localStorage:", e);
    }
  }

  static logStorageQuotaError(error: DOMException | any): void {
    this.logError(new Error(`Storage quota exceeded: ${error.message || 'LocalStorage is full'}`), {
      type: "QuotaExceededError",
      storageType: "localStorage/IndexedDB"
    });
  }

  static logNetworkTimeout(url: string, timeoutMs: number): void {
    this.logError(new Error(`Network timeout reached while fetching: ${url}`), {
      type: "NetworkTimeout",
      timeoutMs
    });
  }
}
