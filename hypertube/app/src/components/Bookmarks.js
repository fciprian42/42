import React, { Component } from "react"
import {getActiveLanguage, getTranslate} from "react-localize-redux/lib/index"
import PropTypes from 'prop-types'
import { connect } from "react-redux"
import { oauthActions } from "../actions/oauthActions"
import { Link } from "react-router-dom"
import EasyTransition from 'react-easy-transition'
import { Translate } from 'react-localize-redux'
import {alertsActions} from "../actions/alertsActions"
import axios from "axios"
import messages from "../messages"
import {usersActions} from "../actions/usersActions"
import {usersConstants} from "../constants/usersConstants"

class Bookmarks extends Component
{
    componentDidMount()
    {
        const {dispatch, users, currentLanguage, history} = this.props;

        if (currentLanguage && currentLanguage === "en")
            document.title = "Hypertube - My bookmarks";
        else
            document.title = "Hypertube - À regarder plus tard";

        if (dispatch && history)
        {
            dispatch(oauthActions.checkOnlineOAuth(history));
            dispatch(usersActions.getLang());
        }

        if (users && history && !users.loggedIn)
            history.push('/');
        else
        {
            let user;

            if (users)
                user = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

            if (!user.username && dispatch && currentLanguage)
            {
                dispatch(alertsActions.info(messages['usernameNeeded'][currentLanguage]));
                setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                history.push('/profile');
            }
            else
            {
                dispatch(usersActions.getBookmarks());
                this.getAvatar();
            }
        }
    }

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

