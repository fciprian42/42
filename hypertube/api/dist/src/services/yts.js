"use strict";
exports.__esModule = true;
var request = require("request");
var baseURL = "http://yts.ag/api/v2";
var self;
var ytsScrapper = /** @class */ (function () {
    function ytsScrapper() {
    }
    ytsScrapper.prototype.print_torrents = function () {
        var torrents = this.movies;
        if (torrents) {
            for (var i = 0; i < torrents.length; i++) {
                console.log("==========================================================================================");
                console.log("Title : " + torrents[i].title);
                console.log("IMDB Code : " + torrents[i].imdb_code);
                console.log("URL : " + torrents[i].url);
                console.log("ID : " + torrents[i].id);
                console.log("Rating : " + torrents[i].rating);
                console.log("==========================================================================================");
            }
        }
    };
    ytsScrapper.prototype.search = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var rawData = '';
            var res = request.get(baseURL + "/list_movies.json?query_term=" + encodeURI(query));
            res.on('data', function (chunk) { rawData += chunk; });
            res.on('end', function () {
                try {
                    var movies = JSON.parse(rawData);
                    _this.movies = movies.data.movies;
                    if (!movies.data.movies)
                        return reject();
                    return resolve(movies.data.movies);
                }
                catch (Error) {
                    reject();
                }
            });
        });
    };
    return ytsScrapper;
}());
exports["default"] = ytsScrapper;
