'use strict'

/*
  Hello!
  It is unlikely that you should touch this Gulpfile. If you want to, however, I can't stop you. I'm not there!
  Here's some things you can do if you'd like:
  - If you want to brand your app, you'll want to update the `gulp package-osx`, `gulp package-windows`, and
    `gulp package-linux` tasks. You can find documentation for the electronPackager() function at the github repo
    joaomoreno/gulp-atom-electron. There are a few basic branding things you can do there.
  - If you want to contemplate the universe and just feel small and meaningless in general, listen to Neil DeGrasse
    Tyson talk for an extended period of time!
*/

const gulp = require('gulp');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const glob = require('glob');
const es = require('event-stream');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const useref = require('gulp-useref');
const replace = require('gulp-replace');
const electron = require('electron-connect').server.create();
const electronPackager = require('gulp-atom-electron');
const symdest = require('gulp-symdest');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const obfuscate = require('gulp-obfuscate');
const ngAnnotate = require('gulp-ng-annotate');
const zip = require('gulp-vinyl-zip');
const clean = require('gulp-clean');
const argv = require('argv');
const gulpIf = require('gulp-if');
const templateCache = require('gulp-angular-templatecache');
const electronVersion = require('electron-prebuilt/package.json').version;

var config = {
  paths: {
    html: [ './index.html' ],
    js: [
      './app/app.routes.js',
      '!./app/src/**/*.module.js',
      './app/src/**/*.js',
      './app/templates.js'
    ],
    htmlTemplates: [ './app/js/**/*.html' ],
    css: './app/assets/styles/*.css',
    sass: './app/assets/styles/_sass/*.scss',
    sassBits: [
      './assets/styles/_sass/base/*.scss',
      './assets/styles/_sass/modules/*.scss'
    ],
    cssDest: './assets/styles',
    appRoutesJs: './app/app.routes.js',
    appConfigJs: './app/app.config.js',
    modulesJs: [
      './app/js/app.module.js'
      // './app/src/**/*.module.js'
    ],
    bundle: './bundle.js',
    minifiedBundle: 'bundle.min.js',
    moduleBundle: './build/js/module-bundle.js'
  }
};

gulp.task('init', function () {
  gulp.src(config.paths.modulesJs)
      .pipe(ngAnnotate())
      .pipe(concat(config.paths.moduleBundle))
      .pipe(gulpIf(argv.compact, uglify()))
      .pipe(gulp.dest('.'));
});

/* These are the building tasks! */
gulp.task('build-single-js-bundle',['init'], function () {
    return gulp.src('./app/js/**/*.js')
        .pipe(concat('bundle.js'))
        .pipe(ngAnnotate())
        .pipe(uglify({compress: true, mangle: false}))
        .pipe(gulp.dest('./build/js'));
});

/* These are the building tasks! */
gulp.task('copy-lib', function () {
  return gulp.src('./lib/*.js')
      .pipe(gulp.dest('./build/js/lib'));
});

gulp.task('css', function () {
  return gulp.src(config.paths.sass)
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(gulp.dest(config.paths.cssDest));
});

gulp.task('copy-css', function () {
  return gulp.src(['./app/assets/scss/*.scss','./app/assets/scss/*.css'])
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(gulp.dest('./build/assets/css'));
});

gulp.task('copy-index', function () {
  return gulp.src(['./app/*.html'])
      .pipe(gulp.dest('./build/'));
});

gulp.task('copy-access', function () {
  return gulp.src(['./app/.htaccess'])
      .pipe(gulp.dest('./build/'));
});

gulp.task('clean-build', function () {
  return gulp.src('./build', {read: false})
      .pipe(clean());
});


gulp.task('template', function () {
  return gulp.src('./app/js/**/*.html')
      .pipe(templateCache({ filename: 'templates.js', module: 'app.templates', root: '/'}))
      .pipe(gulp.dest('./build/js'))
});

