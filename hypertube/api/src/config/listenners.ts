// import * as mongoose from 'mongoose'
// import app from './app'
// const moment				= require('moment');
// const _						= require('lodash');

export const sockets = ({socket, port}) => {
	socket.on('connect', (socket: any) => {
		console.log('Connected client on port %s.', port);

		socket.on('disconnect', () => {
			console.log('Client disconnected');
		});
	});
};

export const listen = ({server, port}) => {
	server.listen(port, () => {
		console.log('Running server on port %s', port);
	});
}
