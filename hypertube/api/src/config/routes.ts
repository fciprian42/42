const fs			= require('fs')
const url			= require("url");
const path			= require("path");

import _ from 'lodash'

const torrentStream	= require('torrent-stream');

// import { getUser, updateUser, resetPassword, generateFA, uploadAvatar } from '../controllers/userController'

import userController from '../controllers/userController'
import moviesController		from '../controllers/moviesController'
import seriesController		from '../controllers/seriesController'
import profileController	from '../controllers/profileController'

import auth from './auth'
import trackers		from '../helpers/trackers'

import * as multer from 'multer'

const User = require('../models/user');

// const OmdbApi = require('omdb-api-pt')
const yifysubtitles = require('yifysubtitles');
// const ysa = require('yifysubtitles-api');
// const omdb = new OmdbApi({
//   apiKey: auth.omdb.apiKey,
//   baseUrl: 'https://omdbapi.com/',
// })
// const ffmpeg = require('@ffmpeg-installer/ffmpeg');
var ffmpeg = require('fluent-ffmpeg');


const srt2vtt	= require('srt-to-vtt')
const srt		= require('srt-stream');

const jwt	= require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

const { exec } = require('child_process');

const formatSupported = ["image/png", "image/jpeg"];

const storage = multer.diskStorage({
    destination	:	(req, file, cb) => exec('mkdir -p ./uploads', err => cb(err, './uploads')),
	filename	:	(req, file, cb) => cb(null, `${req.user.id}.png`),
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
	if (formatSupported.find((q) => q === file.mimetype))
		return cb(null, true);
	return cb(null, false)
}, fileSize: 5000000 });

