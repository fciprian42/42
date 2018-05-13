"use strict";
exports.__esModule = true;
var tools_1 = require("../helpers/tools");
var User = require('../models/user');
var profileController = {
    getProfile: function (data) {
        console.log('Fetch profile');
    },
    changeLanguage: function (_a) {
        var req = _a.req, res = _a.res;
        return new Promise(function (resolve, reject) {
            var userData = req.user;
            var lang = req.body.lang;
            if (!lang)
                return reject({ error: 'Language is missing' });
            if (!tools_1["default"].languageList(lang))
                return reject({ error: 'Language is missing or incorrect' });
            User.findOneAndUpdate(tools_1["default"].findUser(userData.local.email), { lang: lang }, function (err, result) {
                if (err)
                    return reject({ error: 'bad request' });
                if (!result)
                    return reject({ error: 'Bad request' });
                resolve({ success: true, lang: lang });
            });
        });
    }
};
exports["default"] = profileController;
