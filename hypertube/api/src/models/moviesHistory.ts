import * as moment			from 'moment'
import * as mongoose		from 'mongoose'

const MoviesHistory = mongoose.Schema({
	imdb_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Movies'
	},
	from: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	createdAt: {
		type: Date,
		default: moment().format()
	}
});

module.exports = mongoose.model('MoviesHistory', MoviesHistory);
