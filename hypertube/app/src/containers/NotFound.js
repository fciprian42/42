import React, {Component} from 'react'
import { Link } from "react-router-dom"
import { Translate } from 'react-localize-redux'

class NotFound extends Component {

    componentDidMount()
    {
        document.title = "Hypertube - 404";
    }

    render() {
        return (
            <div className="spacecontainer">
                <div className="notfound">
                    <h1><Translate id="404"/></h1>
                    <p><Translate id="pageDoesntExist"/></p>
                    <Link className="btn not-found-btn" to="/">
                        <i className="fas fa-undo-alt"></i>
                    </Link>
                </div>
                <div className="scene">
                    <div className="wrap">
                        <div className="wall wall-right"></div>
                        <div className="wall wall-left"></div>
                        <div className="wall wall-top"></div>
                        <div className="wall wall-bottom"></div>
                        <div className="wall wall-back"></div>
                    </div>
                    <div className="wrap">
                        <div className="wall wall-right"></div>
                        <div className="wall wall-left"></div>
                        <div className="wall wall-top"></div>
                        <div className="wall wall-bottom"></div>
                        <div className="wall wall-back"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default NotFound