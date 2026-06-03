export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { confirmMedicationIntake } from '@/lib/server-db';

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

export async function POST(
  req: Request,
  { params }: { params: { nid: string; medId: string } }
) {
  try {
    const nid = params.nid;
    const medId = parseInt(params.medId, 10);

    if (isNaN(medId)) {
      return NextResponse.json(
        { error: 'Invalid Medication ID' },
        { status: 400, headers: corsHeaders }
      );
    }

    const success = confirmMedicationIntake(nid, medId);

    if (success) {
      return NextResponse.json(
        {
          success: true,
          message: 'Medication intake logged successfully.',
        },
        { status: 200, headers: corsHeaders }
      );
    } else {
      return NextResponse.json(
        { error: 'Patient or medication not found.' },
        { status: 404, headers: corsHeaders }
      );
    }
  } catch (error: any) {
    console.error('Confirm medication intake error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
