# grunt-continue

[![Build Status](https://travis-ci.org/pghalliday/grunt-continue.png)](https://travis-ci.org/pghalliday/grunt-continue)
[![Dependency Status](https://gemnasium.com/pghalliday/grunt-continue.png)](https://gemnasium.com/pghalliday/grunt-continue)

A grunt plugin to force other tasks to continue after failures and check for warnings issued after them

Inspired by and extended from [this](http://stackoverflow.com/a/16972894/2622241) answer by [explunit](http://stackoverflow.com/users/151212/explunit) on StackOverflow

## Usage

Install next to your project's Gruntfile.js with: 

```
$ npm install grunt-continue
```

Here is a simple example gruntfile to show how you might force grunt to continue after failing tests if you have some cleanup that you need to perform afterward

```javascript
module.exports = function(grunt) {

  // Add the grunt-continue tasks
  grunt.loadNpmTasks('grunt-continue');

  // Other tasks and configuration
  ...

  grunt.registerTask('default', [
    'setup',
    'continue:on',
    // All tasks after this point will be run with the force
    // option so that grunt will continue after failures
    'test',
    'continue:off',
    // Tasks after this point will be run without the force
    // option so that grunt exits if they fail
    'cleanup'
  ]);

};
```

`continue:off` does not turn off the continuing if `--force` was specified at the command line.

If `continue:on` is called muliple times `continue:off` must be called that many times in order to stop continuing.

If `continue:off` is called more times than `continue:on` it will fail.

### Checking to see if there were no failures within the block

It is sometimes useful to check if there were no warnings issued by any tasks within `continue:on` and `continue:off`.
For example, you may run a test within the block and cleanup at the end. In this instance you want the overall build to fail after the cleanup.

To accommodate this add the following task at the end: 

```javascript
module.exports = function(grunt) {

  // Add the grunt-continue tasks
  grunt.loadNpmTasks('grunt-continue');

  // Other tasks and configuration
  ...

  grunt.registerTask('default', [
    'setup',
    'continue:on',
    // All tasks after this point will be run with the force
    // option so that grunt will continue after failures
    'test',
    'continue:off',
    // Tasks after this point will be run without the force
    // option so that grunt exits if they fail
    'cleanup',
    'continue:fail-on-warning'
  ]);

};
```

### Checking to see if there were any failures within the block

When you write unit tests for Grunt tasks, sometimes you need to test, that a failure was handled properly. You do not want the overall build to fail after a failing tasks did. You actually want the build to fail, if the task *did not fail*. You can achieve this by executing the `continue:check-any-warnings` task, once the continuation block ended:

```javascript
module.exports = function(grunt) {

  // Add the grunt-continue tasks
  grunt.loadNpmTasks('grunt-continue');

  // Other tasks and configuration
  ...

  grunt.registerTask('default', [
    // Tasks, which should succeed preparing output for unit test checks
    'move:rename',
    ...
    // Prevent Grunt from failing, if a task fails from know on
    'continue:on',
    // Tasks, which should intentionally fail
    'move:failed_wrong_path',
    ...
    // Allow Grunt to fail, if a task fails from know on
    'continue:off',
    // Check, that the tasks, which should fail, actually failed
    'continue:check-any-warnings',
    // Check ouput of the succeeding tasks
    'nodeunit'
  ]);

};
```

### Checking to see if there were only specific failures within the block

When you write unit tests for Grunt tasks, sometimes you need to test, that a failure was reported properly. You want the build to fail, if the failure was *not* reported, or if the expected warning was not issued. You can achieve this by configuring the `continue:check-warnings` task and by executing it, once the continuation block ended:

```javascript
module.exports = function(grunt) {

  grunt.initConfig({
    'continue:check-warnings': {
      test: {
        warnings: [
          'No files or directories specified.',
          'Moving failed.',
          ...
        ]
      }
    },
    ...
  });

  grunt.loadNpmTasks('grunt-continue');
  ...

  grunt.registerTask('default', [
    'move:rename',
    ...
    'continue:on',
    'move:failed_missing_source',
    'move:failed_invalid_destination',
    ...
    'continue:off',
    // Check if all specified warnings were issued
    'continue:check-warnings',
    'nodeunit'
  ]);

};
```

### Clearing warnings before another block is entered

If you use multiple `continue:on` and `continue:off` blocks of tasks, you may need to check, if a warning was issued by any task only in one specific block. It is useful, if you check for occurrences of warnings by `continue:check-any-warnings` or by `continue:check-warnings`. You can achieve this by executing the `continue:clear-warnings` task before the continuation block is entered:

```javascript
module.exports = function(grunt) {

  grunt.initConfig({
    'continue:check-warnings': {
      second_tests: {
        warnings: [
          'No files or directories specified.',
          'Moving failed.'
        ]
      }
    },
    ...
  });

  grunt.loadNpmTasks('grunt-continue');
  ...

  grunt.registerTask('default', [
    'move:rename',
    ...

    // Check if the task fails
    'continue:on',
    'move:missing_task_settings',
    'continue:off',
    'continue:check-any-warnings',

    // Make sure, tha the next check will start with no remembered warnings
    'continue:clear-warnings',

    // Check if the tasks fail and issue specified warnings
    'continue:on',
    'move:failed_missing_source',
    'move:failed_invalid_destination',
    'continue:off',
    'continue:check-warnings:second_tests',

    'nodeunit'
  ]);

};
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using: 

```
$ npm test
```

### Using Vagrant
To use the Vagrantfile you will also need to install the following vagrant plugins

```
$ vagrant plugin install vagrant-omnibus
$ vagrant plugin install vagrant-berkshelf
```


## License
Copyright &copy; 2013 Peter Halliday  
Licensed under the MIT license.
