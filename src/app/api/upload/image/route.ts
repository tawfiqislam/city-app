import { NextRequest, NextResponse } from "next/server"

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Upload to imgBB
    const imgbbFormData = new FormData()
    imgbbFormData.append("key", IMGBB_API_KEY)
    imgbbFormData.append("image", base64)

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData,
    })

    const data = await response.json()

    if (data.success) {
      return NextResponse.json({
        success: true,
        url: data.data.url,
        deleteUrl: data.data.delete_url,
        thumbnail: data.data.thumb?.url,
      })
    } else {
      throw new Error("Upload failed")
    }
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}