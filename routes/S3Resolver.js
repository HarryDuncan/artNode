//S3 Resolver - Switches between dev and prod environments
const express = require('express')
const router = express.Router()
require('dotenv').load();
const cors = require('cors');
var bodyParser = require('body-parser');

// Import for local file handler - Dev Only
const fileHandleLocal = require('./../services/fileUpload.local')

// Import for Prod - to S3
const uploadS3 = require('./../services/fileUpload.prod')
const singleUpload = uploadS3.any();

router.use(bodyParser.json({limit: '50mb'}));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


router.post('/updateImage:type', (req, res) => {
    console.log(req, res)
   res.sendStatus(400)
})

router.post('/uploadImage:type', (req, res) => {
  if(process.env.NODE_ENV === 'dev'){
    fileHandleLocal.upload(req, res, (err) => {
    if(err){
        res.sendStatus(400)
    }else{
          if(req.file == undefined){
            res.sendStatus(400)
          } else {
            res.sendStatus(200)
          }
      }
    })
  }else{
      singleUpload(req, res, function(err){
      return res.json({'imageUrl' : req.files[0].location})
    });
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