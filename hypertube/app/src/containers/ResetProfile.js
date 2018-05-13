import React, { Component } from 'react'
import { connect } from "react-redux"
import { oauthActions } from "../actions/oauthActions"
import PropTypes from 'prop-types'
import { usersActions } from "../actions/usersActions"
import EasyTransition from 'react-easy-transition'
import { Link } from "react-router-dom"
import { getActiveLanguage, getTranslate  } from "react-localize-redux"
import messages from "../messages"
import ResetForm from "./ResetForm"
import {alertsActions} from "../actions/alertsActions"

class Profile extends Component
{
    submit = values => {
        const { dispatch, history, users } = this.props;
        let me;

        if (users)
            me = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        if (values && dispatch && history && users && !users.isOauth)
            dispatch(usersActions.resetPassword(me.email, values.code, values.password, history));
    };

    componentDidMount()
    {
        const { dispatch, users, history } = this.props;
        let user;

        if (users && users.session)
            user = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        if (dispatch && history)
        {
            dispatch(oauthActions.checkOnlineOAuth(history));
            dispatch(usersActions.getLang());
        }

        if ((users && !users.loggedIn) || (users && !users.session))
            history.push('/');
        else if (users && users.session && users.loggedIn && user.isOauth)
            history.push('/profile');
        else
        {
            if (dispatch)
                dispatch(usersActions.generateToken(user.email, history));
        }
    }

    handleLogout = () => {
        const { dispatch, history, currentLanguage } = this.props;

        if (dispatch && history && currentLanguage)
        {
            dispatch(usersActions.logout());
            dispatch(alertsActions.info(messages['successLogout'][currentLanguage]));
            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
            history.push('/');
        }
    };

    render()
    {
        const { alerts, location, users } = this.props;
        let session;

        if (users)
            session = users.session ? users.session : JSON.parse(sessionStorage.getItem('auth'));

        return (
            <div>
                {alerts.message && <div id="notifications" className={`notifications ${alerts.type} alertsFade`}>{alerts.message}</div>}
                <EasyTransition
                    path={location && location.pathname}
                    initialStyle={{opacity: 0}}
                    transition="opacity 0.3s ease-in"
                    finalStyle={{opacity: 1, height: "100vh", display: "flex", flexDirection: "column"}}
                >
                    <div className="resetContent" style={{height: "100%", display: "flex"}}>
                        <header id="headerProfile" className="header" style={{display: "none", width: "100vw", alignItems: "center", padding: 0, backgroundColor: "#262A30"}}>
                            <div className="logo" style={{padding: 0}}>
                                <Link to="/dashboard">
                                    <img src={require("../style/images/logo.png")} alt="" height="65"/>
                                </Link>
                            </div>
                            <div></div>
                            <a className="logout" style={{width: "unset", marginRight: 15, padding: "0 15px"}} onClick={this.handleLogout}>
                                <i className="fas fa-power-off"></i>
                            </a>
                        </header>
                        <nav className="navigation">
                            <div className="logo">
                                <Link to="/dashboard">
                                    <img src={require("../style/images/logo.png")} alt="" height="60"/>
                                </Link>
                            </div>
                            <div></div>
                            <a className="logout" onClick={this.handleLogout}>
                                <i className="fas fa-power-off"></i>
                            </a>
                        </nav>
                        <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "102%", height: "100%"}}>
                            <ResetForm onSubmit={this.submit} session={session && session} />
                        </div>
                    </div>
                </EasyTransition>
            </div>
        );
    }
}

Profile.propTypes = {
    history: PropTypes.object.isRequired,
    alerts: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    lang: PropTypes.object.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired
};


const mapStateToProps = state => {
    const { alerts } = state;
    return {
        lang: state.lang,
        alerts,
        users: state.users,
        translate: getTranslate(state.locale),
        currentLanguage: getActiveLanguage(state.locale).code
    };
};

export default connect(mapStateToProps)(Profile)