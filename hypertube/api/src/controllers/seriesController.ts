import * as OmdbApi		from 'omdb-api-pt'

import auth			from '../config/auth'
import helpers	from '../helpers/tools'

import * as request	from 'request'
import * as axios	from 'axios'

import * as fs		from 'fs'
import * as _ from 'lodash'

const async = require("async");

const User				= require('../models/user');

const Series			= require('../models/series');
const SeriesHistory		= require('../models/seriesHistory');
const SeriesBookMarks	= require('../models/seriesBookmarks');

const omdb = new OmdbApi({	apiKey: auth.omdb.apiKey,
	baseUrl: "https://omdbapi.com/"
})

class seriesController {

	series: any

	scrapSeries(from, fields, callback):any {
		let query = {}, sortBy = {  }

		if (fields.year)
			query["data.Year"] = { $gte : fields.year }

		if (fields.sort_by === "date_added")
			sortBy['data.date_uploaded'] = -1;
		if (fields.rating)
			query["data.imdbRating"] = { $gte: fields.rating }

		if (fields.query_term) {
			query = {'Title': { $regex: `${fields.query_term}`, $options: 'i' }};
			sortBy['Title'] = '1'
		}

		Series.find(query)
		.skip((Number(fields.page) - 1) * Number(fields.limit))
		.limit(Number(fields.limit))
		.sort(sortBy)
		.exec((err, series) => {
			if (err)
			return callback([]);

			console.log(`${series.length} series trouvés`)
			let seriesUpdated = []

			async.forEachOf(series, (value, key, next) => {
				SeriesHistory.findOne({serie_id: series[key].id, from}).exec((err, serieHistory) => {
					if (err)
						return next(err);

					SeriesBookMarks.findOne({serie_id: series[key].id, from}).exec((err, serieBookmarks) => {
						if (err)
							return next(err);

						let newSerie = {
							...series[key].toJSON(),
							added: serieBookmarks ? true : false,
							seen: serieHistory ? true : false
						};
						seriesUpdated.push(newSerie);
						next();
					})
				})
			}, (err) => {
				if (err)
					return callback([]);
				return callback(seriesUpdated);
			});
			// return callback(series);

		})
	}
	find({req, res}) {
		return new Promise(async (resolve): Promise<any> => {
			let { query }		= req.query;
			let fields			= {
				page: 1,
				limit: 10,
			}

			if (query) {
				query = (query.replace('?', '')).split('|')

				for (var i = 0; i < query.length; i++) {
					query[i] = query[i].split('=');
					if (query[i][1])
					fields = {
						...fields,
						[query[i][0]]: query[i][1]
					}
				}
			}
			this.scrapSeries(req.user.id, fields, series => {
				return resolve({series});
			})
		});
	}

