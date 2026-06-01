import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metadata } = body;

    const upload = await mux.video.uploads.create({
     new_asset_settings: {
  playback_policy: ['public'],
},
      cors_origin: '*',
    });

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error('Error creating Mux upload:', error);
    return NextResponse.json(
      { error: 'Failed to create upload' },
      { status: 500 }
    );
  }
}