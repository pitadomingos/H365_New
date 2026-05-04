
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'NATIONAL_ADMIN' | 'PROVINCIAL_ADMIN' | 'DISTRICT_ADMIN' | 'FACILITY_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jurisdiction: {
    province?: string;
    district?: string;
    facility?: string;
  };
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock Users for Demo
export const MOCK_USERS: Record<UserRole, User> = {
  NATIONAL_ADMIN: {
    id: 'u1',
    name: 'Dr. Afonso Dhlakama',
    email: 'national@misau.gov.mz',
    role: 'NATIONAL_ADMIN',
    jurisdiction: {},
  },
  PROVINCIAL_ADMIN: {
    id: 'u2',
    name: 'Geraldo Maputo',
    email: 'provincial@misau.gov.mz',
    role: 'PROVINCIAL_ADMIN',
    jurisdiction: { province: 'Maputo' },
  },
  DISTRICT_ADMIN: {
    id: 'u3',
    name: 'Ana Matola',
    email: 'district@misau.gov.mz',
    role: 'DISTRICT_ADMIN',
    jurisdiction: { province: 'Maputo', district: 'Matola' },
  },
  FACILITY_ADMIN: {
    id: 'u4',
    name: 'Hélio Central',
    email: 'facility@h365.gov.mz',
    role: 'FACILITY_ADMIN',
    jurisdiction: { province: 'Maputo', district: 'Matola', facility: 'Hospital Central de Maputo' },
  },
};

export function UserProvider({ children }: { children: ReactNode }) {
  // Default to national for now, can be switched in UI
  const [user, setUser] = useState<User | null>(MOCK_USERS.NATIONAL_ADMIN);
  const [isLoading] = useState(false);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
