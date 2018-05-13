import * as moment			from 'moment'
import * as mongoose		from 'mongoose'

let Movies = mongoose.Schema({
	imdb_code: {
		type: String,
		required: true,
		unique: true
	},
	data: {
		type: Object,
		default: {},
	},
	comments: [{
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		message: String,
		createdAt: {
			type: Date,
			default: moment().format()
		},
	}],
	likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	Title: {
		type: String,
	},
	last_view: {
		type: Date,
		default: moment().format()
	},
	torrents: {
		type: Array,
		default: []
	},
	typeStream: {
		type: String,
		default: 'movie'
	}
}, { usePushEach: true });

// Movies.methods.cleanInformation = function() {
//     return {
// 		imdb_code: this.imdb_code,
// 		data: this.data,
// 		Title: this.Title,
// 		last_view: this.last_view,
// 		torrents: this.torrents,
// 		typeStream: this.typeStream,
// 	}
// };
module.exports = mongoose.model('Movies', Movies);
