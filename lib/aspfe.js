/**
 * @file aspfe control
 * @author Ielgnaw(wuji0223@gmail.com)
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
};

exports.getLength = function (str) {
    if (!str) {
        return 0;
    }
    var aMatch = str.match(/[^\x00-\xff]/g);
    return (str.length + (!aMatch ? 0 : aMatch.length));
};

exports.showFormatInfo = function (msgList, length) {
    length = length || 12;

    function fillBlank (blankCount, commandStr) {
        var len = exports.getLength(commandStr);
        if (commandStr && len < blankCount) {
            var blankStr = '';
            var differVal = blankCount - len;
            for (var i = 0; i < differVal; i++) {
                blankStr += ' ';
            }
            return commandStr + blankStr;
        }
        return commandStr;
    }

    var str = '';
    for (var i = 0, len = msgList.length; i < len; i++) {
        if (i === msgList.length - 1) {
            str += msgList[i];
        }
        else {
            str += fillBlank(length, msgList[i]);
        }
    }

    return console.log(
        str
    );
};