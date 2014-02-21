/**
 * @file 命令行
 * @author Ielgnaw(wuji0223@gmail.com)
 */

var aspfe = require('./aspfe');
var sys = require('../package');

/**
 * 显示默认信息
 */
function showDefaultInfo () {
    console.log('');
    console.log(sys.name + ' v' + sys.version);
    console.log('');
    console.log('Usage: aspfe <command> [<args>]\n');
    aspfe.showFormatInfo(['command', 'description', 'usage', 'args'], 20);
    console.log(
        '--------------------------------------'
        +
        '--------------------------------------'
    );
    aspfe.showFormatInfo(
        ['init', '初始化', 'aspfe init', 'null'],
        20
    );
    aspfe.showFormatInfo(
        ['list', '列出所有小流量模板', 'aspfe list', 'null'],
        20
    );

    // aspfe copy --src=213, 204 --suffix=houzhuiming --widget=renzheng --issue=123 --subject=zhuti
    aspfe.showFormatInfo(
        [
            'copy',
            '复制',
            'aspfe copy',
            '[--type|-t] [--src|-s], [--suffix|-u], [--widget|-w], [--issue|i], '
                + '[--subject|-j]'
        ],
        20
    );
}

/**
 * 命令集合
 */
var commands = {
    init: function (commandArgs) {
        require('./init')(commandArgs);
    },
    list: function (commandArgs) {
        require('./list')(commandArgs);
    },
    copy: function (commandArgs) {
        require('./copy')(commandArgs);
    }
};

/**
 * 命令行入口
 *
 * @param  {Object} args 命令行参数
 */
module.exports = function (args) {

    aspfe.checkCWDPath(
        process.cwd(),
        '../template',
        'This command could only be runned in the `template` directory'
    );

    if (args.length === 0) {
        showDefaultInfo();
        return;
    }

    if (args[0] === '--version' || args[0] === '-v') {
        console.log('aspfe version ' + sys.version);
        return;
    }

    var command = args.shift().toLowerCase();

    var commandArgs = {};
    var isEnd = true;
    var lastMatchKey = '';
    while (args.length) {
        var params = args.shift();
        if (!isEnd) {
            commandArgs[lastMatchKey] += params;
            lastMatchKey = '';
            isEnd = true;
        }
        else {
            if (/^-(-)?([-\w]+)(=(.*))?$/.test(params)) {
                var str = RegExp.$2;
                if (!RegExp.$1) {
                    if (str.length === 1) {
                        var val = RegExp.$3;
                        if (val) {
                            if (/,$/.test(val)) {
                                lastMatchKey = str;
                                isEnd = false;
                            }
                            else {
                                lastMatchKey = '';
                                isEnd = true;
                            }
                            commandArgs[str] = val.substring(1).trim();
                        }
                        else {
                            commandArgs[str] = true;
                        }
                    }
                }
                else {
                    if (str.length !== 1) {
                        var val = RegExp.$3;
                        if (val) {
                            if (/,$/.test(val)) {
                                lastMatchKey = str;
                                isEnd = false;
                            }
                            else {
                                lastMatchKey = '';
                                isEnd = true;
                            }
                            commandArgs[str] = val.substring(1).trim();
                        }
                        else {
                            commandArgs[str] = true;
                        }
                    }
                }
            }
        }
    }

    if (commands[command]) {
        commands[command](commandArgs);
    }
};