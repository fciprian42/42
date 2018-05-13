import * as express from 'express'

import { createServer, Server }	from 'http'
import * as SocketIO			from 'socket.io'

import * as bodyParser		from 'body-parser'
import * as mongoose		from 'mongoose'
import * as cookieParser	from 'cookie-parser'
import * as passport		from 'passport'
import * as session			from 'express-session'
import * as cookieSession	from 'cookie-session'
// const cors = require('cors')
import * as cors			from 'cors'

import routes				from './src/config/routes'
import { listen, sockets }	from './src/config/listenners'

import * as jwt				from 'jsonwebtoken';
// import flash = require('connect-flash');


import passportConfig	from './src/services/passports'
import './src/models/user'

const { exec }	= require('child_process');
const CronJob	= require('cron').CronJob;

const path			= require('path');
// new CronJob('* * * * * *', function() {
//   // console.log('You will see this message every second');
// }, null, true, 'Europe/Paris');


class App {

	app:	express.Application
	server:	Server
	io:		SocketIO.Server
	port:	String | Number

	constructor() {

		this.createApp()
		this.initServer()


		this.config()

		this.mongo()
		this.sockets()

		this.sessions()

		this.routes()
		this.listen()

	}

	/*
		Creating App
	*/

	createApp(): void {
        this.app = express()
    }

	initServer(): void {
		this.server = createServer(this.app)
	}

	/*
		Configurations
	*/

	config(): void {
		this.port = 8080

		this.app.use((req, res, next) => {
			res.header("Access-Control-Allow-Origin", req.get('origin'))
			res.header('Access-Control-Allow-Credentials', 'true');
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
			// res.header("Access-Control-Allow-Origin", "*");
  			res.header("Access-Control-Allow-Headers", "X-Requested-With");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization")
			next()
		})

		passportConfig(passport);

		exec('mkdir -p ./public/subtitles');
		this.app.use('/public', express.static('./public'));
		this.app.use('/uploads', express.static('./uploads'));
	}

	/*
		Sessions
	*/

	sessions(): void {


		// this.app.use(cookieParser())

		this.app.use(bodyParser.json({limit: '5mb'}));
		this.app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));

		this.app.use ((error, req, res, next) => {
			if (res.req._parsedUrl.path)
				return res.status(403).json({'errors': {swal: "Votre image doit etre inferieur à 5mb"}});
		});
		// this.app.use(session({
	    //     // cookieName: 'hypertube',
	    //     secret: 'ilovescotchscotchyscotchscotch',
	    //     duration: 30 * 60 * 1000,
	    //     activeDuration: 5 * 60 * 1000,
		// 	    resave: true,
		// 	    saveUninitialized: true
    	// }));
		this.app.use(passport.initialize())
		// this.app.use(passport.session())
		console.log('Init session');

		// this.app.use(flash())

		// Temporary
			// this.app.set('view engine', 'ejs')
		//
	}

	/*
		MongoDB
	*/

	mongo(): void {
		mongoose.plugin(require('meanie-mongoose-to-json'))

		require('mongoose').Promise = Promise
		mongoose.connect('mongodb://127.0.0.1:27017/hypertube', { useMongoClient: true })
	}

	/*
		SocketIO
	*/

	sockets(): void {
        this.io = SocketIO(this.server)
		sockets({socket: this.io, port: this.port})
    }

	/*
		Routes
	*/

	routes(): void {
		// this.app.use(express.static('build'));
		// this.app.get('*', (req, res) => {
		// 	res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
		// });
		console.log('Start routes');
		routes(this.app, passport)
	}

	/*
		Listenning port
	*/

	public listen(): void {
		listen({server: this.server, port: this.port})
	}
}

export default new App().app
