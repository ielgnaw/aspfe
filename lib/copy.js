/**
 * @file 文件/文件夹复制
 * @author Ielgnaw(wuji0223@gmail.com)
 */

var exec       = require('child_process').exec;
var fs         = require('fs');
var path       = require('path');
var async      = require('async');
var aspfe      = require('./aspfe');
var aspfeData  = require('./aspfedata');
var AspfeError = require('./error');

// 命令缩写全写对照
var commandShortcutMap = aspfe.commandShortcutMap;

var curCwd = process.cwd();

/**
 * 存储`copy`命令运行运行的一些参数
 * module.exports时初始化
 *
 * @type {Object}
 */
var bizParams = {

    /**
     * 存储当前目录即`template`下的文件夹列表
     *
     * @type {Object}
     */
    curDirMap: null,

    /**
     * 存储各个数据源全流量模板的名字
     *
     * @type {Object}
     */
    globalTplName: null,

    /**
     * 存储当前命令执行的数据源列表
     *
     * @type {Array}
     */
    curSrcList: [],

    /**
     * `.aspfe`目录的路径
     *
     * @type {String}
     */
    aspfeProjPath: '',

    /**
     * `widgets`目录的路径
     *
     * @type {String}
     */
    widgetsPath: ''
};

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

/**
 * 复制`widgets`
 *
 * @param  {Object} params 参数
 *
 * @return {[type]}        [description]
 */
function copyWidgets (params) {
    var widgetsName = params.widget;
    var suffixName = params.suffix;
    var widgetsStr = ''
        + 'svn cp '
        + bizParams.widgetsPath + '/' + widgetsName
        + ' '
        + bizParams.widgetsPath + '/' + widgetsName + '_' + suffixName;
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

/**
 * 复制数据源
 *
 * @param  {Object}   srcIdMap 本次执行的数据源id以及路径
 * @param  {Object}   params   参数
 * @param  {Function} callback 回调
 */
function copySource (srcIdMap, params, callback) {
    var srcId = srcIdMap.srcId;
    var fullPath = srcIdMap.fullPath;

    // 当前srcId对应的全流量模板的名字
    var curGlobalName = bizParams.globalTplName[srcId];

    if (params.type === 'ipad') {
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
        + params.suffix;

    var targetDir = fullPath + '/' + curExperimentName;

    var str = ''
        + 'svn cp '
        + fullPath + '/' + bizParams.globalTplName[srcId]
        + ' '
        + targetDir;

    // 要写入`.aspfe`目录的元信息
    var curDealData = {};
    curDealData[curExperimentName] = {
        issue: params.issue,
        subject: params.subject
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
                    bizParams.aspfeProjPath,
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

                if (bizParams.curSrcList.length) {
                    copySource(bizParams.curSrcList.shift(), params, callback);
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

/**
 * prompt 回调
 *
 * @param  {Object} args 参数
 */
function promptCallback (args) {
    var srcIds = args.src.split(',');
    for (var i = 0, len = srcIds.length; i < len; i++) {
        srcIds[i] = srcIds[i].trim();
        if (!bizParams.curDirMap[srcIds[i]]) {
            console.log(
                srcIds[i] +
                ' 在当前目录: ' +
                curCwd +
                ' 不存在，请重新输入'
            );
            process.exit(1);
        }
        else {
            bizParams.curSrcList.push({
                srcId: srcIds[i],
                fullPath: bizParams.curDirMap[srcIds[i]]
            });
        }
    }

    async.series([
        function (next) {
            var curSrc;
            try {
                curSrc = bizParams.curSrcList.shift();
                copySource(curSrc, args, function () {
                    next(null);
                });
                // throw new AspfeError('asd');
            }
            catch (e) {
                next('复制数据源: ' + curSrc.srcId + ' 出现问题: ' + e);
            }
        },
        function (next) {
            try {
                // copy widgets之前更新aspfedata中的widget数据
                require('./updateWidget')(curCwd);
                copyWidgets(args);
            }
            catch (e) {
                next('复制widgets: ' + args.widget + ' 出现问题' + e);
            }
        }
    ], function (err, results) {
        console.log(err);
    });

}

/**
 * 初始化参数
 */
function initParams () {
    var aspfeProjPath = aspfe.checkCWDPath(
        curCwd,
        aspfe.projDirName,
        '.aspfe not exists. First you have to run `aspfe init`.'
    );
    bizParams.aspfeProjPath = aspfeProjPath;
    bizParams.curDirMap = aspfe.getDirMap(curCwd);
    bizParams.globalTplName = aspfeData.getData(aspfeProjPath).globalTplNameMap;
    bizParams.widgetsPath = bizParams.curDirMap.widgets;
}

/**
 * aspfe copy 命令入口
 *
 * @param  {Object} args 命令行参数
 */
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

        initParams();
        promptCallback(args);
    });
};
