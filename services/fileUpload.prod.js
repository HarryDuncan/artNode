const AWS = require('aws-sdk');
const Busboy = require('busboy');

const BUCKET_NAME = 'harryjdee.com/images/products';
// const IAM_USER_KEY = '';
// const IAM_USER_SECRET = '';

function uploadToS3(file) {
  let s3bucket = new AWS.S3({
   accessKeyId:  process.env.AWS_ACCESS_KEY_ID,
    secretAccessKeyId: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: BUCKET_NAME
  });
  s3bucket.createBucket(function () {
      var params = {
        Bucket: BUCKET_NAME,
        acl : 'public-read',
        Key: file.name,
        Body: file.data
      };
      s3bucket.upload(params, function (err, data) {
        if (err) {
          return err
        }
        return data.Location
      });
  });
}


exports.uploadToS3 = uploadToS3;
