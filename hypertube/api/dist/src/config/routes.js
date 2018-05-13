"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var fs = require('fs');
var url = require("url");
var path = require("path");
var torrentStream = require('torrent-stream');
var userController_1 = require("../controllers/userController");
var moviesController_1 = require("../controllers/moviesController");
var profileController_1 = require("../controllers/profileController");
var exec = require('child_process').exec;
var srt2vtt = require('srt-to-vtt');
var srt = require('srt-stream');
var routes = function (app, passport) {
    app.get('/api/users', isLoggedIn, function (req, res) {
        res.json({});
    });
    app.get('/api/users/me', isLoggedIn, function (req, res) {
        userController_1.getUser({ req: req, res: res }).then(function (data) {
            res.json(__assign({}, data));
        })["catch"](function (err) {
            res.json(__assign({}, err));
        });
    });
    app.post('/api/users/me', isLoggedIn, function (req, res) {
        userController_1.updateUser({ req: req, res: res }).then(function (data) {
            res.json(__assign({}, data));
        })["catch"](function (err) {
            res.json(__assign({}, err));
        });
    });
    app.post('/api/reset', function (req, res) {
        userController_1.resetPassword({ req: req, res: res }).then(function (data) {
            res.json(__assign({}, data));
        })["catch"](function (err) {
            res.json(__assign({}, err));
        });
    });
    app.post('/api/reset/generate', function (req, res) {
        userController_1.generateFA({ req: req, res: res }).then(function (data) {
            res.json(__assign({}, data));
        })["catch"](function (err) {
            res.json(__assign({}, err));
        });
    });
    app.get('/api/movies/find', function (req, res) {
        moviesController_1["default"].findMovies({ req: req, res: res }).then(function (data) {
            res.json(__assign({}, data));
        })["catch"](function (err) {
            res.json(err);
        });
    });
    // app.get('/api/player', function(req, res) {
    //     res.render('video.ejs', {
    //         stream : ''
    //     });
    // });
    var getTorrent = function () { return new Promise(function (resolve) {
        var hash = 'magnet:?xt=urn:btih:53D6D70CF0112DB618D98B345AEB2A3F3411EAE0&dn=Jumanji%3A+Welcome+to+the+Jungle+%282017%29+%5B720p%5D+%5BYTS.GY%5D&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969';
        var movie = '';
        var engine = torrentStream(hash, {
            connections: 1000,
            uploads: 0,
            tmp: 'public/upload/',
            path: "public/upload/my-file",
            verify: true
        });
        engine.on('ready', function () {
            engine.files.forEach(function (file, key) {
                if (key === 0) {
                    var ext = path.extname(file.name);
                    movie = file;
                    movie.size = file.length;
                    movie.path = function (ext) { return "public/upload/" + engine.torrent.name + "/" + file.name.replace(ext, '') + ext; };
                    resolve(movie);
                }
            });
        });
        engine.on('download', function (piece) {
            console.log(piece.toString().padStart(3) + " - Loading: " + engine.swarm.downloaded + " / " + movie.size);
            console.log("-- Progress: " + Math.floor((engine.swarm.downloaded / movie.length) * 100) + " % --");
        });
    }); };
    app.get('/api/subtitle', function (req, res) {
        // const head = {
        // 	'Content-Type': 'application/javascript'
        // };
        // res.writeHead(206, head);
        // res.writeHead(200, { 'Content-Type': 'video/mp4' })
        // fs.createReadStream('public/test.vtt')
        // 	.pipe(srt2vtt())
        // 	.pipe(fs.createWriteStream('public/test.vtt'))
        // 	.on('finish', () => {
        //     // fs.unlink('public/test.srt', () => {});
        //   });
        // fs.createReadStream('public/test.vtt').pipe(res);
        // fs.createReadStream(`public/test.srt`)
        //     .pipe(srt2vtt())
        //     .pipe(fs.createWriteStream(`public/test.vtt`));
        //     fs.unlinkSync(`public/test.srt`);
        fs.createReadStream("public/test.vtt").pipe(res);
        // fs.createReadStream('public/test.srt')
        //   .pipe(srt.read(function onInvalid (sub) {
        // 	  console.log(sub);
        //     return sub
        //   }))
    });
    app.get('/api/vid', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var torrent, range, positions, start, end, chunksize, head, stream_position;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('API/VID', req.headers.range);
                    return [4 /*yield*/, getTorrent()];
                case 1:
                    torrent = _a.sent();
                    range = req.headers.range;
                    positions = range.replace(/bytes=/, "").split("-");
                    start = parseInt(positions[0], 10);
                    end = positions[1] ? parseInt(positions[1], 10) : torrent.size - 1;
                    console.log("Start: " + start + " - End: " + end);
                    if (!end)
                        end = torrent.size - 1;
                    chunksize = (end - start) + 1;
                    head = {
                        'Content-Range': 'bytes ' + start + '-' + end + '/' + torrent.size,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': 'application/vnd.apple.mpegurl'
                    };
                    res.writeHead(206, head);
                    stream_position = { start: start, end: end };
                    torrent.createReadStream(stream_position).pipe(res);
                    return [2 /*return*/];
            }
        });
    }); });
    // app.get('/video', function(req, res) {
    // 	console.log('ASK for VIDEO');
    // 	const engine: any = torrentStream('magnet:?xt=urn:btih:b17734fbeb7d052639fdd3c0a04ce8f9d5ac4a40&dn=Annihilation+%282018%29+%5BWEBRip%5D+%5B720p%5D+%5BYTS.AM%5D', {
    //       connections: 1000,
    //       uploads: 0,
    //       tmp: 'public/upload/tmp',
    //       path: 'public/',
    //       trackers: [
    //         'udp://tracker.openbittorrent.com:80',
    //         'udp://tracker.ccc.de:80',
    //         'udp://track.two:80',
    //         'udp://open.demonii.com:1337/announce',
    //         'udp://tracker.coppersurfer.tk:6969',
    //         'udp://glotorrents.pw:6969/announce',
    //         'udp://tracker.opentrackr.org:1337/announce',
    //         'udp://torrent.gresille.org:80/announce',
    //         'udp://p4p.arenabg.com:1337',
    //         'udp://tracker.leechers-paradise.org:6969',
    //         'udp://tracker.internetwarriors.net:1337',
    //       ],
    //     });
    //
    // 	let file;
    // 	let range = req.headers.range
    //
    // 	range = range.substr(6, range.length);
    // 	range = range.replace('-', '')
    // 	console.log('Range: ' + range);
    //
    // 	let start = Number(range);
    // 	let end = start + 100;
    //
    // 	console.log(Number(start), Number(end));
    //
    // 	engine.on('download', (pieceIndex: number) => {
    // 		console.log(`piece ${pieceIndex.toString().padStart(3)} - Downloaded: ${engine.swarm.downloaded} - Length Movie: ${file.length}`, `${Math.floor((engine.swarm.downloaded / file.length) * 100)} %`);
    // 	});
    //
    // 	engine.on('data', (pieceIndex: number) => {
    // 		console.log(`piece ${pieceIndex.toString().padStart(3)} - Downloaded: ${engine.swarm.downloaded} - Length Movie: ${file.length}`, `${Math.floor((engine.swarm.downloaded / file.length) * 100)} %`);
    // 	});
    //
    // 	engine.on('ready', function() {
    // 		file = engine.files[0];
    // 		console.log('Size of the file is '+ file.length);
    //
    // 		if (!end)
    // 			end = file.length - 1;
    //
    // 		const chunksize = (end - start) + 1;
    //
    // 	    const head = {
    // 			'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
    // 			'Accept-Ranges': 'bytes',
    // 			'Content-Length': chunksize,
    // 			'Content-Type': 'video/mp4'
    // 	    };
    // 		res.writeHead(206, head);
    // 		const stream_position = { start, end };
    //
    // 		file.createReadStream(stream_position).pipe(res);
    // 	});
    // });
    // app.get('/profile', isLoggedIn, function(req, res) {
    //     res.render('profile.ejs', {
    //         user : req.user
    //     });
    // });
    app.post('/api/profile/language/change', isLoggedIn, function (req, res) {
        profileController_1["default"].changeLanguage({ req: req, res: res }).then(function (data) {
            res.json(__assign({}, data));
        })["catch"](function (err) {
            res.json(__assign({}, err));
        });
    });
    app.get('/api/logout', function (req, res) {
        req.logout();
        res.json({ logout: true });
    });
    app.post('/api/login', function (req, res) {
        passport.authenticate('local-login', function (err, user) {
            console.log(err, user);
            if (err)
                return res.status(403).send({ success: false, errorMessage: err });
            return res.json({ success: true, user: user });
        })(req, res);
    });
    // SIGNUP =================================
    app.post('/api/signup', function (req, res) {
        passport.authenticate('local-signup', function (err, user) {
            if (err)
                return res.status(403).send({ success: false, errorMessage: err });
            return res.json({ success: true, user: user });
        })(req, res);
    });
    app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
    app.get('/api/auth/facebook/callback', function (req, res) {
        passport.authenticate('facebook', function (err, user, info) {
            console.log(err, user, info);
            return res.redirect("http://localhost:3000/");
        })(req, res);
    });
    app.get('/api/auth/42', function (req, res) {
        passport.authenticate('42')(req, res);
    });
    app.get('/api/auth/42/callback', function (req, res) {
        console.log('42 callback');
        passport.authenticate('42', function (err, user, info) {
            // return res.json({success: true})
            console.log(err, user, info);
            return res.redirect("http://localhost:3000/");
        })(req, res);
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
    // app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    //
    // app.get('/auth/google/callback',
    //     passport.authenticate('google', {
    //         successRedirect : '/profile',
    //         failureRedirect : '/'
    //     }));
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
var isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    console.log('User is not auth');
    res.redirect('/');
};
exports["default"] = routes;
