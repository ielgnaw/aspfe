/**
 * @file 初始化aspfe
 * @author Ielgnaw(wuji0223@gmail.com)
 */

var fs    = require('fs');
var path  = require('path');
var aspfe = require('./aspfe');

/**
 * aspfe init 命令入口
 *
 * @param  {Object} args 命令行参数
 */
module.exports = function (args) {
    var curDir = process.cwd();

    aspfe.checkCWDPath(
        curDir,
        '../template',
        'This command could only be runned in the `template` directory'
    );

    var aspfeDir = path.resolve(curDir, aspfe.projDirName);
    if (fs.existsSync(aspfeDir) && fs.statSync(aspfeDir).isDirectory()) {
        console.log('`.aspfe` is inited in ' + curDir);
        return;
    }
    else {
        // 创建.aspfe目录
        aspfeDir = path.resolve(curDir, aspfe.projDirName);
        require('mkdirp').sync(aspfeDir);
        require('./aspfedata').create(aspfeDir);
        // init的时候更新aspfedata中的widget数据
        require('./widget').updateWidget(curDir);
        console.log('aspfe init successed');
    }
};