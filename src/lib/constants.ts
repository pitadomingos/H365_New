
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, UsersRound, CalendarDays, Pill, ClipboardEdit, Bell, Settings, LogOut, Users, BedDouble, Star, Siren, Biohazard, Baby, Microscope, MonitorPlay, Info, Megaphone, BarChartBig, CreditCard, Video, BrainCircuit, Droplets, ListChecks, Database, FileText, BookOpenCheck, Network, ListCollapse, Activity, Package, Fingerprint, Smartphone, Brain, Scissors, Utensils, History, HeartPulse, UserCog } from 'lucide-react';

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  disabled?: boolean;
  forceNewTab?: boolean;
};

export type NavGroup = {
  titleKey: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: 'nav.group.clinical',
    items: [
      { href: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
      { href: '/appointments', labelKey: 'nav.appointments', icon: CalendarDays },
      { href: '/visiting-patients', labelKey: 'nav.visitingPatients', icon: Users },
      { href: '/treatment-recommendation', labelKey: 'nav.consultationRoom', icon: ClipboardEdit },
      { href: '/clinical-notes', labelKey: 'nav.clinicalNotes', icon: FileText },
      { href: '/prescription-management', labelKey: 'nav.prescriptionManagement', icon: Pill },
      { href: '/specializations', labelKey: 'nav.specializations', icon: Star },
      { href: '/maternity-care', labelKey: 'nav.maternityCare', icon: Baby },
      { href: '/pediatrics', labelKey: 'nav.pediatrics', icon: Baby },
      { href: '/chronic-care', labelKey: 'nav.chronicCare', icon: History },
      { href: '/mental-health', labelKey: 'nav.mentalHealth', icon: Brain },
      { href: '/operation-theatre', labelKey: 'nav.operationTheatre', icon: Scissors },
      { href: '/nutrition', labelKey: 'nav.nutrition', icon: Utensils },
      { href: '/ward-management', labelKey: 'nav.wardManagement', icon: BedDouble },
    ]
  },
  {
    titleKey: 'nav.group.ancillary',
    items: [
      { href: '/laboratory-management', labelKey: 'nav.laboratory', icon: Microscope },
      { href: '/imaging-management', labelKey: 'nav.imaging', icon: MonitorPlay },
      { href: '/pharmacy-locator', labelKey: 'nav.drugDispensing', icon: Pill },
      { href: '/blood-bank', labelKey: 'nav.bloodBank', icon: Droplets },
      { href: '/emergency-room', labelKey: 'nav.emergencyRoom', icon: Siren },
      { href: '/telemedicine', labelKey: 'nav.telemedicine', icon: Video },
    ]
  },
  {
    titleKey: 'nav.group.publicHealth',
    items: [
      { href: '/public-health-dashboard', labelKey: 'nav.publicDashboard', icon: Activity, forceNewTab: true },
      { href: '/epidemic-control', labelKey: 'nav.epidemicControl', icon: Biohazard },
      { href: '/public-health-messaging', labelKey: 'nav.publicHealthMessaging', icon: Megaphone },
      { href: '/campaigns', labelKey: 'nav.campaigns', icon: Megaphone },
      { href: '/analytics-bi', labelKey: 'nav.analyticsBi', icon: BrainCircuit },
    ]
  },
  {
    titleKey: 'nav.group.admin',
    items: [
      { href: '/patient-registration', labelKey: 'nav.patientRegistration', icon: UsersRound },
      { href: '/reporting', labelKey: 'nav.reporting', icon: BarChartBig },
      { href: '/billing', labelKey: 'nav.billingFinance', icon: CreditCard },
      { href: '/inventory-management', labelKey: 'nav.inventory', icon: Package },
      { href: '/mpi-reconciliation', labelKey: 'nav.mpi', icon: Fingerprint },
      { href: '/staff-management', labelKey: 'nav.staffManagement', icon: UserCog },
      { href: '/biomedical-engineering', labelKey: 'nav.biomedical', icon: Settings },
    ]
  },
  {
    titleKey: 'nav.group.technical',
    items: [
      { href: '/system-activity-log', labelKey: 'nav.systemActivityLog', icon: ListCollapse }, 
      { href: '/system-status', labelKey: 'nav.systemNodeStatus', icon: Network },
      { href: '/technical-overview', labelKey: 'nav.technicalOverview', icon: Info },
      { href: '/docs', labelKey: 'nav.systemDocumentation', icon: BookOpenCheck },
      { href: '/backend-schema-roadmap', labelKey: 'nav.backendRoadmap', icon: Database },
      { href: '/architecture-options', labelKey: 'nav.architectureOptions', icon: Network },
      { href: '/training-materials', labelKey: 'nav.trainingMaterials', icon: BookOpenCheck },
      { href: '/todo-list', labelKey: 'nav.toDoList', icon: ListChecks },
    ]
  },
  {
    titleKey: 'nav.group.mobile',
    items: [
      { href: '/patient-portal/login', labelKey: 'nav.patientPortal', icon: Smartphone },
    ]
  }
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(g => g.items);

export const BOTTOM_NAV_ITEMS: NavItem[] = [
    { href: '/notifications', labelKey: 'nav.notifications', icon: Bell }, 
    { href: '/settings', labelKey: 'nav.settings', icon: Settings },  
    { href: '/logout', labelKey: 'nav.logout', icon: LogOut },    
];

export interface OrderableLabTest {
  id: string;
  label: string;
  category?: string;
}

// More granular list of common lab tests
export const COMMON_ORDERABLE_LAB_TESTS: OrderableLabTest[] = [
  // Hematology - Complete Blood Count (CBC) Components
  { id: "hemoglobin", label: "Hemoglobin (Hgb)", category: "Hematology" },
  { id: "hematocrit", label: "Hematocrit (Hct)", category: "Hematology" },
  { id: "rbc_count", label: "Red Blood Cell Count (RBC)", category: "Hematology" },
  { id: "wbc_count", label: "White Blood Cell Count (WBC)", category: "Hematology" },
  { id: "platelet_count", label: "Platelet Count", category: "Hematology" },
  { id: "mcv", label: "Mean Corpuscular Volume (MCV)", category: "Hematology" },
  { id: "mch", label: "Mean Corpuscular Hemoglobin (MCH)", category: "Hematology" },
  { id: "mchc", label: "Mean Corpuscular Hemoglobin Concentration (MCHC)", category: "Hematology" },
  { id: "rdw", label: "Red Cell Distribution Width (RDW)", category: "Hematology" },
  { id: "neutrophils_abs", label: "Neutrophils (Absolute)", category: "Hematology" },
  { id: "lymphocytes_abs", label: "Lymphocytes (Absolute)", category: "Hematology" },
  { id: "monocytes_abs", label: "Monocytes (Absolute)", category: "Hematology" },
  { id: "eosinophils_abs", label: "Eosinophils (Absolute)", category: "Hematology" },
  { id: "basophils_abs", label: "Basophils (Absolute)", category: "Hematology" },

  // Other Hematology
  { id: "esr", label: "Erythrocyte Sedimentation Rate (ESR)", category: "Hematology" },
  { id: "reticulocyte_count", label: "Reticulocyte Count", category: "Hematology" },
  { id: "pt_inr", label: "Prothrombin Time & INR (PT/INR)", category: "Coagulation" },
  { id: "aptt", label: "Activated Partial Thromboplastin Time (aPTT)", category: "Coagulation" },
  { id: "fibrinogen", label: "Fibrinogen", category: "Coagulation" },
  { id: "d_dimer", label: "D-Dimer", category: "Coagulation" },
  { id: "blood_group_rh", label: "Blood Group & Rh Factor", category: "Blood Bank" },
  { id: "direct_coombs", label: "Direct Coombs Test (DAT)", category: "Blood Bank" },
  { id: "indirect_coombs", label: "Indirect Coombs Test (Antibody Screen)", category: "Blood Bank" },


  // Chemistry - Basic Metabolic Panel (BMP) / Electrolytes (U&E)
  { id: "sodium", label: "Sodium (Na)", category: "Chemistry" },
  { id: "potassium", label: "Potassium (K)", category: "Chemistry" },
  { id: "chloride", label: "Chloride (Cl)", category: "Chemistry" },
  { id: "co2_bicarbonate", label: "CO2 (Bicarbonate)", category: "Chemistry" },
  { id: "bun_urea", label: "Blood Urea Nitrogen (BUN) / Urea", category: "Renal Function" },
  { id: "creatinine_serum", label: "Creatinine, Serum", category: "Renal Function" },
  { id: "egfr", label: "eGFR (estimated Glomerular Filtration Rate)", category: "Renal Function" },
  { id: "glucose_random", label: "Glucose, Random", category: "Chemistry" },
  { id: "calcium_total", label: "Calcium, Total", category: "Chemistry" },
  { id: "magnesium", label: "Magnesium, Serum", category: "Chemistry" },
  { id: "phosphate", label: "Phosphate, Serum", category: "Chemistry" },

  // Chemistry - Liver Function Tests (LFTs)
  { id: "albumin", label: "Albumin", category: "Liver Function" },
  { id: "total_protein", label: "Total Protein", category: "Liver Function" },
  { id: "alp", label: "Alkaline Phosphatase (ALP)", category: "Liver Function" },
  { id: "alt_sgpt", label: "Alanine Aminotransferase (ALT/SGPT)", category: "Liver Function" },
  { id: "ast_sgot", label: "Aspartate Aminotransferase (AST/SGOT)", category: "Liver Function" },
  { id: "ggt", label: "Gamma-Glutamyl Transferase (GGT)", category: "Liver Function" },
  { id: "bilirubin_total", label: "Bilirubin, Total", category: "Liver Function" },
  { id: "bilirubin_direct", label: "Bilirubin, Direct", category: "Liver Function" },

  // Chemistry - Lipid Panel Components
  { id: "cholesterol_total", label: "Cholesterol, Total", category: "Lipids" },
  { id: "triglycerides", label: "Triglycerides", category: "Lipids" },
  { id: "hdl_cholesterol", label: "HDL Cholesterol", category: "Lipids" },
  { id: "ldl_cholesterol_calculated", label: "LDL Cholesterol (Calculated)", category: "Lipids" },
  { id: "vldl_cholesterol_calculated", label: "VLDL Cholesterol (Calculated)", category: "Lipids" },

  // Specific Chemistry / Endocrine / Cardiac
  { id: "glucose_fasting", label: "Glucose, Fasting", category: "Endocrine" },
  { id: "hba1c", label: "Hemoglobin A1c (HbA1c)", category: "Endocrine" },
  { id: "tsh", label: "Thyroid Stimulating Hormone (TSH)", category: "Endocrine" },
  { id: "free_t4", label: "Free T4 (FT4)", category: "Endocrine" },
  { id: "free_t3", label: "Free T3 (FT3)", category: "Endocrine" },
  { id: "serum_iron", label: "Serum Iron", category: "Anemia Panel" },
  { id: "tibc", label: "Total Iron Binding Capacity (TIBC)", category: "Anemia Panel" },
  { id: "ferritin", label: "Ferritin", category: "Anemia Panel" },
  { id: "vit_d", label: "Vitamin D, 25-Hydroxy", category: "Vitamins/Minerals" },
  { id: "vit_b12", label: "Vitamin B12 Level", category: "Vitamins/Minerals" },
  { id: "folate_serum", label: "Folate, Serum", category: "Vitamins/Minerals" },
  { id: "uric_acid", label: "Uric Acid, Serum", category: "Chemistry" },
  { id: "troponin_i_or_t", label: "Troponin I or T (Cardiac Marker)", category: "Cardiac Markers" },
  { id: "ck_mb", label: "Creatine Kinase-MB (CK-MB)", category: "Cardiac Markers" },
  { id: "bnp_or_nt_probnp", label: "BNP or NT-proBNP (Cardiac Marker)", category: "Cardiac Markers" },
  { id: "amylase", label: "Amylase, Serum", category: "Pancreatic Enzymes" },
  { id: "lipase", label: "Lipase, Serum", category: "Pancreatic Enzymes" },

  // Immunology / Serology / Infectious Disease
  { id: "crp", label: "C-Reactive Protein (CRP)", category: "Inflammatory Markers" },
  { id: "rheumatoid_factor", label: "Rheumatoid Factor (RF)", category: "Immunology" },
  { id: "ana", label: "Antinuclear Antibodies (ANA)", category: "Immunology" },
  { id: "hiv_screen", label: "HIV 1/2 Antibody/Antigen Screen", category: "Infectious Disease Serology" },
  { id: "hepatitis_b_surface_antigen", label: "Hepatitis B Surface Antigen (HBsAg)", category: "Infectious Disease Serology" },
  { id: "hepatitis_c_antibody", label: "Hepatitis C Antibody", category: "Infectious Disease Serology" },
  { id: "rpr_syphilis", label: "RPR (Syphilis Screen)", category: "Infectious Disease Serology" },
  { id: "malaria_smear_rdt", label: "Malaria Smear / RDT", category: "Infectious Disease" },
  { id: "covid19_pcr_antigen", label: "COVID-19 PCR / Antigen Test", category: "Infectious Disease" },
  { id: "influenza_a_b_test", label: "Influenza A/B Test", category: "Infectious Disease" },

  // Urinalysis
  { id: "urinalysis_re", label: "Urinalysis, Routine & Microscopy (Urine R/E)", category: "Urinalysis" },
  { id: "urine_culture_sensitivity", label: "Urine Culture & Sensitivity", category: "Microbiology" },
  { id: "urine_pregnancy_test_hcg", label: "Urine Pregnancy Test (hCG)", category: "Urinalysis" },
  { id: "urine_drug_screen", label: "Urine Drug Screen", category: "Toxicology" },

  // Other Microbiology / Stool
  { id: "stool_re_op", label: "Stool R/E (Ova & Parasites)", category: "Microbiology" },
  { id: "stool_culture", label: "Stool Culture & Sensitivity", category: "Microbiology" },
  { id: "stool_occult_blood", label: "Stool Occult Blood (FOBT/FIT)", category: "Gastroenterology" },
  { id: "blood_culture", label: "Blood Culture & Sensitivity", category: "Microbiology" },
  { id: "throat_swab_culture_strep", label: "Throat Swab Culture (Strep Screen)", category: "Microbiology" },
  { id: "sputum_afb_smear_culture", label: "Sputum AFB Smear & Culture (TB)", category: "Microbiology" },
  { id: "gram_stain", label: "Gram Stain (various sites)", category: "Microbiology" },
  
  // Maternity Specific (Examples)
  { id: "gct_glucose_challenge", label: "Glucose Challenge Test (GCT, 1-hour)", category: "Maternity/Endocrine" },
  { id: "ogtt_oral_glucose_tolerance", label: "Oral Glucose Tolerance Test (OGTT)", category: "Maternity/Endocrine" },
  { id: "rubella_igg", label: "Rubella IgG", category: "Maternity/Serology" },
  { id: "group_b_strep_screen", label: "Group B Strep Screen (GBS)", category: "Maternity/Microbiology" },

];

// Maternity specific lab tests (example - can be expanded or merged)
export const MATERNITY_SPECIFIC_LAB_TESTS: OrderableLabTest[] = [
  { id: "cbc_mat", label: "Complete Blood Count (CBC)", category: "Hematology" },
  { id: "blood_group_rh_mat", label: "Blood Group & Rh Factor", category: "Hematology" },
  { id: "urine_re_mat", label: "Urine Routine & Microscopy", category: "Urinalysis" },
  { id: "gct_glucose_challenge_mat", label: "Glucose Challenge Test (GCT, 1-hour)", category: "Endocrine" },
  { id: "ogtt_oral_glucose_tolerance_mat", label: "Oral Glucose Tolerance Test (OGTT)", category: "Endocrine" },
  { id: "hiv_mat_screening", label: "HIV Screening", category: "Serology" },
  { id: "vdrl_rpr_mat_syphilis", label: "VDRL/RPR (Syphilis Test)", category: "Serology" },
  { id: "hbsag_mat_hepb", label: "Hepatitis B Surface Antigen (HBsAg)", category: "Serology" },
  { id: "rubella_igg_mat", label: "Rubella IgG", category: "Serology" },
  { id: "group_b_strep_screen_mat", label: "Group B Strep Screen (GBS)", category: "Microbiology" },
  { id: "antibody_screen_indirect_coombs_mat", label: "Antibody Screen (Indirect Coombs)", category: "Hematology" },
];
 
    