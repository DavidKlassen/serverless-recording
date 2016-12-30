import {exec} from 'child_process';
import ffmpegBin from '../../bin/ffmpeg';


export default (input, output, args) => {
    const cmd = `./${ffmpegBin} -i ${input} ${args} ${output}`;

    return new Promise((resolve, reject) => {
        exec(cmd, (err) => {
            if (err) return reject(err);

            return resolve(output);
        });
    });
};
