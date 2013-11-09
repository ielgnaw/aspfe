/**
 * @file aspfe control
 * @author Wanglei [wanglei23@baidu.com]
 */

var fs   = require('fs');
var path = require('path');
/**
 * aspfe版本信息
 * @type {String}
 */
exports.version = JSON.parse(
    fs.readFileSync(
        path.resolve( __dirname, '../package.json' ), 'UTF-8'
    )
).version;