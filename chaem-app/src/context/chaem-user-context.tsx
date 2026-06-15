import { createContext, useContext, useState, type ReactNode } from 'react';

// ─── TYPES ────────────────────────────────────────────────────────────────────

/**
 * CHAEM Role Hierarchy — mirrors H365 main SaaS user-context.tsx
 *
 * Administrative roles (dashboard access, MISAU pyramid):
 *   NATIONAL_ADMIN    → Full dashboard: all 4 KPI levels, unrestricted
 *   PROVINCIAL_ADMIN  → Provincial + Facility KPI levels, filtered by jurisdiction.province
 *   DISTRICT_ADMIN    → District + Facility KPI levels, filtered by jurisdiction.district
 *   FACILITY_ADMIN    → Facility KPI level only, filtered by jurisdiction.facility
 *
 * Clinical roles (exam registration + facility-level view only):
 *   OCCUPATIONAL_PHYSICIAN → Register exams, view own facility history, no admin KPIs
 *   NURSE_OH               → Register exams, view own facility history, no admin KPIs
 */
export type ChaemRole =
  | 'NATIONAL_ADMIN'
  | 'PROVINCIAL_ADMIN'
  | 'DISTRICT_ADMIN'
  | 'FACILITY_ADMIN'
  | 'OCCUPATIONAL_PHYSICIAN'
  | 'NURSE_OH';

export interface ChaemUser {
  id: string;
  name: string;
  email: string;
  role: ChaemRole;
  crmNumber?: string;        // Medical licence — only for clinical roles
  jurisdiction: {
    province?: string;
    district?: string;
    facility?: string;
  };
}

// ─── ROLE METADATA ────────────────────────────────────────────────────────────

export interface RoleMeta {
  label: string;
  labelPt: string;
  color: string;             // Tailwind text color class
  bgColor: string;           // Tailwind bg color class
  badgeClass: string;        // Tailwind badge classes
  /** Highest dashboard level this role can see */
  maxDashLevel: 'national' | 'provincial' | 'district' | 'facility' | null;
  /** Whether role can access all 4 dashboard levels or is restricted */
  dashLevels: Array<'facility' | 'district' | 'provincial' | 'national'>;
  /** Whether role can register new exams */
  canRegisterExams: boolean;
  /** Whether role can access the KPI dashboard */
  canViewDashboard: boolean;
  /** Whether role can view all exams or only ones they registered */
  canViewAllExams: boolean;
}

export const ROLE_META: Record<ChaemRole, RoleMeta> = {
  NATIONAL_ADMIN: {
    label: 'National Admin',
    labelPt: 'Administrador Nacional',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    maxDashLevel: 'national',
    dashLevels: ['facility', 'district', 'provincial', 'national'],
    canRegisterExams: false,
    canViewDashboard: true,
    canViewAllExams: true,
  },
  PROVINCIAL_ADMIN: {
    label: 'Provincial Admin (DPS)',
    labelPt: 'Administrador Provincial',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    badgeClass: 'bg-violet-100 text-violet-800 border-violet-200',
    maxDashLevel: 'provincial',
    dashLevels: ['facility', 'district', 'provincial'],
    canRegisterExams: false,
    canViewDashboard: true,
    canViewAllExams: true,
  },
  DISTRICT_ADMIN: {
    label: 'District Admin (DDS)',
    labelPt: 'Administrador Distrital',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    maxDashLevel: 'district',
    dashLevels: ['facility', 'district'],
    canRegisterExams: false,
    canViewDashboard: true,
    canViewAllExams: true,
  },
  FACILITY_ADMIN: {
    label: 'Facility Admin',
    labelPt: 'Administrador de Unidade',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    maxDashLevel: 'facility',
    dashLevels: ['facility'],
    canRegisterExams: true,
    canViewDashboard: true,
    canViewAllExams: true,
  },
  OCCUPATIONAL_PHYSICIAN: {
    label: 'Occupational Physician',
    labelPt: 'Médico Especialista em SO',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    maxDashLevel: null,
    dashLevels: [],
    canRegisterExams: true,
    canViewDashboard: false,
    canViewAllExams: true,
  },
  NURSE_OH: {
    label: 'Occupational Health Nurse',
    labelPt: 'Enfermeiro/a de Saúde Ocupacional',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    maxDashLevel: null,
    dashLevels: [],
    canRegisterExams: true,
    canViewDashboard: false,
    canViewAllExams: false,   // Nurses see only exams they participated in
  },
};

