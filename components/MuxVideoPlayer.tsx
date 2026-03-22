'use client';

import MuxPlayer from '@mux/mux-player-react';

interface MuxVideoPlayerProps {
  playbackId: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function MuxVideoPlayer({
  playbackId,
  className = '',
  autoPlay = false,
  loop = true,
  muted = true,
}: MuxVideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
}