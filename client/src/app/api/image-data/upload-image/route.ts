import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";


export const runtime = "nodejs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure request size limit for this route
export const config = {
  api: {
    bodyParser: false, // Disables the default body parser
    responseLimit: false, // Remove response size limitation
  },
};

export async function POST(req: NextRequest) {
  try {
    // Get session to verify authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get teamId from URL params
    const url = new URL(req.url);
    const teamId = url.searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        {
          error: "Invalid team ID",
        },
        { status: 400 }
      );
    }

    // Ensure team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        {
          error: "Team not found",
        },
        { status: 404 }
      );
    }

    // Parse form data with larger size handling
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error("Form data parsing error:", error);
      return NextResponse.json(
        {
          error: "Failed to parse upload data. The file may be too large.",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 413 }
      );
    }

    const files = formData.getAll("image") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          error: "No files uploaded",
        },
        { status: 400 }
      );
    }

    // Check file sizes before processing
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: "File too large",
            details: `${file.name} exceeds the maximum file size of 5MB`,
          },
          { status: 413 }
        );
      }
    }

    console.log(
      "Uploaded Files:",
      files.map((f) => f.name)
    );
    console.log("Query Parameter - teamId:", teamId);

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadResults = [];
    const tempFilePaths = [];
    const savedPhotos = [];

    // Save files temporarily and upload to Cloudinary
    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const filename = `${Date.now()}-${file.name}`;
        const filepath = join(uploadDir, filename);

        // Save to temp location
        await writeFile(filepath, buffer);
        tempFilePaths.push(filepath);

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(filepath, {
          public_id: filename,
          folder: `${team.name}/${new Date().toISOString().slice(0, 10)}`,
        });

        uploadResults.push(uploadResult);
      } catch (error) {
        console.error("File Processing Error:", error);
      }
    }

    console.log("Cloudinary Upload Results:", uploadResults);

    // Save uploaded images in the database
    for (const image of uploadResults) {
      try {
        const photo = await prisma.photoData.create({
          data: {
            url: image.secure_url,
            name: image.original_filename,
            folder: image.asset_folder || "", // Ensure this exists
            user: { connect: { id: userId } }, // Ensure userId is valid
            team: { connect: { id: teamId } }, // Ensure teamId is valid
          },
        });

        savedPhotos.push(photo);
      } catch (dbError) {
        console.error("Database Insertion Error:", dbError);
      }
    }

    // Delete temporary files
    console.log("Attempting to delete temporary files:", tempFilePaths);

    for (const filepath of tempFilePaths) {
      try {
        // Check if file exists before attempting deletion
        const fs = require("fs");
        if (fs.existsSync(filepath)) {
          await unlink(filepath);
          console.log(`Successfully deleted: ${filepath}`);
        } else {
          console.log(`File does not exist: ${filepath}`);
        }
      } catch (unlinkError) {
        console.error(`File Deletion Error for ${filepath}:`, unlinkError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        photos: savedPhotos,
        cloudinary: uploadResults,
        message: "Image uploaded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      {
        error: "File upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
