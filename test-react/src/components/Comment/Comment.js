import React from 'react';
import PropTypes from 'prop-types';

function Comment({authorName, authorEmail, content}) {
    return (
        <div>
            <li>
                {content} From {authorName} {`<${authorEmail}>`}
            </li>
        </div>
    );
}

Comment.propTypes = {
    authorName: PropTypes.string.isRequired,
    authorEmail: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
};

export default Comment;
