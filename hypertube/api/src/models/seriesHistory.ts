import * as moment			from 'moment'
import * as mongoose		from 'mongoose'

const SeriesHistory = mongoose.Schema({
	serie_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Series'
	},
	from: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	last_view: {
		type: Date,
		default: moment().format()
	}
});

module.exports = mongoose.model('SeriesHistory', SeriesHistory);
