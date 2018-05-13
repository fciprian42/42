import * as moment			from 'moment'
import * as mongoose		from 'mongoose'

const SeriesBookMarks = mongoose.Schema({
	serie_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Series'
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

module.exports = mongoose.model('SeriesBookMarks', SeriesBookMarks);
