import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"

import './style/css/App.css'
import './style/css/fontawesome-all.min.css'

import store from "./store"
import App from "./components/App"
import Register from "./containers/Register"
import Forgot from "./containers/Forgot"
import Reset from "./containers/Reset"
import Video from "./components/Video"
import Movies from "./components/Movie"
import Users from "./components/Users"
import NotFound from "./containers/NotFound"
import Profile from "./components/Profile"
import ResetProfile from "./containers/ResetProfile"
import Bookmarks from "./components/Bookmarks"
import History from "./components/History"
import Serie from "./components/Serie"
import Series from "./components/Series"

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Switch>
                <Route
                    exact
                    path="/"
                    component={App}
                />
                <Route
                    exact
                    path="/oauth/:token"
                    component={App}
                />
                <Route
                    exact
                    path="/create-account"
                    component={Register}
                />
                <Route
                    exact
                    path="/forgot-password"
                    component={Forgot}
                />
                <Route
                    exact
                    path="/reset-password"
                    component={Reset}
                />
                <Route
                    exact
                    path="/bookmarks"
                    component={Bookmarks}
                />
                <Route
                    exact
                    path="/history"
                    component={History}
                />
                <Route
                    exact
                    path="/dashboard"
                    component={Video}
                />
                <Route
                    exact
                    path="/profile"
                    component={Profile}
                />
                <Route
                    exact
                    path="/series"
                    component={Series}
                />
                <Route
                    exact
                    path="/profile/reset"
                    component={ResetProfile}
                />
                <Route
                    exact
                    path="/movies/:video"
                    component={Movies}
                />
                <Route
                    exact
                    path="/series/:id"
                    component={Serie}
                />
                <Route
                    exact
                    path="/users/:username"
                    component={Users}
                />
                <Route component={NotFound} />
            </Switch>
        </Router>
    </Provider>,
    document.getElementById('root')
);