/**
 * @file 读取`template/widget`并更新`aspfedata`
 * @author Wanglei [wanglei23@baidu.com]
 */

var fs   = require('fs');
var path = require('path');
var aspfeControl = require('./aspfe');

module.exports = function (dir) {
    var aspfeDir = path.resolve(dir, aspfeControl.projDirName);
    var destination = dir + '/widgets';
    if (fs.existsSync(destination)) {
        var widgetList = [];
        fs.readdirSync(destination).forEach(function (file, index) {
            var fullPath = path.resolve(destination, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file.indexOf('_') === -1) { // 读取不带`_`的，即全流量的widget
                    widgetList.push(file);
                }
            }
        });
        if (widgetList.length > 0) {
            require('./aspfedata').setData(aspfeDir, {
                widget: widgetList
            });
        }
    }
};