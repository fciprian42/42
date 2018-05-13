const mongoose = require('mongoose');

var logSchema = mongoose.Schema({
	target			: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	// movies			: {
	// 	imdb_code
	//  magnet
	// },
});

// logSchema.methods.publicInformation = function() {
//     return {
// 		username: undefined,
// 		firstName: this.firstName,
// 		lastname: this.lastName,
// 		email: this.local.email,
// 		lang: this.lang
// 	}
// };

module.exports = mongoose.model('Log', logSchema);
