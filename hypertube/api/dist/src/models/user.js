var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({
    local: {
        email: String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    fortytwo: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    firstName: String,
    lastName: String,
    lang: {
        type: String,
        required: true,
        "default": 'EN'
    },
    fa: Number
});
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
userSchema.methods.validPassword = function (password, crypted) {
    return bcrypt.compareSync(password, crypted);
};
userSchema.methods.validSecurityCode = function (twoFa) {
    return (Number(twoFa) === this.fa ? true : false);
};
// userSchema.methods.resetPassword = function(twoFa, crypted) {
//     return (fa === this.twoFa ? true : false);
// };
userSchema.methods.publicInformation = function () {
    return {
        username: undefined,
        firstName: this.firstName,
        lastname: this.lastName,
        email: this.local.email,
        lang: this.lang
    };
};
module.exports = mongoose.model('User', userSchema);
