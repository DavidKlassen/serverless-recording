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

const join = Object.assign({}, config, {
    entry: './src/functions/join',
    output: {
        path: './build/functions/join',
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    }
});

const reindex = Object.assign({}, config, {
    entry: './src/functions/reindex',
    output: {
        path: './build/functions/reindex',
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    }
});

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
    join,
    reindex,
    thumb,
    uuid
];
