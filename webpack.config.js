const config = {
    target: 'node',
    externals: {
        'aws-sdk': 'aws-sdk',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: [/node_modules/]
            },
            {
                test: /ffmpeg$/,
                loader: 'file'
            }
        ]
    }
};

const thumb = Object.assign({}, config, {
    entry: './src/functions/thumb',
    output: {
        path: './build/functions/thumb',
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    }
});

const uuid = Object.assign({}, config, {
    entry: './src/functions/uuid',
    output: {
        path: './build/functions/uuid',
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    }
});

module.exports = [
    thumb,
    uuid
];
