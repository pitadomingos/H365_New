export interface FHIRLocation {
  resourceType: "Location";
  id: string;
  name: string;
  physicalType: "facility" | "district" | "province" | "national";
  partOf?: string; // Reference to parent Location ID
}

export interface FHIRObservation {
  resourceType: "Observation";
  id: string;
  status: "final" | "amended" | "registered";
  category: "maternal" | "immunization" | "hiv" | "tb" | "malaria" | "financial" | "infrastructure" | "macro";
  code: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  subject: {
    reference: string; // Patient ID or population segment
    gender: "Male" | "Female" | "All";
    ageGroup: "<1y" | "1-4y" | "5-14y" | "15-49y" | "50y+" | "All";
  };
  effectiveDateTime: string; // YYYY-MM-DD format
  valueQuantity?: {
    value: number;
    unit: string;
  };
  // Numerator / Denominator component split for dynamic WHO calculations
  component?: Array<{
    code: { coding: Array<{ code: string; display: string }> };
    valueQuantity: { value: number; unit: string };
  }>;
  location: { reference: string }; // Reference to FHIRLocation id
}

export interface WHOIndicator {
  id: string;
  code: string;
  name: string;
  category: "maternal" | "immunization" | "hiv" | "tb" | "malaria" | "infrastructure" | "macro";
  numeratorDesc: string;
  denominatorDesc: string;
  target: number;
  unit: "%" | "por 1k" | "por 10k" | "por 100k";
}

