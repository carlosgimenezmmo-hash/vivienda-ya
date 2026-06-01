import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uploadId = searchParams.get('uploadId');

  if (!uploadId) {
    return NextResponse.json(
      { error: 'Upload ID required' },
      { status: 400 }
    );
  }

  try {
    const upload = await mux.video.uploads.retrieve(uploadId);
    
    if (upload.asset_id) {
      const asset = await mux.video.assets.retrieve(upload.asset_id);
      const playbackId = asset.playback_ids?.[0]?.id;

      return NextResponse.json({
        assetId: asset.id,
        playbackId,
        status: asset.status,
        duration: asset.duration,
      });
    }

    return NextResponse.json({
      status: 'waiting_for_asset',
    });
  } catch (error) {
    console.error('Error retrieving asset:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve asset' },
      { status: 500 }
    );
  }
}