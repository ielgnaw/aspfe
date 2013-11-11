/**
 * @file 文件/文件夹复制
 * @author Wanglei [wanglei23@baidu.com]
 */

var exec = require('child_process').exec;
var fs   = require('fs');
var path = require('path');

var aspfeControl = require('./aspfe');

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
                            rl.close();
                            if (callback) {
                                callback(res);
                            }
                            /*rl.question(
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
                            );*/
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

    var templatePath = aspfeControl.checkCWDPath(
        curDir,
        '../template',
        'This command could only be runned in the \'template\' directory'
    );

    var aspfeProjPath = aspfeControl.checkCWDPath(
        curDir,
        aspfeControl.projDirName,
        '.aspfe not exists. First you have to run \'aspfe init\' '
    );

    var curDirMap = getDirMap(curDir);
    var globalTplName =
            require('./aspfedata').getData(aspfeProjPath).globalTplNameMap;

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
                return;
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

            if (!fs.existsSync(targetDir)) {
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
                            console.log('aspfe copy successed');
                        }
                    }
                );
            }
            else {
                console.log(targetDir + ' already exists, change the suffixName');
                return;
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
