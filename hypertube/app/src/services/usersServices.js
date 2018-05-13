import axios from "axios"

export const usersServices = {
    login,
    logout,
    register,
    generateToken,
    resetPassword,
    getBookmarks,
    editInfos,
    addToBookmarks,
    deleteToBookmarks,
    switchLanguage,
    postComment,
    fetchInfos,
    deleteComment,
    getHistory
};

function  login(email, password)
{
    if (email && password)
    {
		return axios({
			method: 'POST',
		    url: 'http://localhost:8080/api/login',
		    data: {
				email,
				password
			},
		}).then(response => {
		    if (response && response.data && response.data.success)
            {
                let user = {
                    email: response.data.user.email,
                    token: response.data.token,
                    username: response.data.user.username,
                    firstname: response.data.user.firstName,
                    lastname: response.data.user.lastname,
                    isOauth: false,
                    lang: "en"
                };

                if (!sessionStorage.getItem('auth'))
                    sessionStorage.setItem('auth', JSON.stringify(user));
            }
            return response;
		});
    }
}

function getBookmarks(token, series)
{
    if (token && !series)
        return axios.get('http://localhost:8080/api/bookmarks/movies', {headers: {authorization: token}});
    if (token && series)
        return axios.get('http://localhost:8080/api/bookmarks/series', {headers: {authorization: token}});
}

function getHistory(token, series)
{
    if (token && !series)
        return axios.get('http://localhost:8080/api/movies/history', {headers: {authorization: token}});
    if (token && series)
        return axios.get('http://localhost:8080/api/series/history', {headers: {authorization: token}});
}

function switchLanguage(currentLang, token)
{
    if (currentLang && token)
        return axios.post('http://localhost:8080/api/profile/language/change', {lang: currentLang}, {headers: { authorization: token }});
}

function editInfos(data, token)
{
    if (data)
        return axios.post('http://localhost:8080/api/users/me', {email: data.email, firstName: data.firstname, lastName: data.lastname, username: data.username}, {headers: { authorization: token }});
}

function postComment(message, imdb_code, token, series)
{
    if (message && imdb_code && token && !series)
        return axios.post(`http://localhost:8080/api/movies/${imdb_code}/comment`, {message: message}, {headers: { authorization: token }});
    else
        return axios.post(`http://localhost:8080/api/series/${imdb_code}/comment`, {message: message}, {headers: { authorization: token }});
}

function deleteComment(imdb_code, token, series)
{
    if (imdb_code && token && !series)
        return axios.delete(`http://localhost:8080/api/movies/${imdb_code}/comment`, {headers: { authorization: token }});
    else
        return axios.delete(`http://localhost:8080/api/series/${imdb_code}/comment`, {headers: { authorization: token }});
}

function register(data)
{
    if (data)
        return axios.post("http://localhost:8080/api/signup", data);
}

function addToBookmarks(code, token, series)
{
    if (code && token && !series)
        return axios.post(`http://localhost:8080/api/movies/${code}/bookmarks`, {imdb: code}, {headers: {authorization: token}});
    if (code && token && series)
        return axios.post(`http://localhost:8080/api/series/${code}/bookmarks`, {imdb: code}, {headers: {authorization: token}});
}

function deleteToBookmarks(code, token, series)
{
    if (code && token && !series)
        return axios.delete(`http://localhost:8080/api/movies/${code}/bookmarks`, {headers: {authorization: token}});
    else
        return axios.delete(`http://localhost:8080/api/series/${code}/bookmarks`, {headers: {authorization: token}});
}

function fetchInfos(token)
{
    if (token)
        return axios.get('http://localhost:8080/api/users/me', {headers: {authorization: token}});
}

function generateToken(email)
{
    if (email)
        return axios.post("http://localhost:8080/api/reset/generate", {email});
}

function resetPassword(email, twofa, passwd)
{
    if (email && twofa && passwd)
        return axios.post("http://localhost:8080/api/reset", {email, twofa, passwd});
}

function logout()
{
    if (localStorage.getItem('auth'))
        localStorage.removeItem('auth');

    if (sessionStorage.getItem('auth'))
        sessionStorage.removeItem('auth');
}