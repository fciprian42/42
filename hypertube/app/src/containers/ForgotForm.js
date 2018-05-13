import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Translate } from 'react-localize-redux'
import { Link } from "react-router-dom"

let ForgotForm = props => {
    const { handleSubmit } = props;

    const handleBlur = () => {
        const email = document.getElementById('email');

        if (email)
            document.getElementById('submit').disabled = !(email.value.length > 0);
    };

    return (
        <div className="forgot-form" id="forgot-form">
            <form onSubmit={ handleSubmit } className="align-items-column">
                <div className="field">
                    <Field
                        type="email"
                        name="email"
                        id="email"
                        component="input"
                        className="form-control"
                        placeholder="Ex: alice@gmail.com"
                        onChange={handleBlur}
                        maxLength={60}
                    />
                    <span><i className="fas fa-envelope"></i></span>
                </div>

                <button type="submit" id="submit" className="btn btn-green" disabled="true">
                    <i className="fas fa-envelope"></i>
                </button>

                <Link to="/"><Translate id="alreadyRemember" /></Link>
            </form>
        </div>
    );
};

export default ForgotForm = reduxForm({
    form: 'forgot'
})(ForgotForm)