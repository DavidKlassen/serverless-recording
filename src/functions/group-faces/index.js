/**
 * Groups faces in the index based on similarity.
 */


import λ from 'apex.js';
import AWS from 'aws-sdk';


const rekognition = new AWS.Rekognition();


export default λ(async () => {
    const data = await rekognition.listFaces({ CollectionId: 'media-recording-participants' }).promise();
    const grouped = [];

    for (const face of data.Faces) {
        if (!face.tagged) {
            face.tagged = true;
            const group = [face];
            const similar = await rekognition.searchFaces({
                CollectionId: 'media-recording-participants',
                FaceId: face.FaceId,
            }).promise();

            for (const match of similar.FaceMatches) {
                data.Faces.find((f) => f.FaceId === match.Face.FaceId).tagged = true;
            }

            group.push(...similar.FaceMatches);
            grouped.push(group);
        }
    }

    return grouped;
});
