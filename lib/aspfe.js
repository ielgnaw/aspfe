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
 * 命令缩写全写对照
 */
exports.commandShortcutMap = {
    't' : 'type',
    's' : 'src',
    'u' : 'suffix',
    'w' : 'widget',
    'i' : 'issue',
    'j' : 'subject'
}

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

/**
 * 获取字符串长度，中文算2个字符
 *
 * @param  {String} str 目标字符串
 */
exports.getLength = function (str) {
    if (!str) {
        return 0;
    }
    var aMatch = str.match(/[^\x00-\xff]/g);
    return (str.length + (!aMatch ? 0 : aMatch.length));
};

/**
 * 输出格式化的信息
 *
 * @param  {Array} msgList 要输出的信息列表
 * @param  {Number} length  间隔的长度
 */
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

/**
 * mix target
 */
exports.mix = function (source, target) {
    var sourceProps = Object.getOwnPropertyNames(source);
    sourceProps.forEach(function (prop) {
        if (typeof target[prop] === 'object') {
            exports.mix(source[prop], target[prop]);
        }
        if (!target.hasOwnProperty(prop)) {
            target[prop] = source[prop];
        }
    });
};

/**
 * 获取目录下的文件夹集合
 *
 * @param  {String} dir 目录参数
 */
exports.getDirMap = function (dir) {
    var fileMap = {};
    fs.readdirSync(dir).forEach(function(file, index) {
        var fullPath = path.resolve(dir, file);
        var stat     = fs.statSync(fullPath);
        var extName  = path.extname(file);
        var name     = path.basename(file, extName);
        if (stat.isDirectory()) {
            fileMap[name] = fullPath;
        }
    });
    return fileMap;
};