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

export async function POST(req: Request) {
  try {
    const { nationalId } = await req.json();

    if (!nationalId) {
      return NextResponse.json(
        { error: 'National ID is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const patient = findPatientByNid(nationalId);

    if (patient) {
      return NextResponse.json(
        {
          success: true,
          patient,
        },
        { status: 200, headers: corsHeaders }
      );
    } else {
      return NextResponse.json(
        { error: 'No clinical record found for this National ID.' },
        { status: 404, headers: corsHeaders }
      );
    }
  } catch (error: any) {
    console.error('Patient login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
