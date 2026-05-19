/**
 * PHI (Protected Health Information) Sanitizer Utility
 */

export interface PatientPHI {
  name?: string;
  fullName?: string;
  patientName?: string;
  nationalId?: string;
  phoneNumber?: string;
  phone?: string;
  age?: number | string;
  gender?: string;
  [key: string]: any;
}

/**
 * Calculates a generic age range string (e.g. "Age 40-50") from a given age.
 */
export function getAgeRange(age?: number | string): string {
  if (age === undefined || age === null || age === "") return "Age Unknown";
  const ageNum = typeof age === "string" ? parseInt(age, 10) : age;
  if (isNaN(ageNum)) return "Age Unknown";
  
  const bracketSize = 10;
  const start = Math.floor(ageNum / bracketSize) * bracketSize;
  const end = start + bracketSize;
  return `Age ${start}-${end}`;
}

/**
 * Sanitizes a patient record object, scrubbing direct identifiers and replacing
 * them with generic demographic descriptors to satisfy privacy regulations.
 */
export function sanitizePatientData<T extends PatientPHI>(patient: T): any {
  if (!patient) return patient;
  
  const sanitized = { ...patient } as any;
  
  // Scrub names
  if (sanitized.name) sanitized.name = "REDACTED_PATIENT";
  if (sanitized.fullName) sanitized.fullName = "REDACTED_PATIENT";
  if (sanitized.patientName) sanitized.patientName = "REDACTED_PATIENT";
  
  // Scrub direct identifiers
  if (sanitized.nationalId) sanitized.nationalId = "REDACTED_ID";
  if (sanitized.phoneNumber) sanitized.phoneNumber = "REDACTED_PHONE";
  if (sanitized.phone) sanitized.phone = "REDACTED_PHONE";
  
  // Convert exact age to range
  if (sanitized.age !== undefined) {
    sanitized.demographicAge = getAgeRange(sanitized.age);
    delete sanitized.age;
  }
  
  return sanitized;
}

/**
 * Sanitizes raw text string containing possible direct identifiers by applying regex rules.
 */
export function sanitizeText(text: string): string {
  if (!text) return text;
  
  let cleaned = text;
  
  // Simple phone number pattern regex
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  cleaned = cleaned.replace(phoneRegex, "[REDACTED_PHONE]");
  
  // Simple National ID pattern regex
  const idRegex = /\b\d{9,12}[A-Za-z]?\b/g;
  cleaned = cleaned.replace(idRegex, "[REDACTED_ID]");
  
  return cleaned;
}
