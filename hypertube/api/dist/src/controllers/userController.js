"use strict";
exports.__esModule = true;
var nodemailer = require("nodemailer");
var tools_1 = require("../helpers/tools");
var auth_1 = require("../config/auth");
var User = require('../models/user');
var userController = /** @class */ (function () {
    function userController() {
    }
    userController.prototype.updateUser = function (_a) {
        var req = _a.req, res = _a.res;
        return new Promise(function (resolve, reject) {
            var _a = req.body, firstName = _a.firstName, lastName = _a.lastName, email = _a.email;
            var emailLocal = req.user.local.email;
            if (!firstName || !lastName || !emailLocal)
                reject({ error: "Incorrect request" });
            User.findOneAndUpdate({ 'local.email': emailLocal }, { firstName: firstName, lastName: lastName, email: email }, function (err, user) {
                if (err)
                    return reject({ error: 'bad request' });
                resolve({ success: 'Updated' });
            });
        });
    };
    userController.prototype.getUser = function (_a) {
        var req = _a.req, res = _a.res;
        return new Promise(function (resolve, reject) {
            var email = req.user.local.email;
            User.findOne({ 'local.email': email }, function (err, user) {
                if (err)
                    return reject({ error: 'bad request' });
                resolve(user.publicInformation());
            });
        });
    };
    userController.prototype.resetFA = function (email) {
        return new Promise(function (resolve, reject) {
            if (!email)
                return reject({ error: 'Input missing' });
            User.findOneAndUpdate(tools_1["default"].findUser(email), { fa: 0 }, function (err, result) {
                if (err)
                    return reject({ error: 'bad request' });
                if (!result)
                    return reject({ error: 'Bad request' });
                resolve({ success: true, message: "2FA Reset successfully" });
            });
        });
    };
    userController.prototype.generateFA = function (_a) {
        var req = _a.req, res = _a.res;
        return new Promise(function (resolve, reject) {
            var email = req.body.email;
            var code = Math.floor(Math.random() * 99999) + 10000;
            if (!email)
                return reject({ error: 'Input missing' });
            User.findOneAndUpdate(tools_1["default"].findUser(email), { fa: code }, function (err, result) {
                if (err)
                    return reject({ error: 'BadRequest' });
                if (!result)
                    return reject({ error: 'UserNotFound' });
                var data = {
                    transporter: nodemailer.createTransport({
                        service: 'gmail',
                        auth: auth_1["default"].gmailAuth
                    }),
                    mailOptions: {
                        from: "Hypertube <hypertube@42.fr>",
                        to: email,
                        subject: "Code de sécurité",
                        text: "Voici votre code de sécurité.",
                        html: "<center>Voici votre code de s\u00E9curit\u00E9<br/><b>" + code + "</b><br/><small>Ce code est \u00E0 usage unique.</small></center>"
                    }
                };
                data.transporter.sendMail(data.mailOptions, function (error, info) {
                    if (error)
                        return reject({ error: 'unable to send the mail' });
                    data.transporter.close();
                    resolve({ success: true, to: email, generated: code });
                });
            });
        });
    };
    userController.prototype.resetPassword = function (_a) {
        var _this = this;
        var req = _a.req, res = _a.res;
        return new Promise(function (resolve, reject) {
            var _a = req.body, email = _a.email, twofa = _a.twofa, passwd = _a.passwd;
            if (!email || !twofa || Number(twofa) === 0 || !passwd)
                return reject({ error: "Unable to do that" });
            var data = {
                transporter: nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: "keskisepasseentdm@gmail.com",
                        pass: "Azerty123"
                    }
                }),
                mailOptions: {
                    from: "Hypertube <hypertube@42.fr>",
                    to: email,
                    subject: "Reinitialisation mot de passe",
                    text: "Votre mot de passe vient d'etre reinitialisé",
                    html: "<center><b>Votre mot de passe vient d'etre reinitialise2</b></center>"
                }
            };
            User.findOne(tools_1["default"].findUser(email), function (err, user) {
                if (err)
                    return reject({ error: 'bad request' });
                if (!user)
                    return reject({ error: "Unable to do that" });
                if (!user.validSecurityCode(twofa))
                    _this.resetFA(email).then(function () { return reject({ error: 'invalid 2fa' }); })["catch"](function () { return reject({ error: 'Bad request' }); });
                if (!tools_1["default"].strongPassword(passwd))
                    return reject({ error: "Password too weak" });
                user.local.password = user.generateHash(passwd);
                user.fa = 0;
                user.save(function (err, userSaved) {
                    if (err)
                        return reject({ error: 'bad request' });
                    data.transporter.sendMail(data.mailOptions, function (error, info) {
                        if (error)
                            console.log('Mail not sent');
                        data.transporter.close();
                    });
                    resolve({ success: true, to: email });
                });
            });
        });
    };
    return userController;
}());
exports.getUser = userController.prototype.getUser;
exports.updateUser = userController.prototype.updateUser;
exports.resetPassword = userController.prototype.resetPassword;
exports.generateFA = userController.prototype.generateFA;
exports.resetFA = userController.prototype.resetFA;
