import * as c from './actions';

const initialState = {
    posts: []
};

export default function home(state = initialState, action) {
    switch (action.type) {
        case c.FETCHED_POSTS:
            return {
                ...state,
                posts: action.posts
            };
        default:
            return state;
    }
}