        if (users && users.session && dispatch)
        {
            axios.get(`http://localhost:8080/api/users/avatar/${JSON.parse(users.session).username}`)
                .then(response => {
                    if (response.data.code === "avatarFound")
                        dispatch({type: usersConstants.GET_AVATAR, url: response.data.src});
                });
        }
    };

    deleteToHistory = (code, series) => {
        const { dispatch }  = this.props;

        if (dispatch)
            dispatch(usersActions.deleteToBookmarks(code, series));
    };

    getRating = (rating) => {
        const starsTotal = 5;
        if (rating)
        {
            const starPercentage = (rating / starsTotal) * 100;
            const starPercentageRounded = `${(Math.abs(starPercentage / 10) * 10) - 10}px`;
            return starPercentageRounded;
        }
    };

    render()
    {
        const { alerts, location, history, users } = this.props;

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

        const emptyMovies = (
            <div>
                <h2>
                    <Translate id="historyEmpty" />
                </h2>
            </div>
        );

        const emptySeries = (
            <div>
                <h2>
                    <Translate id="seriesEmpty" />
                </h2>
            </div>
        );

        return (
            <div>
                {alerts.message && <div id="notifications" className={`notifications ${alerts.type} alertsFade`}>{alerts.message}</div>}
                <EasyTransition
                    path={location && location.pathname}
                    initialStyle={{opacity: 0, backgroundColor: "#2E3740"}}
                    transition="opacity 0.3s ease-in"
                    finalStyle={{opacity: 1, backgroundColor: "#21242B", height: "100vh"}}
                >
                    <div className="history">
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
                                        <li>
                                            <i className="fas fa-clock" style={{color: "#fff"}}></i>
                                        </li>
                                    </Link>
                                    <Link to="/series">
                                        <li>
                                            <i className="fas fa-film"></i>
                                        </li>
                                    </Link>
                                </ul>
                            </div>
                            <a className="logout" onClick={this.handleLogout}>
                                <i className="fas fa-power-off"></i>
                            </a>
                        </nav>
                        <header className="header" style={{backgroundColor: '#252A30', alignItems: 'center'}}>
                            <div className="responsive-nav">
                                {this.props.handleRefresh ? checkRefresh : directLink}
                                <a className="logout" onClick={this.handleLogout}>
                                    <i className="fas fa-power-off"></i>
                                </a>
                            </div>
                            <div>
                                <div className="responsive-nav">
                                    <Link to="/bookmarks">
                                        <i className="fas fa-bookmark" style={{fontSize: "1.4rem", marginRight: 30}}></i>
                                    </Link>
                                    <Link to="/history">
                                        <i className="fas fa-clock" style={{color: "#fff", fontSize: "1.4rem"}}></i>
                                    </Link>
                                    <Link to="/series">
                                        <i className="fas fa-film"></i>
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <Link to="/profile">
                                    <div className="profile-opts">
                                        <img src={(users && users.avatar) || require("../style/images/no-avatar.jpg")} height="40" alt=""/>
                                        <span className="username">{me && me.username}</span>
                                    </div>
                                </Link>
                            </div>
                        </header>
                        <div className="movies-section" id="history-list" style={{marginTop: 0}}>
                            <h2><Translate id="movies" /></h2>
                            <div className="movies-list" id="movies-list">
                                {this.props.users.bookmarks_movies && this.props.users.bookmarks_movies.length > 0 ? this.props.users.bookmarks_movies.map((value, key) => {
                                    if (value.imdb_id && value.imdb_id.imdb_code)
                                    {
                                        let ratingWidth;
                                        let is_series = false;

                                        if (value.imdb_id.data.imdbRating)
                                            ratingWidth = {width: this.getRating(value.imdb_id.data.imdbRating / 2)};

                                        if (!value.imdb_id.data.imdbRating || value.imdb_id.data.imdbRating === "N/A")
                                            ratingWidth = {width: 0};

                                        return (
                                            <Link to={`/movies/${value.imdb_id.imdb_code}`} key={key}>
                                                <div className="linktest">
                                                    <button className='delete-history' onClick={(e) => {e.preventDefault(); this.deleteToHistory(value.imdb_id.imdb_code, is_series)}}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                    <div className={`select-view ${value.imdb_id.seen ? 'show' : 'none'}`}>
                                                        <i className="fas fa-eye"></i>
                                                    </div>
                                                    <img className={`${value.seen ? 'view-img' : 'no-view'}`} src={(value.imdb_id.data && !value.imdb_id.data.Poster) || (value.imdb_id.data && value.imdb_id.data.Poster === 'N/A' ? require('../style/images/no-poster.png') : value.imdb_id.data && value.imdb_id.data.Poster)} title={value.imdb_id.data && value.imdb_id.data.Title} alt={value.imdb_id.data.Title}/>
                                                    <span>{value.imdb_id.data && value.imdb_id.data.Title}</span>
                                                    <small className="year">{value.imdb_id.data && value.imdb_id.data.Year}</small>
                                                    <div className="star-ratings-sprite"><span style={ratingWidth} className="star-ratings-sprite-rating"></span></div>
                                                </div>
                                            </Link>
                                        )
                                    }
                                    return false;
                                }) : emptyMovies}
                            </div>
                            <h2><Translate id="series" /></h2>
                            <div className="movies-list" id="movies-list">
                                {this.props.users.bookmarks_series && this.props.users.bookmarks_series.length > 0 ? this.props.users.bookmarks_series.map((value, key) => {
                                    if (value.serie_id && value.serie_id.imdb_code)
                                    {
                                        let ratingWidth;
                                        let is_series = true;

                                        if (value.serie_id.data.imdbRating)
                                            ratingWidth = {width: this.getRating(value.serie_id.data.imdbRating / 2)};

                                        if (!value.serie_id.data.imdbRating || value.serie_id.data.imdbRating === "N/A")
                                            ratingWidth = {width: 0};

                                        return (
                                            <Link to={`/series/${value.serie_id._id && value.serie_id._id}`} key={key}>
                                                <div className="linktest">
                                                    <button className='delete-history' onClick={(e) => {e.preventDefault(); this.deleteToHistory(value.serie_id._id, is_series)}}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                    <div className={`select-view ${value.serie_id.seen ? 'show' : 'none'}`}>
                                                        <i className="fas fa-eye"></i>
                                                    </div>
                                                    <img className={`${value.seen ? 'view-img' : 'no-view'}`} src={(value.serie_id.data && !value.serie_id.data.Poster) || (value.serie_id.data && value.serie_id.data.Poster === 'N/A' ? require('../style/images/no-poster.png') : value.serie_id.data && value.serie_id.data.Poster)} title={value.serie_id.data && value.serie_id.data.Title} alt={value.serie_id.data.Title}/>
                                                    <span>{value.serie_id.data && value.serie_id.data.Title}</span>
                                                    <small className="year">{value.serie_id.data && value.serie_id.data.Year}</small>
                                                    <div className="star-ratings-sprite"><span style={ratingWidth} className="star-ratings-sprite-rating"></span></div>
                                                </div>
                                            </Link>
                                        )
                                    }
                                    return false;
                                }) : emptySeries}
                            </div>
                        </div>
                    </div>
                </EasyTransition>
            </div>
        );
    }
}

Bookmarks.propTypes = {
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

export default connect(mapStateToProps)(Bookmarks)