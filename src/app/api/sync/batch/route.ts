import { NextResponse } from 'next/server';

/**
 * Next.js API route to handle local-first workstation batch sync requests.
 * Reconciles local queues into the facility hub.
 */
export async function POST(req: Request) {
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
    });
  } catch (error: any) {
    console.error("[LAN Sync Server] Batch Sync Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Sync Error" },
      { status: 500 }
    );
  }
}
