/**
 * @file 文件/文件夹复制
 * @author Ielgnaw(wuji0223@gmail.com)
 */

var exec       = require('child_process').exec;
var fs         = require('fs');
var path       = require('path');

var aspfe      = require('./aspfe');
var aspfeData  = require('./aspfedata');
var async      = require('async');
var AspfeError = require('./error');

var commandShortcutMap = aspfe.commandShortcutMap;

var promptSchema = {};
promptSchema.properties = {};

var srcProperty = {
    description: 'src (Multiple sources separated by commas)',
    type: 'string',
    message: '数据源必须填写，多个数据源以逗号分隔',
    required: true,
    before: function (value) {
        return value.trim();
    }
};

var suffixProperty = {
    description: 'suffixName',
    message: '小流量后缀名必须填写',
    required: true
};

var widgetProperty = {
    description: 'widgetName',
    message: 'widget名必须填写',
    required: true
};

var issueProperty = {
    description: 'issue',
    message: 'issue必须填写，对应icafe空间的feature编号',
    required: true,
    before: function (value) {
        value = value.trim();
        if (isNaN(value)) {
            return value;
        }
        else {
            return 'vui-template-' + value;
        }
    }
};

var subjectProperty = {
    description: 'subject',
    message: 'subject必须填写，对应icafe空间的feature标题',
    required: true
};

function promptCallback (args) {
    var curDir = process.cwd();

    // copy的时候更新aspfedata中的widget数据
    require('./updateWidget')(curDir);

    var aspfeProjPath = aspfe.checkCWDPath(
        curDir,
        aspfe.projDirName,
        '.aspfe not exists. First you have to run `aspfe init` '
    );

    var curDirMap = aspfe.getDirMap(curDir);
    var globalTplName = aspfeData.getData(aspfeProjPath).globalTplNameMap;

    var srcIds = args.src.split(',');
    var srcIdList = [];
    for (var i = 0, len = srcIds.length; i < len; i++) {
        srcIds[i] = srcIds[i].trim();
        if (!curDirMap[srcIds[i]]) {
            console.log(
                srcIds[i] +
                ' 在当前目录: ' +
                curDir +
                ' 不存在，请重新输入'
            );
            process.exit(1);
        }
        else {
            srcIdList.push({
                srcId: srcIds[i],
                fullPath: curDirMap[srcIds[i]]
            });
        }
    }

    var widgetsPath = curDirMap.widgets;
    var widgetsName = args.widget;
    var widgetsStr = ''
        + 'svn cp '
        + widgetsPath + '/' + widgetsName
        + ' '
        + widgetsPath + '/' + widgetsName + '_' + args.suffix;

    function copyWidgets () {
        exec(
            widgetsStr,
            {
                encoding: 'utf8',
                timeout: 0,             //子进程最长执行时间
                maxBuffer: 2000*1024,   // stdout和stderr的最大长度
                killSignal: 'SIGTERM',
                cwd: null,
                env: null
            },
            function(err, stdout, stderr) {
                if (err) {
                    throw new AspfeError(err);
                }
                console.log(stdout);
                console.log('aspfe copy successed');
                process.exit(0);
            }
        );
    }

    async.series([
        function (next) {
            try {
                doCopy(srcIdList.shift(), function () {
                    next(null);
                });
            }
            catch (e) {
                next('svn cp 数据源模板出现问题');
            }
        },
        function (next) {
            try {
                copyWidgets();
            }
            catch (e) {
                next(widgetsStr + ' 出现问题');
            }
        }
    ], function (err, results) {
        console.log(err);
    });

    function doCopy (srcIdMap, callback) {
        var srcId = srcIdMap.srcId;
        var fullPath = srcIdMap.fullPath;

        // 当前srcId对应的全流量模板的名字
        var curGlobalName = globalTplName[srcId];

        if (args.type === 'ipad') {
            curGlobalName = 'ipad_' + curGlobalName;
        }

        // 全流量模板名字去掉后面的数字
        var exceptAfterNumChar;
        if (/(\d+(?=[A-Za-z]+))/.test(curGlobalName)) {
            // 除去数字之后字符的名字
            // 例如 baiduASPP213HS 就是 baiduASPP213
            exceptAfterNumChar =
                curGlobalName.split(RegExp.$1)[0] + RegExp.$1;
        }

        // 本次小流量的名字
        var curExperimentName = ''
            + exceptAfterNumChar
            + '_'
            + args.suffix;

        var targetDir = fullPath + '/' + curExperimentName;

        var str = ''
            + 'svn cp '
            + fullPath + '/' + globalTplName[srcId]
            + ' '
            + targetDir;

        // 要写入`.aspfe`目录的元信息
        var curDealData = {};
        curDealData[curExperimentName] = {
            issue: args.issue,
            subject: args.subject
        };

        if (!fs.existsSync(targetDir)) {
            exec(
                str,
                {
                    encoding: 'utf8',
                    timeout: 0,             //子进程最长执行时间
                    maxBuffer: 2000*1024,   // stdout和stderr的最大长度
                    killSignal: 'SIGTERM',
                    cwd: null,
                    env: null
                },
                function(err, stdout, stderr) {
                    if (err) {
                        console.error(''
                            + '执行 '
                            + str
                            + ' 时报错：'
                            + err
                        );
                        process.exit(1);
                    }
                    console.log(stdout);

                    // 小流量文件的信息写入 .aspfe 目录中
                    var curExperimentNameFile = path.join(
                        aspfeProjPath,
                        curExperimentName
                    );
                    if (!fs.existsSync(curExperimentNameFile)) {
                        var data = JSON.parse(JSON.stringify(curDealData));
                        fs.writeFileSync(
                            curExperimentNameFile,
                            JSON.stringify(data, null, 4), // 第三个参数代表分隔符
                            'UTF-8'
                        );
                    }

                    if (srcIdList.length) {
                        doCopy(srcIdList.shift(), callback);
                    }
                    else {
                        callback && callback.call(null);
                    }
                }
            );
        }
        else {
            console.log(
                targetDir
                    + ' already exists, change the suffixName.'
            );
            process.exit(1);
        }
    }
}

module.exports = function (args) {
    // 平台，默认为pc
    if (!args.type && !args.t) {
        args.type = 'pc';
    }

    if (!args.src && !args.s) {
        promptSchema.properties.src = srcProperty;
    }

    if (!args.suffix && !args.u) {
        promptSchema.properties.suffix = suffixProperty;
    }

    if (!args.widget && !args.w) {
        promptSchema.properties.widget = widgetProperty;
    }

    if (!args.issue && !args.i) {
        promptSchema.properties.issue = issueProperty;
    }

    if (!args.subject && !args.j) {
        promptSchema.properties.subject = subjectProperty;
    }

    var prompt = require('prompt');

    prompt.start();
    prompt.get(promptSchema, function (err, result) {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        aspfe.mix(result, args);
        var sourceProps = Object.getOwnPropertyNames(args);
        sourceProps.forEach(function (prop) {
            if (commandShortcutMap.hasOwnProperty(prop)) {
                args[commandShortcutMap[prop]] = args[prop];
                delete args[prop];
            }
        });
        promptCallback(args);
    });
};
