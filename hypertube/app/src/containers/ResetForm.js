import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Translate } from 'react-localize-redux'
import { Link } from "react-router-dom"

let ResetForm = props => {
    const { handleSubmit, session } = props;

    const handleBlur = () => {
        let count = 0;
        const elements = document.querySelectorAll('#reset-form input');
        let elem;

        if (session)
            elem = 1;
        else
            elem = 2;

        const uppercase = !(/^[^A-Z]*$/).test(elements[elem].value);
        const numeric = /\d/.test(elements[elem].value);
        const length = elements[elem].value.length > 6;

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

        for (let i = 0; i < elements.length; i++)
        {
            if (elements[i].value.length > 0)
                document.getElementById('submit').disabled = false;
            else
            {
                document.getElementById('submit').disabled = true;
                break;
            }
        }
    };

    const unlogged = (
        <div className="register-form" id="reset-form">
            <form onSubmit={ handleSubmit } className="align-items-column">
                <div className="field">
                    <Field
                        type="email"
                        name="email"
                        id="email"
                        component="input"
                        className="form-control"
                        placeholder="Email address"
                        onChange={handleBlur}
                        maxLength={60}
                    />
                    <span><i className="fas fa-envelope"></i></span>
                </div>

                <div className="field">
                    <Field
                        type="text"
                        component="input"
                        name="code"
                        id="code"
                        className="form-control"
                        placeholder="Code"
                        onChange={handleBlur}
                    />
                    <span><i className="fa fa-hashtag"></i></span>
                </div>


                <div className="field">
                    <Field
                        type="password"
                        name="password"
                        id="password"
                        component="input"
                        className="form-control"
                        placeholder="New password"
                        onChange={handleBlur}
                    />
                    <span><i className="fas fa-key"></i></span>
                    <span style={{left: "unset", right: 0, top: 23}}>
                        <div id="security-level" className="security-level"></div>
                    </span>
                </div>

                <button type="submit" id="submit" className="btn btn-green" disabled="true">
                    <i className="fas fa-sync-alt fa-spin"></i>
                </button>
                <Link to="/"><Translate id="noReset" /></Link>
            </form>
        </div>
    );

    const logged = (
        <div className="register-form" id="reset-form">
            <form onSubmit={ handleSubmit } className="align-items-column">

                <div className="field">
                    <Field
                        type="text"
                        component="input"
                        name="code"
                        id="code"
                        className="form-control"
                        placeholder="Code"
                        onChange={handleBlur}
                        autoComplete="off"
                    />
                    <span><i className="fa fa-hashtag"></i></span>
                </div>


                <div className="field">
                    <Field
                        type="password"
                        name="password"
                        id="password"
                        component="input"
                        className="form-control"
                        placeholder="New password"
                        onChange={handleBlur}
                        autoComplete="off"
                    />
                    <span><i className="fas fa-key"></i></span>
                    <span style={{left: "unset", right: 0, top: 23}}>
                        <div id="security-level" className="security-level"></div>
                    </span>
                </div>

                <button type="submit" id="submit" className="btn btn-green" disabled="true">
                    <i className="fas fa-sync-alt fa-spin"></i>
                </button>
                <Link to="/profile" style={{fontWeight: "bold", textAlign: "center"}}><Translate id="noReset" /></Link>
            </form>
        </div>
    );

    return (session ? logged : unlogged);
};

export default ResetForm = reduxForm({
    form: 'reset'
})(ResetForm)