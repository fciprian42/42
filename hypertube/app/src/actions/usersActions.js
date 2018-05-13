import { usersConstants } from '../constants/usersConstants'
import { langConstants } from '../constants/langConstants'
import { usersServices } from '../services/usersServices'
import { alertsActions } from './alertsActions'
import messages	from '../messages'
import { setActiveLanguage } from 'react-localize-redux'
import axios from "axios"
import {moviesConstants} from "../constants/moviesConstants"

export const usersActions = {
    login,
    logout,
    editInfos,
    generateToken,
    resetPassword,
    getBookmarks,
    getHistory,
    deleteToBookmarks,
    register,
    addToBookmarks,
    postComment,
    switchLanguage,
    getLang,
    deleteComment
};

function login(email, password, history)
{
    if (email && password && history) {
        return (dispatch, getState) => {
            usersServices.login(email, password)
                .then(
                    response => {
                        if (response && response.data && response.data.error && response.data.code)
                        {
                            dispatch({type: usersConstants.LOGIN_FAILURE, warning: response.data});
                            dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                        }
                        else
                        {
                            dispatch({type: usersConstants.LOGIN_SUCCESS, session: sessionStorage.getItem('auth'), isOauth: false});
                            dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);

                            history.push('/dashboard');
                        }
                    },
                    warning => {
                        if (warning && warning.data && warning.data.error)
                        {
                            dispatch({type: usersConstants.REGISTER_FAILURE});
                            dispatch(alertsActions.warning(messages[warning.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {
                                dispatch(alertsActions.clear())
                            }, 5000);
                        }
                    }
                );
        }
    }
}

function editInfos(data, history, isOauth)
{
    if (data && history)
    {
        return (dispatch, getState) => {
            const isLogged = getState().users.loggedIn;

            if (isLogged)
            {
                if (isOauth)
                {
                    if (data.username === "" || data.lastname === "" || data.firstname === "")
                    {
                        dispatch(alertsActions.warning('inputMissing')[getState().lang.languageDefault]);
                        setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    }
                }
                else
                {
                    if (data.username === "" || data.lastname === "" || data.firstname === "" || data.email === "")
                    {
                        dispatch(alertsActions.warning('inputMissing')[getState().lang.languageDefault]);
                        setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    }
                }

                const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
                let token = session.token;
                usersServices.editInfos(data, token)
                    .then(
                        response => {
                            if (response && response.data && response.data.error && response.data.code)
                            {
                                dispatch({type: usersConstants.EDIT_FAILURE, warning: response.data});
                                dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                                setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                            }
                            else
                            {
                                let updateInfos = {};

                                if (!isOauth)
                                {
                                    updateInfos = {
                                        email: data.email,
                                        token: token,
                                        username: data.username,
                                        firstname: data.firstname,
                                        lastname: data.lastname,
                                        isOauth: false,
                                        lang: "en"
                                    };
                                }
                                else
                                {
                                    updateInfos = {
                                        email: session.email,
                                        token: token,
                                        username: data.username,
                                        firstname: data.firstname,
                                        lastname: data.lastname,
                                        isOauth: true,
                                        lang: "en"
                                    };
                                }

                                sessionStorage.setItem('auth', JSON.stringify(updateInfos));

                                dispatch({type: usersConstants.EDIT_SUCCESS, payload: JSON.stringify(updateInfos)});

                                if (response && response.data && response.data.code)
                                {
                                    dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                                    setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                                }

                                history.push('/profile');
                            }
                        }
                    )
            }
        };
    }
}

function register(username, email, password, confirm, firstname, lastname, history)
{
    if (username && email && password && confirm && firstname && lastname && history)
    {
        const data = {
            username: username,
            email: email,
            password: password,
            firstName: firstname,
            lastName: lastname
        };

        if (password !== confirm)
        {
            return (dispatch, getState) => {
                dispatch(alertsActions.warning(messages['badCorresponding'][getState().lang.languageDefault]));
                setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
            };
        }

        return (dispatch, getState) => {
            dispatch({type: usersConstants.REGISTER_REQUEST});

            usersServices.register(data)
                .then(
                    response => {
                        if (response && response.data && response.data.success)
                        {
                            dispatch({type: usersConstants.REGISTER_SUCCESS});
                            dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                            history.push('/');
                        }
                        else
                        {
                            dispatch({type: usersConstants.REGISTER_FAILURE});
                            dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                        }
                    },
                    warning => {
                        if (warning && warning.data && warning.data.error)
                        {
                            dispatch({type: usersConstants.REGISTER_FAILURE});
                            dispatch(alertsActions.warning(messages[warning.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {
                                dispatch(alertsActions.clear())
                            }, 5000);
                        }
                    }
                )
            }
    }
}

function logout()
{
    return dispatch => {
        usersServices.logout();
        dispatch({type: usersConstants.LOGOUT});
    };
}

function generateToken(email, history)
{
    if (email && history)
    {
        return (dispatch, getState) => {
            usersServices.generateToken(email)
                .then(
                    response => {
                        if (response && response.data && response.data.error && response.data.code)
                        {
                            dispatch({type: usersConstants.FORGOT_FAILURE, response});
                            dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                        }
                        else
                        {
                            dispatch({type: usersConstants.FORGOT_SUCCESS, token: response.data.generated});
                            if (response && response.data && response.data.code)
                            {
                                dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                                setTimeout(() => {dispatch(alertsActions.clear());}, 5000);
                            }

                            if (!getState().users.session)
                                history.push('/reset-password');
                            else
                                history.push('/profile/reset');
                        }
                    }
                );
        }
    }
}

function resetPassword(email, twofa, passwd, history)
{
    if (email && twofa && passwd && history)
    {
        return (dispatch, getState) => {
            dispatch({type: usersConstants.RESET_REQUEST, email});

            usersServices.resetPassword(email, twofa, passwd)
                .then(
                    response => {
                        if (response && response.data && response.data.error && response.data.code)
                        {
                            dispatch({type: usersConstants.RESET_FAILURE});
                            dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);

                            if (getState().users.session)
                                history.push('/profile');
                            else
                            {
                                if (response.data.code === "twofaInvalid")
                                    history.push('/forgot-password');
                            }
                        }
                        else
                        {
                            dispatch({type: usersConstants.FORGOT_SUCCESS});
                            if (response && response.data && response.data.code)
                            {
                                dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                                setTimeout(() => {dispatch(alertsActions.clear()); document.getElementById('submit').disabled = false;}, 5000);
                            }

                            if (getState().users.session)
                                history.push('/profile');
                            else
                                history.push('/');
                        }
                    }
                )
        }
    }
}

function getLang()
{
    return (dispatch, getState) => {
        if (getState().users.session || sessionStorage.getItem('auth'))
        {
            const me = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            usersServices.fetchInfos(me.token)
                .then(response => {

                    if (response && response.data && response.data.user && response.data.user.lang)
                    {
                        dispatch({type: langConstants.SWITCH_LANG, lang: response.data.user.lang.toLowerCase()});
                        dispatch(setActiveLanguage(response.data.user.lang.toLowerCase()));
                    }
                });
        }
        else
            dispatch(setActiveLanguage('en'));
    };
}

function switchLanguage(currentLang)
{
    return (dispatch, getState) => {

        const isLogged = getState().users.loggedIn;

        switch (currentLang)
        {
            case "fr":
                if (isLogged)
                {
                    const session = JSON.parse(getState().users.session);
                    let token = session.token;
                    usersServices.switchLanguage('FR', token)
                        .then(response => {
                            if (response && response.data && response.data.success)
                            {
                                dispatch({type: langConstants.SWITCH_LANG, lang: 'fr'});
                                dispatch(setActiveLanguage('fr'));

                                if (document.getElementById('btn-fr') && document.getElementById('btn-en'))
                                {
                                    if (document.getElementById('btn-fr').className === "btn-translate active");
                                    else
                                    {
                                        document.getElementById('btn-en').className = "btn-translate";
                                        document.getElementById('btn-fr').className += " active";
                                    }
                                }
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
                }
                else
                {
                    dispatch({type: langConstants.SWITCH_LANG, lang: 'en'});
                    dispatch(setActiveLanguage('en'));
                    document.getElementById('flat-nav-lang').src = require("../style/images/languages/en.png");
                }
                break;
            case "en":
                if (isLogged)
                {
                    const session = JSON.parse(getState().users.session);
                    let token = session.token;
                    usersServices.switchLanguage('EN', token)
                        .then(response => {
                            if (response && response.data && response.data.success)
                            {
                                dispatch({type: langConstants.SWITCH_LANG, lang: 'en'});
                                dispatch(setActiveLanguage('en'));

                                if (document.getElementById('btn-fr') && document.getElementById('btn-en'))
                                {
                                    if (document.getElementById('btn-en').className === "btn-translate active");
                                    else
                                    {
                                        document.getElementById('btn-fr').className = "btn-translate";
                                        document.getElementById('btn-en').className += " active";
                                    }
                                }
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
                }
                else
                {
                    dispatch({type: langConstants.SWITCH_LANG, lang: 'fr'});
                    dispatch(setActiveLanguage('fr'));
                    document.getElementById('flat-nav-lang').src = require("../style/images/languages/fr.png");
                }
                break;
            default:
                break;
        }
    }
}

// History

function addToBookmarks(code, series)
{
    return (dispatch, getState) => {
        if (getState().users.session || sessionStorage.getItem('auth'))
        {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            let token = session.token;

            if (session && token) {
                usersServices.addToBookmarks(code, token, series)
                    .then(
                        response => {
                            if (response.data.success) {
                                const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
                                usersServices.getBookmarks(session.token)
                                    .then(response => {
                                        if (!series)
                                        {
                                            if (response && response.data && response.data.movieBookmarks && response.data.movieBookmarks.length > 0)
                                                dispatch({
                                                    type: usersConstants.GET_HISTORY,
                                                    historyMovies: response.data.movieBookmarks
                                                });
                                        }
                                        else
                                        {
                                            if (response && response.data && response.data.movieBookmarks && response.data.movieBookmarks.length > 0)
                                                dispatch({
                                                    type: usersConstants.GET_HISTORY,
                                                    historySeries: response.data.movieBookmarks
                                                });
                                        }
                                    });
                                dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                                setTimeout(() => {
                                    dispatch(alertsActions.clear())
                                }, 5000);
                            }
                            else
                            {
                                if (response && response.data && response.data.error && response.data.code)
                                {
                                    dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                                    setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                                }
                            }
                        }
                    );
            }
        }
    };
}

function deleteToBookmarks(code, series)
{
        return (dispatch, getState) => {
            if (getState().users.session || sessionStorage.getItem('auth'))
            {
                const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
                let token = session.token;

                if (session && token)
                {
                    usersServices.deleteToBookmarks(code, token, series)
                        .then(
                            response => {
                                if (response.data.success)
                                {
                                    const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));

                                    if (!series) {
                                        usersServices.getBookmarks(session.token, false)
                                            .then(response => {
                                                if (response.data.movieBookmarks.length > 0)
                                                    dispatch({type: usersConstants.GET_HISTORY, historyMovies: response.data.movieBookmarks});
                                                else
                                                    dispatch({type: usersConstants.EMPTY_BOOKMARKS_MOVIES});
                                            });
                                    } else {
                                        usersServices.getBookmarks(session.token, true)
                                            .then(response => {
                                                if (response.data.serieBookmarks.length > 0)
                                                    dispatch({type: usersConstants.GET_HISTORY, historySeries: response.data.serieBookmarks});
                                                else
                                                    dispatch({type: usersConstants.EMPTY_BOOKMARKS_SERIES});
                                            });
                                    }
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
                            }
                        );
                }
            }
        };
}

function getBookmarks()
{
    return (dispatch, getState) => {
        if (getState().users && getState().users.session)
        {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            usersServices.getBookmarks(session.token, false)
                .then(
                    response => {
                        if (response && response.data && response.data.success)
                        {
                            if (response && response.data && response.data.movieBookmarks && response.data.movieBookmarks.length > 0)
                                dispatch({type: usersConstants.GET_HISTORY, historyMovies: response.data.movieBookmarks});
                            else
                                dispatch({type: usersConstants.GET_HISTORY});
                        }
                        else
                        {
                            if (response && response.data && response.data.error && response.data.code)
                            {
                                dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                                setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                            }
                        }
                    }
                );
            usersServices.getBookmarks(session.token, true)
                .then(
                    response => {
                        if (response.data.success)
                        {
                            if (response && response.data && response.data.serieBookmarks && response.data.serieBookmarks.length > 0)
                                dispatch({type: usersConstants.GET_HISTORY, historySeries: response.data.serieBookmarks});
                            else
                                dispatch({type: usersConstants.GET_HISTORY});
                        }
                        else
                        {
                            if (response && response.data && response.data.error && response.data.code)
                            {
                                dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                                setTimeout(() => {
                                    dispatch(alertsActions.clear())
                                }, 5000);
                            }
                        }
                    }
                );
        }
    };
}

function getHistory()
{
    return (dispatch, getState) => {
        if (getState().users && getState().users.session)
        {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            usersServices.getHistory(session.token, false)
                .then(
                    response => {
                        if (response && response.data && response.data.success)
                        {
                            if (response && response.data && response.data.movieHistory && response.data.movieHistory.length > 0)
                                dispatch({type: usersConstants.GET_HISTORIE, historieMovies: response.data.movieHistory});
                            else
                                dispatch({type: usersConstants.GET_HISTORIE});
                        }
                        else
                        {
                            if (response && response.data && response.data.code)
                            {
                                dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                                setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                            }
                        }
                    }
                );
            usersServices.getHistory(session.token, true)
                .then(
                    response => {
                        if (response && response.data && response.data.success)
                        {
                            if (response && response.data && response.data.serieHistory && response.data.serieHistory.length > 0)
                                dispatch({type: usersConstants.GET_HISTORIE, historieSeries: response.data.serieHistory});
                            else
                                dispatch({type: usersConstants.GET_HISTORIE});
                        }
                        else
                        {
                            if (response && response.data && response.data.code)
                            {
                                dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                                setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                            }
                        }
                    }
                );
        }
    };
}

// Comments

function postComment(message, imdb_code, series)
{
    if (message && imdb_code)
    {
        return (dispatch, getState) => {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            usersServices.postComment(message, imdb_code, session.token, series)
                .then(response => {
                    if (response && response.data && response.data.success)
                    {
                        if (!series)
                        {
                            axios.get(`http://localhost:8080/api/movies/${imdb_code}`, {headers: {authorization: session.token}})
                                .then(response => {
                                    if (response && response.data && response.data.movie)
                                        dispatch({type: moviesConstants.GET_COMMENTS, comments: response.data.movie.comments, commented: true});
                                });
                        }
                        else
                        {
                            axios.get(`http://localhost:8080/api/series/${imdb_code}`, {headers: {authorization: session.token}})
                                .then(response => {
                                    if (response && response.data && response.data.serie)
                                        dispatch({type: moviesConstants.GET_COMMENTS, comments: response.data.serie.comments, commented: true});
                                });
                        }
                        dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                        setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    }
                    else
                    {
                        if (response.data && response.data.error && response.data.code)
                        {
                            dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {
                                dispatch(alertsActions.clear())
                            }, 5000);
                        }
                    }
                })
        };
    }
}

function deleteComment(imdb_code, series)
{
        return (dispatch, getState) => {
            const session = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));
            usersServices.deleteComment(imdb_code, session.token, series)
                .then(response => {
                    if (response && response.data && response.data.success)
                    {
                        if (!series)
                        {
                            axios.get(`http://localhost:8080/api/movies/${imdb_code}`, {headers: {authorization: session.token}})
                                .then(response => {
                                    if (response && response.data && response.data.movie)
                                        dispatch({type: moviesConstants.GET_COMMENTS, comments: response.data.movie.comments, commented: false});
                                });
                        }
                        else
                        {
                            axios.get(`http://localhost:8080/api/series/${imdb_code}`, {headers: {authorization: session.token}})
                                .then(response => {
                                    if (response && response.data && response.data.movie)
                                        dispatch({type: moviesConstants.GET_COMMENTS, comments: response.data.serie.comments, commented: false});
                                });
                        }
                        dispatch(alertsActions.success(messages[response.data.code][getState().lang.languageDefault]));
                        setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    }
                    else
                    {
                        if (response && response.data && response.data.error && response.data.code)
                        {
                            dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {
                                dispatch(alertsActions.clear())
                            }, 5000);
                        }
                    }
                })
        };

}