import { moviesConstants } from '../constants/moviesConstants'

const initialState = {movies: [], search: [], comments: {}, query: {}, commented: false, page: 1};

function moviesReducer(state = initialState, action)
{
    switch (action.type)
    {
        case moviesConstants.GET_MOVIES:
            return {movies: action.data, comments: {}, commented: false, page: state.page, search: []};
        case moviesConstants.BACK_MOVIES:
            return {...state};
        case moviesConstants.NEXT_PAGE:
            if (state.movies)
                return {...state, comments: {}, commented: false, movies: state.movies.concat(action.data), page: state.page + 1};
            return {...state};
        case moviesConstants.RESET_MOVIE:
            return {movies: [], comments: {}, commented: false, page: 1, search: []};
        case moviesConstants.GET_COMMENTS:
            return {...state, comments: action.comments, commented: action.commented};
        case moviesConstants.GET_QUERY:
            return {...state, query: action.query};
        case moviesConstants.GET_SEARCH:
            return {...state, comments: {}, commented: false, search: state.search.concat(action.data), page: 1};
        default:
            return state;
    }
}

export default moviesReducer