export const WHO_INDICATORS: Record<string, WHOIndicator> = {
  ANC1: { id: "ANC1", code: "ANC1", name: "Cobertura de CPN 1ª Consulta", category: "maternal", numeratorDesc: "Mulheres com 1ª CPN", denominatorDesc: "Grávidas Esperadas", target: 95, unit: "%" },
  ANC4: { id: "ANC4", code: "ANC4", name: "Cobertura de CPN 4+ Consultas", category: "maternal", numeratorDesc: "Mulheres com 4+ CPN", denominatorDesc: "Grávidas Esperadas", target: 90, unit: "%" },
  SBA: { id: "SBA", code: "SBA", name: "Partos Assistidos por Pessoal Qualificado", category: "maternal", numeratorDesc: "Partos Institucionais", denominatorDesc: "Partos Esperados", target: 85, unit: "%" },
  MMR: { id: "MMR", code: "MMR", name: "Rácio de Mortalidade Materna", category: "maternal", numeratorDesc: "Óbitos Maternos", denominatorDesc: "Nascidos Vivos", target: 70, unit: "por 100k" },
  DTP1: { id: "DTP1", code: "DTP1", name: "Cobertura Vacinal Penta1", category: "immunization", numeratorDesc: "Crianças com 1ª Dose", denominatorDesc: "População Alvo <1a", target: 95, unit: "%" },
  DTP3: { id: "DTP3", code: "DTP3", name: "Cobertura Vacinal Penta3", category: "immunization", numeratorDesc: "Crianças com 3ª Dose", denominatorDesc: "População Alvo <1a", target: 90, unit: "%" },
  MCV: { id: "MCV", code: "MCV", name: "Cobertura de Sarampo MCV1", category: "immunization", numeratorDesc: "Crianças com Sarampo", denominatorDesc: "População Alvo <1a", target: 95, unit: "%" },
  ART: { id: "ART", code: "ART", name: "Cobertura TARV de 12 Meses", category: "hiv", numeratorDesc: "Pacientes em TARV 12M", denominatorDesc: "Pacientes Iniciados", target: 95, unit: "%" },
  VLS: { id: "VLS", code: "VLS", name: "Taxa de Supressão Viral", category: "hiv", numeratorDesc: "Pacientes Supressos", denominatorDesc: "Cargas Virais Testadas", target: 95, unit: "%" },
  TBDET: { id: "TBDET", code: "TBDET", name: "Taxa de Detecção de TB", category: "tb", numeratorDesc: "Casos Notificados", denominatorDesc: "Casos Estimados OMS", target: 90, unit: "%" },
  TBCUR: { id: "TBCUR", code: "TBCUR", name: "Taxa de Sucesso Terapêutico TB", category: "tb", numeratorDesc: "Curas Clínicas", denominatorDesc: "Pacientes Inscritos", target: 85, unit: "%" },
  MALINC: { id: "MALINC", code: "MALINC", name: "Taxa de Incidência de Malária", category: "malaria", numeratorDesc: "Casos Confirmados", denominatorDesc: "População sob Risco", target: 100, unit: "por 1k" },
  MALPOS: { id: "MALPOS", code: "MALPOS", name: "Taxa de Positividade de Malária", category: "malaria", numeratorDesc: "Testes TDR/Lâminas Positivas", denominatorDesc: "Total de Testes Realizados", target: 25, unit: "%" },
  // New indicators added for D2A Revamp
  BEDOCC: { id: "BEDOCC", code: "BEDOCC", name: "Taxa de Ocupação Hospitalar", category: "infrastructure", numeratorDesc: "Dias-Cama Ocupados", denominatorDesc: "Dias-Cama Disponíveis", target: 85, unit: "%" },
  HRDENS: { id: "HRDENS", code: "HRDENS", name: "Densidade de Pessoal Qualificado", category: "infrastructure", numeratorDesc: "Médicos/Enfermeiros", denominatorDesc: "População x 10.000", target: 23, unit: "por 10k" },
  SISC_REF: { id: "SISC_REF", code: "SISC_REF", name: "Taxa de Sucesso de Referências (APE)", category: "maternal", numeratorDesc: "Referências que Chegaram à US", denominatorDesc: "Total de Referências APE", target: 85, unit: "%" },
  U5MR: { id: "U5MR", code: "U5MR", name: "Taxa de Mortalidade < 5 Anos (TMM5)", category: "macro", numeratorDesc: "Óbitos < 5 anos", denominatorDesc: "Nascidos Vivos", target: 25, unit: "por 1k" },
  OOP: { id: "OOP", code: "OOP", name: "Despesa Out-of-Pocket", category: "macro", numeratorDesc: "Gasto Privado", denominatorDesc: "Gasto Total em Saúde", target: 20, unit: "%" },
  CMAM_FILL: { id: "CMAM_FILL", code: "CMAM_FILL", name: "Taxa de Atendimento CMAM (Fill Rate)", category: "infrastructure", numeratorDesc: "Requisições Entregues Completa/.", denominatorDesc: "Total de Requisições", target: 90, unit: "%" },
  EHR_ADOPT: { id: "EHR_ADOPT", code: "EHR_ADOPT", name: "Taxa de Adoção de EHR", category: "macro", numeratorDesc: "US com EHR Ativo", denominatorDesc: "Total de US", target: 80, unit: "%" },
};

export const MOCK_LOCATIONS: FHIRLocation[] = [
  { resourceType: "Location", id: "LOC-MZ", name: "Moçambique", physicalType: "national" },
  { resourceType: "Location", id: "LOC-GZ", name: "Gaza", physicalType: "province", partOf: "LOC-MZ" },
  { resourceType: "Location", id: "LOC-TT", name: "Tete", physicalType: "province", partOf: "LOC-MZ" },
  { resourceType: "Location", id: "LOC-SO", name: "Sofala", physicalType: "province", partOf: "LOC-MZ" },
  { resourceType: "Location", id: "LOC-CH", name: "Chibuto", physicalType: "district", partOf: "LOC-GZ" },
  { resourceType: "Location", id: "LOC-XX", name: "Xai-Xai", physicalType: "district", partOf: "LOC-GZ" },
  { resourceType: "Location", id: "LOC-AN", name: "Angónia", physicalType: "district", partOf: "LOC-TT" },
  { resourceType: "Location", id: "LOC-CZ", name: "Chingodzi CS", physicalType: "facility", partOf: "LOC-AN" }, // Corrected partOf
  { resourceType: "Location", id: "LOC-XX-CS", name: "Xai-Xai CS", physicalType: "facility", partOf: "LOC-XX" },
  { resourceType: "Location", id: "LOC-CH-CS", name: "Chibuto CS", physicalType: "facility", partOf: "LOC-CH" },
];

