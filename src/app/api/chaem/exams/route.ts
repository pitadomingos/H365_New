export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * CHAEM Occupational Exam Shared Storage — L-LAN Bridge (File-Persisted)
 *
 * Replaced the previous module-level in-memory Map with file persistence so
 * exam records survive dev server restarts. Uses the same pattern as
 * server-db.ts → data/chaem-exams.json.
 *
 * Both the chaem-app (port 5174) and patient-portal-app (port 3001) call
 * this endpoint at localhost:3000 to read and write exam data.
 */

const DATA_DIR  = path.join(process.cwd(), 'data');
const EXAM_PATH = path.join(DATA_DIR, 'chaem-exams.json');

function readExams(): Record<string, object> {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(EXAM_PATH)) return {};
    return JSON.parse(fs.readFileSync(EXAM_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function writeExams(store: Record<string, object>) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(EXAM_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[CHAEM L-LAN] Failed to write exam store:', err);
  }
}

// CORS helper — allow all localhost origins for the L-LAN prototype
function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin?.startsWith('http://localhost') ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

/** GET /api/chaem/exams?nid=... — returns exams for a patient (or all if no nid) */
export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  const { searchParams } = new URL(req.url);
  const nid = searchParams.get('nid');

  const store = readExams();
  const allExams = Object.values(store) as any[];
  const result = nid ? allExams.filter(e => e.patientId === nid) : allExams;

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
    const store = readExams();
    store[exam.id] = exam;
    writeExams(store);
    console.log(`[CHAEM L-LAN] Exam persisted: ${exam.id} (patient: ${exam.patientId})`);
    return NextResponse.json({ status: 'ok', id: exam.id }, { headers: corsHeaders(origin) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders(origin) });
  }
}

/** DELETE /api/chaem/exams?id=... — removes a single exam */
export async function DELETE(req: NextRequest) {
  const origin = req.headers.get('origin');
  const id = new URL(req.url).searchParams.get('id');
  if (id) {
    const store = readExams();
    delete store[id];
    writeExams(store);
  }
  return NextResponse.json({ status: 'ok' }, { headers: corsHeaders(origin) });
}
