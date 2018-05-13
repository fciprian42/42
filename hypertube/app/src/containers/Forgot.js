import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from "react-redux"
import {usersActions} from "../actions/usersActions"
import EasyTransition from 'react-easy-transition'
import ForgotForm from "./ForgotForm"
import { getActiveLanguage, getTranslate  } from "react-localize-redux"
import {oauthActions} from "../actions/oauthActions"

class Forgot extends Component
{
    componentWillMount()
    {
        const { dispatch, history, users, currentLanguage } = this.props;

        if (currentLanguage && currentLanguage === "en")
            document.title = "Hypertube - Forgot my password";
        else
            document.title = "Hypertube - Oublie de mot de passe";

        if (dispatch)
            dispatch(oauthActions.checkOnlineOAuth(history));

        if (users && history && users.loggedIn)
            history.push('/dashboard');
    }

    handleSwitchLang = () => {
        const { dispatch, currentLanguage } = this.props;

        if (dispatch && currentLanguage)
            dispatch(usersActions.switchLanguage(currentLanguage));
    };

    submit = values => {
        const { dispatch, history } = this.props;

        if (values && dispatch && history)
            dispatch(usersActions.generateToken(values.email, history));
    };

    render()
    {
        const { alerts, location, currentLanguage } = this.props;

        return (
            <div className="main-content">
                <div className="translate-nav">
                    <div className="translate-nav-lang" onClick={this.handleSwitchLang}>
                        {currentLanguage && <img id="flat-nav-lang" src={require("../style/images/languages/"+ currentLanguage +".png")} alt="" height="20"/>}
                    </div>
                </div>
                {alerts.message && <div id="notifications" className={`notifications ${alerts.type} alertsFade`} style={{position: "absolute", top: 61}}>{alerts.message}</div>}
                <EasyTransition
                    path={location && location.pathname}
                    initialStyle={{opacity: 0}}
                    transition="opacity 0.3s ease-in"
                    finalStyle={{opacity: 1}}
                >
                        <h2>Hypertube</h2>
                        <ForgotForm onSubmit={this.submit} />
                </EasyTransition>
            </div>
        );
    }
}

Forgot.propTypes = {
    history: PropTypes.object.isRequired,
    alerts: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    const { alerts } = state;
    return {
        users: state.users,
        alerts,
        translate: getTranslate(state.locale),
        currentLanguage: getActiveLanguage(state.locale).code
    }
};

export default connect(mapStateToProps)(Forgot)