export const createObservation = (
  id: string,
  category: FHIRObservation["category"],
  indicatorCode: string,
  gender: "Male" | "Female" | "All",
  ageGroup: "<1y" | "1-4y" | "5-14y" | "15-49y" | "50y+" | "All",
  date: string,
  locationId: string,
  numVal: number,
  denVal: number
): FHIRObservation => ({
  resourceType: "Observation",
  id,
  status: "final",
  category,
  code: {
    coding: [{ system: "http://who.int/indicators", code: indicatorCode, display: indicatorCode }]
  },
  subject: {
    reference: `Group/${indicatorCode}-population`,
    gender,
    ageGroup
  },
  effectiveDateTime: date,
  location: { reference: locationId },
  component: [
    {
      code: { coding: [{ code: "NUMERATOR", display: "Numerator value" }] },
      valueQuantity: { value: numVal, unit: "count" }
    },
    {
      code: { coding: [{ code: "DENOMINATOR", display: "Denominator value" }] },
      valueQuantity: { value: denVal, unit: "count" }
    }
  ]
});

export const MOCK_OBSERVATIONS: FHIRObservation[] = [
  // --- maternal ---
  createObservation("obs-1", "maternal", "ANC1", "Female", "15-49y", "2026-05-10", "LOC-CZ", 120, 130),
  createObservation("obs-2", "maternal", "ANC4", "Female", "15-49y", "2026-05-11", "LOC-CZ", 80, 130),
  createObservation("obs-3", "maternal", "SBA", "Female", "15-49y", "2026-05-12", "LOC-CZ", 95, 110),
  createObservation("obs-4", "maternal", "MMR", "Female", "15-49y", "2026-05-15", "LOC-CZ", 1, 1000), // MMR expressed as ratio

  createObservation("obs-5", "maternal", "ANC1", "Female", "15-49y", "2026-05-10", "LOC-XX-CS", 200, 210),
  createObservation("obs-6", "maternal", "ANC4", "Female", "15-49y", "2026-05-11", "LOC-XX-CS", 140, 210),
  createObservation("obs-7", "maternal", "SBA", "Female", "15-49y", "2026-05-12", "LOC-XX-CS", 185, 200),
  createObservation("obs-8", "maternal", "MMR", "Female", "15-49y", "2026-05-15", "LOC-XX-CS", 0, 1500),

  createObservation("obs-9", "maternal", "ANC1", "Female", "15-49y", "2026-05-10", "LOC-CH-CS", 180, 190),
  createObservation("obs-10", "maternal", "ANC4", "Female", "15-49y", "2026-05-11", "LOC-CH-CS", 130, 190),
  createObservation("obs-11", "maternal", "SBA", "Female", "15-49y", "2026-05-12", "LOC-CH-CS", 170, 180),
  createObservation("obs-12", "maternal", "MMR", "Female", "15-49y", "2026-05-15", "LOC-CH-CS", 2, 1200),

  createObservation("obs-ref-1", "maternal", "SISC_REF", "All", "All", "2026-05-20", "LOC-CH-CS", 45, 60),
  createObservation("obs-ref-2", "maternal", "SISC_REF", "All", "All", "2026-05-20", "LOC-XX-CS", 80, 85),

  // --- immunization ---
  createObservation("obs-13", "immunization", "DTP1", "Male", "<1y", "2026-05-01", "LOC-CZ", 98, 100),
  createObservation("obs-14", "immunization", "DTP3", "Male", "<1y", "2026-05-02", "LOC-CZ", 85, 100),
  createObservation("obs-15", "immunization", "MCV", "Male", "<1y", "2026-05-03", "LOC-CZ", 90, 100),

  createObservation("obs-16", "immunization", "DTP1", "Female", "<1y", "2026-05-01", "LOC-CZ", 102, 105),
  createObservation("obs-17", "immunization", "DTP3", "Female", "<1y", "2026-05-02", "LOC-CZ", 82, 105),
  createObservation("obs-18", "immunization", "MCV", "Female", "<1y", "2026-05-03", "LOC-CZ", 92, 105),

  createObservation("obs-19", "immunization", "DTP1", "Male", "<1y", "2026-05-01", "LOC-XX-CS", 140, 150),
  createObservation("obs-20", "immunization", "DTP3", "Male", "<1y", "2026-05-02", "LOC-XX-CS", 120, 150),
  createObservation("obs-21", "immunization", "MCV", "Male", "<1y", "2026-05-03", "LOC-XX-CS", 130, 150),

  createObservation("obs-19f", "immunization", "DTP1", "Female", "<1y", "2026-05-01", "LOC-XX-CS", 145, 155),
  createObservation("obs-20f", "immunization", "DTP3", "Female", "<1y", "2026-05-02", "LOC-XX-CS", 125, 155),
  createObservation("obs-21f", "immunization", "MCV", "Female", "<1y", "2026-05-03", "LOC-XX-CS", 135, 155),

  createObservation("obs-22", "immunization", "DTP1", "Male", "<1y", "2026-05-01", "LOC-CH-CS", 110, 120),
  createObservation("obs-22a", "immunization", "DTP3", "Male", "<1y", "2026-05-02", "LOC-CH-CS", 95, 120),
  createObservation("obs-22b", "immunization", "MCV", "Male", "<1y", "2026-05-03", "LOC-CH-CS", 100, 120),

  createObservation("obs-22f", "immunization", "DTP1", "Female", "<1y", "2026-05-01", "LOC-CH-CS", 115, 125),
  createObservation("obs-22fa", "immunization", "DTP3", "Female", "<1y", "2026-05-02", "LOC-CH-CS", 98, 125),
  createObservation("obs-22fb", "immunization", "MCV", "Female", "<1y", "2026-05-03", "LOC-CH-CS", 105, 125),

  // --- hiv ---
  createObservation("obs-23", "hiv", "ART", "Female", "15-49y", "2026-05-05", "LOC-CZ", 880, 950),
  createObservation("obs-24", "hiv", "VLS", "Female", "15-49y", "2026-05-06", "LOC-CZ", 810, 880),
  createObservation("obs-25", "hiv", "ART", "Male", "15-49y", "2026-05-05", "LOC-CZ", 540, 600),
  createObservation("obs-26", "hiv", "VLS", "Male", "15-49y", "2026-05-06", "LOC-CZ", 490, 540),

  // --- tb ---
  createObservation("obs-31", "tb", "TBDET", "Male", "15-49y", "2026-05-18", "LOC-CZ", 45, 50),
  createObservation("obs-32", "tb", "TBCUR", "Male", "15-49y", "2026-05-19", "LOC-CZ", 39, 45),
  createObservation("obs-33", "tb", "TBCUR", "All", "All", "2026-Q1", "LOC-GZ", 350, 420),

  // --- malaria ---
  createObservation("obs-37", "malaria", "MALINC", "Female", "1-4y", "2026-05-20", "LOC-CZ", 85, 1000),
  createObservation("obs-38", "malaria", "MALPOS", "Female", "1-4y", "2026-05-20", "LOC-CZ", 192, 400),
  createObservation("obs-39", "malaria", "MALINC", "Female", "1-4y", "2026-05-20", "LOC-XX-CS", 110, 1000),
  createObservation("obs-40", "malaria", "MALPOS", "Female", "1-4y", "2026-05-20", "LOC-XX-CS", 160, 500),
  createObservation("obs-41", "malaria", "MALINC", "Female", "1-4y", "2026-05-20", "LOC-CH-CS", 140, 1000),
  createObservation("obs-42", "malaria", "MALPOS", "Female", "1-4y", "2026-05-20", "LOC-CH-CS", 294, 600),

  // --- infrastructure & macro ---
  createObservation("obs-infra-1", "infrastructure", "BEDOCC", "All", "All", "2026-05-01", "LOC-GZ", 880, 1000),
  createObservation("obs-infra-2", "infrastructure", "BEDOCC", "All", "All", "2026-05-01", "LOC-TT", 750, 1000),
  createObservation("obs-infra-3", "infrastructure", "HRDENS", "All", "All", "2026-05-01", "LOC-CH", 15, 10000),
  createObservation("obs-infra-4", "infrastructure", "HRDENS", "All", "All", "2026-05-01", "LOC-XX", 28, 10000),
  createObservation("obs-infra-5", "infrastructure", "CMAM_FILL", "All", "All", "2026-05-01", "LOC-MZ", 78, 100),
  createObservation("obs-macro-1", "macro", "U5MR", "All", "All", "2026-01-01", "LOC-MZ", 65, 1000),
  createObservation("obs-macro-2", "macro", "OOP", "All", "All", "2026-01-01", "LOC-MZ", 32, 100),
  createObservation("obs-macro-3", "macro", "EHR_ADOPT", "All", "All", "2026-01-01", "LOC-MZ", 45, 100),
];

