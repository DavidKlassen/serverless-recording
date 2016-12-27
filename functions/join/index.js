const ffmpeg = require('ffmpeg');
const fs = require('fs');
const tmp = require("tmp");
const AWS = require('aws-sdk');
const path = require('path');
const s3 = new AWS.S3({ params: { Bucket: 'media-recording-test-1' } });


process.env['PATH'] += `:${path.join(process.env['LAMBDA_TASK_ROOT'], 'bin')}`;


function runFFmpeg(src, dst, args) {
    return (new ffmpeg(src)).then(function (video) {
        args.forEach(function (arg) {
            video.addCommand(arg[0], arg[1]);
        });

        return video.save(dst).then(function () {
            return dst;
        });
    });
}


exports.handle = function (e, ctx, cb) {
    s3.listObjectsV2({ Prefix: e.id }).promise()
        .then(function (data) {
            const parts = data.Contents.filter(function (obj) {
                return (new RegExp(`${e.id}/part_\\d+`)).test(obj.Key);
            }).sort(function (a, b) {
                const ts1 = parseInt(a.Key.replace(/.*\/part_(\d+)/, "$1"), 10);
                const ts2 = parseInt(b.Key.replace(/.*\/part_(\d+)/, "$1"), 10);
                return ts1 > ts2;
            });

            return Promise.all(parts.map(function (part) {
                return s3.getObject({ Key: part.Key }).promise();
            }));
        })
        .then(function (parts) {
            const tmpFile = tmp.fileSync({ postfix: '.webm' });
            const dstFile = tmp.tmpNameSync({ postfix: '.webm' });
            const tmbFile = tmp.tmpNameSync({ postfix: '.png' });

            // concat video parts and write to tmp file
            fs.appendFileSync(tmpFile.name, Buffer.concat(parts.map(function (part) {
                return part.Body
            })));

            // create a thumbnail
            return runFFmpeg(tmpFile.name, tmbFile, [
                ['-vf', 'thumbnail,scale=200:150:force_original_aspect_ratio=increase,crop=200:150'],
                ['-frames:v', '1']
            ]).then(function (res) {
                return s3.upload({
                    Key: `${e.id}/thumb.png`,
                    Body: fs.readFileSync(res),
                    ContentType: 'image/png',
                    ACL: 'public-read'
                }).promise();
            }).then(function () {
                // repair the container
                return runFFmpeg(tmpFile.name, dstFile, [['-c', 'copy']]);
            }).then(function (res) {
                return s3.upload({
                    Key: `${e.id}/result.webm`,
                    Body: fs.readFileSync(res),
                    ContentType: 'video/webm',
                    ACL: 'public-read'
                }).promise();
            });
        })
        .then(cb.bind(null, null), cb.bind(null));
};
