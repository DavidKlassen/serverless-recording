var AWS = require('aws-sdk');
var s3 = new AWS.S3({ params: { Bucket: 'media-recording-test-1' } });

exports.handle = function(e, ctx, cb) {
    Promise.all(e.parts.map(function (key) {
       return new Promise(function (resolve, reject) {
           s3.getObject({
               Key: key
           }, function (err, data) {
               if (err) return reject(err);
               resolve(data.Body);
           });
       });
    })).then(function (parts) {
        s3.upload({
            Key: e.key,
            Body: Buffer.concat(parts),
            ContentType: 'video/webm'
        }, cb);
    }).catch(cb);
};
