import React, { Component }	from 'react'
import PropTypes from 'prop-types'
import SearchForm from "../containers/SearchForm"
import { connect } from "react-redux"
import EasyTransition from 'react-easy-transition'
import { Link } from "react-router-dom"
import { Translate } from 'react-localize-redux'
import { oauthActions } from "../actions/oauthActions"
import { moviesActions } from "../actions/moviesActions"
import {alertsActions} from "../actions/alertsActions"
import Navigation from "../containers/Navigation"
import messages from "../messages"
import {getActiveLanguage, getTranslate} from "react-localize-redux/lib/index"
import axios from "axios"
import {usersActions} from "../actions/usersActions"
import {moviesConstants} from "../constants/moviesConstants"

class Video extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            settings: false,
            sortByName: false,
            sortBy: 'rating',
            search: false,
            valueSearch: "",
            series: false,
            check: false
        };
    }

    submit = values => {
        const { dispatch, currentLanguage } = this.props;

        dispatch({type: moviesConstants.RESET_MOVIE});

        if (values.search && dispatch)
        {
            dispatch(moviesActions.searchSeries(`?query=?query_term=${values.search}`));
            this.setState({search: true, valueSearch: values.search});
        }
        else
        {
            this.setState({search: false, valueSearch: ""});
            this.handleMovies();
            dispatch(alertsActions.warning(messages['searchEmpty'][currentLanguage && currentLanguage]));
            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
        }
    };

    componentDidMount()
    {
        const { dispatch, users, history, currentLanguage } = this.props;

        document.title = "Hypertube";

        if (dispatch && history)
        {
            dispatch(oauthActions.checkOnlineOAuth(history));
            dispatch(usersActions.getLang());
        }

        if (users && history && !users.loggedIn)
            history.push('/');
        else
        {
            let user = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

            if (!user.username && dispatch && currentLanguage)
            {
                dispatch(alertsActions.info(messages['usernameNeeded'][currentLanguage]));
                setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                history.push('/profile');
            }
            else
            {
                dispatch(usersActions.getBookmarks());
                this.handleMovies();
            }
        }
    }

    addToBookmarks = (code) => {
        const { dispatch }  = this.props;

        if (dispatch)
            dispatch(usersActions.addToBookmarks(code, true));
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

    sortListName = () => {
        const { dispatch, movies } = this.props;

        let byName = movies.movies.slice(0);

        byName.sort((a, b) => {
            let x = a.data.Title ? a.data.Title.toLowerCase() : a.data.Title;
            let y = b.data.Title ? b.data.Title.toLowerCase() : b.data.Title;
            if (this.state.sortByName)
                return (x > y) ? -1 : x < y ? 1 : 0;
            return (x < y) ? -1 : x > y ? 1 : 0;
        });

        if (dispatch)
            dispatch({type: 'GET_MOVIES', data: byName});

        this.setState({sortByName: !this.state.sortByName});
    };

    handleScroll = () => {
        const { dispatch } = this.props;
        const nextPage = document.getElementById("movies-list").scrollHeight - document.getElementById("movies-list").scrollTop === document.getElementById("movies-list").clientHeight;

        if (nextPage && dispatch)
            dispatch(moviesActions.nextPageSeries(`?query=?${this.state.query}`));
    };

    checkGenreExist = (query) => {
        const { dispatch, currentLanguage, users } = this.props;
        let user;

        if (users && users.session)
            user = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        if (query && users && users.session)
        {
            axios.get(`http://localhost:8080/api/series/find?query=?${query}limit=44`, {headers: {authorization: user.token}})
                .then(response => {
                    if (response && response.data && response.data.series && response.data.series.length > 0)
                    {
                        dispatch({type: moviesConstants.GET_QUERY, query: query});
                        dispatch(moviesActions.getSeries(`?query=?${query}`, user.token));
                    }
                    else
                    {
                        dispatch(alertsActions.warning(messages['moviesNotFound'][currentLanguage]));
                        setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                    }
                });
        }
    };

    handleMovies = () => {
        const { yearRate, rating, sortBy, genre } = this.state;

        let query = '';

        if (yearRate) query = `${query}year=${yearRate}|`;
        if (rating) query = `${query}rating=${rating}|`;
        if (genre) query = `${query}genre=${genre}|`;
        if (sortBy) query = `${query}sort_by=${sortBy}|`;

        this.checkGenreExist(query);
    };

    hasSearch = props => {
        this.setState({search: true, valueSearch: props.search});
    };

    handleRefresh = () => {
        const { dispatch, users } = this.props;
        let query = '';

        this.setState({sortByName: false, genre: null, search: false, series: false, sortBy: "rating"});

        if (dispatch && users && users.session)
        {
            dispatch({type: moviesConstants.RESET_MOVIE});
            dispatch(moviesActions.getSeries(`?query=?${query}`));
        }
    };

    resetOptions = () => {
        this.handleMovies();
        this.setState({search: false, valueSearch: ""});
    };

    change = values => {
        if (values.search)
            document.getElementById('resetField').style.display = "block";
        else
            document.getElementById('resetField').style.display = "none";
    };

    render()
    {
        const { alerts, movies, location, history } = this.props;
        const { valueSearch } = this.state;

        const showSearch = (value) => {
            return (
                <div className="search-content">
                    <h2>
                        You've searched "{value && value}"
                    </h2>
                </div>
            );
        };

        return (
            <div>
                {alerts.message && <div id="notifications" className={`notifications ${alerts.type} alertsFade`}>{alerts.message}</div>}
                <EasyTransition
                    path={location && location.pathname}
                    initialStyle={{opacity: 0, backgroundColor: "#2E3740"}}
                    transition="opacity 0.3s ease-in"
                    finalStyle={{opacity: 1, backgroundColor: "#21242B", height: "100vh"}}
                >
                    <Navigation history={history} hasSearch={this.hasSearch} resetOptions={this.resetOptions} />
                    <div className="movies-section">
                        <div className="searchContentList">
                            <SearchForm onSubmit={this.submit} onChange={this.change} resetOptions={this.resetOptions}/>
                        </div>
                        <div className={`sort-movies block`}>
                            <div className={`sorting series-width`} style={{width: "100%", display: "block"}}>
                                <button id="genre" className={this.state.sortByName ? "selected-sort" : "no-selected"} style={{marginBottom: 20, paddingBottom: 10}} onClick={this.sortListName}>
                                    <Translate id="sortByName" />
                                </button>
                            </div>
                            <div></div>
                            <div></div>
                        </div>

                        {this.state.search && valueSearch ? showSearch(this.state.valueSearch) : null}

                        <div className="movies-list" id="movies-list" onScroll={this.handleScroll}>
                            {movies && movies.search && movies.search.length > 0 ? movies.search.map((value, key) => {

                                let ratingWidth;

                                if (value.data.imdbRating)
                                    ratingWidth = {width: this.getRating(value.data.imdbRating / 2)};

                                if (!value.data.imdbRating || value.data.imdbRating === "N/A")
                                    ratingWidth = {width: 0};

                                return (
                                    <Link to={`/series/${value._id}`} key={key}>
                                        <div className="linktest">
                                            <button id={`bookmark movie-${key}`} className={`${value.added ? 'added' : 'add-later'}`}  onClick={(e) => {this.addToBookmarks(value.imdb_code); document.getElementById('bookmark movie-'+key).className = "added"; document.getElementById('status icon-'+key).className = "fas fa-check"; e.preventDefault();}}>
                                                <i id={`status icon-${key}`} className={`${value.added ? 'fas fa-check' : 'fas fa-plus'}`}></i>
                                            </button>
                                            <div className={`select-view ${value.seen ? 'show' : 'none'}`}>
                                                <i className="fas fa-eye"></i>
                                            </div>
                                            <img className={`${value.seen ? 'view-img' : 'no-view'}`} src={!value.data.Poster || value.data.Poster === 'N/A' ? require('../style/images/no-poster.png') : value.data.Poster} title={value.data.Title} alt={value.data.Title}/>
                                            <span>{value.data.Title}</span>
                                            <small className="year">{value.data.Year}</small>
                                            <div className="star-ratings-sprite"><span style={ratingWidth} className="star-ratings-sprite-rating"></span></div>
                                        </div>
                                    </Link>
                                )
                            }): movies && movies.movies.length > 0 && !movies.movies.movies && movies.movies.map((value, key) => {
                                let ratingWidth;
                                if (value.typeStream === "serie" && value.data && value.imdb_code)
                                {
                                    if (value.data.imdbRating)
                                        ratingWidth = {width: this.getRating(value.data.imdbRating / 2)};

                                    if (value.imdb_code)
                                    {
                                        return (
                                            <Link to={`/series/${value._id}`} key={key}>
                                                <div className="linktest">
                                                    <button id={`series movie-${key}`} className={`${value.added ? 'added' : 'add-later'}`}  onClick={(e) => {this.addToBookmarks(value._id); document.getElementById('series movie-'+key).className = "added"; document.getElementById('status icon-'+key).className = "fas fa-check"; e.preventDefault();}}>
                                                        <i id={`status icon-${key}`} className={`${value.added ? 'fas fa-check' : 'fas fa-plus'}`}></i>
                                                    </button>
                                                    <div className={`select-view ${value.seen ? 'show' : 'none'}`}>
                                                        <i className="fas fa-eye"></i>
                                                    </div>
                                                    <img src={!value.data.Poster || value.data.Poster === 'N/A' ? require('../style/images/no-poster.png') : value.data.Poster} title={value.Title} alt={value.Title}/>
                                                    <span>{value.Title}</span>
                                                    <small className="year">{value.data.Year}</small>
                                                    <div className="star-ratings-sprite"><span style={ratingWidth} className="star-ratings-sprite-rating"></span></div>
                                                </div>
                                            </Link>
                                        )
                                    }
                                }
                                return false;
                            })}
                        </div>
                    </div>
                </EasyTransition>
            </div>
        );
    }
}

Video.propTypes = {
    history: PropTypes.object.isRequired,
    alerts: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
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
        movies: state.movies,
        translate: getTranslate(state.locale),
        currentLanguage: getActiveLanguage(state.locale).code
    }
};

export default connect(mapStateToProps)(Video)
