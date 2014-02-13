/**
 * @file 命令行
 * @author Wanglei [wanglei23@baidu.com]
 */

var fs   = require('fs');
var path = require('path');

var commandMap = {};

/**
 * 扫描目录
 *
 * @param  {String} dir 基础目录
 */
(function scanDir(dir) {
    fs.readdirSync(dir).sort(function(file) {
        var fullPath = path.resolve(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            return 1;
        }
        return -1;
    }).forEach(function(file, index) {
        var fullPath = path.resolve(dir, file);
        var stat     = fs.statSync(fullPath);
        var extName  = path.extname(file);
        if (stat.isFile() && /^\.js$/i.test(extName)) {
            var mod = require(fullPath);
            var cli = mod.cli;
            if (cli) {
                commandMap[cli.command] = cli;
            }
        }
        else if (stat.isDirectory()) {
            scanDir(fullPath);
        }
    });
})(__dirname);

/**
 * 获取具有命令行功能的模块列表
 *
 * @param {string} baseDir 基础目录
 * @return {Array}
 */
function getModules(baseDir) {
    var commandModules = [];
    fs.readdirSync(baseDir).forEach(
        function (file) {
            file = path.resolve(baseDir, file);
            if (fs.statSync(file).isFile()
                && path.extname(file).toLowerCase() === '.js'
            ) {
                var module = require(file);
                if (module.cli) {
                    commandModules.push(module);
                }
            }
        }
    );
    return commandModules;
}

/**
 * 显示默认命令行信息
 */
function showDefaultInfo() {
    function pad(msg, length) {
        length = length || 12;
        if (msg.length < length) {
            return msg + new Array(length - msg.length).join(' ');
        }
        return msg;
    }
    console.log( 'Usage: aspfe <command>\n' );
    console.log( 'Builtin Commands:\n' );
    getModules(__dirname).forEach(
        function(mod) {
            var cli = mod.cli;
            var alias = cli.alias;
            console.log('%s %s',
                pad(cli.command + (alias ? '(' + alias + ')' : '')),
                (cli.description || '').replace(/(。|\.)$/, '')
            );
        }
    );
}

exports.parseArgs = function (args) {

    if (args.length === 0) {
        showDefaultInfo();
        return;
    }

    // 显示版本信息
    if (args[0] === '--version' || args[0] === '-v') {
        console.log('aspfe version ' + require('./aspfe').version);
        return;
    }

    var command = args.shift().toLowerCase();

    var commandArgs = {};
    while (args.length) {
        var params = args.shift();
        if (/^-(-)?([-_a-zA-Z0-9]+)?$/.test(params)) {
            var str = RegExp.$2;
            if (!RegExp.$1) {
                if (str.length === 1) {
                    commandArgs[str] = true;
                }
            }
            else {
                if (str.length !== 1) {
                    commandArgs[str] = true;
                }
            }
        }
    }

    if (commandMap[command]) {
        commandMap[command].main(commandArgs);
    }

};