import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Translate } from 'react-localize-redux'

let ProfileForm = props => {
    const { handleSubmit, isOauth } = props;

    let me;

    if (props.user)
        me = JSON.parse(props.user);

    const handleBlur = () => {
        const elements = document.querySelectorAll('#profile-form input');

        let length;
        isOauth ? length = 3 : length = 4;

        for (let i = 0; i < length; i++)
        {
            if (elements[i].value.length > 0) {
                document.getElementById('submit').disabled = false;
            }
            else
            {
                document.getElementById('submit').disabled = true;
                break;
            }
        }
    };

    return (
        <div id="profile-form">
            <form onSubmit={ handleSubmit } className="align-items-column">

                <div className="field">
                    <Field
                        type="text"
                        component="input"
                        name="firstname"
                        id="firstname"
                        maxLength={20}
                        className="form-control"
                        placeholder={me && me.firstname}
                        onChange={handleBlur}
                    />
                    <span><i className="fa fa-user"></i></span>
                </div>

                <div className="field">
                    <Field
                        type="text"
                        component="input"
                        name="lastname"
                        id="lastname"
                        maxLength={25}
                        className="form-control"
                        placeholder={me && me.lastname}
                        onChange={handleBlur}
                    />
                    <span><i className="fa fa-user"></i></span>
                </div>

                <div className="field">
                    <Field
                        type="text"
                        component="input"
                        name="username"
                        id="username"
                        maxLength={30}
                        className="form-control"
                        placeholder={me && me.username}
                        onChange={handleBlur}
                    />
                    <span><i className="fa fa-user"></i></span>
                </div>

                <div className="field">
                    <Field
                        type="email"
                        name="email"
                        id="email"
                        component="input"
                        className="form-control"
                        placeholder={me && me.email}
                        onChange={handleBlur}
                        maxLength={60}
                        disabled={isOauth && isOauth}
                    />
                    <span><i className="fas fa-envelope"></i></span>
                </div>

                <button type="submit" id="submit" className="btn btn-green" style={{width: "100%"}} disabled="true">
                    <Translate id="edit" />
                </button>
            </form>
        </div>
    );
};

export default ProfileForm = reduxForm({
    form: 'profile'
})(ProfileForm)