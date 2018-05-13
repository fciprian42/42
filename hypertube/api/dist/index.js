"use strict";
exports.__esModule = true;
var express = require("express");
var http_1 = require("http");
var SocketIO = require("socket.io");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
var passport = require("passport");
var session = require("express-session");
var routes_1 = require("./src/config/routes");
var listenners_1 = require("./src/config/listenners");
var flash = require("connect-flash");
var passports_1 = require("./src/services/passports");
require("./src/models/user");
var CronJob = require('cron').CronJob;
var path = require('path');
// new CronJob('* * * * * *', function() {
//   // console.log('You will see this message every second');
// }, null, true, 'Europe/Paris');
var App = /** @class */ (function () {
    function App() {
        this.createApp();
        this.initServer();
        this.config();
        this.parser();
        this.mongo();
        this.sockets();
        this.sessions();
        this.routes();
        this.listen();
    }
    /*
        Creating App
    */
    App.prototype.createApp = function () {
        this.app = express();
    };
    App.prototype.initServer = function () {
        this.server = http_1.createServer(this.app);
    };
    /*
        Configurations
    */
    App.prototype.config = function () {
        this.port = 8080;
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization");
            next();
        });
        passports_1["default"](passport);
        this.app.use('/public', express.static('./public'));
    };
    App.prototype.parser = function () {
        this.app.use(bodyParser.json()); // get information from html forms
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());
    };
    /*
        Sessions
    */
    App.prototype.sessions = function () {
        this.app.use(session({
            secret: 'ilovescotchscotchyscotchscotch',
            resave: true,
            saveUninitialized: true
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use(flash());
        // Temporary
        this.app.set('view engine', 'ejs');
        //
    };
    /*
        MongoDB
    */
    App.prototype.mongo = function () {
        mongoose.plugin(require('meanie-mongoose-to-json'));
        require('mongoose').Promise = Promise;
        mongoose.connect('mongodb://127.0.0.1:27017/hypertube', { useMongoClient: true });
    };
    /*
        SocketIO
    */
    App.prototype.sockets = function () {
        this.io = SocketIO(this.server);
        listenners_1.sockets({ socket: this.io, port: this.port });
    };
    /*
        Routes
    */
    App.prototype.routes = function () {
        // this.app.use(express.static('build'));
        // this.app.get('*', (req, res) => {
        // 	res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
        // });
        routes_1["default"](this.app, passport);
    };
    /*
        Listenning port
    */
    App.prototype.listen = function () {
        listenners_1.listen({ server: this.server, port: this.port });
    };
    return App;
}());
exports["default"] = new App().app;
