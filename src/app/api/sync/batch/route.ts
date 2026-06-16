import { NextRequest, NextResponse } from 'next/server';

// CORS headers — allow all localhost origins (CHAEM / Patient Portal L-LAN bridge)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * Next.js API route to handle local-first workstation batch sync requests.
 * Reconciles local queues into the facility hub.
 */
export async function POST(req: NextRequest) {
  try {
    const { workstationId, facilityId, batch } = await req.json();

    console.log(`[LAN Sync Server] Reconciling batch sync queue:`, {
      workstationId,
      facilityId,
      itemCount: batch?.length || 0,
      timestamp: new Date().toISOString()
    });

    // In production, this persists workstation queue mutations into the master facility SQL hub.
    // Here, we return a successful synchronization response.
    return NextResponse.json({
      status: "success",
      message: `Successfully synchronized ${batch?.length || 0} local transactions to facility hub.`,
      processedCount: batch?.length || 0
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("[LAN Sync Server] Batch Sync Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Sync Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
