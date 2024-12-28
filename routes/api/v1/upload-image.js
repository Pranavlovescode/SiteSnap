import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

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

router.post("/", upload.single("image"), async (req, res) => {
  console.log("Multer file details", req.file);
  // Code for cloudinary upload

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const uploadResult = await cloudinary.uploader
    .upload(req.file.path, {
      public_id: `${req.file.filename}`,
    })
    .catch((error) => {
      console.log(error);
    });

  console.log("Cloudinary upload", uploadResult);

  // Add the user id to the photoData table as a relation
  // await prisma.photoData.create({
  //   data:{
  //     message:uploadResult.secure_url,      
  //   }
  // })

  res.send({ multer: req.file, cloudinary: uploadResult });
});

export default router;
