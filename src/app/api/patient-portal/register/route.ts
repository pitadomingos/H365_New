export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { findPatientByNid, registerPatient } from '../../../../lib/server-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { nationalId, fullName, gender, dateOfBirth, district, province, phone, email, allergies, chronicConditions, nextOfKinName, nextOfKinRelation, nextOfKinPhone } = body;

    // Validate required fields
    if (!nationalId || !fullName || !gender || !dateOfBirth) {
      return NextResponse.json(
        { error: 'National ID, full name, gender and date of birth are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check NID is not already registered
    const existing = findPatientByNid(nationalId);
    if (existing) {
      return NextResponse.json(
        { error: 'A patient with this National ID is already registered. Please log in instead.' },
        { status: 409, headers: corsHeaders }
      );
    }

    // Calculate age from date of birth
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    // Create the new patient record
    const newPatient = registerPatient({
      nationalId,
      fullName,
      gender,
      dateOfBirth,
      age,
      district: district || 'Maputo',
      province: province || 'Maputo Cidade',
      phone: phone || '',
      email: email || '',
      allergies: Array.isArray(allergies) ? allergies : allergies ? [allergies] : [],
      chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : chronicConditions ? [chronicConditions] : [],
      nextOfKinName: nextOfKinName || '',
      nextOfKinRelation: nextOfKinRelation || 'Spouse',
      nextOfKinPhone: nextOfKinPhone || '',
      status: 'Self-Registered',
      location: 'Outpatient',
      photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    });

    return NextResponse.json(
      { success: true, patient: newPatient },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Self-registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
