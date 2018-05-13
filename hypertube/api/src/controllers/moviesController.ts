// import ytsScrapper	from '../services/yts'
// import rarbgToApi	from 'rarbgto-api'
// import * as EztvApi		from 'eztv-api-pt'
// import * as KatApi		from 'kat-api-pt'
import * as OmdbApi		from 'omdb-api-pt'

import auth			from '../config/auth'
import helpers		from '../helpers/tools'

import * as request	from 'request'
import * as axios	from 'axios'
// import * as cheerio	from 'cheerio'
import * as fs		from 'fs'
import * as _ from 'lodash'


const async = require("async");

const User				= require('../models/user');

const Movies			= require('../models/movies');
const MoviesHistory		= require('../models/moviesHistory');
const MoviesBookMarks	= require('../models/moviesBookmarks');

// const kat		= new KatApi({ baseUrl: 'https://katcr.co/'});
// const rarbgApi	= require('rarbg');
// const eztv = new EztvApi({ baseUrl: 'https://eztv.ag/' });

const omdb = new OmdbApi({	apiKey: auth.omdb.apiKey,
	baseUrl: "https://omdbapi.com/"
})

class moviesController {

	movies: any

	constructor() { }



	scrapMovies(from, fields, callback):any {
		let query = {}

		let sortBy = { 'Title': '1' }

		if (fields.genre)
			query["data.Genre"] = fields.genre
		if (fields.year)
			query["data.Year"] = { $gte : fields.year }

		if (fields.sort_by === "rating")
			query["data.imdbRating"] = { $gte: '7'};
		if (fields.sort_by === "date_added")
			sortBy['data.date_uploaded'] = -1;
		if (fields.rating)
			query["data.imdbRating"] = { $gte: fields.rating }

		if (fields.query_term)
			query = {'Title': { $regex: `${fields.query_term}`, $options: 'i' }};

		Movies.find(query)
			.skip((Number(fields.page) - 1) * Number(fields.limit))
			.limit(Number(fields.limit))
			.sort(sortBy)
			.exec((err, movies) => {
				if (err)
					return callback([]);

				console.log(`${movies.length} films trouvés`)
				let moviesUpdated = []

				async.forEachOf(movies, (value, key, next) => {
					MoviesHistory.findOne({imdb_id: movies[key].id, from}).exec((err, movieHistory) => {
						if (err)
							return next(err);

						MoviesBookMarks.findOne({imdb_id: movies[key].id, from}).exec((err, movieBookmarks) => {
							if (err)
								return next(err);

							let newMovie = {
								...movies[key].toJSON(),
								added: movieBookmarks ? true : null,
								seen: movieHistory ? true : null
							};

							moviesUpdated.push(newMovie);
							next();
						})
					})
				}, (err) => {
					if (err)
						return callback([]);
					return callback(moviesUpdated);
				});
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

			this.scrapMovies(req.user.id, fields, movies => {
				return resolve({movies: movies});
			})
    	});
	}


