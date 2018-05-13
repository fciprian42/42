import { usersConstants } from '../constants/usersConstants'
import { oauthConstants } from '../constants/oauthConstants'

let session = sessionStorage.getItem('auth');

const initialState = session ? {loggedIn: true, session, avatar: null, bookmarks_series: [], bookmarks_movies: [], history_movies: [], history_series: [], tokenFA: 0} : {loggedIn: false, tokenFA: 0};

function usersReducer(state = initialState, action)
{
    switch (action.type)
    {
        case usersConstants.LOGIN_SUCCESS:
            return {...state, loggedIn: true, session: action.session};
        case usersConstants.LOGIN_FAILURE:
            return {...state};
        case usersConstants.LOGOUT:
            return {loggedIn: false, tokenFA: 0};
        case usersConstants.FORGOT_SUCCESS:
            return {...state, tokenFA: action.token};
        case usersConstants.REGISTER_REQUEST:
            return {...state};
        case usersConstants.REGISTER_FAILURE:
            return {...state};
        case usersConstants.REGISTER_SUCCESS:
            return {...state};
        case usersConstants.FORGOT_FAILURE:
            return {...state};
        case usersConstants.RESET_REQUEST:
            return {...state};
        case usersConstants.RESET_SUCCESS:
            return {...state};
        case usersConstants.GET_AVATAR:
            return {...state, avatar: action.url};
        case usersConstants.RESET_FAILURE:
            return {...state};
        case usersConstants.EDIT_FAILURE:
            return {...state};
        case usersConstants.EDIT_SUCCESS:
            return {...state, session: action.payload};
        case usersConstants.GET_HISTORY:
            if (action.historyMovies)
                return {...state, bookmarks_movies: action.historyMovies};
            else if (action.historySeries)
                return {...state, bookmarks_series: action.historySeries};
            else
                return {...state};
        case usersConstants.GET_HISTORIE:
            if (action.historieMovies)
                return {...state, history_movies: action.historieMovies};
            else if (action.historieSeries)
                return {...state, history_series: action.historieSeries};
            else
                return {...state};
        case usersConstants.EMPTY_BOOKMARKS_MOVIES:
            return {...state, bookmarks_movies: []};
        case usersConstants.EMPTY_BOOKMARKS_SERIES:
            return {...state, bookmarks_series: []};
        case oauthConstants.OAUTH_CHECKER:
            return {...state, loggedIn: action.payload.online, session: action.payload.session};
        default:
            return state;
    }
}

export default usersReducer