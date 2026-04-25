"use client"

import { useRef, useState } from "react"

interface ImageUploaderProps {
  label?: string
  required?: boolean
  value: string
  onChange: (url: string) => void
  onImageUploaded?: (url: string) => void
  placeholder?: string
  helpText?: string
  previewMaxHeight?: string
}

export default function ImageUploader({
  label = "Upload Image",
  required = false,
  value,
  onChange,
  onImageUploaded,
  placeholder = "https://example.com/image.jpg",
  helpText,
  previewMaxHeight = "max-h-48",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadToImgBB = async (file: File) => {
    setUploading(true)
    setUploadError("")
    setUploadSuccess("")

    try {
      const IMGBB_KEY =
        process.env.NEXT_PUBLIC_IMGBB_API_KEY || ""

      if (!IMGBB_KEY) {
        setUploadError(
          "imgBB API key not configured. Paste an image URL below instead."
        )
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await res.json()

      if (data.success && data.data?.url) {
        const url = data.data.url
        onChange(url)

        // Call onImageUploaded only if it exists
        if (onImageUploaded && typeof onImageUploaded === "function") {
          onImageUploaded(url)
        }

        setUploadSuccess(
          `Uploaded successfully! (${(file.size / 1024).toFixed(0)} KB)`
        )
        setUploadError("")
      } else {
        throw new Error(
          data.error?.message || "Upload failed. Please try again."
        )
      }
    } catch (err: any) {
      console.error("imgBB upload error:", err)
      setUploadError(
        err.message || "Upload failed. Please paste an image URL instead."
      )
      setUploadSuccess("")
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.")
      return
    }

    if (file.size > 32 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 32MB.")
      return
    }

    await uploadToImgBB(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadError("Please drop an image file.")
      return
    }

    await uploadToImgBB(file)
  }

  const handleRemove = () => {
    onChange("")
    setUploadSuccess("")
    setUploadError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center gap-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {!required && (
            <span className="text-gray-400 font-normal ml-1 text-xs">
              (Optional)
            </span>
          )}
        </label>
        {uploadSuccess && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            ✅ Uploaded
          </span>
        )}
      </div>

      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}

      {/* Upload Area */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* Drag & Drop + File Picker */}
        <div
          className={`p-5 text-center transition-all ${
            dragOver
              ? "bg-emerald-50 border-2 border-dashed border-emerald-400"
              : "bg-gray-50"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
        >
          <div className="text-4xl mb-2">📸</div>

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 font-medium">
                Uploading to imgBB...
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                {dragOver
                  ? "Drop your image here!"
                  : "Drag & drop or click to upload"}
              </p>

              <label className="inline-block cursor-pointer">
                <span className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition cursor-pointer">
                  Choose Image
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-gray-400 mt-3">
                All image formats supported • Max 32MB • Auto-uploaded to imgBB
              </p>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-t border-b border-gray-100">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400">or paste URL</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* URL Input */}
        <div className="p-4 bg-white">
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setUploadSuccess("")
              setUploadError("")
            }}
          />
        </div>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-green-500 text-lg">✅</span>
          <p className="text-green-700 text-sm font-medium">
            {uploadSuccess}
          </p>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <span className="text-red-500">⚠️</span>
          <p className="text-red-700 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">
              📷 Preview:
            </p>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
            >
              ✕ Remove
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={value}
              alt="Uploaded preview"
              className={`w-full ${previewMaxHeight} object-contain p-2`}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                setUploadError(
                  "Cannot load image. Check the URL or upload again."
                )
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "block"
                setUploadError("")
              }}
            />
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium shadow-sm">
                ✓ Ready
              </span>
            </div>
          </div>

          {/* Show the URL */}
          <p className="text-xs text-gray-400 mt-2 truncate">
            🔗 {value}
          </p>
        </div>
      )}
    </div>
  )
}