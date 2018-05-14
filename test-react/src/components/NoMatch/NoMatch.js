import React from 'react';
import { Link } from 'react-router-dom';

function App() {
    return (
        <div>
            <p>404 page not found</p>
            <p>Back to <Link to='/'>Home</Link></p>
        </div>
    );
}

export default App;