import React, { Component } from 'react'
import { connect } from "react-redux"
import { oauthActions } from "../actions/oauthActions"
import PropTypes from 'prop-types'
import { usersActions } from "../actions/usersActions"
import EasyTransition from 'react-easy-transition'
import { Translate } from 'react-localize-redux'
import { Link } from "react-router-dom"
import { getActiveLanguage, getTranslate  } from "react-localize-redux"
import messages from "../messages"
import ProfileForm from "../containers/ProfileForm"
import {alertsActions} from "../actions/alertsActions"

import axios from 'axios'
import {usersConstants} from "../constants/usersConstants"

class Profile extends Component
{
    submit = values => {
        const { dispatch, currentLanguage, users, history } = this.props;

        let user;

        if (users)
            user = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        if (values && dispatch && currentLanguage && history && users)
        {
            dispatch(usersActions.editInfos(values, history, user.isOauth));
            axios.get(`http://localhost:8080/api/users/avatar/${user.username}`)
                .then(response => {
                    if (response.data.code === "avatarFound")
                        dispatch({type: usersConstants.GET_AVATAR, url: response.data.src});
                });
        }
    };

    componentDidMount()
    {
        const { dispatch, users, history, currentLanguage } = this.props;
        let user;

        if (users && users.session)
            user = JSON.parse(users.session);

        if (currentLanguage && currentLanguage === "en")
            document.title = "Hypertube - My profile";
        else
            document.title = "Hypertube - Mon profile";

        if (dispatch && history)
        {
            dispatch(oauthActions.checkOnlineOAuth(history));
            dispatch(usersActions.getLang());
        }

        if (users && history && !users.loggedIn)
            history.push('/');
        else
        {
            if (users && history && dispatch && currentLanguage && users && users.session)
            {
                if (!user.username)
                {
                    dispatch(alertsActions.info(messages['usernameNeeded'][currentLanguage]));
                    setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                }
                else
                {
                    if (user.username)
                    {
                        axios.get(`http://localhost:8080/api/users/avatar/${user.username}`)
                            .then(response => {
                                if (response.data.code === "avatarFound")
                                    dispatch({type: usersConstants.GET_AVATAR, url: response.data.src});
                            });
                    }
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

    handleSwitch = (e) => {
        const { dispatch } = this.props;
        const id = e.target.id;

        if (dispatch && (id === "flag-fr" || id === "btn-fr"))
            dispatch(usersActions.switchLanguage('fr'));

        if (dispatch && (id === "flag-en" || id === "btn-en"))
            dispatch(usersActions.switchLanguage('en'));
    };

	handleFileUpload = (e) => {
	    const { users, dispatch, currentLanguage } = this.props;
		const file = e.target.files[0];
		const name = "Avatar";

		let data = new FormData();
		data.append('file', file);
		data.append('name', name);

		if (users && JSON.parse(users.session).username)
        {
            if (dispatch && users && currentLanguage && file)
            {
                if (file.size > 2000000)
                {
                    dispatch(alertsActions.warning(messages['sizeFile'][currentLanguage]));
                    setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    e.target.value = null;
                }
                else if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/jpg")
                {
                    dispatch(alertsActions.warning(messages['typeFile'][currentLanguage]));
                    setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    e.target.value = null;
                }
                else
                {
                    axios.post('http://localhost:8080/api/users/avatar', data, { headers: { authorization: JSON.parse(users.session).token } })
                        .then(response => {
                            dispatch({type: usersConstants.GET_AVATAR, url: response.data.src});
                            dispatch(alertsActions.success(messages[response.data.code][currentLanguage]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                        });
                }
            }
        }
        else
        {
            e.target.value = null;
            dispatch(alertsActions.info(messages['usernameNeeded'][currentLanguage]));
            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
        }
	};

    render()
    {
        const { alerts, location, users, lang } = this.props;

        let user;

        if (users && users.session)
            user = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        const accessDenied = {
            width: "100%",
            display: users.session && user.isOauth ? "none" : "block"
        };

        return (
            <div>
                {alerts.message && <div id="notifications" className={`notifications ${alerts.type} alertsFade`}>{alerts.message}</div>}
                <EasyTransition
                    path={location && location.pathname}
                    initialStyle={{opacity: 0}}
                    transition="opacity 0.3s ease-in"
                    finalStyle={{opacity: 1, height: "100vh"}}
                >
                    <div className="profileContent">
                        <header id="headerProfile" className="header" style={{display: "none", width: "100vw", alignItems: "center", padding: 0, backgroundColor: "#262A30"}}>
                            <Link to="/dashboard">
                                <div className="logo" style={{padding: 0}}>
                                    <img src={require("../style/images/logo.png")} alt="" height="60"/>
                                </div>
                            </Link>
                            <div>
                                <Link to="/bookmarks">
                                    <i className="fas fa-bookmark" style={{fontSize: "1.4rem", marginRight: 30}}></i>
                                </Link>
                                <Link to="/series">
                                    <i className="fas fa-film"></i>
                                </Link>
                            </div>
                            <a className="logout" style={{width: "unset", marginRight: 15, padding: "0 15px"}} onClick={this.handleLogout}>
                                <i className="fas fa-power-off"></i>
                            </a>
                        </header>
                        <nav className="navigation">
                            <Link to="/dashboard">
                                <div className="logo">
                                    <img src={require("../style/images/logo.png")} alt="" height="60"/>
                                </div>
                            </Link>
                            <div className="nav-items">
                                <ul>
                                    <Link to="/bookmarks">
                                        <li>
                                            <i className="fas fa-bookmark"></i>
                                        </li>
                                    </Link>
                                    <Link to="/history">
                                        <li>
                                            <i className="fas fa-clock" style={{color: "#fff"}}></i>
                                        </li>
                                    </Link>
                                    <Link to="/series">
                                        <li>
                                            <i className="fas fa-film"></i>
                                        </li>
                                    </Link>
                                </ul>
                            </div>
                            <a className="logout" onClick={this.handleLogout}>
                                <i className="fas fa-power-off"></i>
                            </a>
                        </nav>
                        <div className="usersInfos">
                            <div className="userPicture">
                                <img src={(users.avatar) || require("../style/images/no-avatar.jpg")} alt="" height="200"/>
                                <div style={{position: "relative", width: "100%"}}>
                                    <input type="file" className="input-file" onChange={this.handleFileUpload}/>
                                    <label className="content-file">
                                        <Translate id="editAvatar" /> <small>(png, jpeg, jpg)</small>
                                    </label>
                                </div>
                            </div>
                            <div className="userLang">
                                <button id="btn-en" onClick={this.handleSwitch} className={`btn-translate ${lang && lang.languageDefault === "en" ? "active" : "no-active"}`} style={{marginRight: 30}}>
                                    <img id="flag-en" src={require('../style/images/languages/en.png')} alt="english" height="30" />
                                </button>
                                <button id="btn-fr" onClick={this.handleSwitch} className={`btn-translate ${lang && lang.languageDefault === "fr" ? "active" : "no-active"}`}>
                                    <img id="flag-fr" src={require('../style/images/languages/fr.png')} alt="french" height="30" />
                                </button>
                            </div>
                            <div className="userInfos">
                                <h2 style={{color: "#f1f2f6"}}>
                                    <Translate id="myInfos" />
                                </h2>
                                <ProfileForm onSubmit={this.submit} isOauth={users.session && user.isOauth} user={users && users.session ? users.session : sessionStorage.getItem('auth')}/>
                                <Link to="/profile/reset" style={{fontWeight: "bold", color: "#c8d6e5"}}>
                                    <button className="btn btn-gray" style={accessDenied}>
                                        <Translate id="editPassword" />
                                    </button>
                                </Link>
                            </div>
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
