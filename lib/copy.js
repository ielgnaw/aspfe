/**
 * @file 文件/文件夹复制
 * @author Wanglei [wanglei23@baidu.com]
 */

var exec = require('child_process').exec;
var fs   = require('fs');
var path = require('path');


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
                                'SVN copy ? (yes) ',
                                function (svnCopyAnswer) {
                                    if (
                                        svnCopyAnswer === ''
                                        ||
                                        svnCopyAnswer === 'y'
                                        ||
                                        svnCopyAnswer === 'yes'
                                    ) {
                                        res.svnCopy = true;
                                    }
                                    else {
                                        res.svnCopy = false;
                                    }
                                    rl.close();
                                    if (callback) {
                                        callback(res);
                                    }
                                }
                            );
                        }
                    }
                );
            }
        }
    );
}

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

// 全流量模板名字
var globalTplName = {
    '1'   : 'baiduASPT1S',
    '204' : 'baiduASPT204S',
    '213' : 'baiduASPP213HS',
    '217' : 'baiduASPT217S',
    '219' : 'anticheat'
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
// cli.usage = 'aspfe copy --source=sourceFile|sourceDir target=targetFile|targetDir [--nosvncopy]';
cli.usage = 'aspfe copy';


/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令运行选项
 */
cli.main = function() {
    getReadLine(function(res) {
        var curDir = process.cwd();
        var curDirMap = getDirMap(curDir);
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
                return;
            }
            else {
                srcIdList.push({
                    srcId: srcIdArr[i],
                    fullPath: curDirMap[srcIdArr[i]]
                });
                // srcIdMap[srcIdArr[i]] = curDirMap[srcIdArr[i]];
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
                            + '\\' + exceptAfterNumChar
                            + '_' + res.suffixName;

            var str = ''
                + 'svn cp '
                + fullPath + '\\' + globalTplName[srcId]
                + ' '
                + targetDir;

            var runCopy = exec(
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

                    if (srcIdList.length) {
                        doCopy(srcIdList.shift());
                    }
                    else {
                        console.log('done');
                    }
                }
            );
        }

        doCopy(srcIdList.shift());


        /*var srcIdMap = {};
        for (var i = 0, len = srcIdArr.length; i < len; i++) {
            if (!curDirMap[srcIdArr[i]]) {
                console.log(
                    srcIdArr[i] +
                    ' 在当前目录: ' +
                    curDir +
                    ' 不存在，请重新输入'
                );
                return;
            }
            else {
                srcIdMap[srcIdArr[i]] = curDirMap[srcIdArr[i]];
            }
        }

        var targetDir;
        var str;
        var runCopy;
        for (var i in srcIdMap) {
            (function(srcId) {
                var exceptAfterNumChar = globalTplName[srcId];
                if (/(\d+(?=[A-Za-z]+))/.test(globalTplName[srcId])) {
                    // 除去数字之后字符的名字
                    // 例如 baiduASPP213HS 就是 baiduASPP213
                    exceptAfterNumChar =
                        globalTplName[srcId].split(RegExp.$1)[0] + RegExp.$1;
                }
                targetDir = srcIdMap[srcId]
                                + '\\' + exceptAfterNumChar
                                + '_' + res.suffixName;

                str = ''
                    + 'svn cp '
                    + srcIdMap[srcId] + '\\' + globalTplName[srcId]
                    + ' '
                    + targetDir;

                runCopy = exec(
                    str,
                    {
                        encoding: 'utf8',
                        timeout: 0,             //子进程最长执行时间
                        maxBuffer: 2000*1024,   // stdout和stderr的最大长度
                        killSignal: 'SIGTERM',
                        cwd: null,
                        env: null
                    }
                );

                runCopy.stdout.on('data', function (data) {
                    console.log(data);
                });

                runCopy.stderr.on('data', function (data) {
                    console.log('stderr: \n' + data + '\n');
                });

                runCopy.on('exit', function (code) {
                    console.log('SVN COPY Finished：' + targetDir + '\n');
                });
            })(i);
        }*/
    });
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
