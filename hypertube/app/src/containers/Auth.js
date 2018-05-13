import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {zoomIn} from 'react-animations'
import Radium, {StyleRoot} from 'radium'
import {connect} from "react-redux"
import {usersActions} from "../actions/usersActions"
import { getTranslate, getActiveLanguage } from 'react-localize-redux'
import AuthForm from "./AuthForm"

const styles = {
    zoomIn: {
        animation: 'x 0.5s',
        animationName: Radium.keyframes(zoomIn, 'zoomIn')
    }
};

class Auth extends Component
{
    componentDidMount()
    {
        const { currentLanguage } = this.props;

        if (currentLanguage && currentLanguage === "en")
            document.title = "Hypertube - Login";
        else
            document.title = "Hypertube - Se connecter";
    }

    submit = values => {
        const { dispatch, history } = this.props;

        if (values && dispatch && history)
            dispatch(usersActions.login(values.email, values.password, history));
    };

    render()
    {
        return (
            <StyleRoot id="main-content" style={styles.zoomIn}>
                <h2>Hypertube</h2>
                <AuthForm onSubmit={this.submit} />
            </StyleRoot>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        users: state.users,
        translate: getTranslate(state.locale),
        currentLanguage: getActiveLanguage(state.locale).code
    };
};

Auth.propTypes = {
    history: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired
};

export default connect(mapStateToProps)(Auth)