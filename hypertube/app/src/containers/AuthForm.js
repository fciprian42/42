import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Translate } from 'react-localize-redux'
import { Link } from "react-router-dom"

let AuthForm = props => {
    const { handleSubmit } = props;

    const handleBlur = () => {
        const email = document.getElementById('email');
        const password = document.getElementById('password');

        if (email && password)
            document.getElementById('submit').disabled = !(email.value.length > 0 && password.value.length > 0);
    };

    return (
        <div className="login-form" id="login-form">
            <form onSubmit={ handleSubmit } className="align-items-column">
                <div className="field">
                    <Field
                        type="text"
                        name="email"
                        id="email"
                        component="input"
                        className="form-control"
                        placeholder="Ex: mxalice@gmail.com | JohnDoe397"
                        onChange={handleBlur}
                        maxLength={60}
                    />
                    <span><i className="fas fa-envelope"></i></span>
                </div>

                <div className="field">
                    <Field
                        type="password"
                        name="password"
                        id="password"
                        component="input"
                        className="form-control"
                        placeholder="******"
                        onChange={handleBlur}
                    />
                    <span><i className="fas fa-key"></i></span>
                </div>

                <div className="options-form">
                    <Link to="/forgot-password" style={{marginTop: 0, right: 0, position: "absolute"}}><Translate id="forgotPassword" /></Link>
                </div>
                <button type="submit" id="submit" className="btn btn-green" disabled="true">
                    <i className="fas fa-lock-open"></i>
                </button>
                <a href="http://localhost:8080/api/auth/facebook">
                    <button type="button" className="btn btn-blue">
                        <i className="fab fa-facebook-f"></i>
                    </button>
                </a>
                <a href="http://localhost:8080/api/auth/google">
                    <button type="button" className="btn btn-google">
                        <i className="fab fa-google"></i>
                    </button>
                </a>
                <a href="http://localhost:8080/api/auth/42">
                    <button type="button" className="btn btn-42">
                        <img src={require('../style/images/42.svg')} height={20} width={20} alt=""/>
                    </button>
                </a>
                <Link to="/create-account"><Translate id="notAccount" /></Link>
            </form>
        </div>
    );
};

export default AuthForm = reduxForm({
    form: 'auth'
})(AuthForm)