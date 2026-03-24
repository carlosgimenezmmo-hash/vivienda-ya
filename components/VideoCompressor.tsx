"use client"
import { useState, useRef } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL, fetchFile } from "@ffmpeg/util"

interface VideoCompressorProps {
  videoFile: File
  onCompressed: (compressedFile: File) => void
  onError: (error: string) => void
}

export default function VideoCompressor({ videoFile, onCompressed, onError }: VideoCompressorProps) {
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const compress = async () => {
    setLoading(true)
    setProgress(0)
    try {
      // Cargar FFmpeg
      const ffmpeg = new FFmpeg()
      ffmpegRef.current = ffmpeg
      
      ffmpeg.on("log", ({ message }) => {
        console.log(message)
      })
      
      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.round(progress * 100))
      })

      // Descargar los archivos necesarios
      await ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, 'application/wasm'),
      })

      // Escribir archivo original
      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile))

      // Comprimir a 720p, bitrate 1M
      await ffmpeg.exec([
        "-i", "input.mp4",
        "-vf", "scale=1280:720",
        "-b:v", "1M",
        "-c:a", "aac",
        "-b:a", "128k",
        "output.mp4"
      ])

      // Leer archivo comprimido
      const compressedData = await ffmpeg.readFile("output.mp4")
      const compressedBlob = new Blob([compressedData], { type: "video/mp4" })
      const compressedFile = new File([compressedBlob], videoFile.name, { type: "video/mp4" })

      onCompressed(compressedFile)
    } catch (err) {
      console.error(err)
      onError("Error al comprimir el video. Se usará el original.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={compress}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? `Comprimiendo... ${progress}%` : "Comprimir video (menos espacio)"}
      </button>
    </div>
  )
}