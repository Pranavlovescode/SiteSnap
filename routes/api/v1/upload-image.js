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

router.post("/", upload.array("image", 10), async (req, res) => {
  console.log("Multer file details", req.files);
  // Code for cloudinary upload

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const uploadResults=[];

  for (const files of req.files) {
    const uploadResult = await cloudinary.uploader.upload(files.path, {
      public_id: files.filename,
    }).catch((error) => {
      console.log(error);
    });
    uploadResults.push(uploadResult)
  }

  // const uploadResult = await cloudinary.uploader
  //   .upload(req.files["image"], {
  //     public_id: `${req.files["image"]}`,
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  console.log("Cloudinary upload", uploadResults);

  // Add the user id to the photoData table as a relation
  // await prisma.photoData.create({
  //   data:{
  //     message:uploadResult.secure_url,
  //   }
  // })

  res.send({ multer: req.files, cloudinary: uploadResults });
});

export default router;
