const { series, dest, src, watch } = require("gulp");
const handlebars = require("gulp-compile-handlebars");
const rename = require("gulp-rename");
const data = require("gulp-data");
const del = require("del");
const path = require("path");
const htmlInlineAutoprefixer = require("gulp-inline-autoprefixer");
const cleanCSS = require("gulp-clean-css");

const gtHandlebars = function() {
  var templateData = {},
    options = {
      batch: ["./src/partials"],
      helpers: {
        toLowerCase: function(str) {
          return str.toLowerCase();
        },
        increment: function(initial) {
          return initial + 1;
        },
        hideIfCountdownExpired: function(endDate) {
          const currentDate = new Date();
          const expiryDate = new Date(endDate);
          const diff = expiryDate - currentDate;

          const hasExpired = diff > 0 ? "" : "countdown--expired";

          return hasExpired;
        }
      }
    };

  return src("./src/pages/*.hbs")
    .pipe(
      data(function(file) {
        return require(`./src/data/${path.basename(file.path, ".hbs")}.json`);
      })
    )
    .pipe(handlebars(templateData, options))
    .pipe(
      rename(function(path) {
        path.extname = ".html";
      })
    )
    .pipe(dest("dist"));
};

const gtHtmlAutoprefix = function() {
  return src("./partials/styles/*.hbs")
    .pipe(htmlInlineAutoprefixer({ browsers: ["ie11"] }, {}, {}))
    .pipe(dest("./partials/styles/"));
};

const gtCleanCss = function() {
  return src("./src/partials/css/*.css")
    .pipe(cleanCSS({ compatibility: "ie11" }))
    .pipe(
      rename(function(path) {
        path.extname = ".styles.hbs";
      })
    )
    .pipe(dest("./dist/styles"));
};

const gtWatch = function() {
  return watch(
    ["./src/**/*.css", "./src/data/*.json"],
    { events: "all" },
    series(gtClean, gtCleanCss, gtHtmlAutoprefix, gtHandlebars, gtWatch)
  );
};

const gtClean = function(cb) {
  return del(["dist"]);
};

exports.clean = gtClean;
exports.watch = gtWatch;
exports.css = gtCleanCss;
exports.build = series(gtClean, gtCleanCss, gtHtmlAutoprefix, gtHandlebars);
exports.default = exports.build;