	like({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { imdb } = req.params

			const { id } = req.user

			if (!imdb)
				return reject({error: true, code: 'imdbMissing'})

			Movies.findOne({imdb_code: imdb}).exec((err, movie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!movie) movie = new Movies({imdb_code: imdb, likes: []});

				if (movie.likes.indexOf(id) !== -1)
					return reject({error: true, code: 'alreadyLiked'});

				let movieSaved = movie.toJSON()
				movieSaved.likes.push(id);

				Movies.findOneAndUpdate({imdb_code: imdb}, {likes: movieSaved.likes}).exec((err) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
					return resolve({success: true, code: 'movieLiked'});
				})
			});
		})
	}
	unlike({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { imdb } = req.params

			const { id } = req.user

			if (!imdb)
				return reject({error: true, code: 'imdbMissing'})

			Movies.findOne({imdb_code: imdb}).exec((err, movie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!movie) movie = new Movies({imdb_code: imdb, likes: []});

				if (movie.likes.indexOf(id) === -1)
					return reject({error: true, code: 'likeNeeded'});

				movie.likes =  _.remove(movie.likes, objId => { objId === id});

				Movies.findOneAndUpdate({imdb_code: imdb}, {likes: movie.likes}).exec((err) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
					return resolve({success: true, code: 'movieUnliked'});
				})
			});
		})
	}


	putComment({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { imdb } = req.params
			const { message } = req.body

			const { id } = req.user

			if (!imdb)		return reject({error: true, code: 'imdbMissing'})
			if (!message)	return reject({error: true, code: 'messageMissing'})

			Movies.findOne({imdb_code: imdb}).exec((err, movie) => {
				if (err)
					return reject({error: true, code: 'errorDb'});

				if (!movie)
					return reject({error: true, code: 'movieNotFound'});

				if (movie.comments.find( v => String(v.from) === String(id) ))
					return reject({error: true, code: 'alreadyCommented'});

				movie.comments.push({ from: id, message })

				Movies.findOneAndUpdate({imdb_code: imdb}, {comments: movie.comments}).exec((err) => {
					if (err)
						return reject({error: true, code: 'errorDb'});
					return resolve({success: true, code: 'movieCommented'});
				})
			});
		})
	}
	rmComment({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { imdb } = req.params

			const { id } = req.user

			if (!imdb)		return reject({error: true, code: 'imdbMissing'})

			Movies.findOne({imdb_code: imdb}).exec((err, movie) => {
				if (err)
					return reject({error: true, code: 'errorDb'});

				if (!movie) return reject({error: true, code: 'commentNotFound'});

				if (!movie.comments.find( v => String(v.from) === String(id) ))
					return reject({error: true, code: 'commentNotFound'});

				movie.comments = _.reject(movie.comments, v => String(v.from) === String(id));

				Movies.findOneAndUpdate({imdb_code: imdb}, {comments: movie.comments}).exec((err) => {
					if (err)
						return reject({error: true, code: 'errorDb'});
					return resolve({success: true, code: 'movieCommentRemoved'});
				})
			});
		})
	}


	findOne({req, res}) {
        return new Promise((resolve, reject): void => {
            const {imdb} = req.params
			let comments = [];

            Movies.findOne({imdb_code: imdb}).populate('likes', 'username').exec((err, movie) => {
                if (err)
                    return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

					// console.log('ici', movie);
                if (!movie)
                    return reject({error: true, code: 'movieNotFound'});

				let liked = false;
				let added = false;

				_.forEach(movie.likes, (v) => {
					if (v)
						liked = v.username === req.user.username ? true : false
					// if (v && (v.username === req.user.username))
					// 	liked = true;
				})

				MoviesBookMarks.findOne({'imdb_id': movie.id, from: req.user.id}).exec((err, bookmark) => {
					if (err)
	                    return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

					if (bookmark)
						added = true;

					async.forEachOf(movie.comments, (row, key, next) => {
						User.findById(movie.comments[key].from).exec( async (err, user) => {
							if (err || !user)
								return next(err);

							// await asyncTest(movie.comments[key].toJSON(), user)
							comments.push({...movie.comments[key].toJSON(), from: user})
							next();
						})
					}, async (err) => {
						if (err)
							console.log('HandleError in findMovieImdb');

					 	const results = comments.map( async (value) => (
							{ username: value.from.username, message: value.message, createdAt: value.createdAt }
						))

						Promise.all(results).then((completed) => {
							resolve({success: true, movie: {...movie.toJSON(), comments: completed, liked, likes: movie.likes, added}});
						});
					})
				})
            });
        });
	}

	getBookmarks({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { id } = req.user

			MoviesBookMarks.find({from: id}).populate('imdb_id').exec((err, movieBookmarks) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
				return resolve({success: true, code: 'movieBookmarksList', movieBookmarks});
			});
		})
	}

	getHistory({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { id } = req.user

			MoviesHistory.find({from: id}).populate('imdb_id').exec((err, movieHistory) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
				return resolve({success: true, code: 'movieHistoryList', movieHistory});
			});
		})
	}

	putHistory({req, res, imdb}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { id } = req.user

			if (!imdb)		return reject({error: true, code: 'imdbMissing'})

			Movies.findOne({imdb_code: imdb}).exec((err, movie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!movie)
					return reject({error: true, code: 'movieNotFound'});

				MoviesHistory.findOne({imdb_id: movie.id, from: id}).exec((err, movieHistory) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

					if (movieHistory)
						return reject({error: true, code: 'movieAlreadyInHistory'});

					let newMovieHistory = new MoviesHistory({imdb_id: movie.id, from: id});

					newMovieHistory.save();
					resolve({success: true, code: 'movieSetInHistory'});
				});
			});
		})
	}
	// rmHistory({req, res}) {
	// 	return new Promise((resolve, reject): Promise<any> => {
	// 		const { imdb } = req.params
	//
	// 		const { id } = req.user
	//
	// 		if (!imdb)		return reject({error: true, code: 'imdbMissing'})
	//
	// 		Movies.findOne({imdb_code: imdb}).exec((err, movie) => {
	// 			if (err)
	// 				return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
	//
	// 			if (!movie)
	// 				return reject({error: true, code: 'movieNotFound'});
	//
	// 			MoviesHistory.findOneAndRemove({imdb_id: movie.id, from: id}).exec((err, movieHistory) => {
	// 				if (err)
	// 					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));
	//
	// 				if (!movieHistory) return reject({error: true, code: 'movieNotInHistory'});
	//
	// 				resolve({success: true, code: 'movieHistoryRemoved'});
	// 			});
	// 		});
	// 	})
	// }

	putBookmarks({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { imdb } = req.params
			const { id } = req.user

			if (!imdb)		return reject({error: true, code: 'imdbMissing'})

			Movies.findOne({imdb_code: imdb}).exec((err, movie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!movie)
					return reject({error: true, code: 'movieNotFound'});

				MoviesBookMarks.findOne({imdb_id: movie.id, from: id}).exec((err, movieBookmarks) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

					if (movieBookmarks)
						return reject({error: true, code: 'movieAlreadyInBookmarks'});

					let newMovieBookmarks = new MoviesBookMarks({imdb_id: movie.id, from: id});

					newMovieBookmarks.save();
					resolve({success: true, code: 'movieSetInBookmarks'});
				});
			});
		})
	}
	rmBookmarks({req, res}) {
		return new Promise((resolve, reject): Promise<any> => {
			const { imdb } = req.params

			const { id } = req.user

			if (!imdb)		return reject({error: true, code: 'imdbMissing'})

			Movies.findOne({imdb_code: imdb}).exec((err, movie) => {
				if (err)
					return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

				if (!movie)
					return reject({error: true, code: 'movieNotFound'});

				MoviesBookMarks.findOneAndRemove({imdb_id: movie.id, from: id}).exec((err, movieBookmarks) => {
					if (err)
						return reject(helpers.handleError(err, {error: true, code: 'errorDb'}));

					if (!movieBookmarks) return reject({error: true, code: 'movieNotInBookmarks'});

					resolve({success: true, code: 'movieBookmarksRemoved'});
				});
			});
		})
	}

}

export default new moviesController
