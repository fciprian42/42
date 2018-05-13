"use strict";
// import * as mongoose from 'mongoose'
// import app from './app'
// const moment				= require('moment');
// const _						= require('lodash');
exports.__esModule = true;
exports.sockets = function (_a) {
    var socket = _a.socket, port = _a.port;
    socket.on('connect', function (socket) {
        console.log('Connected client on port %s.', port);
        socket.on('disconnect', function () {
            console.log('Client disconnected');
        });
    });
};
exports.listen = function (_a) {
    var server = _a.server, port = _a.port;
    server.listen(port, function () {
        console.log('Running server on port %s', port);
    });
};
