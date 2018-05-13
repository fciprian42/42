"use strict";
exports.__esModule = true;
var auth_1 = require("../config/auth");
var request_1 = require("request");
var cheerio_1 = require("cheerio");
var OmdbApi = require('omdb-api-pt');
var omdb = new OmdbApi({
    apiKey: auth_1["default"].omdb.apiKey,
    baseUrl: 'https://omdbapi.com/'
});
var moviesController = /** @class */ (function () {
    function moviesController() {
        this.list = {
            movies: []
        };
    }
    moviesController.prototype.scrapYts = function (query, callback) {
        var self = this;
        var $;
        request_1["default"]("https://yts.am/browse-movies/" + query).then(function (error, response, body) {
            console.log(error);
            if (error)
                return callback(error);
            $ = cheerio_1["default"].load(body);
            var lengthAllMovies = $('.browse-movie-wrap').length;
            console.log(response, body, error);
            if (!lengthAllMovies)
                return callback([]);
            var pagination = $('.pagination-bordered').first().text();
            pagination = pagination.split(' of ');
            self.list.pagination = {
                actual: pagination[0],
                length: pagination[1]
            };
            $('.browse-movie-wrap').each(function (index) {
                self.list.movies.push({
                    name: $(this).find('.browse-movie-bottom a').text(),
                    year: $(this).find('.browse-movie-bottom .browse-movie-year').text(),
                    link: $(this).find('a').attr('href'),
                    img: $(this).find('.browse-movie-link img').attr('data-cfsrc')
                });
                if (index === (lengthAllMovies - 1))
                    return callback();
            });
        })["catch"](function () {
            console.log('Error request');
            return callback([]);
        });
    };
    moviesController.prototype.findMovies = function (_a) {
        var _this = this;
        var req = _a.req, res = _a.res;
        return new Promise(function (resolve, reject) {
            var query = req.query.query;
            if (!query)
                reject({ error: "Incorrect request" });
            _this.scrapYts(query, function () {
                var list = _this.list;
                _this.list = { movies: [] };
                resolve(list);
            });
        });
    };
    return moviesController;
}());
exports["default"] = new moviesController;
