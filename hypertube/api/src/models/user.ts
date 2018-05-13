const mongoose	= require('mongoose');
const bcrypt	= require('bcrypt-nodejs');
// const Movies	= require('./movies');

let userSchema = mongoose.Schema({
    // local			: {
  		email		: {
			type: String,
		},
        password	: String,
		token		: String,
		authid		: String,
		token		: String,
    // },
    // facebook		: {
    //     id			: String,
    //     token		: String,
    //     firstName	: String,
    //     lastName	: String,
    //     email		: {
	// 		type: String,
	// 	}
    // },
	// fortytwo		: {
    //     id			: String,
    //     token		: String,
    //     firstName	: String,
    //     lastName	: String,
    //     email		: {
	// 		type: String,
	// 	}
    // },
    // twitter			: {
    //     id			: String,
    //     token		: String,
    //     displayName	: String,
    //     username	: String
    // },
    // google			: {
    //     id			: String,
    //     token		: String,
    //     email		: String,
    //     name		: String
    // },
	firstName		: String,
	lastName		: String,
  	username		: {
		type: String,
	},
	lang : {
		type: String,
		required: true,
		default: 'EN'
	},
	fa				: Number,
});

userSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = (password, crypted) => {
	if (!password || !crypted)
		return false
    return bcrypt.compareSync(password, crypted);
};

userSchema.methods.validSecurityCode = function(twoFa) {
    return (Number(twoFa) === this.fa ? true : false);
};

userSchema.methods.publicInformation = function() {
    return {
		id: this.id,
		username: this.username,
		firstName: this.firstName,
		lastname: this.lastName,
		// email: this.email,
		lang: this.lang,
	}
};

userSchema.methods.privateInformation = function() {
    return {
		id: this.id,
		username: this.username,
		firstName: this.firstName,
		lastname: this.lastName,
		email: this.email,
		lang: this.lang,
	}
};

module.exports = mongoose.model('User', userSchema);
