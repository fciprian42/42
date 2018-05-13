import React, { Component } from 'react'
import {usersActions} from "../actions/usersActions"
import {alertsActions} from "../actions/alertsActions"
import { Link } from "react-router-dom"
import {moviesActions} from "../actions/moviesActions"
import messages from "../messages"
import {getActiveLanguage, getTranslate} from "react-localize-redux/lib/index"
import PropTypes from 'prop-types'
import { connect } from "react-redux"
import SearchFrom from "./SearchForm"
import axios from "axios/index"
import {usersConstants} from "../constants/usersConstants"

class Navigation extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {};
    }

    componentDidMount()
    {
        const { users } = this.props;
        let me;

        if (users)
            me = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        if (users && me && me.username)
            this.getAvatar();
    }

    submit = values => {
        const { dispatch, currentLanguage } = this.props;

        if (values.search && dispatch)
        {
            this.props.hasSearch(values);
            if (this.props.history.location.pathname === "/dashboard")
                dispatch(moviesActions.searchMovies(`?query=?query_term=${values.search}`));
            if (this.props.history.location.pathname === "/series")
                dispatch(moviesActions.searchSeries(`?query=?query_term=${values.search}`));
        }
        else
        {
            if (this.props.handleRefresh)
                this.props.handleRefresh(false);
            dispatch(alertsActions.warning(messages['searchEmpty'][currentLanguage && currentLanguage]));
            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
        }
    };

    change = values => {
        if (values.search)
            document.getElementById('resetField').style.display = "block";
        else
            document.getElementById('resetField').style.display = "none";
    };

    handleLogout = () => {
        const { dispatch, history, currentLanguage } = this.props;

        if (dispatch && history)
        {
            dispatch(usersActions.logout());
            dispatch(alertsActions.info(messages['successLogout'][currentLanguage && currentLanguage]));
            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
            history.push('/');
        }
    };

    getAvatar = () => {
        const {users, dispatch} = this.props;

        let me;

        if (users)
        {
            me = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

            axios.get(`http://localhost:8080/api/users/avatar/${me && me.username}`)
                .then(response => {
                    if (response.data.code === "avatarFound")
                        dispatch({type: usersConstants.GET_AVATAR, url: response.data.src});
                });
        }
    };

    render()
    {
        const { users, history } = this.props;

        let me;

        if (users)
            me = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        const checkRefresh = (
            <div className="logo" onClick={this.props.handleRefresh}>
                <img src={require("../style/images/logo.png")} alt="" height="60"/>
            </div>
        );

        const directLink = (
            <Link to="/dashboard">
                <div className="logo">
                    <img src={require("../style/images/logo.png")} alt="" height="60"/>
                </div>
            </Link>
        );

        return (
            <div style={{display: "flex "}}>
                <nav className="navigation">
                    {this.props.handleRefresh ? checkRefresh : directLink}
                    <div className="nav-items">
                        <ul>
                            <Link to="/bookmarks">
                                <li className={history.location.pathname === "/bookmarks" ? "active" : "no-active"}>
                                    <i className="fas fa-bookmark"></i>
                                </li>
                            </Link>
                            <Link to="/history">
                                <li className={history.location.pathname === "/history" ? "active" : "no-active"}>
                                    <i className="fas fa-clock" style={{color: "#fff"}}></i>
                                </li>
                            </Link>
                            <Link to="/series">
                                <li className={history.location.pathname === "/series" ? "active" : "no-active"}>
                                    <i className="fas fa-film"></i>
                                </li>
                            </Link>
                        </ul>
                    </div>
                    <a className="logout" onClick={this.handleLogout}>
                        <i className="fas fa-power-off"></i>
                    </a>
                </nav>
                <header className="header">
                    <div className="responsive-nav">
                        {this.props.handleRefresh ? checkRefresh : directLink}
                        <a className="logout" onClick={this.handleLogout}>
                            <i className="fas fa-power-off"></i>
                        </a>
                    </div>
                    <div className="searchContent" style={{marginLeft: 50, marginTop: 10}}>
                        <SearchFrom onSubmit={this.submit} onChange={this.change} resetOptions={this.props.resetOptions}/>
                    </div>
                    <div id="nav-responsive" style={{display: "none", alignItems: "center"}}>
                        <div style={{marginLeft: 20}}>
                            <Link to="/bookmarks">
                                <i className="fas fa-bookmark" style={{fontSize: "1.4rem", marginRight: 30}}></i>
                            </Link>
                            <Link to="/history">
                                <i className="fas fa-clock" style={{fontSize: "1.4rem", marginRight: 30}}></i>
                            </Link>
                            <Link to="/series">
                                <i className="fas fa-film" style={{fontSize: "1.4rem"}}></i>
                            </Link>
                        </div>
                    </div>
                    <div className="avatar-header" style={{paddingRight: 30}}>
                        <Link to="/profile">
                            <div className="profile-opts">
                                <img className="force-marg" src={(users && users.avatar) || require('../style/images/no-avatar.jpg')} height="40" alt=""/>
                                <div className="username">
                                    {me && me.username}
                                </div>
                            </div>
                        </Link>
                    </div>
                </header>
            </div>
        );
    };
}

Navigation.propTypes = {
    alerts: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    lang: PropTypes.object.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    const { alerts } = state;
    return {
        users: state.users,
        lang: state.lang,
        alerts,
        movies: state.movies.movies,
        translate: getTranslate(state.locale),
        currentLanguage: getActiveLanguage(state.locale).code
    }
};

export default connect(mapStateToProps)(Navigation)
