import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import streamifier from "streamifier";

export const runtime = "nodejs";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Route config for large files
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

// Define the minimal Cloudinary response type
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

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Form data parsing failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 413 }
      );
    }

    const files = formData.getAll("image") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: "File too large",
            details: `${file.name} exceeds 5MB`,
          },
          { status: 413 }
        );
      }
    }

    const uploadDir = join(process.cwd(), "uploads");
    if (process.env.NODE_ENV === "development") {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadResults: CloudinaryUploadResponse[] = [];
    const tempFilePaths: string[] = [];
    const savedPhotos = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name}`;
        const folder = `${team.name}/${new Date().toISOString().slice(0, 10)}`;

        let uploadResult: CloudinaryUploadResponse;

        if (process.env.NODE_ENV === "development") {
          const filepath = join(uploadDir, filename);
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
          uploadResult = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                public_id: filename,
                folder,
              },
              (error, result) => {
                if (error || !result) {
                  return reject(error || new Error("Cloudinary upload failed"));
                }
                resolve({
                  secure_url: result.secure_url,
                  original_filename: result.original_filename,
                  asset_folder: result.asset_folder,
                });
              }
            );

            streamifier.createReadStream(buffer).pipe(stream);
          });
        }

        uploadResults.push(uploadResult);
      } catch (error) {
        console.error("Upload failed:", error);
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
        console.error("Database error:", error);
      }
    }

    if (process.env.NODE_ENV === "development") {
      for (const filepath of tempFilePaths) {
        try {
          const fs = require("fs");
          if (fs.existsSync(filepath)) {
            await unlink(filepath);
            console.log("Deleted:", filepath);
          }
        } catch (error) {
          console.error(`Failed to delete temp file ${filepath}:`, error);
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
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
