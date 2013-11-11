/**
 * @file 列出所有的小流量模板、issue、subject
 * @author Wanglei [wanglei23@baidu.com]
 */

var aspfeControl = require('./aspfe');
var aspfeData    = require('./aspfedata');

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

    var afData = aspfeData.getData(aspfeProjPath);
    var afDataProps = Object.getOwnPropertyNames(afData);
    console.log(pad('suffixName'), pad('issue'), pad('subject'));
    console.log(pad('------------------------------------------------------------'));
    afDataProps.forEach(function(prop) {
        if (
            prop != 'crFile'
            &&
            prop != 'globalTplNameMap'
        ) {
            console.log(pad(prop), pad(afData[prop].issue), pad(afData[prop].subject));
            console.log(pad('………………………………………………………………………………………………………………………………………………………………'));
        }
    });
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
