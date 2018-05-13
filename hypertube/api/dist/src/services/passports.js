"use strict";
exports.__esModule = true;
var passportLocal = require("passport-local");
var LocalStrategy = passportLocal.Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var FortyTwoStrategy = require('passport-42').Strategy;
var User = require('../models/user');
var auth_1 = require("../config/auth");
var passportConfig = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        if (email)
            email = email.toLowerCase();
        console.log(email, password);
        process.nextTick(function () {
            User.findOne({ 'local.email': email }, function (err, user) {
                if (err)
                    return done(err);
                if (!user)
                    return done({ 'errorMessage': "userNotFound" });
                if (!user.validPassword(password, user.local.password))
                    return done({ 'errorMessage': "invalidPassword" });
                return done(null, user.publicInformation());
            });
        });
    }));
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
        process.nextTick(function () {
            if (!req.user) {
                User.findOne({ 'local.email': email }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user)
                        return done({ 'errorMessage': 'emailAlreadyTaken' });
                    else {
                        var newUser_1 = new User();
                        newUser_1.local.email = email;
                        newUser_1.local.password = newUser_1.generateHash(password);
                        newUser_1.lang = "EN";
                        newUser_1.save(function (err) {
                            if (err)
                                return done(err);
                            return done(null, newUser_1.publicInformation());
                        });
                    }
                });
            }
            else if (!req.user.local.email) {
                User.findOne({ 'local.email': email }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user)
                        return done({ 'errorMessage': 'emailAlreadyTaken' });
                    else {
                        var user_1 = req.user;
                        user_1.local.email = email;
                        user_1.local.password = user_1.generateHash(password);
                        user_1.lang = "EN";
                        user_1.save(function (err) {
                            if (err)
                                return done(err);
                            return done(null, user_1.publicInformation());
                        });
                    }
                });
            }
            else
                return done(null, req.user);
        });
    }));
    var fbStrategy = auth_1["default"].facebookAuth;
    fbStrategy.passReqToCallback = true;
    passport.use(new FacebookStrategy(fbStrategy, function (req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
            // check if the user is already logged in
            if (!req.user) {
                User.findOne({ 'facebook.id': profile.id }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebook.email = (profile.emails[0].value || '').toLowerCase();
                            user.save(function (err) {
                                if (err)
                                    return done(err);
                                return done(null, user);
                            });
                        }
                        return done(null, user); // user found, return that user
                    }
                    else {
                        // if there is no user, create them
                        var newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
                        newUser.save(function (err) {
                            if (err)
                                return done(err);
                            return done(null, newUser);
                        });
                    }
                });
            }
            else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user; // pull the user out of the session
                user.facebook.id = profile.id;
                user.facebook.token = token;
                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = (profile.emails[0].value || '').toLowerCase();
                user.save(function (err) {
                    if (err)
                        return done(err);
                    return done(null, user);
                });
            }
        });
    }));
    var fortytwo = auth_1["default"].fortytwoAuth;
    console.log('Passport');
    // passport.use(new FortyTwoStrategy({
    //     clientID: fortytwo.clientID,
    //     clientSecret: fortytwo.clientSecret,
    //     callbackURL: fortytwo.callbackURL
    //   },
    //   function(accessToken, refreshToken, profile, cb) {
    // 	  	console.log('Profile '+ profile)
    // 		User.findOrCreate({ fortytwoId: profile.id }, function (err, user) {
    // 			return cb(err, user);
    // 		});
    //   }
    // ));
    fortytwo.passReqToCallback = true;
    passport.use(new FortyTwoStrategy(fortytwo, function (req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
            console.log('Passport');
            // check if the user is already logged in
            if (!req.user) {
                User.findOne({ 'fortytwo.id': profile.id }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.fortytwo.token) {
                            user.fortytwo.token = token;
                            user.fortytwo.name = profile.name.givenName + ' ' + profile.name.familyName;
                            user.fortytwo.email = (profile.emails[0].value || '').toLowerCase();
                            user.save(function (err) {
                                if (err)
                                    return done(err);
                                return done(null, user);
                            });
                        }
                        return done(null, user); // user found, return that user
                    }
                    else {
                        // if there is no user, create them
                        var newUser = new User();
                        newUser.fortytwo.id = profile.id;
                        newUser.fortytwo.token = token;
                        newUser.fortytwo.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.fortytwo.email = (profile.emails[0].value || '').toLowerCase();
                        newUser.save(function (err) {
                            if (err)
                                return done(err);
                            return done(null, newUser);
                        });
                    }
                });
            }
            else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user; // pull the user out of the session
                user.fortytwo.id = profile.id;
                user.fortytwo.token = token;
                user.fortytwo.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.fortytwo.email = (profile.emails[0].value || '').toLowerCase();
                user.save(function (err) {
                    if (err)
                        return done(err);
                    return done(null, user);
                });
            }
        });
    }));
};
exports["default"] = passportConfig;
