import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from "react-redux"
import { usersActions } from "../actions/usersActions"
import EasyTransition from 'react-easy-transition'
import RegisterForm from "./RegisterForm"
import { getActiveLanguage, getTranslate  } from "react-localize-redux"
import {oauthActions} from "../actions/oauthActions"

class Register extends Component
{
    componentWillMount()
    {
        const { dispatch, users, history, currentLanguage } = this.props;

        if (currentLanguage && currentLanguage === "en")
            document.title = "Hypertube - Register";
        else
            document.title = "Hypertube - S'enregister";

        if (dispatch && history)
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

        if (values.username && values.email && values.password && values.passwordConfirm && values.firstName && values.lastName && dispatch && history)
            dispatch(usersActions.register(values.username, values.email, values.password, values.passwordConfirm, values.firstName, values.lastName, history));
        else
            history.push('/create-account');
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
                    <RegisterForm onSubmit={this.submit} />
                </EasyTransition>
            </div>
        );
    }
}

Register.propTypes = {
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

export default connect(mapStateToProps)(Register)