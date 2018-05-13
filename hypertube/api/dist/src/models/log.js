const mongoose = require('mongoose');
var logSchema = mongoose.Schema({
    target: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
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
//# sourceMappingURL=log.js.map