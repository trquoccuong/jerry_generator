#!/usr/bin/env node
var program = require('commander');
var dir = process.cwd();
var mkdirp = require('mkdirp');
var fs = require('fs');
var fsEx = require('fs-extra');
var glob = require('glob');
var path = require('path');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
}

program
    .version('0.0.1')
    .usage('[command] [params]');

//.option('scafford' , 'Make jerryJS structure')
//    .option('module', 'Make a module ')
program
    .command('scaffold')
    .description('Make jerryJS structure')
    .action(buildScaffold);
program
    .command('module [params]')
    .description('Make a module ')
    .option('-b , --backend','Only render backend folder')
    .option('-f , --frontend','Only render frontend folder')
    .action(buildModule)

//if (program.scafford) buildScafford();
//if (program.module) buildModule();

program.parse(process.argv);

function buildModule(params,option){
    var front = option.frontend || false;
    var back = option.backend || false;
    if (front == false && back == false) {
        front = back = true;
    }
    if(program.args.length > 0) {
        var moduleName = program.args[0];
        if(moduleName.match(/^[a-zA-Z0-9_]+$/)) {
            if(fs.existsSync(dir + '/modules/' + moduleName)){
                console.log('   \x1b[31mError\x1b[0m : ' + 'You already have ' + moduleName + ' module');
            } else {
                var nameModule = moduleName.capitalize();
                var nameLower = moduleName.toLowerCase();
                var routerInfo = ['"use strict";',
                    '',
                'class '+ nameModule +'Router extends JerryRouter {',
                    '   constructor(controllers){',
                    '       super()',
                    "       // Make a route",
                    "       // this.route('/').get(controllers.index);",
                    '   }',
                '}',
                'module.exports = '+ nameModule +'Router;'].join("\n");

                var moduleInfo = ['"use strict";',
                    '',
                    'class '+ nameModule +' extends JerryModule {',
                    '   constructor(){',
                    '       super()',
                    '       this.configurations  = {',
                    '           name: "'+ moduleName +'" ',
                    '       };',
                    '   }',
                    '}',
                    'module.exports = '+ nameModule +';'].join("\n");
                var controllerInfo = ['"use strict";',
                    '',
                    'class Controller extends JerryController {',
                    '   constructor(myModule){',
                    '       super(myModule)',
                    "       // Make a controller",
                    "       // this.index = function (req, res) {",
                    "           // res.send('Hello Jerry')",
                    '       //}',
                    '   }',
                    '}',
                    'module.exports = Controllers;'].join("\n");
                mkdirSync(dir + '/modules/' + nameLower);
                write(dir + '/modules/' + nameLower + '/module.js',moduleInfo);

                if(back){
                    mkdirSync(dir + '/modules/' + nameLower + "/admin");
                    mkdirSync(dir + '/modules/' + nameLower + "/admin/views");
                    mkdirSync(dir + '/modules/' + nameLower + "/admin/controllers");
                    write(dir + '/modules/' + nameLower + '/admin/controllers/index.js',controllerInfo);
                    write(dir + '/modules/' + nameLower + '/admin/route.js',routerInfo);
                }
                if(front){
                    write(dir + '/modules/' + nameLower + '/route.js',routerInfo);
                    mkdirSync(dir + '/modules/' + nameLower + "/views");
                    mkdirSync(dir + '/modules/' + nameLower + "/controllers");
                    write(dir + '/modules/' + nameLower + '/controllers/index.js',controllerInfo);
                }
            }
        } else {
            console.log('   \x1b[31mError\x1b[0m : ' + 'module name only contain a-Z,0-9,_');
        }

    } else {
        program.help();
    }
}

function buildScaffold(){
    mkdir(dir + '/modules');
    mkdir(dir + '/config');
    mkdir(dir + '/public');
    mkdir(dir + '/layout');
    copyFile(__dirname + '/default/server.js', dir + '/server.js');

}


function copyFolder(from, to) {
    fsEx.copySync(from,to);
    console.log('   \x1b[34mcreate\x1b[0m : ' + 'default config file');
}

function copyFile(from, to) {
    var fileName = path.basename(to);
    fsEx.copySync(from,to);
    console.log('   \x1b[34mcreate\x1b[0m : ' + fileName);
}


/**
 * Load template file.
 */

function loadFile(name) {
    return fs.readFileSync(path.join(__dirname, '..', 'default', name), 'utf-8');
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory(path, fn) {
    fs.readdir(path, function(err, files){
        if (err && 'ENOENT' != err.code) throw err;
        fn(!files || !files.length);
    });
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(path, str, mode) {
    fs.writeFileSync(path, str, { mode: mode || 0666 });
    console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}
/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
    mkdirp(path, 0755, function(err){
        if (err) throw err;
        console.log('   \033[36mcreate\033[0m : ' + path);
        fn && fn();
    });
}

function mkdirSync(path) {
    mkdirp.sync(path);
    console.log('   \033[36mcreate\033[0m : ' + path);
}
