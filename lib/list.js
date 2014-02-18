/**
 * @file 列出所有的小流量模板、issue、subject
 * @author Ielgnaw(wuji0223@gmail.com)
 */

var fs    = require('fs');
var path  = require('path');
var aspfe = require('./aspfe');

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

function test () {
    // var md5 = function(str){
    //     return crypto.createHash('md5').update(str).digest('hex');
    // };
    var FILE = 'C:/Users/Wanglei/Desktop/my/aspfe-test/vui-template_1-0-36_BRANCH/template/204/baiduASPT204_hahahaha/index.tpl'
    var fs = require('fs');
    var crypto = require('crypto');
    fs.readFile(FILE, 'utf8', function (err, data) {
        // console.log(data);
        var hasher = crypto.createHash('md5');
        hasher.update(data);
        console.log(hasher.digest('hex'));
    });

    // var text = "123|12312312123123121231231212312312123123121231231212312312";
    // var hasher=crypto.createHash("md5");
    // hasher.update(text);
    // var hashmsg=hasher.digest('hex');//hashmsg为加密之后的数据

    // var text1 = "123|12312312123123121231231212312312123123121231231212312312";
    // var hasher1 = crypto.createHash("md5");
    // hasher1.update(text1);
    // var hashmsg1 = hasher1.digest('hex');//hashmsg为加密之后的数据
    // console.log(hashmsg);
    // console.log(hashmsg1);
}

/**
 * aspfe list 命令入口
 *
 * @param  {Object} args 命令行参数
 */
module.exports = function (args) {
    var curDir = process.cwd();
    var aspfeProjPath = aspfe.checkCWDPath(
        curDir,
        aspfe.projDirName,
        '.aspfe not exists. First you have to run \'aspfe init\' '
    );

    aspfe.showFormatInfo(['ExperimentName', 'issue', 'subject'], 35);
    console.log(
        '--------------------------------------------'
        +
        '--------------------------------------------'
    );

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
                    aspfe.showFormatInfo(
                        [prop, afData[prop].issue, afData[prop].subject],
                        35
                    );
                    console.log(
                        '……………………………………………………………………………………………………………………'
                        +
                        '……………………………………………………………………………………………………………………'
                    );
                });
            }
        }
    });
}
