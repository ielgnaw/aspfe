/**
 * @file 文件/文件夹复制
 * @author Wanglei [wanglei23@baidu.com]
 */

var exec = require('child_process').exec;
var fs   = require('fs');
var path = require('path');

var aspfeControl = require('./aspfe');
var aspfeData    = require('./aspfedata');

/**
 * 从控制台获取信息
 *
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function getReadLine(callback) {
    var readline = require('readline');
    var rl = readline.createInterface(
        {
            input: process.stdin,
            output: process.stdout
        }
    );
    var res = {};
    rl.question(
        'srcid (Multiple data sources separated by commas): ',
        function (srcIdAnswer) {
            if (!srcIdAnswer) {
                console.log('srcid required');
                rl.close();
            }
            else {
                res.srcId = srcIdAnswer;
                rl.question(
                    'suffixName: ',
                    function (suffixNameAnswer) {
                        if (!suffixNameAnswer) {
                            console.log('suffixName required');
                            rl.close();
                        }
                        else {
                            res.suffixName = suffixNameAnswer;
                            rl.question(
                                'issue: ',
                                function (issueAnswer) {
                                    res.issue = '';
                                    if (issueAnswer) {
                                        var removeBlank =
                                            issueAnswer.replace(/\s+/g, '');
                                        if (isNaN(removeBlank)) {
                                            res.issue = removeBlank;
                                        }
                                        else {
                                            res.issue =
                                                'vui-template-' + removeBlank;
                                        }
                                    }
                                    rl.question(
                                        'subject: ',
                                        function (subjectAnswer) {
                                            res.subject = subjectAnswer;
                                            rl.close();
                                            if (callback) {
                                                callback(res);
                                            }
                                        }
                                    );
                                }
                            );
                        }
                    }
                );
            }
        }
    );
}

/**
 * 获取当前目录下的文件夹集合
 *
 * @param  {[type]} dir [description]
 * @return {[type]}     [description]
 */
function getDirMap(dir) {
    var fileMap = {};
    fs.readdirSync(dir).forEach(function(file, index) {
        var fullPath = path.resolve(dir, file);
        var stat     = fs.statSync(fullPath);
        var extName  = path.extname(file);
        var name     = path.basename(file, extName);
        if (stat.isDirectory()) {
            fileMap[name] = fullPath;
        }
    });
    return fileMap;
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
cli.command = 'copy';

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '复制';

/**
 * 命令用法信息
 *
 * @type {string}
 */
cli.usage = 'aspfe copy';

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令运行选项
 */
cli.main = function() {
    var curDir = process.cwd();

    // var templatePath = aspfeControl.checkCWDPath(
    //     curDir,
    //     '../template',
    //     'This command could only be runned in the \'template\' directory'
    // );

    var aspfeProjPath = aspfeControl.checkCWDPath(
        curDir,
        aspfeControl.projDirName,
        '.aspfe not exists. First you have to run \'aspfe init\' '
    );

    var curDirMap = getDirMap(curDir);
    var globalTplName = aspfeData.getData(aspfeProjPath).globalTplNameMap;

    getReadLine(function(res) {
        var srcIdArr = res.srcId.split(',');
        var srcIdList = [];
        for (var i = 0, len = srcIdArr.length; i < len; i++) {
            if (!curDirMap[srcIdArr[i]]) {
                console.log(
                    srcIdArr[i] +
                    ' 在当前目录: ' +
                    curDir +
                    ' 不存在，请重新输入'
                );
                process.exit(1);
            }
            else {
                srcIdList.push({
                    srcId: srcIdArr[i],
                    fullPath: curDirMap[srcIdArr[i]]
                });
            }
        }

        function doCopy(srcIdMap) {
            var srcId = srcIdMap.srcId;
            var fullPath = srcIdMap.fullPath;
            var exceptAfterNumChar = globalTplName[srcId];
            if (/(\d+(?=[A-Za-z]+))/.test(globalTplName[srcId])) {
                // 除去数字之后字符的名字
                // 例如 baiduASPP213HS 就是 baiduASPP213
                exceptAfterNumChar =
                    globalTplName[srcId].split(RegExp.$1)[0] + RegExp.$1;
            }
            var targetDir = fullPath
                            + '/' + exceptAfterNumChar
                            + '_' + res.suffixName;

            var str = ''
                + 'svn cp '
                + fullPath + '/' + globalTplName[srcId]
                + ' '
                + targetDir;

            // 当前处理的小流量 res.suffixName
            var curDealData = {};
            curDealData[res.suffixName] = {
                issue: res.issue,
                subject: res.subject
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

                        // 小流量信息写在aspfedata里
                        /*aspfeData.setData(aspfeProjPath, curDealData);*/

                        // 小流量文件的信息写入 .aspfe 目录中
                        var suffixFile = path.join(
                            aspfeProjPath,
                            res.suffixName
                        );
                        if (!fs.existsSync(suffixFile)) {
                            var data = JSON.parse(JSON.stringify(curDealData));
                            fs.writeFileSync(
                                suffixFile,
                                JSON.stringify(data, null, 4), // 第三个参数代表分隔符
                                'UTF-8'
                            );
                        }

                        if (srcIdList.length) {
                            doCopy(srcIdList.shift());
                        }
                        else {
                            console.log('aspfe copy successed');
                            process.exit(0);
                        }
                    }
                );
            }
            else {
                console.log(
                    targetDir + ' already exists, change the suffixName'
                );
                process.exit(1);
            }
        }
        doCopy(srcIdList.shift());
    });
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
