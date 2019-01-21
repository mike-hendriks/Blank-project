// Load Gulp...of course
const { src, dest, task, watch, series, parallel } = require('gulp');

// CSS related plugins
var sass         = require( 'gulp-sass' );
var autoprefixer = require( 'gulp-autoprefixer' );

// JS related plugins
var uglify       = require( 'gulp-uglify' );
var babelify     = require( 'babelify' );
var browserify   = require( 'browserify' );
var source       = require( 'vinyl-source-stream' );
var buffer       = require( 'vinyl-buffer' );
var stripDebug   = require( 'gulp-strip-debug' );

// Utility plugins
var rename       = require( 'gulp-rename' );
var sourcemaps   = require( 'gulp-sourcemaps' );
var notify       = require( 'gulp-notify' );
var options      = require( 'gulp-options' );
var gulpif 			 = require( 'gulp-if' );
var cache 			 = require( 'gulp-cache' );   


// Browers related plugins
var browserSync  = require( 'browser-sync' ).create();

// Project related variables
var styleSRC     = './src/scss/style.scss';
var styleURL     = './public/css/';
var mapURL       = './';

var jsSRC        = './src/js/';
var jsFront      = 'main.js';
var jsFiles      = [ jsFront ];
var jsURL        = './public/js/';

var styleWatch   = './src/scss/**/*.scss';
var jsWatch      = './src/js/**/*.js';
var htmlWatch    = './src/**/*.html';

// Tasks
function browser_sync() {
	browserSync.init({
		// server: {
		// 	baseDir: './public/'
    // }
    proxy: 'project-template.test'

	});
}
function clearCache() {
	gulp.task('clearCache', function() {
		// Still pass the files to clear cache for
		// gulp.src('./lib/*.js')
		// .pipe(cache.clear());
		
		// Or, just call this for everything
		cache.clearAll();
	});
}

function reload(done) {
	browserSync.reload();
	done();
}

function css(done) {
	src( [ styleSRC ] )
		.pipe( sourcemaps.init() )
		.pipe( sass({
			errLogToConsole: true,
			outputStyle: 'compressed'
		}) )
		.on( 'error', console.error.bind( console ) )
		.pipe( autoprefixer({ browsers: [ 'last 2 versions', '> 5%', 'Firefox ESR' ] }) )
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( sourcemaps.write( mapURL ) )
		.pipe( dest( styleURL ) )
		.pipe( browserSync.stream() );
	done();
};

function js(done) {
	jsFiles.map( function( entry ) {
		return browserify({
			entries: [jsSRC + entry]
		})
		.transform( babelify, { presets: [ '@babel/preset-env' ] } )
		.bundle()
		.pipe( source( entry ) )
		.pipe( rename( {
			extname: '.min.js'
        } ) )
		.pipe( buffer() )
		.pipe( gulpif( options.has( 'production' ), stripDebug() ) )
		.pipe( sourcemaps.init({ loadMaps: true }) )
		.pipe( uglify() )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( dest( jsURL ) )
		.pipe( browserSync.stream() );
	});
	done();
};

function watch_files() {
	watch(styleWatch, series(css, reload));
	watch(jsWatch, series(js, reload));
	src(jsURL + 'main.min.js')
		.pipe( notify({ message: 'Gulp is Watching, Happy Coding!' }) );
}

task("css", css);
task("js", js);
task("default", parallel(css, js));
task("watch", parallel(browser_sync, watch_files), clearCache);