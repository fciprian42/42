import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter, Route, Switch } from "react-router-dom";

import { Provider } from 'react-redux';
import configureStore from './redux/configureStore';
import Home from './containers/Home';
import Post from './containers/Post';
import App from './components/App';
import NoMatch from './components/NoMatch';

import './index.css';
import 'normalize.css/normalize.css';

const store = configureStore();

ReactDOM.render((
        <Provider store={store}>
            <BrowserRouter>
                <App>
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/posts/:id" component={Post} />
                        <Route component={NoMatch}/>
                    </Switch>
                </App>
            </BrowserRouter>
        </Provider>),
    document.getElementById('root')
);