// ─── MOCK USERS (for demo — mirrors H365 MOCK_USERS pattern) ─────────────────

export const CHAEM_MOCK_USERS: Record<ChaemRole, ChaemUser> = {
  NATIONAL_ADMIN: {
    id: 'cu1',
    name: 'Dr. Afonso Dhlakama',
    email: 'national@misau.gov.mz',
    role: 'NATIONAL_ADMIN',
    jurisdiction: {},
  },
  PROVINCIAL_ADMIN: {
    id: 'cu2',
    name: 'Geraldo Maputo',
    email: 'dps.maputo@misau.gov.mz',
    role: 'PROVINCIAL_ADMIN',
    jurisdiction: { province: 'Maputo' },
  },
  DISTRICT_ADMIN: {
    id: 'cu3',
    name: 'Ana Matola',
    email: 'dds.matola@misau.gov.mz',
    role: 'DISTRICT_ADMIN',
    jurisdiction: { province: 'Maputo', district: 'Matola' },
  },
  FACILITY_ADMIN: {
    id: 'cu4',
    name: 'Hélio Central',
    email: 'admin@hcm.gov.mz',
    role: 'FACILITY_ADMIN',
    jurisdiction: { province: 'Maputo', district: 'Matola', facility: 'Hospital Central de Maputo' },
  },
  OCCUPATIONAL_PHYSICIAN: {
    id: 'cu5',
    name: 'Dr. Emília Sitoe',
    email: 'e.sitoe@chaem.gov.mz',
    role: 'OCCUPATIONAL_PHYSICIAN',
    crmNumber: 'CRM-2847',
    jurisdiction: { province: 'Maputo', district: 'Matola', facility: 'Hospital Central de Maputo' },
  },
  NURSE_OH: {
    id: 'cu6',
    name: 'Enf. Carlos Mabunda',
    email: 'c.mabunda@chaem.gov.mz',
    role: 'NURSE_OH',
    jurisdiction: { province: 'Maputo', district: 'Matola', facility: 'Hospital Central de Maputo' },
  },
};

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

interface ChaemUserContextType {
  user: ChaemUser;
  setUser: (user: ChaemUser) => void;
  roleMeta: RoleMeta;
  /** Convenience: does the current user have a given permission? */
  can: (permission: 'viewDashboard' | 'registerExams' | 'viewAllExams') => boolean;
}

const ChaemUserContext = createContext<ChaemUserContextType | undefined>(undefined);

export function ChaemUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ChaemUser>(CHAEM_MOCK_USERS.FACILITY_ADMIN);

  const roleMeta = ROLE_META[user.role];

  const can = (permission: 'viewDashboard' | 'registerExams' | 'viewAllExams') => {
    switch (permission) {
      case 'viewDashboard':  return roleMeta.canViewDashboard;
      case 'registerExams':  return roleMeta.canRegisterExams;
      case 'viewAllExams':   return roleMeta.canViewAllExams;
    }
  };

  return (
    <ChaemUserContext.Provider value={{ user, setUser, roleMeta, can }}>
      {children}
    </ChaemUserContext.Provider>
  );
}

export function useChaemUser() {
  const ctx = useContext(ChaemUserContext);
  if (!ctx) throw new Error('useChaemUser must be used within a ChaemUserProvider');
  return ctx;
}
