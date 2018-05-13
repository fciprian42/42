import * as moment			from 'moment'
import * as mongoose		from 'mongoose'

let Series = mongoose.Schema({
	imdb_code: {
		type: String,
		// required: true,
		// unique: true
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
});

module.exports = mongoose.model('Series', Series);
