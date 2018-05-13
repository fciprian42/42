import React from 'react'
import { Field, reduxForm, reset } from 'redux-form'
import store from "../store"

let SearchForm = props => {
    const { handleSubmit, handleChange } = props;

    const resetField = () => {
        store.dispatch(reset('search'));
        props.resetOptions();
    };

    return (
        <div>
            <form onSubmit={ handleSubmit } >
                <div className="field">
                    <Field
                        type="text"
                        name="search"
                        id="search"
                        component="input"
                        className="form-control"
                        placeholder="Ex: The Dark Knight"
                        style={{width: 250, borderBottom: "none", padding: "25px 0", textIndent: 0}}
                        onChange={handleChange}
                        maxLength={120}
                    />
                    <span style={{top: "23.5%", left: -30, fontSize: "1.3rem"}}><i className="fas fa-search"></i></span>
                    <span id="resetField" onClick={resetField} style={{left: "unset", right: -17, top: 28, cursor: "pointer", display: "none"}}>
                        <i className="fas fa-times"></i>
                    </span>
                </div>
            </form>
        </div>
    );
};

export default SearchForm = reduxForm({
    form: 'search'
})(SearchForm)