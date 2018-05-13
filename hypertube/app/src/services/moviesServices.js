import axios from "axios"

export const moviesServices = {
    getMovies,
    getSeries,
    searchMovies,
    searchSeries,
    like,
    unlike
};

function getMovies(query, page, token)
{
    if (!page)
        return axios.get(`http://localhost:8080/api/movies/find${query}|limit=44`, {headers: { authorization: token }});
    else
        return axios.get(`http://localhost:8080/api/movies/find${query}|limit=44|page=${page}`, {headers: { authorization: token }});
}

function searchMovies(query, token)
{
    if (query && token)
        return axios.get(`http://localhost:8080/api/movies/find${query}|sort_by=rating`, {headers: { authorization: token }});
}

function searchSeries(query, token)
{
    if (query && token)
        return axios.get(`http://localhost:8080/api/series/find${query}|sort_by=rating`, {headers: { authorization: token }});
}

function like(code, token, series)
{
    if (code && token && !series)
        return axios.get(`http://localhost:8080/api/movies/${code}/like`, {headers: { authorization: token }});
    if (code && token && series)
        return axios.get(`http://localhost:8080/api/series/${code}/like`, {headers: { authorization: token }});
}

function unlike(code, token, series)
{
    if (code && token && !series)
        return axios.delete(`http://localhost:8080/api/movies/${code}/like`, {headers: { authorization: token }});
    if (code && token && series)
        return axios.delete(`http://localhost:8080/api/series/${code}/like`, {headers: { authorization: token }});
}

function getSeries(query, page, token)
{
    if (!page)
        return axios.get(`http://localhost:8080/api/series/find${query}|limit=44`, {headers: { authorization: token }});
    else
        return axios.get(`http://localhost:8080/api/series/find${query}|limit=44|page=${page}`, {headers: { authorization: token }});
}
