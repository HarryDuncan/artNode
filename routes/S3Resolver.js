//S3 Resolver - Switches between dev and prod environments
const express = require('express')
const router = express.Router()
require('dotenv').load();
const cors = require('cors');
var Busboy = require('busboy');

// Import for local file handler - Dev Only
const fileHandleLocal = require('./../services/fileUpload.local')

// Import for Prod - to S3
const upload = require('./../services/fileUpload.prod')


router.post('/updateImage:type', (req, res) => {
    console.log(req, res)
   res.sendStatus(400)
})


router.post('/uploadImage:type', (req, res) => {
  if(process.env.NODE_ENV === 'production'){
    fileHandleLocal.upload(req, res, (err) => {
    if(err){
        res.sendStatus(400)
    }else{
          if(req.files == undefined){
            res.sendStatus(400)
          } else {
            res.sendStatus(200)
          }
      }
    })
  }else{

    var busboy = new Busboy({ headers: req.headers });

    // The file upload has completed
    busboy.on('finish', function() {
      console.log('Upload finished');
      
      // Your files are stored in req.files. In this case,
      // you only have one and it's req.files.element2:
      // This returns:
      // {
      //    element2: {
      //      data: ...contents of the file...,
      //      name: 'Example.jpg',
      //      encoding: '7bit',
      //      mimetype: 'image/png',
      //      truncated: false,
      //      size: 959480
      //    }
      // }
      
      // Grabs your file object from the request.
      const file = req.files.file;
      
      // Begins the upload to the AWS S3
      upload.uploadToS3(file);
    });

    req.pipe(busboy);
      // var busboy = new Busboy(req);
  }
});



router.post('/deleteImage:type', (req, res) => {
  if(process.env.NODE_ENV === 'dev'){
      let path = `./../art/src/images/${req.body['dataType']}/${req.body['url']}.jpg`
      let isRemoved = fileHandleLocal.removeImage(path) 
      if(!isRemoved){
        res.sendStatus(400)
      } else {
        res.sendStatus(200)
      }
  }else{
    console.log('todo prod')
  }
  
  
});

module.exports = router