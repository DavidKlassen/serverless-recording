/**
 * Repairs video container.
 */


import λ from 'apex.js';
import AWS from 'aws-sdk';
import tmp from 'tmp';
import fs from 'fs';
import ffmpeg from '../../utils/ffmpeg';


const s3 = new AWS.S3();


export default λ(async (e) => {
    return Promise.all(e.Records.map(async (record) => {
        // download video file
        const video = await s3.getObject({
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key
        }).promise();

        // write file to /tmp
        const file = tmp.fileSync({ postfix: '.webm' });
        fs.appendFileSync(file.name, video.Body);

        // reindex
        const dst = tmp.tmpNameSync({ postfix: '.webm' });
        await ffmpeg(file.name, dst, '-y -c copy');

        // upload and return
        return s3.upload({
            Bucket: record.s3.bucket.name,
            Key: `${record.s3.object.key}.reindexed.webm`,
            Body: fs.readFileSync(dst),
            ContentType: 'video/webm',
            ACL: 'public-read'
        }).promise();
    }));
});
