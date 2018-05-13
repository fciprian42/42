import helpers from '../helpers/tools'

const User = require('../models/user');

const profileController = {
	getProfile: (data: any) => {
		console.log('Fetch profile');
	},
	changeLanguage: ({req, res}) => {
		return new Promise((resolve, reject): void => {
			const userData	= req.user
			const {lang}	= req.body

			if (!lang)
				return reject({error: true, code: 'inputMissing'});

			if (!helpers.languageList(lang))
				return reject({error: true, code: 'badRequest'});

			User.findOneAndUpdate(helpers.findUser(userData.email), {lang}, (err, result) => {
				if (err)
					return reject({error: true, code: 'badRequest'});

				if (!result)
					return reject({error: true, code: 'badRequest'});

				resolve({success: true, code: "languageUpdated", lang});
			});
		})
	},

}

export default profileController
