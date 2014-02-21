/**
 * @file widgets的一些处理
 * @author Ielgnaw(wuji0223@gmail.com)
 */

var fs    = require('fs');
var path  = require('path');
var aspfe = require('./aspfe');

/**
 * 获取`template/widgets`目下的所有文件夹信息
 * 排除带`_`的，即只获取全流量的widgets文件夹
 *
 * @param  {String} dir 目录参数
 */
exports.getGlobalWidget = function (dir) {
    dir = dir || process.cwd();
    var aspfeDir = path.resolve(dir, aspfe.projDirName);
    var widgetpath = dir + path.sep + 'widgets';
    var ret = [];
    if (fs.existsSync(widgetpath)) {
        fs.readdirSync(widgetpath).forEach(function (file, index) {
            var fullPath = path.resolve(widgetpath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file.indexOf('_') === -1) { // 读取不带`_`的，即全流量的widget
                    ret.push(file);
                }
            }
        });
    }
    return ret;
}

/**
 * 读取`template/widget`里的文件夹信息并更新到`aspfedata`
 *
 * @param  {String} dir 目录参数
 */
exports.updateWidget = function (dir) {
    dir = dir || process.cwd();
    var aspfeDir = path.resolve(dir, aspfe.projDirName);
    var widgetList = exports.getGlobalWidget();
    if (widgetList.length > 0) {
        require('./aspfedata').setData(aspfeDir, {
            widget: widgetList
        });
    }
}