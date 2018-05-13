import React from 'react'
import { Field, reduxForm } from 'redux-form'
import { Translate } from 'react-localize-redux'

let CommentForm = props => {
    const { handleSubmit } = props;

    const handleBlur = () => {
        const elements = document.querySelectorAll('#comment-form textarea');

        for (let i = 0; i < elements.length; i++)
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
        <div id="comment-form">
            <form onSubmit={ handleSubmit } className="align-items-column">

                <div className="field">
                    <Field
                        type="text"
                        component="textarea"
                        name="message"
                        id="message"
                        cols={50}
                        rows={5}
                        placeholder="..."
                        className="form-control"
                        autoComplete="off"
                        onChange={handleBlur}
                        style={{width: "100%", textIndent: 40, marginBottom: 10}}
                    />
                    <span style={{top: 15, left: 15}}><i className="fa fa-pencil-alt"></i></span>
                </div>

                <button type="submit" id="submit" className="btn btn-comment" style={{width: "100%", backgroundColor: "rgba(49, 53, 62, 0.7)", border: "1px solid #435160"}} disabled="true">
                    <Translate id="send" />
                </button>
            </form>
        </div>
    );
};

CommentForm = reduxForm({
    form: 'comment'
})(CommentForm)

export default CommentForm