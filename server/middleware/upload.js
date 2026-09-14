const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(__dirname, "../uploads/chat");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const allowedTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "application/zip": ".zip",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = allowedTypes[file.mimetype];

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("File type is not allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
