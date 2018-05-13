import React, { Component } from 'react'
import { connect } from "react-redux"
import PropTypes from 'prop-types'
import axios from 'axios'
import { getActiveLanguage, getTranslate  } from "react-localize-redux"
import messages from "../messages";
import { Link } from "react-router-dom"
import { oauthActions } from "../actions/oauthActions"
import EasyTransition from 'react-easy-transition'
import { Translate } from 'react-localize-redux'
import {alertsActions} from "../actions/alertsActions"
import {usersActions} from "../actions/usersActions"
import {usersConstants} from "../constants/usersConstants"

class Users extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {};
    }

    componentDidMount()
    {
        const { dispatch, users, history, match, currentLanguage } = this.props;

        if (dispatch && history)
        {
            dispatch(oauthActions.checkOnlineOAuth(history));
            dispatch(usersActions.getLang());
        }

        if (users && history && !users.loggedIn)
            history.push('/');
        else
        {

            let user;

            if (users)
                user = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

            if (!user.username && dispatch && currentLanguage)
            {
                dispatch(alertsActions.info(messages['usernameNeeded'][currentLanguage]));
                setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                history.push('/profile');
            }
            else
            {
                if (match && match.params && users && users.session)
                {
                    document.title = match.params.username;

                    axios.get(`/api/users/${match.params.username}`, { headers : {authorization : user.token }})
                        .then(response => {
                            if (!response.data.error && response && response.data && response.data.user)
                            {
                                const data = response.data.user;

                                this.setState({
                                    id: data.id,
                                    username: data.username,
                                    firstname: data.firstName,
                                    lastname: data.lastname
                                });

                                this.getAvatar();
                            }
                        });
                }
            }
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

    getAvatar = () => {
        const {match, dispatch} = this.props;

        if (match && dispatch)
        {
            axios.get(`http://localhost:8080/api/users/avatar/${match.params.username}`)
                .then(response => {
                    if (response && response.data && response.data.code === "avatarFound")
                        dispatch({type: usersConstants.GET_AVATAR, url: response.data.src});
                });
        }
    };

    handleSwitch = () => {
        const { dispatch, currentLanguage } = this.props;

        if (dispatch)
        {
            if (currentLanguage === "en")
                dispatch(usersActions.switchLanguage("fr"));
            else
                dispatch(usersActions.switchLanguage("en"));
        }
    };

    render()
    {
        const { alerts, location, lang, match, history, users} = this.props;
        let me;

        if (users)
            me = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        const found = (
            <div>
                <EasyTransition
                    path={location && location.pathname}
                    initialStyle={{opacity: 0}}
                    transition="opacity 0.3s ease-in"
                    finalStyle={{opacity: 1, height: "100vh"}}
                >
                    <div className="profileContent" style={{height: "100%"}}>
                        <header id="headerProfile" className="header" style={{display: "none", width: "100vw", alignItems: "center", padding: 0, backgroundColor: "#262A30"}}>
                            <div className="logo" style={{padding: 0, lineHeight: "65px"}}>
                                <Link to="/dashboard">
                                    <img src={require("../style/images/logo.png")} alt="" height="60"/>
                                </Link>
                            </div>
                            <div>
                                <button id={`btn-${lang && lang.languageDefault}`} onClick={this.handleSwitch} className={`btn-users-trans ${lang && lang.languageDefault === "en" ? "active" : "no-active"}`} style={{marginRight: 30}}>
                                    <img id={`flag-${lang && lang.languageDefault}`} src={require(`../style/images/languages/${lang && lang.languageDefault}.png`)} alt={lang && lang.languageDefault} height="30" />
                                </button>
                            </div>
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
                            <div style={{height: "80%"}}>
                                <button id={`btn-${lang && lang.languageDefault}`} onClick={this.handleSwitch} className={`btn-users-trans ${lang && lang.languageDefault === "en" ? "active" : "no-active"}`} style={{marginRight: 30}}>
                                    <img id={`flag-${lang && lang.languageDefault}`} src={require(`../style/images/languages/${lang && lang.languageDefault}.png`)} alt={lang && lang.languageDefault} height="30" />
                                </button>
                            </div>
                            <a className="logout" onClick={this.handleLogout}>
                                <i className="fas fa-power-off"></i>
                            </a>
                        </nav>
                        <div className="usersInfos">
                            <div className="userPicture" style={{marginBottom: 0}}>
                                <img src={(users.session && users.avatar) || require('../style/images/no-avatar.jpg')} alt="" height="200"/>
                            </div>
                            <div className="userInfos" style={{marginBottom: 30}}>
                                <h3>
                                    <p>
                                        <Translate id="hi" /> {users.session && me.username} ! <img src={require('../style/images/hello.png')} height={30} alt=""/>
                                    </p>
                                    <Translate id="myself" /> {match && match.params.username} <br/>  <Translate id="trueName" /> {this.state.firstname} {this.state.lastname}
                                </h3>
                            </div>
                            <button className="btn btn-gray" onClick={() => {history && history.goBack()}}>
                                <i className="fas fa-undo-alt"></i>
                            </button>
                        </div>
                    </div>
                </EasyTransition>
            </div>
        );

        const notFound = (
            <div>
                <EasyTransition
                    path={location && location.pathname}
                    initialStyle={{opacity: 0}}
                    transition="opacity 0.3s ease-in"
                    finalStyle={{opacity: 1, height: "100vh"}}
                >
                    <div className="profileContent" style={{height: "100%"}}>
                        <header id="headerProfile" className="header" style={{display: "none", width: "100vw", alignItems: "center", padding: 0, backgroundColor: "#262A30"}}>
                            <div className="logo" style={{padding: 0, lineHeight: "65px"}}>
                                <Link to="/dashboard">
                                    <img src={require("../style/images/logo.png")} alt="" height="60"/>
                                </Link>
                            </div>
                            <div>
                                <button id={`btn-${lang && lang.languageDefault}`} onClick={this.handleSwitch} className={`btn-users-trans ${lang && lang.languageDefault === "en" ? "active" : "no-active"}`} style={{marginRight: 30}}>
                                    <img id={`flag-${lang && lang.languageDefault}`} src={require(`../style/images/languages/${lang && lang.languageDefault}.png`)} alt={lang && lang.languageDefault} height="30" />
                                </button>
                            </div>
                            <div className="logout" style={{width: "unset", marginRight: 15, padding: "0 15px"}}>
                                <a onClick={this.handleLogout}>
                                    <i className="fas fa-power-off"></i>
                                </a>
                            </div>
                        </header>
                        <nav className="navigation">
                            <div className="logo">
                                <Link to="/dashboard">
                                    <img src={require("../style/images/logo.png")} alt="" height="60"/>
                                </Link>
                            </div>
                            <div style={{height: "80%"}}>
                                <button id={`btn-${lang && lang.languageDefault}`} onClick={this.handleSwitch} className={`btn-users-trans ${lang && lang.languageDefault === "en" ? "active" : "no-active"}`} style={{marginRight: 30}}>
                                    <img id={`flag-${lang && lang.languageDefault}`} src={require(`../style/images/languages/${lang && lang.languageDefault}.png`)} alt={lang && lang.languageDefault} height="30" />
                                </button>
                            </div>
                            <div className="logout">
                                <a onClick={this.handleLogout}>
                                    <i className="fas fa-power-off"></i>
                                </a>
                            </div>
                        </nav>
                        <div className="usersInfos">
                            <div className="userPicture">
                                <img src={require('../style/images/batman.jpg')} alt="" height="200" width="210" style={{marginBottom: 10}}/>
                                <h3 style={{marginBottom: 40}}>
                                    <strong>{this.props.match && this.props.match.params.username}</strong> <Translate id="userNotFound" />
                                </h3>
                            </div>
                            <button className="btn btn-gray" onClick={() => {history && history.goBack()}}>
                                <i className="fas fa-undo-alt"></i>
                            </button>
                        </div>
                    </div>
                </EasyTransition>
            </div>
        );

        return(
            <div>
                {alerts.message && <div id="notifications" className={`notifications ${alerts.type} alertsFade`}>{alerts.message}</div>}
                {this.state.id ? found : notFound}
            </div>
        );
    }
}

Users.propTypes = {
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

export default connect(mapStateToProps)(Users)
