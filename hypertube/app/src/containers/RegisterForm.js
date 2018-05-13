import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Translate } from 'react-localize-redux'
import { Link } from "react-router-dom"

let RegisterForm = props => {
    const { handleSubmit } = props;

    const handleBlur = () => {
        let count = 0;
        const checkbox = document.getElementById('cgu').checked;
        const elements = document.querySelectorAll('#register-form input');
        const uppercase = !(/^[^A-Z]*$/).test(elements[4].value);
        const numeric = /\d/.test(elements[4].value);
        const length = elements[4].value.length > 6;

        if (uppercase)
        {
            if (count < 3)
                count++;
        }
        else
        {
            if (count > 0)
                count --;
        }

        if (numeric)
        {
            if (count < 3)
                count++;
        }
        else
        {
            if (count > 0)
                count --;
        }

        if (length)
        {
            if (count < 3)
                count++;
        }
        else
        {
            if (count > 0)
                count --;
        }

        switch (count)
        {
            case 0:
                document.getElementById('security-level').style.backgroundColor = "#ff4d4d";
                break;
            case 1:
                document.getElementById('security-level').style.backgroundColor = "#ffaf40";
                break;
            case 2:
                document.getElementById('security-level').style.backgroundColor = "#ffaf40";
                break;
            case 3:
                document.getElementById('security-level').style.backgroundColor = "#32ff7e";
                break;
            default:
                break;
        }

        for (let i = 0; i < elements.length - 1; i++)
        {
            if (elements[i].value.length > 0 && checkbox)
                document.getElementById('submit').disabled = false;
            else
            {
                document.getElementById('submit').disabled = true;
                break;
            }
        }
    };

    return (
        <div className="register-form" id="register-form">
            <form onSubmit={ handleSubmit } className="align-items-column">
                <div className="field">
                    <Field
                        type="text"
                        name="username"
                        id="username"
                        component="input"
                        className="form-control"
                        placeholder="Ex: JohnDoe03"
                        onChange={handleBlur}
                        maxLength={30}
                    />
                    <span><i className="fas fa-user"></i></span>
                </div>

                <div className="field">
                    <Field
                        type="text"
                        name="firstName"
                        id="firstName"
                        component="input"
                        className="form-control"
                        placeholder="Ex: John"
                        onChange={handleBlur}
                        maxLength={20}
                    />
                    <span><i className="fas fa-user"></i></span>
                </div>

                <div className="field">
                    <Field
                        type="text"
                        name="lastName"
                        id="lastName"
                        component="input"
                        className="form-control"
                        placeholder="Ex: Doe"
                        onChange={handleBlur}
                        maxLength={25}
                    />
                    <span><i className="fas fa-user"></i></span>
                </div>

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
                    <span style={{left: "unset", right: 0, top: 19}}>
                        <div id="security-level" className="security-level"></div>
                    </span>
                </div>

                <div className="field">
                    <Field
                        type="password"
                        component="input"
                        name="passwordConfirm"
                        id="passwordConfirm"
                        className="form-control"
                        placeholder="Confirm password"
                        onChange={handleBlur}
                    />
                    <span><i className="fa fa-redo-alt fa-spin"></i></span>
                </div>

                <div className="options-form" style={{display: "block"}}>
                    <Field
                        type="checkbox"
                        name="r_cgu"
                        component="input"
                        id="cgu"
                        onClick={handleBlur}
                    />
                    <label htmlFor="cgu"></label>
                    <Translate id="gcuTerms">I accept the terms of <a href="">CGU</a></Translate>
                </div>

                <button type="submit" id="submit" className="btn btn-green" disabled="true">
                    <i className="fas fa-user"></i>
                </button>
                <Link to="/"><Translate id="alreadyAccount" /></Link>
            </form>
        </div>
    );
};

export default RegisterForm = reduxForm({
    form: 'register'
})(RegisterForm)