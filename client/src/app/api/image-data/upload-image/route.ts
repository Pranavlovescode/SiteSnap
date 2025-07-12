import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import streamifier from "streamifier";

export const runtime = "nodejs";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

// Define type for Cloudinary response
interface CloudinaryUploadResponse {
  secure_url: string;
  original_filename: string;
  asset_folder?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const teamId = url.searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json({ error: "Missing team ID" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Parse multipart form
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Failed to parse form data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 413 }
      );
    }

    const files = formData.getAll("image") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: "File too large",
            details: `${file.name} exceeds 5MB limit`,
          },
          { status: 413 }
        );
      }
    }

    const isDev = process.env.NODE_ENV === "development";
    const uploadResults: CloudinaryUploadResponse[] = [];
    const savedPhotos = [];
    const tempFilePaths: string[] = [];

    if (isDev) {
      const uploadDir = join(process.cwd(), "uploads");
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${file.name}`;
        const folder = `${team.name}/${new Date().toISOString().slice(0, 10)}`;

        let uploadResult: CloudinaryUploadResponse;

        if (isDev) {
          const filepath = join(process.cwd(), "uploads", filename);
          await writeFile(filepath, buffer);
          tempFilePaths.push(filepath);

          const result = await cloudinary.uploader.upload(filepath, {
            public_id: filename,
            folder,
          });

          uploadResult = {
            secure_url: result.secure_url,
            original_filename: result.original_filename,
            asset_folder: result.asset_folder,
          };
        } else {
          // Upload directly from memory (streamed)
          uploadResult = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                public_id: filename,
                folder,
              },
              (error, result) => {
                if (error || !result) return reject(error || new Error("Upload failed"));
                resolve({
                  secure_url: result.secure_url,
                  original_filename: result.original_filename,
                  asset_folder: result.asset_folder,
                });
              }
            );

            streamifier.createReadStream(buffer).pipe(uploadStream);
          });
        }

        uploadResults.push(uploadResult);
      } catch (error) {
        console.error("File Processing Error:", error);
      }
    }

    for (const image of uploadResults) {
      try {
        const photo = await prisma.photoData.create({
          data: {
            url: image.secure_url,
            name: image.original_filename,
            folder: image.asset_folder ?? "",
            user: { connect: { id: userId } },
            team: { connect: { id: teamId } },
          },
        });
        savedPhotos.push(photo);
      } catch (error) {
        console.error("Database Insert Error:", error);
      }
    }

    // Only delete temp files in dev
    if (isDev) {
      for (const filepath of tempFilePaths) {
        try {
          const fs = require("fs");
          if (fs.existsSync(filepath)) {
            await unlink(filepath);
            console.log("🧹 Deleted:", filepath);
          }
        } catch (error) {
          console.error(`Failed to delete ${filepath}:`, error);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        photos: savedPhotos,
        cloudinary: uploadResults,
        message: "Upload successful",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected Upload Error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
