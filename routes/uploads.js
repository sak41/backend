const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const uploadCtrl = require("../controllers/uploadController");

router.post("/image", upload.single("image"), uploadCtrl.uploadImage);

module.exports = router;
