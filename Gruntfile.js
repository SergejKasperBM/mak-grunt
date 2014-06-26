module.exports = function (grunt) {

  //MAIN Project SETTINGS

  var destDir = "dest";
  var appDir = "mak";
  var whitelabels = ["mak", "cnouch", "schlafwelt", "ekinova"];
  var defaultHostname = "0.0.0.0";
  var gitDir = "mak";
  if (grunt.option('dest')) {
    destDir = grunt.option('dest');
    grunt.log.write('destribution directory specified by user: ' + destDir);
  }


  //CSS 2 LESS

  var cssToLessTasks = function cssToLessTasks () {
    var tasks = {};
    var fileMapping = function fileMapping(distName) {
      var files = {};
      files[destDir + "/assets/"+distName+"/css/styles.css"] = appDir + "/assets/"+distName+"/less/styles.less",
      files[destDir + "/assets/"+distName+"/css/ie8.css"] = appDir + "/assets/"+distName+"/less/ie/ie8.less",
      files[destDir + "/assets/"+distName+"/css/ie_colorthumbs.css"] = appDir + "/assets/"+distName+"/less/ie/ie8_colorthumbs.less",
      files[destDir + "/assets/"+distName+"/css/ie_colorthumbs.css"] = appDir + "/assets/"+distName+"/less/ie/ie_colorthumbs.less"
      return files;
    }; 
    whitelabels.forEach(function (label) {
      var task = {};
      task.options = {};
      task.options.paths = [appDir + "/assets/" + label +"/less"];
      task.files = fileMapping(label);
      tasks[label] = task;
    });
    return tasks;
  };

  //Watch
  whitelabels.forEach(function (label) {
      
      //Configure watch:markup task
      var markup_task = {
      files: [appDir + '/{**/,}*.php', appDir + '/{**/,}*.html', appDir + '/{**/,}*.js'],
      tasks:["sync", "dom_munger"]
      };
      
      //Configure watch:less task
      var less_task = {};
      less_task.files = [appDir + "/assets/"+ label +"/less/{**/,}*.less"]
      if (label != "mak") {
        less_task.files.push(appDir + "/assets/mak/less/{**/,}*.less");
      }
      less_task.tasks = ["shell", "less"];

      //Build watch:<distribution> task
      grunt.registerTask('watch:' + label, function() {
        // Configuration for watch:test tasks.
        var config = {
          options: { 
            livereload: true, 
          },
          less: less_task,
          markup: markup_task
        };

        grunt.config('watch', config);
        grunt.task.run('watch');
      });
  });
  
  //LOCAL DEPLOYMENT
  
  //Ip configuration for deployment 
  //So you get your current ip, can visit the server from LAN with any device and have Livereload!
  var os=require('os');
  var ifaces=os.networkInterfaces();
  var hostname = null;
  for (var dev in ifaces) {
      if(dev != "en1" && dev != "en0") {
          continue;
      }
      ifaces[dev].some(function(details){
        if (details.family=='IPv4') {
          hostname = details.address;
          return true;
        }
      });
  }
  if (grunt.option('url')) {
    hostname = grunt.option('url');
    grunt.log.write('host specified by user: ' + hostname);
  } else {
    if (hostname){
      grunt.log.write('host detected by system: ' + hostname);
    } else {
      hostname = defaultHostname;
      grunt.log.write('No IPv4 host detected by system. Setting host to project-default: ' + hostname);
    }
  }

  //Use Livereload

  var lrscripts='<script src="http://'+ hostname +':35729/livereload.js?snipver=1"></script>';

  //Use Weinre http://localhost:
  var wscripts='<script src="http://'+ hostname +':8082/target/target-script-min.js#anonymous"></script>';

  // PROJECT CONFIGURATION


  grunt.initConfig({
    
    gitinfo: {
      options: {
          cwd: './' + gitDir
      }
    },

    //OSX filelimit fix
    shell: {
        resetWatchFileLimit: {
            options: {
                stderr: false,
                failOnError: false
            },
            command: 'launchctl limit maxfiles 10480 10480'
        }
    },

    pkg: grunt.file.readJSON('package.json'),

    clean: [destDir],

    less: cssToLessTasks(),

    php: {
        mak: {
            options: {
                ini: 'php.ini',
                port: 8080,
                open: true,
                //keepalive: true,
                hostname: hostname,
                base: destDir
            }
        },
        cnouch: {
            options: {
                ini: 'php.ini',
                port: 8080,
                open: true,
                //keepalive: true,
                hostname: hostname,
                base: destDir,
                router: 'routers/cnouch.php'
            }
        },
        schlafwelt: {
            options: {
                ini: 'php.ini',
                port: 8080,
                open: true,
                //keepalive: true,
                hostname: hostname,
                base: destDir,
                router: 'routers/schlafwelt.php'
            }
        }, 
        ekinova: {
            options: {
                ini: 'php.ini',
                port: 8080,
                open: true,
                //keepalive: true,
                hostname: hostname,
                base: destDir,
                router: 'routers/ekinova.php'
            }
        }
    },
    weinre: {
      dev: {
        options: {
          httpPort: 8082,
          boundHost: '-all-',          
        }
      }
    },
    copy : {
      'routers' : {
          expand : true,
          flatten : false,
          cwd : '.',
          src : ['routers/*.php', 'php.ini'],
          dest : destDir        
      },
      'other' : {
        files : [ {
          expand : true,
          flatten : false,
          cwd : appDir,
          src : ['./**', '!/assets/**/less', '!/html/mak/layout/layout-*.php'],
          dest : destDir
        }]
      }
    },

    dom_munger: {
      layout_catalogue: {
        options: {  
          append: [{selector:'body', html: lrscripts}, {selector:'body', html: wscripts}],
        },
        src: appDir + '/html/mak/layout/layout-catalogue.php', 
        dest: destDir + '/html/mak/layout/layout-catalogue.php', 
      },
      layout_checkout: {
        options: {
          append: [{selector:'body', html: lrscripts}, {selector:'body', html: wscripts}],
        },
        src: appDir + '/html/mak/layout/layout-checkout.php', 
        dest: destDir + '/html/mak/layout/layout-checkout.php', 
      },
      layout_default: {
        options: { 
          append: [{selector:'body', html: lrscripts}, {selector:'body', html: wscripts}],
        },
        src: appDir + '/html/mak/layout/layout-default.php', 
        dest: destDir + '/html/mak/layout/layout-default.php', 
      },
      layout_default_start: {
        options: {
          append: [{selector:'body', html: lrscripts}, {selector:'body', html: wscripts}],
        },
        src: appDir + '/html/mak/layout/layout-default-start.php', 
        dest: destDir + '/html/mak/layout/layout-default-start.php', 
      },
      layout_naked:{
        options: { 
          append: [{selector:'body', html: lrscripts}, {selector:'body', html: wscripts}],
        },
        src: appDir + '/html/mak/layout/layout-naked.php', 
        dest: destDir + '/html/mak/layout/layout-naked.php', 
      },
      layout_error: {
        options: {   
          append: [{selector:'body', html: lrscripts}, {selector:'body', html: wscripts}],
        },
        src: appDir + '/html/mak/layout/layout-error.php', 
        dest: destDir + '/html/mak/layout/layout-error.php',       
      },
    },
    sync: {
      main: {
        files: [{
          cwd : appDir,
          src : ["./**", "!/assets/**/less", '!/html/mak/layout/*.php'],
          dest : destDir
        }],
        verbose: true // Display log messages when copying files
      }
    },
    selenium: {
      options: {
        browsers: ['chrome'],
        timeout: 100,
        log: 'tests/results/wd.log',
        force: true,
        startURL: hostname + ':8080'
      },
      suite: {
        files: {
          'source.tap': ['tests/source/*.suite']
        }
      }
    },
    ftpush: {
      build: {
        auth: {
          host: 'brink-martens.com',
          port: 21,
          authKey: 'mak fuer benutzer'
        },
        src: destDir,
        dest: '/<%= gitinfo.local.branch.current.name %>',
        exclusions: [destDir + '/**/.DS_Store', destDir + '/**/Thumbs.db']
      }
    }

  });
  // Load the plugin that provides the "less" task.
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-dom-munger');
  grunt.loadNpmTasks('grunt-php');
  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-ftpush');
  grunt.loadNpmTasks('grunt-gitinfo');
  grunt.loadNpmTasks('grunt-weinre');
  grunt.loadNpmTasks('grunt-selenium');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'less:mak', 'less:cnouch', 'less:schlafwelt', 'less:ekinova', 'copy' ]);

  
  grunt.registerTask('git-lookup', 'build task', function(target) {
      grunt.registerTask('gitinfo-result', 'build task', function(target) {
        grunt.log.writeln('local branch: ' + grunt.config.get('gitinfo').local.branch.current.name);
        grunt.log.writeln('remote origin url: ' + grunt.config.get('gitinfo').remote.origin.url);
      });
      grunt.task.run(['gitinfo', 'gitinfo-result']);
  });

  grunt.registerTask('test', 'build task', function(target) {
        if (target === 'sw') {
        grunt.task.run(['default', 'php:schlafwelt', 'selenium']);
      } else if (target === 'cn') {
        grunt.task.run(['default', 'php:cnouch', 'selenium']);
      } else if (target === 'ek') {
        grunt.task.run(['default', 'php:ekinova', 'selenium']);
      } else {
        grunt.task.run(['default', 'php:mak', 'selenium']);
      }
    });

  grunt.registerTask('deploy-local', 'build task', function(target) {
      
      //grunt.log.write(gitinfo.local.branch.current.name);
      if (target === 'sw') {
        grunt.task.run(['default', 'dom_munger' ,'php:schlafwelt', 'watch:schlafwelt']);
      } else if (target === 'cn') {
        grunt.task.run(['default', 'dom_munger' ,'php:cnouch', 'watch:cnouch' ]);
      } else if (target === 'ek') {
        grunt.task.run(['default', 'dom_munger' ,'php:ekinova', 'watch:ekinova' ]);
      } else {
        grunt.task.run(['default', 'dom_munger' ,'php:mak', 'watch:mak' ]);
      }
    });

    grunt.registerTask('deploy-remote', 'build task', function(target) {
      grunt.task.run(['default', 'git-lookup','ftpush']);
    });
};