// Re-usable Helper function to get sublocations
export const getSubLocationIds = (locId: string): string[] => {
  const direct = [locId];
  MOCK_LOCATIONS.forEach(l => {
    if (l.partOf === locId) {
      direct.push(l.id);
      MOCK_LOCATIONS.forEach(sl => {
        if (sl.partOf === l.id) {
          direct.push(sl.id);
          MOCK_LOCATIONS.forEach(ssl => {
            if (ssl.partOf === sl.id) direct.push(ssl.id);
          });
        }
      });
    }
  });
  return Array.from(new Set(direct));
};

export const computeIndicators = (targetLocIds: string[], timePeriod: string = "2026-05", observations = MOCK_OBSERVATIONS) => {
  const result: Record<string, { numerator: number; denominator: number; value: number; gap: number; target: number; unit: string; name: string }> = {};

  Object.keys(WHO_INDICATORS).forEach(indKey => {
    const ind = WHO_INDICATORS[indKey];
    let sumNumerator = 0;
    let sumDenominator = 0;

    observations.forEach(obs => {
      if (obs.code.coding[0].code !== ind.code) return;
      if (!targetLocIds.includes(obs.location.reference)) return;
      if (!obs.effectiveDateTime.startsWith(timePeriod)) return;

      const numComp = obs.component?.find(c => c.code.coding[0].code === "NUMERATOR");
      const denComp = obs.component?.find(c => c.code.coding[0].code === "DENOMINATOR");
      if (numComp && denComp) {
        sumNumerator += numComp.valueQuantity.value;
        sumDenominator += denComp.valueQuantity.value;
      }
    });

    // Default safe mock filler if bounds return empty for specific disaggregation
    if (sumDenominator === 0) {
      sumNumerator = Math.round(ind.target * 0.8);
      sumDenominator = 100;
    }

    const calculatedValue = sumDenominator > 0 
      ? (ind.unit === "por 100k" ? Math.round((sumNumerator / sumDenominator) * 100000 * 10) / 10 : Math.round((sumNumerator / sumDenominator) * 100))
      : 0;

    const gap = Math.round((calculatedValue - ind.target) * 10) / 10;

    result[indKey] = {
      numerator: sumNumerator,
      denominator: sumDenominator,
      value: calculatedValue,
      gap,
      target: ind.target,
      unit: ind.unit,
      name: ind.name
    };
  });

  return result;
};
