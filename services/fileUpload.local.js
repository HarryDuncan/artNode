//File upload Handler for Dev Mode
const express = require('express')
require('dotenv').load();
const cors = require('cors');
var bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const router = express.Router()


// Public Folder
router.use(express.static('./../../public'));

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
      callback(null,`./../../art/public/images/${req.params.type.substring(1 , req.params.type.length)}`);
    },
  filename: function(req, file, cb){
    cb(null,file.originalname);
  }
});


// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 20000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('file');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

const removeImage = (path) => {
  try {
  fs.unlinkSync(path)
  return true
  } catch(err) {
    console.log(err)
   return false 
  }
}

module.exports.upload = upload;
module.exports.removeImage = removeImage;
