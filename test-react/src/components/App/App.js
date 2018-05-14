import React from 'react';
import { Link } from 'react-router-dom'
import './app.css';

function App({children}) {
    return (
        <div>
            <nav className="nav-bar">
                <Link to='/'>Home</Link>
            </nav>
            <div className="container">
                { children }
            </div>
        </div>
    );
}

export default App;