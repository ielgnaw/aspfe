/**
 * @file 列出所有的小流量模板、issue、subject
 * @author Wanglei [wanglei23@baidu.com]
 */

var fs           = require('fs');
var path         = require('path');

var aspfeControl = require('./aspfe');

/**
 * 获取小流量配置文件的数据
 *
 * @param  {String} fullPath 小流量配置文件全路径
 * @return {Object}          Data
 */
function getData(fullPath) {
    if (fullPath) {
        var content = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(content);
    }
    return null;
}

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
cli.command = 'list';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '列出所有的小流量模板';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'aspfe list';


/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令运行选项
 */
cli.main = function(args, opts) {
    function pad(msg, length) {
        length = length || 20;
        if (msg.length < length) {
            return msg + new Array(length - msg.length).join(' ');
        }
        return msg;
    }
    var curDir = process.cwd();
    var aspfeProjPath = aspfeControl.checkCWDPath(
        curDir,
        aspfeControl.projDirName,
        '.aspfe not exists. First you have to run \'aspfe init\' '
    );

    console.log(pad('suffixName'), pad('issue'), pad('subject'));
    console.log(pad('------------------------------------------------------'));
    fs.readdirSync(aspfeProjPath).forEach(function(file, index) {
        var fullPath = path.resolve(aspfeProjPath, file);
        var stat     = fs.statSync(fullPath);
        var extName  = path.extname(file);
        var name     = path.basename(file, extName);
        if (stat.isFile()) {
            if (name != 'aspfedata') {
                var afData = getData(fullPath);
                var afDataProps = Object.getOwnPropertyNames(afData);
                afDataProps.forEach(function(prop) {
                    console.log(
                        pad(prop),
                        pad(afData[prop].issue),
                        pad(afData[prop].subject)
                    );
                    console.log(pad('……………………………………………………………………………………………………'));
                });
            }
        }
    });
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
