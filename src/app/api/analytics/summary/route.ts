export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getAllPatients } from '@/lib/server-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const patients = getAllPatients();
    const total = patients.length;

    // ── Gender ──────────────────────────────────────────────────────────────
    const genderCounts = patients.reduce((acc, p) => {
      acc[p.gender] = (acc[p.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // ── Province ────────────────────────────────────────────────────────────
    const provinceCounts: Record<string, number> = {};
    patients.forEach(p => {
      if (p.province) provinceCounts[p.province] = (provinceCounts[p.province] || 0) + 1;
    });
    const provinceData = Object.entries(provinceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([province, count]) => ({ province, count }));

    // ── Age buckets ──────────────────────────────────────────────────────────
    const ageBuckets = [
      { label: '0–17', min: 0, max: 17 },
      { label: '18–34', min: 18, max: 34 },
      { label: '35–49', min: 35, max: 49 },
      { label: '50–64', min: 50, max: 64 },
      { label: '65+', min: 65, max: 200 },
    ].map(b => ({
      label: b.label,
      count: patients.filter(p => p.age >= b.min && p.age <= b.max).length,
    }));

    // ── Status ───────────────────────────────────────────────────────────────
    const statusCounts: Record<string, number> = {};
    patients.forEach(p => {
      const s = p.status || 'Registered';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // ── Monthly registrations (last 6 months) ────────────────────────────────
    const now = new Date();
    const shortMonths = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const monthlyReg: Record<string, { month: string; count: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyReg[key] = { month: shortMonths[d.getMonth()], count: 0 };
    }
    patients.forEach(p => {
      if (!p.lastVisit) return;
      const d = new Date(p.lastVisit);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyReg[key]) monthlyReg[key].count++;
    });

    // ── Chronic conditions top-5 ─────────────────────────────────────────────
    const conditionCounts: Record<string, number> = {};
    patients.forEach(p => {
      (p.chronicConditions || []).forEach(c => {
        conditionCounts[c] = (conditionCounts[c] || 0) + 1;
      });
    });
    const topConditions = Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([condition, count]) => ({ condition, count }));

    // ── Patient Portal metrics ───────────────────────────────────────────────
    let totalMeds = 0, totalConfirmed = 0, totalVisits = 0, totalLabs = 0;
    patients.forEach(p => {
      totalMeds     += (p.medications || []).length;
      totalVisits   += (p.visits || []).length;
      totalLabs     += (p.labs || []).length;
      (p.medications || []).forEach((m: any) => {
        totalConfirmed += (m.adherenceLog || []).length;
      });
    });

    // Lab status breakdown
    const labStatus: Record<string, number> = {};
    patients.forEach(p => {
      (p.labs || []).forEach((l: any) => {
        const s = l.status || 'Unknown';
        labStatus[s] = (labStatus[s] || 0) + 1;
      });
    });

    // Medication frequency distribution
    const medFreqCounts: Record<string, number> = {};
    patients.forEach(p => {
      (p.medications || []).forEach((m: any) => {
        const f = m.frequency || 'Other';
        medFreqCounts[f] = (medFreqCounts[f] || 0) + 1;
      });
    });

    return NextResponse.json({
      h365: {
        total,
        genderCounts,
        provinceData,
        ageBuckets,
        statusCounts,
        monthlyRegistrations: Object.values(monthlyReg),
        topConditions,
      },
      portal: {
        totalMeds,
        totalConfirmed,
        totalVisits,
        totalLabs,
        adherenceRate: totalMeds > 0 ? Math.round((totalConfirmed / totalMeds) * 100) : 0,
        labStatus,
        medFreqCounts,
      },
    }, { headers: corsHeaders });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
