import { moviesConstants } from '../constants/moviesConstants'
import { moviesServices } from '../services/moviesServices'
import { alertsActions } from './alertsActions'
import messages	from '../messages'

export const moviesActions = {
    getMovies,
    getSeries,
    nextPage,
    like,
    unlike,
    searchMovies,
    searchSeries,
    nextPageSeries
};

function getMovies(query, token)
{
    if (query)
    {
        return (dispatch, getState) => {
            moviesServices.getMovies(query, null, token)
                .then(response => {
                    if (response && response.data && response.data.movies && response.data.movies.length > 0)
                        dispatch({type: moviesConstants.GET_MOVIES, data: response.data.movies});
                    else
                    {
                        dispatch(alertsActions.warning(messages['moviesNotFound'][getState().lang.languageDefault]));
                        setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    }
                });
        };
    }
}

function searchMovies(query)
{
    if (query)
    {
        return (dispatch, getState) => {
			const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            dispatch({type: moviesConstants.RESET_MOVIE});
            moviesServices.searchMovies(query, session.token)
                .then(response => {
                    if (response && response.data && response.data.movies && response.data.movies.length > 0)
                        dispatch({type: moviesConstants.GET_SEARCH, data: response.data.movies});
                });
        };
    }
}

function searchSeries(query)
{
    if (query)
    {
        return (dispatch, getState) => {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            dispatch({type: moviesConstants.RESET_MOVIE});
            moviesServices.searchSeries(query, session.token)
                .then(response => {
                    if (response && response.data && response.data.series && response.data.series.length > 0)
                        dispatch({type: moviesConstants.GET_SEARCH, data: response.data.series});
                });
        };
    }
}

function like(code, series)
{

        return (dispatch, getState) => {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            moviesServices.like(code, session.token, series)
                .then(response => {
                    if (response && response.data && response.data.success && response.data.code)
                    {
                        dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                        setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    }
                    else
                    {
                        if (response && response.data && response.data.error && response.data.code)
                        {
                            dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                        }
                    }
                });
        };

}

function unlike(code, series)
{

        return (dispatch, getState) => {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            moviesServices.unlike(code, session.token, series)
                .then(response => {
                    if (response && response.data && response.data.success && response.data.code)
                    {
                        dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                        setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    }
                    else
                    {
                        if (response && response.data && response.data.error && response.data.code)
                        {
                            dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                        }
                    }
                });
        };

}

function nextPage(query)
{
    if (query)
    {
        return (dispatch, getState) => {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));

                moviesServices.getMovies(query, getState().movies.page + 1, session.token)
                    .then(response => {
                        if (response && response.data && response.data.movies && response.data.movies.length > 0)
                            dispatch({type: moviesConstants.NEXT_PAGE, data: response.data.movies});
                        else
                        {
                            dispatch(alertsActions.warning(messages['noMoreData'][getState().lang.languageDefault]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                        }
                    });

        };
    }
}

function nextPageSeries(query)
{
    if (query)
    {
        return (dispatch, getState) => {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            moviesServices.getSeries(query, getState().movies.page + 1, session.token)
                .then(response => {
                    if (response && response.data && response.data.series && response.data.series.length > 0)
                        dispatch({type: moviesConstants.NEXT_PAGE, data: response.data.series});
                    else
                    {
                        dispatch(alertsActions.warning(messages['noMoreData'][getState().lang.languageDefault]));
                        setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    }
                });
        }
    }
}

function getSeries(query, token)
{
    return (dispatch, getState) => {
        moviesServices.getSeries(query, null, token)
            .then(response => {
                if (response && response.data && response.data.series && response.data.series.length > 0)
                    dispatch({type: moviesConstants.GET_MOVIES, data: response.data.series});
                else
                {
                    dispatch(alertsActions.warning(messages['moviesNotFound'][getState().lang.languageDefault]));
                    setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                }
            });
    };
}
