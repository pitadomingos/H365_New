import { NextRequest, NextResponse } from 'next/server';
import { registerPatient, findPatientByNid } from '@/lib/server-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const patientData = await req.json();
    const { nationalId, fullName, gender, dateOfBirth } = patientData;

    // Validate required fields — aligned with patient-portal/register
    if (!nationalId || !fullName || !gender || !dateOfBirth) {
      return NextResponse.json(
        { error: 'National ID, full name, gender and date of birth are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Prevent duplicate NID — same guard as patient-portal/register
    const existing = findPatientByNid(nationalId);
    if (existing) {
      return NextResponse.json(
        { error: 'A patient with this National ID is already registered.' },
        { status: 409, headers: corsHeaders }
      );
    }

    const registered = registerPatient(patientData);

    return NextResponse.json(
      {
        success: true,
        message: 'Patient registered successfully on SaaS backend.',
        patient: registered,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Patient registration API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
