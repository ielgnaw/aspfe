/**
 * @file 初始化aspfe
 * @author Wanglei [wanglei23@baidu.com]
 */

var fs   = require('fs');
var path = require('path');

var aspfeControl = require('./aspfe');

/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令名称
 *
 * @type {string}
 */
cli.command = 'init';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '初始化';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'aspfe init';


/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令运行选项
 */
cli.main = function(args, opts) {
    var curDir = process.cwd();

    // var templatePath = aspfeControl.checkCWDPath(
    //     curDir,
    //     '../template',
    //     'This command could only be runned in the \'template\' directory'
    // );

    var aspfeDir = path.resolve(curDir, aspfeControl.projDirName);
    if (fs.existsSync(aspfeDir) && fs.statSync(aspfeDir).isDirectory()) {
        console.log('aspfe is inited in ' + curDir);
        // test setData
        // require('./aspfedata').setData(aspfeDir, {
        //     c : 212321,
        //     globalTplNameMap: {
        //         b:23333,
        //         d: 123123213
        //     }
        // });
        return;
    }
    else {
        // 创建.aspfe目录
        aspfeDir = path.resolve(curDir, aspfeControl.projDirName);
        require('mkdirp').sync(aspfeDir);
        require('./aspfedata').create(aspfeDir);
        console.log('aspfe init successed');
    }
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
