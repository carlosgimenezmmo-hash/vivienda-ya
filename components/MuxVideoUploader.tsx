'use client';

import { useState, useCallback } from 'react';
import * as UpChunk from '@mux/upchunk';

interface MuxVideoUploaderProps {
  onUploadComplete: (playbackId: string, assetId: string) => void;
  onUploadProgress?: (progress: number) => void;
  maxFiles?: number;
}

export default function MuxVideoUploader({
  onUploadComplete,
  onUploadProgress,
  maxFiles = 3,
}: MuxVideoUploaderProps) {
  const [uploads, setUploads] = useState<
    Array<{
      file: File;
      progress: number;
      status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
      uploadId?: string;
      playbackId?: string;
    }>
  >([]);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const videoFiles = Array.from(files).filter((file) =>
        file.type.startsWith('video/')
      );

      if (videoFiles.length + uploads.length > maxFiles) {
        alert(`Máximo ${maxFiles} videos permitidos`);
        return;
      }

      const newUploads = videoFiles.map((file) => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      newUploads.forEach((upload, index) => {
        startUpload(upload.file, uploads.length + index);
      });
    },
    [uploads.length, maxFiles]
  );

  const startUpload = async (file: File, uploadIndex: number) => {
    try {
      const response = await fetch('/api/mux/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get upload URL');

      const { uploadUrl, uploadId } = await response.json();

      setUploads((prev) => {
        const updated = [...prev];
        updated[uploadIndex] = {
          ...updated[uploadIndex],
          status: 'uploading',
          uploadId,
        };
        return updated;
      });

      const upload = UpChunk.createUpload({
        endpoint: uploadUrl,
        file,
        chunkSize: 5120,
      });

      upload.on('progress', (progress) => {
        setUploads((prev) => {
          const updated = [...prev];
          updated[uploadIndex] = { ...updated[uploadIndex], progress };
          return updated;
        });
        onUploadProgress?.(progress);
      });

      upload.on('success', async () => {
        setUploads((prev) => {
          const updated = [...prev];
          updated[uploadIndex] = { ...updated[uploadIndex], status: 'processing' };
          return updated;
        });

        pollForAsset(uploadId, uploadIndex);
      });

      upload.on('error', (err) => {
        console.error('Upload error:', err);
        setUploads((prev) => {
          const updated = [...prev];
          updated[uploadIndex] = { ...updated[uploadIndex], status: 'error' };
          return updated;
        });
      });
    } catch (error) {
      console.error('Error starting upload:', error);
      setUploads((prev) => {
        const updated = [...prev];
        updated[uploadIndex] = { ...updated[uploadIndex], status: 'error' };
        return updated;
      });
    }
  };

  const pollForAsset = async (uploadId: string, uploadIndex: number) => {
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/mux/asset?uploadId=${uploadId}`);
        if (response.ok) {
          const { playbackId, assetId, status } = await response.json();

          if (status === 'ready' && playbackId) {
            setUploads((prev) => {
              const updated = [...prev];
              updated[uploadIndex] = {
                ...updated[uploadIndex],
                status: 'complete',
                playbackId,
              };
              return updated;
            });
            onUploadComplete(playbackId, assetId);
          } else {
            pollForAsset(uploadId, uploadIndex);
          }
        }
      } catch (error) {
        console.error('Error polling for asset:', error);
      }
    }, 5000);
  };

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
  <input
    id="mux-file-input"
    type="file"
    accept="video/*"
    capture="environment"
    style={{ display: 'none' }}
    onChange={(e) => handleFileSelect(e.target.files)}
  />
  <button
    onClick={() => document.getElementById('mux-file-input')?.click()}
    style={{
      width: '100%', padding: '20px', borderRadius: 14,
      background: 'rgba(37,99,235,0.15)', border: '2px dashed rgba(37,99,235,0.4)',
      color: '#60A5FA', fontSize: 16, fontWeight: 700, cursor: 'pointer',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}
  >
    <span style={{ fontSize: 36 }}>📹</span>
    <span>Grabar propiedad</span>
    <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>
      Se abrirá la cámara del celular
    </span>
  </button>
</div>
      <div className="space-y-3">
        {uploads.map((upload, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <p className="font-medium text-sm truncate">{upload.file.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      upload.status === 'error'
                        ? 'bg-red-500'
                        : upload.status === 'complete'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16">
                  {upload.status === 'complete'
                    ? '✓ Listo'
                    : upload.status === 'processing'
                    ? '⚡ Procesando...'
                    : upload.status === 'error'
                    ? '✗ Error'
                    : `${Math.round(upload.progress)}%`}
                </span>
              </div>
            </div>
            {upload.status !== 'uploading' && (
              <button
                onClick={() => removeUpload(index)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}