const routes = (app, passport) => {

	// *****************************
	// ******* PREFERENCES USERS
	// *****************************

	app.get('/api/users/me', isLoggedIn, (req, res) => {
		userController.getUser({req, res})
			.then(data => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.get('/api/users/:username', isLoggedIn, (req, res) => {
        userController.getThisUser({req, res})
			.then(data => res.json({...data}))
			.catch(err => res.json({...err}));
	});


	app.post('/api/users/me', isLoggedIn, (req, res) => {
		userController.updateUser({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.post('/api/reset', (req, res) => {
		userController.resetPassword({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.post('/api/reset/generate', (req, res) => {
		userController.generateFA({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.get('/api/users/avatar/:username', (req, res) => {
		userController.showAvatar({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.post('/api/users/avatar', isLoggedIn, upload.single('file'), (req, res, next) => {
		userController.uploadAvatar({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.post('/api/profile/language/change', isLoggedIn, (req, res) => {
		profileController.changeLanguage({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});


	// *****************************
	// ******* MOVIES
	// *****************************

	app.get('/api/movies/find', isLoggedIn, (req, res) => {
		moviesController.find({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json(err));
	});

	app.get('/api/series/find', isLoggedIn, (req, res) => {
		seriesController.find({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json(err));
	});

	app.get('/api/bookmarks/movies', isLoggedIn, (req, res) => {
		moviesController.getBookmarks({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json(err));
	});

	app.get('/api/bookmarks/series', isLoggedIn, (req, res) => {
		seriesController.getBookmarks({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json(err));
	});

	//+++++++++
	// MOVIES | LIKE / UNLIKE
	//+++++++++

	app.get('/api/movies/:imdb/like', isLoggedIn, (req, res) => {
		moviesController.like({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.delete('/api/movies/:imdb/like', isLoggedIn, (req, res) => {
		moviesController.unlike({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	//+++++++++
	// SERIES | LIKE / UNLIKE
	//+++++++++

	app.get('/api/series/:serieId/like', isLoggedIn, (req, res) => {
		seriesController.like({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.delete('/api/series/:serieId/like', isLoggedIn, (req, res) => {
		seriesController.unlike({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	//+++++++++
	// MOVIES | COMMENT
	//+++++++++

	app.post('/api/movies/:imdb/comment', isLoggedIn, (req, res) => {
		moviesController.putComment({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.delete('/api/movies/:imdb/comment', isLoggedIn, (req, res) => {
		moviesController.rmComment({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	//+++++++++
	// SERIES | COMMENT
	//+++++++++

	app.post('/api/series/:serieId/comment', isLoggedIn, (req, res) => {
		seriesController.putComment({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.delete('/api/series/:serieId/comment', isLoggedIn, (req, res) => {
		seriesController.rmComment({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	//+++++++++
	// MOVIES | HISTORY
	//+++++++++

	app.get('/api/movies/history', isLoggedIn, (req, res) => {
		moviesController.getHistory({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.post('/api/movies/:imdb/history', isLoggedIn, (req, res) => {
		moviesController.putHistory({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	//+++++++++
	// SERIES | HISTORY
	//+++++++++

	app.get('/api/series/history', isLoggedIn, (req, res) => {
		seriesController.getHistory({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.post('/api/series/:serieId/history', isLoggedIn, (req, res) => {
		seriesController.putHistory({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	//+++++++++
	// MOVIES | BOOKMARKS
	//+++++++++

	app.post('/api/movies/:imdb/bookmarks', isLoggedIn, (req, res) => {
		moviesController.putBookmarks({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.delete('/api/movies/:imdb/bookmarks', isLoggedIn, (req, res) => {
		moviesController.rmBookmarks({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

    app.get('/api/movies/:imdb', isLoggedIn, (req, res) => {
        moviesController.findOne({req, res}).then((data) => {
            res.json({...data});
        }).catch(err => res.json({...err}));
    });

	//+++++++++
	// SERIES | BOOKMARKS
	//+++++++++

	app.post('/api/series/:serieId/bookmarks', isLoggedIn, (req, res) => {
		seriesController.putBookmarks({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

	app.delete('/api/series/:serieId/bookmarks', isLoggedIn, (req, res) => {
		seriesController.rmBookmarks({req, res})
			.then((data) => res.json({...data}))
			.catch(err => res.json({...err}));
	});

    app.get('/api/series/:serieId', isLoggedIn, (req, res) => {
        seriesController.findOne({req, res}).then((data) => {
            res.json({...data});
        }).catch(err => res.json({...err}));
    });


	// *****************************
	// ******* STREAM TORRENT
	// *****************************

	const getTorrent = (hash) => new Promise((resolve) => {
	    let movie: any = '';

		console.log('hash -> ' , hash);
	    const engine: any = torrentStream(hash, {
			connections: 1000,		// Max amount of peers to be connected to.
			uploads: 0,				// Number of upload slots.
			tmp: 'public/stream',	// Root folder for the files storage.
			path: `public/stream/my-file`,	// Where to save the files. Overrides `tmp`.
			verify: true,
			tracker: true,
			trackers
	    });

	    engine.on('ready', () => {
			engine.files.forEach((file, key) => {
				if (file.length > 50000000) { // More than 50mb
					console.log("LE TORRENT EST PRET");

					const w = path.extname(file.name);
					movie = file;
					movie.size = file.length;
					movie.path = (w: string) => `public/upload/${engine.torrent.name}/${file.name.replace(w, '')}${w}`;
					resolve(movie);
				} else {
					console.log(file);
				}
			});
	    });

	    engine.on('download', (piece: number) => {
			console.log(`${piece.toString().padStart(3)} - Loading: ${engine.swarm.downloaded} / ${movie.size}`);
			console.log(`-- Progress: ${Math.floor((engine.swarm.downloaded / movie.length) * 100)} % --`);
	    });
	})

	app.get('/api/subtitle', (req, res) => {
		const { imdb, lang } = req.query

		if (!imdb || imdb === 'undefined') {
			console.log('Aucun sous titre');
			res.writeHead(200, { "Content-Type": 'text/vtt' });
			return fs.createReadStream('./public/default.vtt').pipe(res)
		}

		const getSub = ({imdb, lang}, callback) => {
			yifysubtitles(imdb, {
				path: './public/subtitles',
				langs: ['en', 'fr']
			}).then(resp => {

				if (!resp || resp.length < 1)
					return callback('./public/default.vtt');

				resp.forEach((value, key) => {
					console.log(key);
					if (value && value.langShort === lang && value.path) {
						console.log('Langue trouvé, ' , value.path);
						return callback(value.path);
					}
					// if (key === 1) {
					// 	console.log('Langue non trouve');
					// 	return callback();
					// }
					if (resp.length - 1 === key && value.langShort !== lang) {
						console.log('NO SUBTITLE');
						return callback('./public/default.vtt');
					}
				})
			}).catch(err => callback(null));
		}

		getSub({imdb, lang}, (vtt) => {
			res.writeHead(200, { "Content-Type": 'text/vtt' });

			if (vtt) {
				console.log('Envoi des sous titres', vtt);
				return fs.createReadStream(vtt).pipe(res)
			}
			else {
				console.log('Pas de sous titre');
				return fs.createReadStream('./public/default.vtt').pipe(res)
			}
		})
	})

	app.get('/api/stream', (req, res) => {
		const {hash, id, imdb, token} = req.query

		if (token)
			req.headers.authorization = token

		isLoggedIn(req, res, async () => {
			if (id)
				seriesController.putHistory({req, res, serieId: id}).then(data => console.log('Serie added to history !')).catch(err => console.log(err));
			else if (imdb)
				moviesController.putHistory({req, res, imdb}).then(data => console.log('Movie added to history !')).catch(err => console.log(err));

			const torrent = await getTorrent(hash);

			let range = req.headers.range;

			let positions = range.replace(/bytes=/, "").split("-");
			let start = parseInt(positions[0], 10);
			let end = positions[1] ? parseInt(positions[1], 10) : torrent.size - 1;

			if (!end) end = torrent.size - 1;
			const chunksize = (end - start) + 1;

			const head = {
				'Content-Range': 'bytes ' + start + '-' + end + '/' + torrent.size,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunksize,
				'Content-Type': 'application/vnd.apple.mpegurl'
			};
			res.writeHead(206, head);

			const stream_position = { start, end };

			let command = ffmpeg(torrent).videoCodec('libx264').output(torrent.createReadStream(stream_position).pipe(res));
			// var command = ffmpeg(torrent.createReadStream(stream_position));
			// var command = ffmpeg(torrent.createReadStream(stream_position)).pipe(res);
		})
	})

	// *****************************
	// ******* AUTH
	// *****************************

	app.get('/api/auth', (req, res) => {
		const token = req.headers.authorization

		// console.log('Votre token : ' + token);
		jwt.verify(token, 'ilovescotchyscotch', (err, verifiedToken) => {
			// console.log('Parsing token: ', verifiedToken);
			if (err || !verifiedToken.id)
				return res.status(200).json({error: true, online: false, code: "notConnected"});

			User.findById(verifiedToken.id).exec((err, user) => {
				if (err)
					return res.status(200).json({error: true, online: false, code: "errorDb"});

				if (!user)
					return res.status(200).json({error: true, online: false, code: "badToken"});
				console.log('Connected as -', user.username);
				return res.status(200).json({success: true, online: true, code: "connected", user: user.privateInformation()});
			})
		});
	});

	app.post('/api/login', (req, res, next) => {
		passport.authenticate('local-login', (err, user, info) => {
			if (err)
				return res.json(err);

			if (info)
				return res.status(200).json({error: true, code: "inputMissing"});

			return res.json({success: true, code: "successLogin", token: jwt.sign({id: user.id}, 'ilovescotchyscotch', {}), user})
		})(req, res, next);
	});

	app.post('/api/signup', (req, res) => {
		passport.authenticate('local-signup', (err, user) => {
			if (err)
				return res.status(200).json(err);
			return res.json({success: true, code: "successSignup", user: user, token: jwt.sign({id: user.id}, 'ilovescotchyscotch', {})});
		})(req, res)
	});

	app.get('/api/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

	app.get('/api/auth/facebook/callback', (req, res) => {
		passport.authenticate('facebook', (err, user, info) => {
			if (err)
				return res.redirect(`http://localhost:3000/`);

			const token = jwt.sign({id: user.id}, 'ilovescotchyscotch', {});

            return res.redirect(`http://localhost:3000/oauth/token?=${token}`);
		})(req, res);
	});

	app.get('/api/auth/42', (req, res) => {
		passport.authenticate('42')(req, res)
	});

	app.get('/api/auth/42/callback', (req, res) => {
		passport.authenticate('42', (err, user, info) => {
			if (err)
				return res.redirect(`http://localhost:3000/`);
			const token = jwt.sign({id: user.id}, 'ilovescotchyscotch', {});

			return res.redirect(`http://localhost:3000/oauth/token?=${token}`)
		})(req, res)
	});

	// twitter --------------------------------
	//
	// app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));
	//
	// app.get('/auth/twitter/callback',
	//     passport.authenticate('twitter', {
	//         successRedirect : '/profile',
	//         failureRedirect : '/'
	//     }));

	// google ---------------------------------

	app.get('/api/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

	app.get('/api/auth/google/callback', (req, res) => {
		passport.authenticate('google', (err, user, info) => {
			if (err)
				return res.redirect(`http://localhost:3000/`);
			const token = jwt.sign({id: user.id}, 'ilovescotchyscotch', {});

            return res.redirect(`http://localhost:3000/oauth/token?=${token}`);
		})(req, res);
	});

	// =============================================================================
	// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
	// =============================================================================

	// locally --------------------------------
	// app.get('/api/connect/local', function(req, res) {
	//     res.render('connect-local.ejs', { message: req.flash('loginMessage') });
	// });

	// app.post('/api/connect/local', passport.authenticate('local-signup', {
	//     successRedirect : '/profile1',
	//     failureRedirect : '/connect/local',
	//     failureFlash : true
	// }));

	// 42 -------------------------------

	// app.get('/api/connect/42', passport.authorize('42'));
	//
	// app.get('/api/connect/42/callback', passport.authorize('42', {
	// 	successRedirect : '/profile2',
	// 	failureRedirect : '/'
	// }));
	//
	// app.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));
	//
	// app.get('/connect/facebook/callback',
	//     passport.authorize('facebook', {
	//         successRedirect : '/profile1',
	//         failureRedirect : '/'
	//     }));

	// twitter --------------------------------

	// app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
	//
	// app.get('/connect/twitter/callback',
	//     passport.authorize('twitter', {
	//         successRedirect : '/profile2',
	//         failureRedirect : '/'
	//     }));
	//
	// app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));
	//
	// app.get('/connect/google/callback',
	//     passport.authorize('google', {
	//         successRedirect : '/profile3',
	//         failureRedirect : '/'
	//     }));

	// app.get('/unlink/local', isLoggedIn, function(req, res) {
	//     var user            = req.user;
	//     user.local.email    = undefined;
	//     user.local.password = undefined;
	//     user.save(function(err) {
	//         res.redirect('/profile');
	//     });
	// });
	//
	// app.get('/unlink/42', isLoggedIn, function(req, res) {
	//     var user            = req.user;
	//     user.fortytwo.token = undefined;
	//     user.save(function(err) {
	//         res.redirect('/profile');
	//     });
	// });
	//
	// app.get('/unlink/facebook', isLoggedIn, function(req, res) {
	//     var user            = req.user;
	//     user.facebook.token = undefined;
	//     user.save(function(err) {
	//         res.redirect('/profile');
	//     });
	// });

	// app.get('/unlink/twitter', isLoggedIn, function(req, res) {
	//     var user           = req.user;
	//     user.twitter.token = undefined;
	//     user.save(function(err) {
	//         res.redirect('/profile');
	//     });
	// });
	//
	// app.get('/unlink/google', isLoggedIn, function(req, res) {
	//     var user          = req.user;
	//     user.google.token = undefined;
	//     user.save(function(err) {
	//         res.redirect('/profile');
	//     });
	// });
};

const isLoggedIn = (req, res, next) => {
	const token = req.headers.authorization

	console.log(`isLoggedIn: ${token ? 'token present' : 'token non present'}`);
	jwt.verify(token, 'ilovescotchyscotch', (err, verifiedToken) => {
		if (verifiedToken && verifiedToken.id) {
			// console.log(`Id: ${verifiedToken.id}`);
			User.findById(verifiedToken.id).exec((err, user) => {
				if (err || !user)
					return res.status(200).json({error: true, code: "notConnected", online: false});
				req.user = user
				return next();
			})
		} else
			return res.status(200).json({error: true, code: "badToken", online: false});
	});
}

export default routes;
