/**
 * DHIS2 Interoperability Mapping Registry
 * Maps Clinical Diagnosis Codes (ICD-10/SNOMED) to National DHIS2 Data Element IDs.
 */

export const DHIS2_MAPPINGS = {
  // MALARIA (Aggregate Dataset: CD_MALARIA)
  'MALARIA_CONFIRMED_RDT': {
    dhis2Id: 'H1234567890',
    name: 'Malaria confirmed (RDT+)',
    codes: ['B50', 'B51', 'B52', 'B53', 'B54'], // ICD-10 for Malaria
  },
  'MALARIA_SEVERE': {
    dhis2Id: 'M9988776655',
    name: 'Severe Malaria hospitalized',
    codes: ['B50.0'],
  },

  // HIV/AIDS (Aggregate Dataset: CD_HIV)
  'HIV_TEST_POSTIVE': {
    dhis2Id: 'T5544332211',
    name: 'HIV newly diagnosed positive',
    codes: ['Z21', 'B20', 'B21', 'B22', 'B23', 'B24'],
  },

  // TUBERCULOSIS (Aggregate Dataset: CD_TB)
  'TB_NEW_CASE': {
    dhis2Id: 'TB001122334',
    name: 'TB new cases (All forms)',
    codes: ['A15', 'A16', 'A17', 'A18', 'A19'],
  },

  // REPRODUCTIVE HEALTH (Aggregate Dataset: RH_ANC)
  'ANC_FIRST_VISIT': {
    dhis2Id: 'A9876543210',
    name: 'ANC 1st Visit attendance',
    codes: ['Z34.0', 'Z34.8', 'Z34.9'],
  },
  'ANC_FOURTH_VISIT': {
    dhis2Id: 'A4433221100',
    name: 'ANC 4th Visit attendance',
    codes: ['Z34.0'], // Logic would differentiate by visit number in clinical metadata
  },

  // CHILD HEALTH / VACCINATION (Aggregate Dataset: CH_IMM)
  'BCG_VACCINATION': {
    dhis2Id: 'V1122334455',
    name: 'BCG Doses Administered',
    codes: ['Z23.2'],
  },
  'PENTA_3_VACCINATION': {
    dhis2Id: 'V9988771122',
    name: 'Penta 3 Doses Administered',
    codes: ['Z27.1'],
  },

  // NON-COMMUNICABLE DISEASES
  'HYPERTENSION_NEW': {
    dhis2Id: 'NCD112233',
    name: 'Hypertension newly diagnosed',
    codes: ['I10', 'I11', 'I12', 'I13', 'I15'],
  },
  'DIABETES_NEW': {
    dhis2Id: 'NCD445566',
    name: 'Diabetes Mellitus newly diagnosed',
    codes: ['E10', 'E11', 'E12', 'E13', 'E14'],
  }
};

/**
 * Utility to find a DHIS2 Data Element ID based on a diagnosis code.
 */
export const getDhis2IdByCode = (code) => {
  for (const [key, mapping] of Object.entries(DHIS2_MAPPINGS)) {
    if (mapping.codes.some(c => code.startsWith(c))) {
      return mapping.dhis2Id;
    }
  }
  return null;
};
