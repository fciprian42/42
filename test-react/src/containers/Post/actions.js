import Api from '../../utils/Api'

export const FETCHED_POST = 'FETCHED_POST';
export const FETCHED_USER = 'FETCHED_USER';
export const FETCHED_COMMENTS = 'FETCHED_COMMENTS';
export const START_FETCH = 'START_FETCH';

export function fetchedPost(post) {
    return {
        type: FETCHED_POST,
        post
    }
}

export function fetchedUser(user) {
    return {
        type: FETCHED_USER,
        user
    }
}

export function fetchedComments(comment) {
    return {
        type: FETCHED_COMMENTS,
        comment
    }
}

export function startFetch() {
    return {
        type: START_FETCH
    }
}

export function fetch(postId) {
    return (dispatch) => {
        dispatch(startFetch());

        Api.getPost(postId).then(data => {
            dispatch(fetchedPost(data));

            Api.getUser(data.userId).then(data => {
                dispatch(fetchedUser(data));
            }).catch(err => {
                console.error(err);
            });
        }).catch(err => {
            if (err)
                document.location.href="/"
        });

        Api.getPostComments(postId).then(data => {
            dispatch(fetchedComments(data));
        });
    }
}
