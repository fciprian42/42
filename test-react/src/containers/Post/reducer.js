import * as c from './actions';

const initialState = {
    post: null,
    user: null,
    comments: null
};

export default function post(state = initialState, action) {
    switch (action.type) {
        case c.START_FETCH:
            return initialState;
        case c.FETCHED_USER:
            return {
                ...state,
                user: action.user
            };
        case c.FETCHED_POST:
            return {
                ...state,
                post: action.post
            };
        case c.FETCHED_COMMENTS:
            return {
                ...state,
                comments: action.comment
            };
        default:
            return state;
    }
}