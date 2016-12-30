/**
 * Joins video chunks in one file.
 */


import λ from 'apex.js';
import AWS from 'aws-sdk';
import tmp from 'tmp';
import fs from 'fs';


const s3 = new AWS.S3();


export default λ(async (e) => {
    // get list of chunks
    const list = await s3.listObjectsV2({
        Bucket: e.bucket,
        Prefix: `${e.id}/chunks`
    }).promise();

    // download chunks
    const chunks = await Promise.all(list.Contents.map((item) => s3.getObject({
        Bucket: e.bucket,
        Key: item.Key
    }).promise()));

    // concat and write to temp file
    const file = tmp.fileSync({ postfix: '.webm' });
    fs.appendFileSync(file.name, Buffer.concat(chunks.map((part) => part.Body)));

    // upload file to s3
    return s3.upload({
        Bucket: e.bucket,
        Key: `${e.id}/joined.webm`,
        Body: fs.readFileSync(file.name),
        ContentType: 'video/webm'
    }).promise();
});
