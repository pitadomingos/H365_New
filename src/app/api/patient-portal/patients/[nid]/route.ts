export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { findPatientByNid, updatePatientProfile } from '@/lib/server-db';

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
    return NextResponse.json(patient, { status: 200, headers: corsHeaders });
  } else {
    return NextResponse.json(
      { error: 'Patient not found' },
      { status: 404, headers: corsHeaders }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { nid: string } }
) {
  try {
    const nid = params.nid;
    const body = await req.json();

    // We only allow updating contact and next-of-kin information via the patient portal
    const allowedUpdates = {
      email: body.email,
      phone: body.phone,
      address: body.address,
      nextOfKinName: body.nextOfKinName,
      nextOfKinRelation: body.nextOfKinRelation,
      nextOfKinPhone: body.nextOfKinPhone,
    };

    // Remove undefined properties so we don't overwrite existing values with undefined
    Object.keys(allowedUpdates).forEach(
      (key) =>
        allowedUpdates[key as keyof typeof allowedUpdates] === undefined &&
        delete allowedUpdates[key as keyof typeof allowedUpdates]
    );

    const updatedPatient = updatePatientProfile(nid, allowedUpdates);

    if (updatedPatient) {
      return NextResponse.json(
        {
          success: true,
          patient: updatedPatient,
        },
        { status: 200, headers: corsHeaders }
      );
    } else {
      return NextResponse.json(
        { error: 'Patient profile not found or could not be updated.' },
        { status: 404, headers: corsHeaders }
      );
    }
  } catch (error: any) {
    console.error('Update patient profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
