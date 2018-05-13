const auth = {
    'facebookAuth' : {
        'clientID'			: '173196756806333', // your App ID
        'clientSecret'		: '023cfb5e6d68f87060a648e5cafbe336', // your App Secret
		'callbackURL'		: 'http://localhost:8080/api/auth/facebook/callback',
		'profileURL'		: 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
		'profileFields'		: ['id', 'email', 'name'], // For requesting permissions from Facebook API
		'passReqToCallback'	: false
	},

    'twitterAuth' : {
        'consumerKey'        : 'your-consumer-key-here',
        'consumerSecret'     : 'your-client-secret-here',
        'callbackURL'        : 'http://localhost:8080/api/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '333622758655-69gem8blli2hndjmmovaev9p0p2pjrtj.apps.googleusercontent.com',
        'clientSecret'     : '6Cwm0y3QqWjtNA96No22DfVY',
        'callbackURL'      : 'http://localhost:8080/api/auth/google/callback'
    },

	'fortytwoAuth' : {
		'clientID'			: '428703a7c3566bd5bf7fd0c4e4f4e0e3f1e2be4b9281305c34acc68897d9feb8',
    	'clientSecret'		: '650b7523f0b04d9bf91abca95f0e78d0ba03f420362a5ac92a69d8f2ecf9cd2b',
    	'callbackURL'		: "http://localhost:8080/api/auth/42/callback",
		'passReqToCallback'	: true
	},

	'openSubtitle' : {
		'login'			: '0011000101',
		'passwd'		: 'qwqwqw'
	},
	'gmailAuth': {
		'user': "keskisepasseentdm@gmail.com",
		'pass': "Azerty123"
	},
	'omdb': {
		'apiKey': '2d44ee4f'
	},
};

export default auth
