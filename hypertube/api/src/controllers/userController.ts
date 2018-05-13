import * as nodemailer from 'nodemailer'
import helpers from '../helpers/tools'
import config from '../config/auth'

import multer from 'multer'
import * as fs from 'fs'

const User = require('../models/user');
const Movies = require('../models/movies');

const fileType = require('file-type');
const readChunk = require('read-chunk');
const imageType = require('image-type');

class userController {

    updateUser({req, res}) {
        return new Promise((resolve, reject): void => {
            let { firstName,
				username,
                lastName,
                email }	= req.body;
            const emailLocal			= req.user.email

			if (!firstName)
				firstName = req.user.firstName
			if (!lastName)
				lastName = req.user.lastName
			if (!email)
				email = req.user.email
			if (!username)
				username = req.user.username

            if (!firstName || !lastName || !email || !username)
                reject({error: true, code: "fieldsMissing"});

			username = username.toLowerCase();

			User.findOne({$or: [{username: username }, {email}]}).exec((err, userFound) => {
				if (err)
                    return reject({error: true, code: 'badRequest'});

				if (userFound && userFound.username === username && req.user.username !== userFound.username)
                    return reject({error: true, code: 'usernameAlreadyTaken'});
				if (userFound && userFound.email === email && req.user.email !== userFound.email)
                    return reject({error: true, code: 'emailAlreadyTaken'});

				User.findOneAndUpdate({ 'email' :  emailLocal }, {firstName, lastName, email, username}, (err, user) => {
					if (err)
						return reject({error: true, code: 'badRequest'});
					resolve({success: true, code: 'userUpdated'});
				});
			})
        });
    }
	showAvatar({req, res, next, upload}) {
		return new Promise((resolve, reject): void => {
			const { username } = req.params;

			if (!username)
				return reject({error: true, code: "badRequest"});

			User.findOne({ username }, (err, user) => {
                if (err)
                    return reject({error: true, code: 'badRequest'});
				if (!user)
					return reject({error: true, code: 'userNotFound'});

				if (fs.existsSync(`uploads/${user.id}.png`))
				    return resolve({success: true, code: 'avatarFound', src: `http://localhost:8080/uploads/${user.id}.png`});
				return resolve({success: true, code: 'avatarFound', src: `http://image.ibb.co/c564Jc/oho.jpg`});
            });
        });
	}
	uploadAvatar({req, res, next, upload}) {
		return new Promise((resolve, reject): void => {
			const { file } = req;

			if (!file)
				return reject({error: true, code: "invalidFile"});

				try {
					const buffer = readChunk.sync(`./uploads/${req.user.id}.png`, 0, 12);

					if (!imageType(buffer))
						return reject({error: true, code: "invalidFile"});
					return resolve({success: true, code: 'avatarUploaded', src: `http://localhost:8080/uploads/${req.user.id}.png`});
				} catch (Error) {
					return reject({error: true, code: "invalidFile"});
				}
        });
	}
	getThisUser({req, res}){
        return new Promise((resolve, reject): void => {
            const username = req.params.username;

            if (!username)
                return reject({error: true, code: "badRequest"});

            User.findOne({ username }, (err, user) => {
                if (err)
                    return reject({error: true, code: 'badRequest'});
                if (!user)
                    return reject({error: true, code: 'userNotFound'});

                resolve({user: user.publicInformation(), success: true, code: 'userInformation'});
            });
        });
    }
    getUser({req, res}) {
        return new Promise((resolve, reject): void => {
            const username	= req.user.username;
            const email		= req.user.email;

            User.findById(req.user.id, (err, userResponse) => {
                if (err)
                    return reject({error: true, code: 'badRequest'});

				if (!userResponse)
					return reject({error: true, code: 'userNotFound'});

				resolve({user: userResponse.privateInformation()});
            });
        });
    }
    resetFA(email): Promise<any> {
        return new Promise((resolve, reject): void => {

            if (!email)
                return reject({error: true, code: 'inputMissing'});

            User.findOneAndUpdate(helpers.findUser(email), {fa: 0}, (err, result) => {
                if (err)
                    return reject({error: true, code: 'badRequest'});

                if (!result)
                    return reject({error: true, code: 'badRequest'});

                resolve({success: true, code: "twofaResetSuccess"});
            });
        })
    }
    generateFA({req, res}): Promise<any> {
        return new Promise((resolve, reject): void => {
            const {email}	=	req.body;
            const code		=	Math.floor(Math.random() * 99999) + 10000

            if (!email)
                return reject({error: true, code: 'emailMissing'});

            User.findOneAndUpdate(helpers.findUser(email), {fa: code}, (err, result) => {
                if (err)
                    return reject({error: true, code: 'badRequest'});

                if (!result)
                    return reject({error: true, code: 'userNotFound'});

                let data = {
                    transporter: nodemailer.createTransport({
                        service: 'gmail',
                        auth: config.gmailAuth
                    }),
                    mailOptions: {
                        from: "Hypertube <hypertube@42.fr>",
                        to: email,
                        subject: "Security code",
                        text: "There is your security code to reset your password.",
                        html: `<center>There is your security code to reset your password<br/><b>${code}</b><br/><small>This code is unique.</small></center>`,
                    }
                };

                data.transporter.sendMail(data.mailOptions, function(error, info){
                    if (error)
                        return reject({error: true, code: "serviceMailCrashed"});
                    data.transporter.close();
                    resolve({success: true, to: email, generated: code, code: "twofaCodeGenerated"});
                });
            });
        })
    }
    resetPassword({req, res}): any {
        return new Promise((resolve, reject): void => {
            const {email, twofa, passwd}	=	req.body;

            if (!email || !twofa || Number(twofa) === 0 || !passwd)
                return reject({error: true, code: 'inputMissing'});

            let data = {
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
                    html: "<center><b>Votre mot de passe vient d'etre reinitialise2</b></center>",
                }
            };

            User.findOne(helpers.findUser(email), (err, user) => {
                if (err)
                    return reject({error: true, code: 'badRequest'});

                if (!user)
                    return reject({error: true, code: "userNotFound"});

                if (!user.validSecurityCode(twofa))
                    return this.resetFA(email).then(() => reject({error: true, code: "twofaInvalid"}) ).catch(() => reject({error: true, code: 'badRequest'}) );

                user.password	= user.generateHash(passwd);
                user.fa = 0;

				if (!user.password || user.password.length < 5)
					return reject({error: true, code: "passwordTooBad"});

				User.findOneAndUpdate(helpers.findUser(email), { password: user.password, fa: user.fa}).exec((err) => {
					if (err)
						return reject({error: true, code: 'badRequest'});

					data.transporter.sendMail(data.mailOptions, function(error, info){
						if (error)
							return reject({error: true, code: "serviceMailCrashed"});
						data.transporter.close();
					});
					return resolve({success: true, code: "successResetPwd", to: email});
				});
            });
        });
    }
}

// export const getUser		= userController.prototype.getUser;
// export const updateUser		= userController.prototype.updateUser;
// export const resetPassword	= userController.prototype.resetPassword;
// export const generateFA		= userController.prototype.generateFA;
// export const resetFA		= userController.prototype.resetFA;
// export const uploadAvatar		= userController.prototype.uploadAvatar;
export default new userController
