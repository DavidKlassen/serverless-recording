/**
 * Creates a thumbnail from a video file.
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

        // create thumbnail
        const thumbName = tmp.tmpNameSync({ postfix: '.png' });
        const filters = 'thumbnail,scale=200:150:force_original_aspect_ratio=increase,crop=200:150';
        const args = `-vf "${filters}" -frames:v 1`;
        await ffmpeg(file.name, thumbName, args);

        // upload thumbnail and return
        return s3.upload({
            Bucket: record.s3.bucket.name,
            Key: `${record.s3.object.key}.thumb.png`,
            Body: fs.readFileSync(thumbName),
            ContentType: 'image/png',
            ACL: 'public-read'
        }).promise();
    }));
});
