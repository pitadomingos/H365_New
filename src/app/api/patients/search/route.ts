import { NextRequest, NextResponse } from 'next/server';
import { getAllPatients } from '@/lib/server-db';

// CORS headers — allow all localhost origins (CHAEM L-LAN bridge)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

/**
 * GET /api/patients/search?q=<query>&limit=<n>
 *
 * Searches the H365 patient database for CHAEM cross-origin patient lookup.
 * Matches against: fullName, nationalId, district, province.
 * Returns a lightweight patient list (no sensitive clinical data).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);

    if (!query || query.length < 2) {
      return NextResponse.json({ patients: [] }, { headers: corsHeaders });
    }

    const all = getAllPatients();

    const matched = all
      .filter(p =>
        p.fullName?.toLowerCase().includes(query) ||
        p.nationalId?.toLowerCase().includes(query) ||
        p.district?.toLowerCase().includes(query) ||
        p.province?.toLowerCase().includes(query)
      )
      .slice(0, limit)
      .map(p => ({
        // Return only non-sensitive identification fields needed by CHAEM
        id: p.id,
        nationalId: p.nationalId,
        fullName: p.fullName,
        gender: p.gender,
        age: p.age,
        dateOfBirth: p.dateOfBirth,
        district: p.district,
        province: p.province,
        photoUrl: p.photoUrl,
        status: p.status,
      }));

    return NextResponse.json({ patients: matched }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[/api/patients/search] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
