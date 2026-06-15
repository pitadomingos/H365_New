import { NextRequest, NextResponse } from 'next/server';

/**
 * CHAEM Occupational Exam Shared Storage — L-LAN Bridge
 *
 * Acts as the cross-origin shared hub for CHAEM exam records.
 * Both the chaem-app (port 5174) and patient-portal-app (port 3002) call
 * this endpoint at localhost:3000 to read and write exam data, bypassing
 * the browser's per-origin localStorage restriction.
 *
 * In production this would persist to a database. For the L-LAN prototype
 * we store in a module-level Map (survives hot-reload in dev mode).
 */

// Module-level in-memory store — persists across requests in the same process
const examStore = new Map<string, object>();

// CORS helper — allow all localhost origins for the L-LAN prototype
function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin?.startsWith('http://localhost') ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Pre-flight handler
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

/** GET /api/chaem/exams?nid=... — returns exams for a patient (or all if no nid) */
export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const { searchParams } = new URL(req.url);
  const nid = searchParams.get('nid');

  const allExams = Array.from(examStore.values()) as any[];
  const result = nid
    ? allExams.filter(e => e.patientId === nid)
    : allExams;

  return NextResponse.json({ exams: result }, { headers: corsHeaders(origin) });
}

/** POST /api/chaem/exams — upserts an exam record */
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const exam = await req.json();
    if (!exam?.id) {
      return NextResponse.json({ error: 'Exam must have an id field' }, { status: 400, headers: corsHeaders(origin) });
    }
    examStore.set(exam.id, exam);
    console.log(`[CHAEM L-LAN] Exam upserted: ${exam.id} (patient: ${exam.patientId})`);
    return NextResponse.json({ status: 'ok', id: exam.id }, { headers: corsHeaders(origin) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders(origin) });
  }
}

/** DELETE /api/chaem/exams?id=... — removes a single exam */
export async function DELETE(req: NextRequest) {
  const origin = req.headers.get('origin');
  const id = new URL(req.url).searchParams.get('id');
  if (id) examStore.delete(id);
  return NextResponse.json({ status: 'ok' }, { headers: corsHeaders(origin) });
}
