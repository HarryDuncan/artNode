const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').load();

aws.config.update({
  accessKeyId:  process.env.AWS_ACCESS_KEY_ID,
  secretAccessKeyId: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const s3 = new aws.S3();


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

const getFileLocation = (req) =>{
  let url = req.url
  url = url.substring(url.indexOf(':') + 1, url.length)
  let returnURL = 'harryjdee.com/images/' + url
  return returnURL
}



const uploadS3 = multer({
  storage: multerS3({
    s3,
    bucket: function(req, file, cb){
        cb(null, getFileLocation(req))
    },
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'Meta'});
    },
    key: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
})

module.exports = uploadS3;
