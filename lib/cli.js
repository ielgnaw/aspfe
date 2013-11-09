/**
 * @file 命令行
 * @author Wanglei [wanglei23@baidu.com]
 */

function defaultInfo() {
    var moduleNames = [];
    function readName( mod ) {
        moduleNames.push( mod.cli.command );
    }

    function pad(msg, length) {
        length = length || 16;
        if (msg.length < length) {
            return msg + new Array(length - msg.length).join(' ');
        }
        return msg;
    }

    console.log( 'Usage: edp <command> [<args>] [<options>]\n' );

    console.log( 'Builtin Commands:\n' );
    // exports.getBuiltinModules().forEach(
    //     function( mod ) {
    //         var cli = mod.cli;
    //         var alias = cli.alias;
    //         console.log( "%s %s",
    //             pad( cli.command + (alias ? '(' + alias + ')' : '' ) ),
    //             (cli.description || '').replace(/(。|\.)$/, '')
    //         );
    //     }
    // );
    console.log();

    moduleNames = ['addhtml    添加html文件', '\naddjs      添加javascript文件'];
    // exports.getExtensionModules().forEach( readName );
    if (moduleNames.length) {
        console.log( 'User Commands:' );
        console.log( moduleNames.join( ', ' ) );
        console.log();
    }

    // console.log( 'See "edp help <command>" for more information.' );
}

var fs   = require('fs');
var path = require('path');

var commandMap = {};

(function scanDir(dir) {
    var tmp = {};
    fs.readdirSync(dir).forEach(function(file, index) {
        var fullPath = path.resolve(dir, file);
        var stat     = fs.statSync(fullPath);
        var extName  = path.extname(file);
        var name     = path.basename(file, extName);
        if (stat.isFile() && /^\.js$/i.test(extName)) {
            var mod = require(fullPath);
            var cli = mod.cli;
            if (cli) {
                commandMap[cli.command] = cli;
            }
        }
        else if (stat.isDirectory()) {
            scanDir(fullPath);
        }
    });
})(__dirname);

exports.parseArgs = function(args) {
    if (args.length === 0) {
        // showDefaultInfo();
        return;
    }

    // 显示版本信息
    if (args[0] === '--version' || args[0] === '-v') {
        console.log('aspfe version ' + require('./aspfe').version);
        return;
    }


    // var command = args[0];
    var command = args.shift();

    // var argv = require('optimist').usage('Usage: $0 -x [num] -y [num]').demand(['x','y']).argv;

    // var argv = require('optimist');
    var commandArgs = [];
    if (commandMap[command]) {
        commandMap[command].main();
        // for (var i = 0, len = args.length; i < len; i++) {
        //     if (/^\-+/.test(args[i])) {
        //         // commandArgs.push(args[i].replace(/^\-+/, ''));
        //         console.log(args[i].replace(/^\-+/, ''), '213');
        //         // console.log(args[i]);
        //     }
        //     else {
        //         argv.usage(
        //             'Usage: ' + commandMap[command].usage
        //         ).demand(
        //             ['srcid', 'smallname']
        //         ).argv;
        //         return;
        //     }
        // }
        // commandMap[command].main(commandArgs);
    }





    // var command = args.shift();
    // var childCommand = args.shift();
    // console.log(require('./branch/add'));

    // var a = require('./' + command + '/' + childCommand);
    // a.cli.main(args);

};