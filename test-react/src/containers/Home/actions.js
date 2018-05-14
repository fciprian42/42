import Api from '../../utils/Api'

export const FETCHED_POSTS = 'FETCHED_POSTS';

export function fetched(posts) {
    return {
        type: FETCHED_POSTS,
        posts
    }
}

export function fetch() {
    return dispatch => {
        Api.getPosts().then(data => {
            dispatch(fetched(data));
        }).catch(err => {
            console.error(err);
        });
    }
}