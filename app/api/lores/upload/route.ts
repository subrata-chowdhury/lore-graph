import { NextResponse } from "next/server";
import cloudinary from "@/config/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to Base64 string for Cloudinary
    // const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const uploadResponse = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "lore-graph/lores",
            // public_id: userId, // This was likely a copy-paste error from a user upload route
            // --- DIMENSIONS ---
            width: 230,
            height: 130,

            // --- CROP STRATEGY ---
            // 'fill': Create an image with the exact given width and height,
            // retaining aspect ratio, cropping the excess.
            crop: "fill",

            // --- POSITIONING ---
            // 'center': Always crop from the exact geometric center of the image.
            gravity: "center",

            // --- COMPRESSION ---
            quality: "auto", // Heavy compression with no visual loss
            fetch_format: "auto", // Convert to WebP/AVIF
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        url: uploadResponse.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "File upload failed", details: error }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { publicId } = await req.json(); // Get the public_id from request body

    if (!publicId) {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 });
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy("labTesto/labs/" + publicId);

    if (result.result !== "ok") {
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }

    return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error deleting image", details: String(error) },
      { status: 500 }
    );
  }
}
