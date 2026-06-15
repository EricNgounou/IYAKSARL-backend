const asyncHandler = require("express-async-handler");

const sharp = require("sharp");
const path = require("path");
const { extractPublicId } = require("./helpers");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");

const { v2: cloudinary } = require("cloudinary");
const e = require("express");

// 1. Configure Cloudinary
cloudinary.config();

// For local cloud storage using MinIO
const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  region: process.env.MINIO_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true, // Mandatory criteria mapping for local IP/domain target resolution
});

const NODE_ENV = process.env.NODE_ENV;
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "application-images";

const processUpload = asyncHandler(async (req, res) => {
  // Assert file status inside upload array bounds
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: "No files where uploaded. Please provide at least one image.",
    });
  }

  let { imgAltTexts } = req.body;
  imgAltTexts = JSON.parse(imgAltTexts);

  const resolutions = [1200, 400];
  const formats = ["avif", "webp", "jpeg"];

  const optimizationPromises = req.files.map(async (file, i) => {
    const uniqueBaseId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = path.extname(file.originalname).toLowerCase();
    const cleanBaseName = path
      .basename(file.originalname, originalExt)
      .replace(/[^a-zA-Z0-9]/g, "_");

    const imageUrls = {
      isUploaded: true,
      ...imgAltTexts[i],
    };

    for (const resolution of resolutions) {
      for (const format of formats) {
        let sharpInstance = sharp(file.buffer).resize({ width: resolution });
        if (format === "avif") {
          sharpInstance = sharpInstance.avif({ quality: 65, effort: 4 });
        } else if (format === "webp") {
          sharpInstance = sharpInstance.webp({ quality: 80 });
        } else if (format === "jpeg") {
          sharpInstance = sharpInstance.jpeg({
            quality: 80,
            progressive: true,
          });
        }
        const processedBuffer = await sharpInstance.toBuffer();
        const storageFilename = `${cleanBaseName}-${resolution}px${format.toUpperCase()}-${uniqueBaseId}.${format}`;

        let publicStorageUrl;

        if (NODE_ENV === "development") {
          await s3Client.send(
            new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: storageFilename,
              Body: processedBuffer,
              ContentType: `image/${format}`,
            }),
          );

          publicStorageUrl = `${process.env.MINIO_ENDPOINT}/${BUCKET_NAME}/${storageFilename}`;
        } else if (NODE_ENV === "production") {
          const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                {
                  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET, // Replace with your actual upload preset

                  // --- Custom Naming Configurations ---
                  public_id: storageFilename.split(".")[0], // Your personalized file name
                  use_filename: true, // Tells Cloudinary to use the provided name
                  unique_filename: false, // Disables adding random characters to your name
                },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result);
                },
              );
              stream.end(fileBuffer);
            });
          };

          const result = await uploadToCloudinary(processedBuffer);
          publicStorageUrl = result.secure_url; // Get the secure URL of the uploaded image
        }

        imageUrls[
          `${resolution === 1200 ? "main" : "thumbnail"}Url${format.toUpperCase()}`
        ] = publicStorageUrl;
      }
    }

    return imageUrls;
  });
  const uploadedImageUrls = await Promise.all(optimizationPromises);
  return uploadedImageUrls;
});

const processDelete = asyncHandler(async (req, res) => {
  let { deletedImgs } = req.body;
  deletedImgs = JSON.parse(deletedImgs);
  if (!deletedImgs.length) return;

  if (NODE_ENV === "production") {
    const publicIds = deletedImgs.map((url) => {
      const publicId = extractPublicId(url);
      return publicId;
    });
    await cloudinary.api.delete_resources(publicIds);
  } else if (NODE_ENV === "development") {
    const imgObKeys = deletedImgs.map((url) => {
      const endpoint = process.env.MINIO_ENDPOINT;
      const imgNameKey = url.slice(
        endpoint.length + 1 /* +1 because we are skipping the slash "/" */,
      );
      return { Key: imgNameKey };
    });

    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: imgObKeys, // Array of objects containing keys
        },
      }),
    );
  }
});

module.exports = {
  processUpload,
  processDelete,
};
