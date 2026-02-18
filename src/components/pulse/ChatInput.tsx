"use client"

import { useState, useRef, useTransition } from "react"
import { Send, Image, Mic, MicOff, Video, Loader2 } from "lucide-react"
import { sendMessage } from "@/app/guild/[guildId]/pulse/actions"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  guildId: string
  token: string
}

export function ChatInput({ guildId, token }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isPending) return

    const currentMessage = message
    setMessage("")

    startTransition(async () => {
      await sendMessage(guildId, token, currentMessage)
    })
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const resp = await fetch(`/api/talk/${token}/upload`, {
        method: "POST",
        body: formData,
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Upload failed" }))
        console.error("Upload failed:", err)
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (accept: string) => {
    const input = accept.startsWith("video") ? videoInputRef.current : fileInputRef.current
    if (input) {
      input.accept = accept
      input.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadFile(file)
      e.target.value = ""
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Find a supported audio format
      const formats = [
        { mime: "audio/webm;codecs=opus", ext: "webm", type: "audio/webm" },
        { mime: "audio/webm", ext: "webm", type: "audio/webm" },
        { mime: "audio/mp4", ext: "m4a", type: "audio/mp4" },
        { mime: "audio/ogg;codecs=opus", ext: "ogg", type: "audio/ogg" },
        { mime: "", ext: "wav", type: "audio/wav" }, // default fallback
      ]
      const format = formats.find(f => f.mime === "" || MediaRecorder.isTypeSupported(f.mime))
      if (!format) {
        stream.getTracks().forEach((t) => t.stop())
        setError("Voice recording is not supported in this browser")
        return
      }

      const options = format.mime ? { mimeType: format.mime } : undefined
      const recorder = new MediaRecorder(stream, options)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
        setRecordingDuration(0)

        const blob = new Blob(chunksRef.current, { type: format.type })
        const now = new Date()
        const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, "-")
        const file = new File([blob], `voice-${timestamp}.${format.ext}`, { type: format.type })
        await uploadFile(file)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      timerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1)
      }, 1000)
    } catch (error) {
      console.error("Microphone access denied:", error)
      setError("Microphone access denied")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const busy = isPending || isUploading

  return (
    <div className="border-t border-gray-dark p-4">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      <input ref={videoInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {/* Error message */}
      {error && (
        <div className="mb-3 flex items-center gap-2 text-sm text-danger">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-gray hover:text-white">&times;</button>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-danger" />
          <span className="text-danger">Recording {formatDuration(recordingDuration)}</span>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Media buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleFileSelect("image/*")}
            disabled={busy}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray transition-colors hover:bg-black-light hover:text-gold disabled:opacity-50"
            title="Share image"
          >
            <Image className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-50",
              isRecording
                ? "bg-danger/20 text-danger hover:bg-danger/30"
                : "text-gray hover:bg-black-light hover:text-gold"
            )}
            title={isRecording ? "Stop recording" : "Record voice"}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => handleFileSelect("video/*")}
            disabled={busy}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray transition-colors hover:bg-black-light hover:text-gold disabled:opacity-50"
            title="Share video"
          >
            <Video className="h-4 w-4" />
          </button>
        </div>

        {/* Text input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Speak into the void..."
          disabled={busy}
          className="flex-1 rounded-lg border border-gray-dark bg-black-light px-4 py-2 text-white placeholder:text-gray transition-colors focus:border-guild focus:outline-none disabled:opacity-50"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={busy || !message.trim()}
          className="flex items-center gap-2 rounded-lg bg-guild px-4 py-2 font-medium text-black transition-colors hover:bg-guild/80 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">{isPending ? "Sending..." : "Send"}</span>
        </button>
      </form>
    </div>
  )
}