gulp.task('build-client-bundles', ['build-single-js-bundle'] , (done) => {

  glob('./build/js/bundle.js', (err, files) => {
  if (err) done(err)

  let tasks = files.map((entry) => {
        return browserify({ entries: [entry] })
            .transform('babelify', { presets: [ 'es2015' ] })
            .bundle()
            .pipe(source(entry))
            .pipe(rename({
              dirname: 'js',
              basename: 'bundle',
              extname: '.js'
            }))
            .pipe(gulp.dest('./build'))
      })

  es.merge(tasks).on('end', done)

})})
gulp.task('build-client-scss', (done) => {
  glob('./app/assets/scss/*.scss', (err, files) => {
  if (err) done(err)

  let tasks = files.map((entry) => {
        return gulp.src(entry)
            .pipe(sass())
            .pipe(rename({
              dirname: 'css'
            }))
            .pipe(gulp.dest('./build/assets'))
      })

  es.merge(tasks).on('end', done)
})})
gulp.task('build-client-html', (done) => {
  glob('./app/*.html', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(gulp.dest('./build'))
    })

    es.merge(tasks).on('end', done)
  })})
gulp.task('build-client-html-production', (done) => {
  glob('./app/*.html', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(useref())
        .pipe(gulp.dest('./build'))
    })

    es.merge(tasks).on('end', done)
  })})
gulp.task('build-client-assets', (done) => {
  glob('./app/assets/**/*', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      console.log(entry)
      return gulp.src(entry)
        .pipe(rename({
          dirname: 'assets'
        }))
        .pipe(gulp.dest('./build'))
    })

    es.merge(tasks).on('end', done)
  })})

gulp.task('copy-client-assets', function () {
  return gulp.src('./app/assets/**/*', {
    base: './app/assets'
  }).pipe(gulp.dest('./build/assets'));
});

gulp.task('build-client', [ 'build-single-js-bundle', 'copy-lib', 'copy-index','build-client-scss', 'copy-css', 'template', 'copy-client-assets', 'copy-access']);
gulp.task('min-build-client', [ 'build-client-bundles', 'template', 'build-client-html']);
gulp.task('build-client-production', ['build-client-bundles', 'build-client-scss', 'template', 'build-client-html-production', 'copy-client-assets']);

gulp.task('build-server', (done) => {
  glob('./src/*.js', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(gulp.dest('./build'))
    })

    es.merge(tasks).on('end', done)
  })
})

gulp.task('build', ['build-client']);
gulp.task('build2', ['min-build-client']);

gulp.task('build-production', ['build-client-production', 'build-server'], () => {
  gulp.src('./package.json')
    .pipe(replace('build/index.js', 'index.js'))
    .pipe(gulp.dest('./build'))
})

/* These are the watch tasks! */

gulp.task('watch-client', () => {
  gulp.watch('./app/**/*', ['build-client'], (e) => {
    console.log('Client file ' + e.path + ' was ' + e.type + ', rebuilding...')
  })
})

gulp.task('watch-server', () => {
  gulp.watch('./src/**/*', ['build-server'], (e) => {
    console.log('Server file ' + e.path + ' was ' + e.type + ', rebuilding...')
  })
})

gulp.task('watch', ['build', 'watch-client', 'watch-server'])

/* These are the linting tasks! */

gulp.task('lint-client', (done) => {
  glob('./app/**/*.js', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(eslint())
        .pipe(eslint.format())
    })

    es.merge(tasks).on('end', done)
  })
})

gulp.task('lint-server', (done) => {
  glob('./src/**/*.js', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(eslint())
        .pipe(eslint.format())
    })

    es.merge(tasks).on('end', done)
  })
})

gulp.task('lint', ['lint-client', 'lint-server'])

/* This is the serve task! */

gulp.task('serve', ['build', 'watch'], () => {
  electron.start()
  gulp.watch('./build/index.js', electron.restart);
  gulp.watch(['./build/js/*.js', './build/css/*.css'], electron.reload)
})

gulp.task('build and watch', ['build', 'watch'], () => {
gulp.watch('./build/index.js', electron.restart);
gulp.watch(['./build/js/*.js', './build/css/*.css'], electron.reload)
})

/* These are the packaging tasks! */

gulp.task('package-osx', ['build-production'], () => {
  return gulp.src('./build/**')
    .pipe(electronPackager({ version: electronVersion, platform: 'darwin' }))
    .pipe(symdest('release'))
})

gulp.task('package-windows', ['build-production'], () => {
  return gulp.src('./build/**')
    .pipe(electronPackager({ version: electronVersion, platform: 'win32' }))
    .pipe(zip.dest('./release/windows.zip'))
})

gulp.task('package-linux', ['build-production'], () => {
  return gulp.src('./build/**')
    .pipe(electronPackager({ version: electronVersion, platform: 'linux' }))
    .pipe(zip.dest('./release/linux.zip'))
})

gulp.task('package', ['build-production', 'package-windows', 'package-osx', 'package-linux'])
