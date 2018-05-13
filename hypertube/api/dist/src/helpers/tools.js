"use strict";
// import * as async		from 'async'
// import * as _			from 'lodash'
// import * as moment		from 'moment'
// import * as mongoose	from 'mongoose'
exports.__esModule = true;
// const User				= mongoose.model('User');
var languages = ["FR", "EN"];
var helpers = {
    findUser: function (email) {
        return ({
            $or: [
                { 'local.email': email }
            ]
        });
    },
    strongPassword: function (pw) {
        return pw.length > 5;
    },
    languageList: function (lang) {
        for (var i = 0; i < languages.length; i++) {
            if (languages[i] === lang)
                return true;
        }
        return false;
    }
};
exports["default"] = helpers;
