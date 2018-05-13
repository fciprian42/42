import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from "react-redux"
import Auth from '../containers/Auth'
import { oauthActions } from "../actions/oauthActions"
import axios from "axios"
import { usersActions } from "../actions/usersActions"
import { getActiveLanguage, getTranslate  } from "react-localize-redux"
import {alertsActions} from "../actions/alertsActions"
import {usersConstants} from "../constants/usersConstants"
import messages from "../messages"

class App extends Component
{
    componentDidMount()
    {
        const { dispatch, users, history, currentLanguage } = this.props;

        document.title = "Hypertube";

        if (dispatch && history)
        {
            dispatch(oauthActions.checkOnlineOAuth(history));
            if (users && users.session)
                dispatch(usersActions.getLang());
        }

        if (users && history && users.loggedIn)
            history.push('/dashboard');

        if (this.props.location.pathname === "/oauth/token" && users && !users.loggedIn)
        {
            let token = this.props.location.search.replace('?=', '');
            axios.get('http://localhost:8080/api/auth', {headers: { authorization: token }})
                .then(response => {
                    if (response && response.data && response.data.user)
                    {
                        axios.get(`/api/users/me`, {headers: {authorization: token}})
                            .then(
                                response => {
                                    let username;

                                    if (response && response.data && response.data.user && response.data.user.username)
                                        username = response.data.user.username;
                                    else
                                        username = null;

                                    if (response.data && response.data.user)
                                    {
                                        let user = {
                                            email: response.data.user.email,
                                            token: token,
                                            id: response.data.user.id,
                                            username: username,
                                            firstname: response.data.user.firstName,
                                            lastname: response.data.user.lastname,
                                            isOauth: true,
                                            lang: "en"
                                        };

                                        if (!sessionStorage.getItem('auth'))
                                            sessionStorage.setItem('auth', JSON.stringify(user));

                                        if (dispatch && currentLanguage && history)
                                        {
                                            dispatch({type: usersConstants.LOGIN_SUCCESS, session: JSON.stringify(user)});
                                            dispatch(alertsActions.success(messages['successLogin'][currentLanguage && currentLanguage]));
                                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);

                                            history.push('/dashboard');
                                        }
                                    }
                                    else
                                    {
                                        if (dispatch && response && response.data && response.data.error)
                                        {
                                            dispatch(alertsActions.success(messages[response.data.code][currentLanguage && currentLanguage]));
                                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                                        }
                                    }
                                }
                            );
                    }
                })
                .catch(warning => {
                    if (users && users.loggedIn)
                        history.push('/dashboard');
                    else
                        history.push('/')
                })
        }
        else
        {
            if (users && history && users.loggedIn)
                history.push('/dashboard');
            else
                history.push('/')
        }
    }

    handleSwitchLang = () => {
        const { dispatch, currentLanguage } = this.props;

        if (dispatch && currentLanguage)
            dispatch(usersActions.switchLanguage(currentLanguage));
    };

    render()
    {
        const { alerts, currentLanguage, history } = this.props;

        return (
            <div className="main-content">
                <div className="translate-nav">
                    <div className="translate-nav-lang" onClick={this.handleSwitchLang}>
                        {currentLanguage && currentLanguage && <img id="flat-nav-lang" src={require("../style/images/languages/"+ currentLanguage +".png")} alt="" height="20"/>}
                    </div>
                </div>
                {alerts.message && <div id="notifications" className={`notifications ${alerts.type} alertsFade`} style={{position: "absolute", top: 61}}>{alerts.message}</div>}
                <Auth history={history && history} />
            </div>
        );
    }
}

App.propTypes = {
    history: PropTypes.object.isRequired,
    alerts: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    const { alerts } = state;
    return {
        alerts,
        users: state.users,
        translate: getTranslate(state.locale),
        currentLanguage: getActiveLanguage(state.locale).code
    };
};

export default connect(mapStateToProps)(App)
