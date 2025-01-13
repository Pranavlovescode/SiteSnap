import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import verifyToken from "../middlewares/verifyToken.js";

const prisma = new PrismaClient();
const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload-images", upload.array("image", 10), verifyToken, async (req, res) => {
  const userId = req.user.id;
  const {teamId}= req.query;
  console.log("Multer file details", req.files);
  console.log("query parameter",teamId)

  // Code for cloudinary upload

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const uploadResults = [];

  const team = await prisma.team.findUnique({
    where:{
      id:teamId
    }
  })

  try {
    for (const files of req.files) {
      const uploadResult = await cloudinary.uploader
        .upload(files.path, {
          public_id: files.filename,
          folder:`${team.name}/${new Date().toISOString().slice(0,10)}`,
        })
        .catch((error) => {
          console.log(error);
        });
      uploadResults.push(uploadResult);
    }

    console.log("Cloudinary upload", uploadResults);

    // Add the user id to the photoData table as a relation
    uploadResults.map(async (image) => {
      await prisma.photoData.create({
        data: {
          url: image.secure_url,
          name:image.display_name,
          folder:image.asset_folder,
          user: {
            connect: {
              id: userId,
            },
          },
          team:{
            connect:{
              id:teamId
            }
          }
        },
      });
    });

    // Delete the files from the uploads folder
    for (const files of req.files) {
      fs.unlink(files.path, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }

    res.status(201).json({ multer: req.files, cloudinary: uploadResults , message: "Image uploaded successfully!" });
  } catch (error) {
    console.log("Error in upload", error);
    res.status(500).json({ error: "Error in uploading the image" });
  }
});


router.get('/get-images',verifyToken,async(req,res)=>{
  const {teamId} = req.query;
  console.log("team id ",teamId)
  const images = await prisma.photoData.findMany({
    where:{
      teamId:teamId
    },
    include:{
      user:true,
      team:true
    }
  })
  res.status(200).json({images})
})

export default router;
