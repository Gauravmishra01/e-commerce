import multer from "multer";

const storage = multer.memoryStorage(); // ✅ IMPORTANT

export const multipleUpload = multer({
  storage,
}).array("files", 10);

export const singleUpload = multer({
  storage,
}).single("file");
