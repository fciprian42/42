import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import home from '../containers/Home/reducer';
import post from '../containers/Post/reducer';

function configureStore() {

    const enhancer = applyMiddleware(thunk);

    const reducer = combineReducers({
        home,
        post
    });

    const store = createStore(reducer, enhancer);
    return store;
}

export default configureStore;