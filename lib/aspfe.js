/**
 * @file aspfe control
 * @author Wanglei [wanglei23@baidu.com]
 */

var fs   = require('fs');
var path = require('path');

/**
 * aspfe版本信息
 */
exports.version = JSON.parse(
    fs.readFileSync(
        path.resolve( __dirname, '../package.json' ), 'UTF-8'
    )
).version;

/**
 * .aspfe文件夹名字
 *
 * @type {String}
 */
exports.projDirName = '.aspfe';

/**
 * 检测当前工作目录
 */
exports.checkCWDPath = function(curDir, destination, errMsg) {
    var errMsg = errMsg || 'directory wrong';
    var destDir = path.resolve(curDir, destination);
    if (!fs.existsSync(destDir)) {
        console.log(errMsg);
        process.exit(1);
    }
    return destDir;
}