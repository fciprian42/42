// import * as async		from 'async'
// import * as _			from 'lodash'
// import * as moment		from 'moment'
// import * as mongoose	from 'mongoose'

// const User				= mongoose.model('User');
const languages = ["FR", "EN"];

const helpers = {
	findUser: (email) => {
		return ({
			$or: [
				{'email': email}
			]
		})
	},
	getEpisodeSeason: (info) => {
		if (!info || !info[0])
			return [0, 0]
		return info[0].split('E')
	},
	strongPassword: (pw) => {
		return pw.length > 5
	},
	languageList: (lang) => {
		for (let i = 0; i < languages.length; i++) {
			if (languages[i] === lang)
				return true
		}
		return false
	},
	handleError: (err, json) => {
		console.log(err);
		return json
	},
};

export default helpers