	like({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { serieId } = req.params

			const { id } = req.user

			if (!serieId)
				return reject({error: true, code: 'imdbMissing'})

				console.log('Put LIKE');
			Series.findOne({'_id': serieId}).exec((err, serie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!serie)
					return reject({error: true, code: 'serieNotFound'});

				if (serie.likes.indexOf(id) !== -1)
					return reject({error: true, code: 'alreadyLiked'});

				serie.likes.push(id);

				Series.findOneAndUpdate({'_id': serieId}, {likes: serie.likes}).exec((err) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
					return resolve({success: true, code: 'serieLiked'});
				})
			});
		})
	}
	unlike({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { serieId } = req.params

			const { id } = req.user

			if (!serieId)
				return reject({error: true, code: 'imdbMissing'})

			Series.findOne({'_id': serieId}).exec((err, serie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!serie)
					return reject({error: true, code: 'serieNotFound'});

				if (serie.likes.indexOf(id) === -1)
					return reject({error: true, code: 'likeNeeded'});

				serie.likes =  _.remove(serie.likes, objId => { objId === id});

				Series.findOneAndUpdate({'_id': serieId}, {likes: serie.likes}).exec((err) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
					return resolve({success: true, code: 'serieUnliked'});
				})
			});
		})
	}

	getBookmarks({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { id } = req.user

			SeriesBookMarks.find({from: id}).populate('serie_id').exec((err, serieBookmarks) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
				return resolve({success: true, code: 'serieBookmarksList', serieBookmarks});
			});
		})
	}

	getHistory({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { id } = req.user

			SeriesHistory.find({from: id}).populate('serie_id').exec((err, serieHistory) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
				return resolve({success: true, code: 'serieHistoryList', serieHistory});
			});
		})
	}

	findOne({req, res}) {
		return new Promise((resolve, reject): void => {
			const	{ serieId }		= req.params
			let		comments	= [];

			Series.findOne({'_id': serieId}).populate('likes', 'username').exec((err, serie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!serie)
					return reject({error: true, code: 'serieNotFound'});

				let liked = false;
				let added = false;

				_.forEach(serie.likes, (v) => { if (v) liked = v.username === req.user.username ? true : false })

				SeriesBookMarks.findOne({'serie_id': serie.id, from: req.user.id}).exec((err, bookmark) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

					if (bookmark)
						added = true;

					async.forEachOf(serie.comments, (row, key, next) => {
						User.findById(serie.comments[key].from).exec( async (err, user) => {
							if (err || !user)
								return next(err);
							comments.push({...serie.comments[key].toJSON(), from: user})
							next();
						})
					}, async (err) => {
						if (err)
							console.log('HandleError in findSerieImdb');

						const results = comments.map( async (value) => (
							{ username: value.from.username, message: value.message, createdAt: value.createdAt }
						))

						Promise.all(results).then((completed) => {
							resolve({success: true, serie: {...serie.toJSON(), comments: completed, liked, likes: serie.likes, added}});
						});
					})
				})
			});
		});
	}

	putComment({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { serieId } = req.params
			const { message } = req.body

			const { id } = req.user

			if (!serieId)
				return reject({error: true, code: 'imdbMissing'})
			if (!message)
				return reject({error: true, code: 'messageMissing'})

			Series.findOne({'_id': serieId}).exec((err, serie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!serie)
					return reject({error: true, code: 'serieNotFound'});

				if (serie.comments.find( v => String(v.from) === String(id) ))
					return reject({error: true, code: 'alreadyCommented'});

				serie.comments.push({ from: id, message })

				Series.findOneAndUpdate({ '_id': serieId}, { comments: serie.comments }).exec((err) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
					return resolve({success: true, code: 'serieCommented'});
				})
			});
		})
	}
	rmComment({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { serieId } = req.params

			const { id } = req.user

			if (!serieId)	return reject({error: true, code: 'imdbMissing'})

			Series.findOne({'_id': serieId}).exec((err, serie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!serie)
					return reject({error: true, code: 'serieNotFound'});

				if (!serie.comments.find( v => String(v.from) === String(id) ))
					return reject({error: true, code: 'commentNotFound'});

				serie.comments = _.reject(serie.comments, v => String(v.from) === String(id));

				Series.findOneAndUpdate({ '_id': serieId}, { comments: serie.comments }).exec((err) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
					return resolve({success: true, code: 'serieCommentRemoved'});
				})
			});
		})
	}

	putHistory({req, res, serieId}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { id } = req.user

			console.log('putHistory: '+ serieId);
			if (!serieId || serieId === 'undefined')
				return reject({error: true, code: 'imdbMissing'})

			Series.findOne({'_id': serieId}).exec((err, serie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!serie)
					return reject({error: true, code: 'serieNotFound'});

				SeriesHistory.findOne({serie_id: serie.id, from: id}).exec((err, serieHistory) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

					if (serieHistory)
						return reject({error: true, code: 'serieAlreadyInHistory'});

					let newSerieHistory = new SeriesHistory({serie_id: serie.id, from: id});

					newSerieHistory.save();
					resolve({success: true, code: 'serieSetInHistory'});
				});
			});
		})
	}
	rmHistory({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { serieId } = req.params
			const { id } = req.user

			if (!serieId)		return reject({error: true, code: 'imdbMissing'})

			Series.findOne({'_id': serieId}).exec((err, serie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!serie)
					return reject({error: true, code: 'serieNotFound'});

				SeriesHistory.findOneAndRemove({serie_id: serie.id, from: id}).exec((err, serieHistory) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

					if (!serieHistory) return reject({error: true, code: 'serieNotInHistory'});

					resolve({success: true, code: 'serieHistoryRemoved'});
				});
			});
		})
	}

	putBookmarks({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { serieId }	= req.params
			const { id }		= req.user

			if (!serieId)		return reject({error: true, code: 'imdbMissing'})

			Series.findOne({'_id': serieId}).exec((err, serie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!serie)
					return reject({error: true, code: 'serieNotFound'});

				SeriesBookMarks.findOne({serie_id: serie.id, from: id}).exec((err, serieBookmarks) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

					if (serieBookmarks)
						return reject({error: true, code: 'serieAlreadyInBookmarks'});

					let newSerieBookmarks = new SeriesBookMarks({serie_id: serie.id, from: id});

					newSerieBookmarks.save();
					resolve({success: true, code: 'serieSetInBookmarks'});
				});
			});
		})
	}
	rmBookmarks({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { serieId } = req.params

			const { id } = req.user

			if (!serieId)		return reject({error: true, code: 'imdbMissing'})

			// console.log(serieId);
			SeriesBookMarks.findOneAndRemove({serie_id: serieId, from: id}).exec((err, serieBookmarks) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!serieBookmarks) return reject({error: true, code: 'serieNotInBookmarks'});

				resolve({success: true, code: 'serieBookmarksRemoved'});
			});
		})
	}
}

export default new seriesController
