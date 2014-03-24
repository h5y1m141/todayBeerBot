module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    watch:
      files:['coffee/**/*.coffee']
      tasks:['coffee']
      # tasks:['coffee','exec:jasmine']
    jasmine:
      product:
        src: "/lib/*.js"
        options:
          specs: "/spec/*_spec.js"
    exec:
      jasmine:"node_modules/jasmine-node/bin/jasmine-node spec/todayBeerBot_spec.js"
    coffee:
      compile:
        files:[
          expand:true
          cwd: 'coffee/'
          src:['**/*.coffee']
          dest: './'
          ext: '.js'
        ]
        
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-notify'
  grunt.loadNpmTasks "grunt-contrib-jasmine"
  grunt.loadNpmTasks 'grunt-exec'
  grunt.registerTask 'default', ['watch']
  return
