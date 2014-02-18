/**
 * @file aspfedata
 * @author Ielgnaw(wuji0223@gmail.com)
 */

var fs   = require('fs');
var path = require('path');

var aspfe = require('./aspfe');

var FILENAME = 'aspfedata';

var DEFAULTCONF = {
    crFile: 'http://cooder.baidu.com/dynamic/upload.py',
    globalTplNameMap: {
        '1'   : 'baiduASPT1S',
        '204' : 'baiduASPT204S',
        '213' : 'baiduASPP213HS',
        '217' : 'baiduASPT217S',
        '219' : 'anticheat',
        '665' : 'baiduASPT665S'
    }
};

/**
 * 创建aspfedata
 *
 * @param  {String} fullPath .aspfe的路径
 */
exports.create = function(fullPath) {
    if (fullPath) {
        var file = path.join(fullPath, FILENAME);
        if (!fs.existsSync(file)) {
            var data = JSON.parse(JSON.stringify(DEFAULTCONF));
            fs.writeFileSync(
                file,
                JSON.stringify(data, null, 4), // 第三个参数代表分隔符
                'UTF-8'
            );
        }
    }
};

/**
 * 设置项目的aspfeData信息
 *
 * @param {String}  fullPath 文件路径
 * @param {Object}  afData   数据
 * @param {Boolean} isCover  是否覆盖
 */
exports.setData = function(fullPath, afData, isCover){
    if (fullPath) {
        var file = path.join(fullPath, FILENAME);
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            if (isCover) {
                fs.open(file, 'w', 0644, function(e, fd) {
                    if(e) {
                        throw e;
                    }
                    fs.write(
                        fd,
                        JSON.stringify(afData, null, 4),
                        0,
                        'utf8',
                        function(e){
                            if(e) {
                                throw e;
                            }
                            fs.closeSync(fd);
                        }
                    );
                });
            }
            else {
                aspfe.mix(JSON.parse(data), afData);
                fs.open(file, 'w', 0644, function(e, fd) {
                    if(e) {
                        throw e;
                    }
                    fs.write(
                        fd,
                        JSON.stringify(afData, null, 4),
                        0,
                        'utf8',
                        function(e){
                            if(e) {
                                throw e;
                            }
                            fs.closeSync(fd);
                        }
                    );
                });
            }
        });
    }
};

/**
 * 获取项目的aspfeData信息
 */
exports.getData = function (fullPath) {
    if (fullPath) {
        var file = path.join(fullPath, FILENAME);
        var content = fs.readFileSync(file, 'utf8');
        return JSON.parse(content);
    }
    return null;
};


