import * as passportLocal from 'passport-local'

import auth from '../config/auth'

import helpers from '../helpers/tools'

const LocalStrategy		= passportLocal.Strategy
const FacebookStrategy	= require('passport-facebook').Strategy;
const FortyTwoStrategy	= require('passport-42').Strategy;
const GoogleStrategy	= require('passport-google-oauth').OAuth2Strategy;

const User       = require('../models/user');

const passportConfig = function(passport) {

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => User.findById(id, (err, user) => done({error: true, code: "errorDb"}, user) ));

passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true,
		session: false
}, (req, email, password, done) => {
    if (email)
        email = email.toLowerCase();

    process.nextTick(function () {
        User.findOne({ $or: [{email}, {username: email }]  }, function(err, user) {
            if (err)
                return done({error: true, code: "errorDb"});

            if (!user)
                return done({error: true, code: "userNotFound"});

			if (!user.password)
                return done({error: true, code: "userIsOauth"});

            if (!user.validPassword(password, user.password))
                return done({error: true, code: "badPassword"});

			return done(null, user.publicInformation());
        });
    });
}));

passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true,
	session: false
}, (req, email, password, done) => {
    if (email)
        email = email.toLowerCase();

    let {username, firstName, lastName} = req.body

	if (!username) return done(helpers.handleError(null, {error: true, code: 'usernameMissing'}));
	if (!firstName) return done(helpers.handleError(null, {error: true, code: 'firstNameMissing'}));
	if (!lastName) return done(helpers.handleError(null, {error: true, code: 'lastNameMissing'}));

	if (!password || password.length < 5) return done(helpers.handleError(null, {error: true, code: 'passwordTooBad'}));

	username = username.toLowerCase()

    process.nextTick(() => {
        if (!req.user) {
            User.findOne({ $or: [{ email }, { username }] }, (err, user) => {
                if (err)
                    return done(helpers.handleError(err, {error: true, code: "errorDb"}));

                if (user && user.email === email) return done(helpers.handleError(err, {error: true, code: 'emailAlreadyTaken'}));
                if (user && user.username === username) return done(helpers.handleError(err, {error: true, code: 'usernameAlreadyTaken'}));

                let newUser            = new User();

                newUser.firstName		= firstName;
                newUser.lastName		= lastName;
                newUser.username		= username;

                newUser.email			= email;
                newUser.password		= newUser.generateHash(password);
				newUser.lang			= "EN";

                newUser.save(err => {
                    if (err)
                        return done(helpers.handleError(err, {error: true, code: "errorDb"}));

                    return done(null, newUser.publicInformation());
                });
            });
        }
		else
            return done(null, req.user);
    });
}));

let fbStrategy = auth.facebookAuth;

passport.use(new FacebookStrategy(fbStrategy, (req, token, refreshToken, profile, done) => {

    process.nextTick(() => {

        User.findOne({ 'authid' : profile.id }, (err, user) => {
            if (err)
                return done(helpers.handleError(err, {error: true, code: "errorDb"}));

            if (user) {
				if (!user.token) {
					User.findOneAndUpdate({ 'authid' : profile.id }, { token }).exec((err) => {
						if (err)
							return done(helpers.handleError(err, {error: true, code: "errorDb"}));
						return done(null, user);
					})
				} else
					return done(null, user);
            } else {
                let newUser            = new User();

                newUser.authid		= profile.id;
                newUser.token		= token;
                newUser.firstName	= profile.name.givenName;
                newUser.lastName	= profile.name.familyName;
                newUser.email		= (profile.emails[0].value || '').toLowerCase();

				User.findOne({email: newUser.email}).exec((err, u) => {
					if (err)
						return done(helpers.handleError(err, {error: true, code: "errorDb"}));

					if (u)
						return done(helpers.handleError(null, {error: true, code: "emailAlreadyTaken"}));

					newUser.save(err => {
						if (err)
							return done(helpers.handleError(err, {error: true, code: "errorDb"}));
						return done(null, newUser);
					});
				});
            }
        });
    });
}));

	let fortytwo = auth.fortytwoAuth;

    passport.use(new FortyTwoStrategy(fortytwo, (req, token, refreshToken, profile, done) => {

        process.nextTick(() => {

            User.findOne({ authid : profile.id }, (err, user) => {
                if (err)
                    return done(helpers.handleError(err, {error: true, code: "errorDb"}));

                if (user) {
                    if (!user.token) {
						User.findOneAndUpdate({ authid : profile.id }, {token}).exec((err) => {
							if (err)
								return done(helpers.handleError(err, {error: true, code: "errorDb"}));
							return done(null, user);
						})
                    } else
						return done(null, user);

                } else {
                    let newUser            = new User();

                    newUser.authid		= profile.id;
                    newUser.token		= token;
                    newUser.firstName	= profile.name.givenName
                    newUser.lastName	= profile.name.familyName;
                    newUser.email		= (profile.emails[0].value || '').toLowerCase();

					User.findOne({email: newUser.email}).exec((err, u) => {
						if (err)
							return done(helpers.handleError(err, {error: true, code: "errorDb"}));

						if (u)
							return done(helpers.handleError(null, {error: true, code: "emailAlreadyTaken"}));

	                    newUser.save(err => {
	                        if (err)
	                            return done(helpers.handleError(err, {error: true, code: "errorDb"}));

	                        return done(null, newUser);
	                    });
					});
                }
            });
        });
    }));

	//++++++++++++++++++
	//+++ GOOGLE
	//++++++++++++++++++


	let google = auth.googleAuth;

    passport.use(new GoogleStrategy(google, (token, refreshToken, profile, done) => {

        process.nextTick(() => {

            User.findOne({ authid : profile.id }, (err, user) => {
                if (err)
                    return done(helpers.handleError(err, {error: true, code: "errorDb"}));

                if (user) {
                    if (!user.token) {
						User.findOneAndUpdate({ authid : profile.id }, {token}).exec((err) => {
							if (err)
								return done(helpers.handleError(err, {error: true, code: "errorDb"}));
							return done(null, user);
						})
                    } else
						return done(null, user);

                } else {
                    let newUser            = new User();

                    newUser.authid		= profile.id;
                    newUser.token		= token;
                    newUser.firstName	= profile.name.givenName
                    newUser.lastName	= profile.name.familyName;
                    newUser.email		= (profile.emails[0].value || '').toLowerCase();

					User.findOne({email: newUser.email}).exec((err, u) => {
						if (err)
							return done(helpers.handleError(err, {error: true, code: "errorDb"}));

						if (u)
							return done(helpers.handleError(null, {error: true, code: "emailAlreadyTaken"}));

	                    newUser.save(err => {
	                        if (err)
	                            return done(helpers.handleError(err, {error: true, code: "errorDb"}));

	                        return done(null, newUser);
	                    });
                	});
                }
            });
        });
    }));
};

export default passportConfig
