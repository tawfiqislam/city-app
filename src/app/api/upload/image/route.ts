import { NextRequest, NextResponse } from "next/server"

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || ""

export async function POST(request: NextRequest) {
  try {
    if (!IMGBB_API_KEY) {
      return NextResponse.json(
        { error: "Image hosting service not configured. Please set IMGBB_API_KEY." },
        { status: 500 }
      )
    }

    const contentType = request.headers.get("content-type") || ""

    let base64Image = ""
    let imageName = "citywatch-upload"

    // Handle multipart form data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("image") as File

      if (!file) {
        return NextResponse.json(
          { error: "No image file provided" },
          { status: 400 }
        )
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Allowed: JPEG, PNG, GIF, WEBP" },
          { status: 400 }
        )
      }

      // Validate file size (max 10MB)
      const MAX_SIZE = 10 * 1024 * 1024
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        )
      }

      // Convert to base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      base64Image = buffer.toString("base64")
      imageName = file.name.split(".")[0] || "upload"
    }
    // Handle JSON body (base64 string)
    else if (contentType.includes("application/json")) {
      const body = await request.json()
      if (!body.image) {
        return NextResponse.json(
          { error: "No image data provided" },
          { status: 400 }
        )
      }
      base64Image = body.image
      imageName = body.name || "upload"
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      )
    }

    if (!base64Image) {
      return NextResponse.json(
        { error: "No image data to upload" },
        { status: 400 }
      )
    }

    // Upload to imgBB
    const imgbbFormData = new FormData()
    imgbbFormData.append("key", IMGBB_API_KEY)
    imgbbFormData.append("image", base64Image)
    imgbbFormData.append("name", `citywatch-${imageName}-${Date.now()}`)

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData,
    })

    const imgbbData = await imgbbResponse.json()

    if (!imgbbData.success) {
      console.error("imgBB upload failed:", imgbbData)
      return NextResponse.json(
        { error: "Image upload to hosting service failed" },
        { status: 500 }
      )
    }

    // Return structured response
    return NextResponse.json({
      success: true,
      data: {
        url: imgbbData.data.url,
        displayUrl: imgbbData.data.display_url,
        thumbnail: imgbbData.data.thumb?.url || imgbbData.data.url,
        deleteUrl: imgbbData.data.delete_url,
        size: imgbbData.data.size,
        width: imgbbData.data.width,
        height: imgbbData.data.height,
        title: imgbbData.data.title,
        expiration: imgbbData.data.expiration || "never",
      },
    })
  } catch (error: any) {
    console.error("Image upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload image: " + (error.message || "Unknown error") },
      { status: 500 }
    )
  }
}