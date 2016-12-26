const ffmpeg = require('ffmpeg');
const fs = require('fs');
const AWS = require('aws-sdk');
const tmp = require("tmp");
const s3 = new AWS.S3({ params: { Bucket: 'media-recording-test-1' } });

process.env['PATH'] += ':' + process.env['LAMBDA_TASK_ROOT'];

exports.handle = function(e, ctx, cb) {
    s3.getObject({ Key: e.src }, function (err, data) {
        if (err) return cb(err);

        const src = tmp.fileSync({ postfix: '.webm' });
        const dst = tmp.tmpNameSync({ postfix: '.webm' });

        fs.appendFileSync(src.name, data.Body);

        (new ffmpeg(src.name)).then(function (video) {
            video.addCommand('-c', 'copy');
            video.save(dst, function (err) {
                if (err) return cb(err);

                s3.upload({
                    Key: e.dst,
                    Body: fs.readFileSync(dst),
                    ContentType: 'video/webm',
                    ACL:'public-read'
                }, cb);
            });
        });
    });
};
