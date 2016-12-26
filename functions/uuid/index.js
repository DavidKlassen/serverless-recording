const uuidV1 = require('uuid/v1');

exports.handle = function(e, ctx, cb) {
    cb(null, uuidV1());
};
