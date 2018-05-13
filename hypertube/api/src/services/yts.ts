import * as request from 'request'
import * as open from 'open'

const baseURL = "http://yts.ag/api/v2";
let self;

class ytsScrapper {

	movies: Array<any>

	print_torrents() {
		let torrents = this.movies

		if (torrents) {
			for(var i = 0; i< torrents.length; i++){
				console.log("==========================================================================================");
				console.log("Title : " + torrents[i].title);
				console.log("IMDB Code : " + torrents[i].imdb_code);
				console.log("URL : " + torrents[i].url);
				console.log("ID : " + torrents[i].id);
				console.log("Rating : " + torrents[i].rating);
				console.log("==========================================================================================");
			}
		}
	}
	search(query) {
		return new Promise((resolve, reject) => {
			let rawData = '';
			let res = request.get(baseURL + "/list_movies.json?query_term=" + encodeURI(query));

			res.on('data', (chunk) => { rawData += chunk;});
			res.on('end', () => {
				try {
					var movies = JSON.parse(rawData);
					this.movies = movies.data.movies
					if (!movies.data.movies)
						return reject();
					return resolve(movies.data.movies)
				} catch (Error) {
					reject();
				}
			});
		})
	}
}

export default ytsScrapper
