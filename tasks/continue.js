module.exports = function(grunt) {

    var defaultWarnHandler = grunt.fail.warn;

    function warn(){
        var warnings = grunt.config('grunt-continue:warnings') || [];
        warnings.push(arguments[0]);
        grunt.config.set('grunt-continue:warnings', warnings);
        defaultWarnHandler.apply(grunt, Array.prototype.slice.call(arguments));
    }

    grunt.registerTask('continue:on', 'Continue after failing tasks', function() {
        grunt.warn = grunt.fail.warn = warn;
        overridden = grunt.config('grunt-continue:overridden') || false;
        if (!overridden) {
            count = grunt.config('grunt-continue:count') || 0;
            if (!count && grunt.option('force')) {
                grunt.config('grunt-continue:overridden', true);
            } else {
                if (!count) {
                    grunt.option('force', true);
                }
                grunt.config.set('grunt-continue:count', ++count);
            }
        }
    });

    grunt.registerTask('continue:off', 'Stop continuing after failing tasks', function() {
        grunt.warn = grunt.fail.warn = defaultWarnHandler;
        overridden = grunt.config('grunt-continue:overridden') || false;
        if (!overridden) {
            count = grunt.config('grunt-continue:count') || 0;
            if (!count) return false;
            grunt.config.set('grunt-continue:count', --count);
            if (!count) {
                grunt.option('force', false);
            }
        }
    });

    grunt.registerTask('continue:fail-on-warning', 'Check to see if there were any warnings, fail if there were', function(){
        var warnings = grunt.config('grunt-continue:warnings') || null;
        if(warnings) {
            var msg = grunt.util.pluralize(warnings.length, 'A warning has/Warnings have')+' occurred between continue:on and continue:off:\n';
            for(var i = 0, len = warnings.length; i<len; i++) {
                msg += ' - ';
                msg += grunt.util.kindOf(warnings[i]) == 'string'?warnings[i]:JSON.stringify(warnings[i]);
                msg += '\n';
            }
            msg += '\n';
            grunt.warn(grunt.util.normalizelf(msg));
        }
    });

    grunt.registerTask('continue:clear-warnings', 'Clear warnings remembered, when continung after failing tasks was on', function() {
        grunt.config.set('grunt-continue:warnings', null);
        grunt.verbose.writeln('Warnings were cleared.');
    });

    grunt.registerTask('continue:check-any-warnings', 'Check to see if there were any warnings, fail if there were none', function () {
        var actual = grunt.config('grunt-continue:warnings') || [];
        grunt.verbose.writeln('Some warnings were expected.');
        if (actual.length) {
            grunt.verbose.writeln(actual.length + ' actual ' + grunt.util.pluralize(actual.length, 'warning/warnings') + ':');
            actual.forEach(function (warning) {
                grunt.verbose.writeln('  "' + warning + '"');
            });
            grunt.log.ok(actual.length + grunt.util.pluralize(actual.length, ' warning was/ warnings were') + ' found.');
        } else {
            grunt.fail.warn('No warnings were found.');
        }
    });

    grunt.registerMultiTask('continue:check-warnings', 'Check to see if there were only expected warnings, fail if there were other or none', function () {
          var expected = this.data.warnings,
              actual = grunt.config('grunt-continue:warnings') || [];
          if (!expected) {
              grunt.fail.warn('No expected warnings were specified.');
          }
          grunt.verbose.writeln(expected.length + grunt.util.pluralize(expected.length, ' warning was/ warnings were') + ' expected:');
          expected.forEach(function (warning) {
              grunt.verbose.writeln('  "' + warning + '"');
          });
          actual = actual.map(function (warning) {
            return warning.toString();
          });
          actual.forEach(function (warning) {
              grunt.verbose.writeln('Actual warning: "' + warning + '".');
              if (expected.indexOf(warning) < 0) {
                  grunt.fail.warn('Unexpected warning: "' + warning + '".');
              }
          });
          expected.forEach(function (warning) {
              if (actual.indexOf(warning) < 0) {
                  grunt.fail.warn('Warning not found: "' + warning + '".');
              }
          });
          grunt.log.ok(actual.length + grunt.util.pluralize(actual.length, ' warning was/ warnings were') + ' expected and found.');
        });

};