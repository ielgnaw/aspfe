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
    aspfe.showFormatInfo(['command', 'description', 'usage', 'args'], 23);
    console.log(
        '--------------------------------------'
        +
        '--------------------------------------'
    );
    aspfe.showFormatInfo(
        ['init', '初始化', 'aspfe init', 'null'],
        23
    );
    aspfe.showFormatInfo(
        ['list', '列出所有小流量模板', 'aspfe list', 'null'],
        23
    );
    aspfe.showFormatInfo(
        [
            'copy',
            '复制',
            'aspfe copy',
            '[--src|-s], [--suffix|-s], [--widget|-w], [--issue|i], '
                + '[--subject|-j]'
        ],
        23
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
    while (args.length) {
        var params = args.shift();
        if (/^-(-)?([-\w]+)(=(.*))?$/.test(params)) {
            var str = RegExp.$2;
            if (!RegExp.$1) {
                if (str.length === 1) {
                    commandArgs[str] =
                        RegExp.$3
                        ?
                        RegExp.$3.substring(1).trim()
                        :
                        true;
                }
            }
            else {
                if (str.length !== 1) {
                    commandArgs[str] =
                        RegExp.$3
                        ?
                        RegExp.$3.substring(1).trim()
                        :
                        true;
                }
            }
        }
    }

    if (commands[command]) {
        commands[command](commandArgs);
    }
};