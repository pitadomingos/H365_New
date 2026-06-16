export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { findPatientByNid } from '@/lib/server-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

/**
 * GET /api/patient-portal/patients/[nid]/medications/[medId]
 * Returns a single medication record by index/id for a given patient NID.
 */
export async function GET(
  _req: Request,
  { params }: { params: { nid: string; medId: string } }
) {
  const patient = findPatientByNid(params.nid);
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404, headers: corsHeaders });
  }
  const meds: any[] = patient.medications || [];
  const med = meds.find((m: any) => String(m.id ?? m.medId) === params.medId)
    ?? meds[parseInt(params.medId, 10)];
  if (!med) {
    return NextResponse.json({ error: 'Medication not found' }, { status: 404, headers: corsHeaders });
  }
  return NextResponse.json(med, { status: 200, headers: corsHeaders });
}
