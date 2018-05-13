import { createStore, applyMiddleware, combineReducers, compose } from "redux"
import { connectRoutes } from "redux-first-router"
import createHistory from "history/createBrowserHistory"
import { reducer as formReducer } from "redux-form"
import thunk from 'redux-thunk'
import { localeReducer as locale } from 'react-localize-redux'
import { initialize, addTranslation} from 'react-localize-redux'
import { translations} from "./locales";

import users from "./reducers/usersReducer"
import alerts from "./reducers/alertsReducer"
import movies from "./reducers/moviesReducer"
import lang from "./reducers/langReducer"

const history = createHistory();
const routes = {home: "/", users: "/users/:username", history: "/history", serie: "/series/:id", series: "/series", bookmarks: "/bookmarks", forgot: "/forgot-password", oauth: "/oauth/:token", register: "/create-account", dashboard: "/dashboard", profile: "/profile", reset: "/profile/reset", movies: "/movies/:video"};
const { reducer, middleware } = connectRoutes(history, routes);

const store = createStore(
    combineReducers({location: reducer, locale: locale, users: users, alerts: alerts, movies: movies, lang: lang, form: formReducer}),
    {},
    compose(applyMiddleware(thunk, middleware))
);

store.dispatch(initialize(['en', 'fr'], {defaultLanguage: store.getState().lang.defaultLanguage}));
store.dispatch(addTranslation(translations));

export default store