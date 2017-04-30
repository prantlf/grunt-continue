module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../tasks');

  grunt.registerTask('fail', function(label) {
    grunt.log.writeln(label);
    return false;
  });

  grunt.registerTask('pass', function(label) {
    grunt.log.writeln(label);
    return true;
  });

  grunt.initConfig({
    'continue:check-warnings': {
      test: {
        warnings: [
          'Error: Task "fail:second" failed.'
        ]
      }
    },
  });

  // Default task.
  grunt.registerTask('default', [
    'continue:on',
    'fail:second',
    'continue:off',
    'continue:check-warnings'
  ]);
};
