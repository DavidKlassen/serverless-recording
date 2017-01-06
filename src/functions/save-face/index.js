/**
 * Stores the face from a thumbnail to the face index.
 */


import λ from 'apex.js';
import AWS from 'aws-sdk';


const rekognition = new AWS.Rekognition();


export default λ(async (e) => {
    return Promise.all(e.Records.map(async (record) => rekognition.indexFaces({
            CollectionId: 'media-recording-participants',
            ExternalImageId: record.s3.object.key.split('/')[0],
            Image: {
                S3Object: {
                    Bucket: record.s3.bucket.name,
                    Name: record.s3.object.key
                }
            }
        }).promise()
    ));
});
