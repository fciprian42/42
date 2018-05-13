import * as jwt			from 'jsonwebtoken';
import * as mongoose	from 'mongoose';
import * as async		from 'async';

const Users	=	mongoose.model('Users');

// export const authorization = (req, res, next) => {
// 	let token = req.headers["authorization"];
//
// 	async.waterfall([
// 		(callback) => {
// 			jwt.verify(token, 'ilovescotchyscotch', (err, verifiedToken) => {
// 				if (err || !verifiedToken.id)
// 					return callback('invalid token');
//
// 				token = verifiedToken;
// 				return callback();
// 			});
// 		},
// 		(callback) => {
// 			Users.findOne({'_id': token.id}, (err, user) => {
// 				if (err)
// 					return callback(err);
//
// 				if (!user)
// 					return callback('User not found');
//
// 				req.connectedAs = user;
// 				return callback();
// 			});
// 		},
// 	], (err) => {
// 		if (err)
// 			return res.status(400).json(err.error ? err : {error: {msg: 'unable to reach'}});
// 		return next();
// 	});
// };
