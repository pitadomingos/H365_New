export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { findPatientByNid } from '@/lib/server-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(
  req: Request,
  { params }: { params: { nid: string } }
) {
  const nid = params.nid;
  const patient = findPatientByNid(nid);

  if (patient) {
    return NextResponse.json(
      {
        visits: patient.visits || [],
        labs: patient.labs || [],
      },
      { status: 200, headers: corsHeaders }
    );
  } else {
    return NextResponse.json(
      { error: 'Patient not found' },
      { status: 404, headers: corsHeaders }
    );
  }
}
