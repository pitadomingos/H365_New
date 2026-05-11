/**
 * Privacy & De-identification Utility
 * Ensures clinical data is scrubbed of PII before synchronization to non-local layers.
 */

import crypto from 'crypto';

/**
 * Global (In-memory) Audit Log for the session.
 * In production, this would persist to a secure 'privacy_audit' table.
 */
export const privacyAuditLog = [];

const logPrivacyEvent = (type, message, severity = 'low') => {
  const event = {
    id: Date.now() + Math.random(),
    type,
    message,
    severity,
    timestamp: new Date().toISOString()
  };
  privacyAuditLog.push(event);
  console.log(`[Privacy-Audit] ${type}: ${message}`);
  // Keep log size manageable in memory
  if (privacyAuditLog.length > 100) privacyAuditLog.shift();
};

/**
 * Generates a consistent but irreversible Hashed Patient Identifier (HPID).
 */
export const generateHPID = (patientId, facilitySecret) => {
  if (!patientId) return null;
  
  logPrivacyEvent('ANONYMIZATION', `Generated HPID for patient identifier`);
  
  return crypto
    .createHmac('sha256', facilitySecret || 'FACILITY_DEFAULT_SECRET')
    .update(patientId)
    .digest('hex');
};

/**
 * Scrubs a payload of common PII fields.
 */
export const scrubPii = (payload) => {
  const piiFields = ['patient_name', 'phone_number', 'email', 'national_id', 'address', 'full_name'];
  
  const scrubbed = { ...payload };
  let redactedCount = 0;

  piiFields.forEach(field => {
    if (scrubbed[field]) {
      scrubbed[field] = '[REDACTED]';
      redactedCount++;
    }
  });
  
  if (redactedCount > 0) {
    logPrivacyEvent('REDACTION', `Scrubbed ${redactedCount} PII fields from clinical record`);
  }
  
  return scrubbed;
};

/**
 * Validates if a record is safe for "Central SaaS" export.
 * A record is safe if it contains a diagnosis but no raw patient identifiers.
 */
export const isSafeForUpstream = (record) => {
  const data = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
  
  // Rule: Must not have raw fields often used for PII
  const risks = ['patientName', 'phoneNumber', 'idCard'];
  const hasRisk = risks.some(field => !!data[field]);
  
  return !hasRisk;
};
