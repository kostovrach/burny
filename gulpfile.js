import gulp from 'gulp';
import fileInclude from 'gulp-file-include';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import browserSyncLib from 'browser-sync';
import { deleteAsync } from 'del';
import { fileURLToPath } from 'url';
import { dirname, basename, join } from 'path';
import fs from 'fs';
import fg from 'fast-glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);
const browserSync = browserSyncLib.create();

const paths = {
  html: {
    src: 'src/pages/*.html',
    watch: [
      'src/pages/**/*.html', 
      'src/components/**/*.html', 
      'src/layout/**/*.html'
    ],
    dest: 'src/',
  },
  styles: {
    src: 'src/scss/style.scss',
    watch: [
      'src/scss/**/*.scss',
      'src/components/**/*.scss',
      'src/pages/**/*.scss',
      'src/tech/**/*.scss',
    ],
    dest: 'src/css/',
  },
  scripts: {
    src: [
      'node_modules/@studio-freight/lenis/dist/lenis.min.js',
      'node_modules/swiper/swiper-bundle.js', 
      'node_modules/@fancyapps/ui/dist/fancybox/fancybox.umd.js',
      'node_modules/gsap/dist/gsap.min.js',
      'node_modules/gsap/dist/ScrollTrigger.min.js',
      'src/js/libs/*.js',
      'src/js/**/*.js', 
      '!src/js/main.min.js'
    ],
    dest: 'src/js/',
  },
  build: {
    dest: 'build/',
    copy: [
      'src/**/*.html',
      'src/favicon.ico',
      '!src/components/**/*.html',
      '!src/pages/**/*.html',
      'src/css/style.min.css',
      'src/js/main.min.js',
      'src/js/**/*.json'
    ],
    assets: 'src/assets/**/*'
  }
};

// Генерация _components.scss, _pages.scss и _tech.scss с @forward
async function generateScssIndex() {
  const targetDirs = ['src/scss/components', 'src/scss/pages', 'src/scss/tech'];

  await Promise.all(targetDirs.map(async (dirPath) => {
    const folderName = basename(dirPath);
    const scssFiles = await fg('**/*.scss', {
      cwd: dirPath,
      onlyFiles: true,
      ignore: [`**/_${folderName}.scss`, '**/style.scss', '**/*.min.css'],
    });

    const forwards = scssFiles
      .map(file => {
        const withoutExt = file.replace(/\.scss$/, '');
        return `@forward '${withoutExt.startsWith('_') ? withoutExt.slice(1) : withoutExt}';`;
      })
      .join('\n');

    const targetFilePath = join(dirPath, `_${folderName}.scss`);

    // Исключение перезаписи при отсутствии изменений
    const previousContent = fs.existsSync(targetFilePath)
      ? fs.readFileSync(targetFilePath, 'utf8')
      : '';

    if (previousContent !== forwards) {
      fs.writeFileSync(targetFilePath, forwards);
      console.log(`Updated: ${targetFilePath}`);
    } else {
      console.log(`Skipped (no changes): ${targetFilePath}`);
    }
  }));
}

// HTML
function html() {
  return src(paths.html.src)
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// SCSS
function stylesTask() {
  return src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(concat('style.min.css'))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Обёртка: generate + компиляция
const styles = series(generateScssIndex, stylesTask);

// JS
function scripts() {
  return src(paths.scripts.src)
    .pipe(concat('main.min.js'))
    .pipe(terser())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Clean build folder
function clean() {
  return deleteAsync([paths.build.dest]);
}

// Copy text files to build/
function copyTextFiles() {
  return src(paths.build.copy, { 
    base: 'src',
    allowEmpty: true,
  })
    .pipe(dest(paths.build.dest));
}

// Copy binary files (images, fonts, etc.) to build/
function copyAssets() {
  return src(paths.build.assets, { 
    base: 'src',
    allowEmpty: true,
    encoding: false
  })
  .pipe(dest(paths.build.dest));
}

const copyToBuild = parallel(copyTextFiles, copyAssets);

// Watcher
function serve() {
  browserSync.init({
    server: { baseDir: 'src/' },
    notify: false,
    open: true,
  });

  watch(paths.html.watch, html);
  watch(paths.styles.watch, series(generateScssIndex, stylesTask));
  watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts);
}

// Основные таски
export { styles, scripts, html, serve, generateScssIndex, copyAssets };
export const build = series(clean, generateScssIndex, html, styles, scripts, copyToBuild);
export default series(generateScssIndex, parallel(html, styles, scripts), serve);