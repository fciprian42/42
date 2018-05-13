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
            dispatch(moviesActions.searchMovies(`?query=?query_term=${values.search}`));
            this.setState({search: true, valueSearch: values.search});
        }
        else
        {
            this.handleRefresh();
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
            if (users && users.session)
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
    }

    addToBookmarks = (code) => {
        const { dispatch }  = this.props;

        if (dispatch)
            dispatch(usersActions.addToBookmarks(code, this.state.series));
    };

    handleInput = (e) => {
        const name = e.target.name, value = e.target.value;

        this.setState({[name]: value});
    };

    getSortList = (query, sortBy) => {
		this.setState({sortBy}, () => {
			this.handleMovies();
		});
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

	handleSettings = (e) => {
	    const { dispatch } = this.props;
	    const panel = document.getElementById('panelSettings');

	    if (!this.state.settings)
        {
            document.getElementById('showSettings').style.display = "none";
            document.getElementById('optionsSearch').style.display = "block";
            panel.style.display = "flex";
            this.setState({settings: true});
        }
        else
        {
            if (e.target.id === "optionsSearch" || e.target.id === "optionsSearchI")
            {
                dispatch({type: moviesConstants.RESET_MOVIE});
                this.handleMovies();
            }
            document.getElementById('showSettings').style.display = "block";
            document.getElementById('optionsSearch').style.display = "none";
            panel.style.display = "none";
            this.setState({settings: false});
        }
    };

    handleScroll = () => {
        const { dispatch } = this.props;
        const nextPage = document.getElementById("movies-list").scrollHeight - document.getElementById("movies-list").scrollTop === document.getElementById("movies-list").clientHeight;

        if (nextPage && dispatch)
            dispatch(moviesActions.nextPage(`?query=?${this.state.query}`));
    };

    checkGenreExist = (query) => {
        const { dispatch, currentLanguage, users } = this.props;
        let user;

        if (users && users.session)
		    user = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        if (query && users && users.session)
        {
                axios.get(`http://localhost:8080/api/movies/find?query=?${query}limit=44`, {headers: {authorization: user.token}})
                    .then(response => {
                        if (response && response.data && response.data.movies && response.data.movies.length > 0)
                        {
                            dispatch({type: moviesConstants.GET_QUERY, query: query});
                            dispatch(moviesActions.getMovies(`?query=?${query}`, user.token));
                        }
                        else
                        {
                            if (users && users.session)
                                this.setState({genre: null, yearRate: "", rating: ""});
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

    sortListGenre = (e) => {
        const genre = e.target.title;

        if (!genre)
            return ;

        document.getElementById("movies-list").scrollTop = 0;
		this.setState({genre}, () => {
			this.handleMovies();
		});
    };

    handleSeries = () => {
        const { dispatch } = this.props;

        if (dispatch)
        {
            this.setState({sortByName: false, genre: null, search: false, series: true, sortBy: "rating"});
            dispatch({type: moviesConstants.RESET_MOVIE});
            dispatch(moviesActions.getSeries());
        }
    };

    hasSearch = props => {
        this.setState({search: true, valueSearch: props.search});
    };

    handleRefresh = () => {
        const { dispatch, users } = this.props;
        let query = '';

        this.setState({sortByName: false, genre: null, search: false, series: false, sortBy: "rating"});

        let user;

        if (users)
            user = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        if (dispatch && users && users.session)
        {
            dispatch({type: moviesConstants.RESET_MOVIE});
            dispatch(moviesActions.getMovies(`?query=?${query}sort_by=rating|page=1`, user.token));
        }
    };

    resetOptions = () => {
        if (this.state.series)
        {
            this.setState({sortByName: false, genre: null, search: false, sortBy: "rating"});
            this.handleSeries();
        }
        else
            this.handleRefresh();
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
                    <Navigation history={history} handleSeries={this.handleSeries} handleRefresh={this.handleRefresh} hasSearch={this.hasSearch} resetOptions={this.resetOptions} />
                    <div className="movies-section">
                        <div className="searchContentList">
                            <SearchForm onSubmit={this.submit} onChange={this.change} resetOptions={this.resetOptions}/>
                        </div>
                        <div className={`sort-movies ${this.state.search ? 'none' : 'flex'}`}>
                            <div>
                                <button id="most_popular" style={{marginRight: 10}} className={`${this.state.sortBy === "rating" ? "selected-sort" : "no-selected"} ${this.state.series ? 'none' : 'block'}`} onClick={() => {this.getSortList(this.props.movies.query, 'rating')}}>
                                    <Translate id="mostPopular" />
                                </button>
                                <button id="recently_added" className={this.state.sortBy === "date_added" ? "selected-sort" : "no-selected" && this.state.series ? 'none' : 'block'} onClick={() => {this.getSortList(this.props.movies.query, 'date_added')}}>
                                    <Translate id="recentlyAdded" />
                                </button>
                            </div>
                            <div></div>
                            <div className={`sorting ${this.state.series ? 'series-width' : 'no-series'}`} style={{width: `${this.state.series ? '100%' : '70%'}`, display: `${this.state.series ? 'block' : 'flex'}`}}>
                                <ul className={`nav ${this.state.series ? 'none' : 'show'}`}>
                                    <li className="dropdown">
                                        {this.state.genre ? <Translate id={this.state.genre} /> : <Translate id="sortByGenre" />}
                                        <i className="fas fa-angle-down" style={{verticalAlign: "middle", marginLeft: 5}}></i>
                                        <ul style={{zIndex: 2}}>
                                            <li title="Horror" onClick={this.sortListGenre}>
                                                Horror
                                            </li>
                                            <li title="Drama" onClick={this.sortListGenre}>
                                                <Translate id="Drama" />
                                            </li>
                                            <li title="Comedy" onClick={this.sortListGenre}>
                                                <Translate id="Comedy" />
                                            </li>
                                            <li title="Documentary" onClick={this.sortListGenre}>
                                                <Translate id="Documentary" />
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                                <button id="genre" className={this.state.sortByName ? "selected-sort" : "no-selected"} style={{marginBottom: 20, paddingBottom: `${this.state.series ? '10px' : '20px'}`}} onClick={this.sortListName}>
                                    <Translate id="sortByName" />
                                </button>
                            </div>
                            <div className="options-movies">
                                <button id="showSettings" className="optionsMoviesBtn" onClick={this.handleSettings}>
                                    <i className="fas fa-cog"></i>
                                </button>
                                <button id="optionsSearch" className="optionsMoviesBtn" style={{display: "none"}} onClick={this.handleSettings}>
                                    <i id="optionsSearchI" className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>

                        <div id="panelSettings">
                            <div className="sortsRange">
                                <div className="ratingRange">
                                    <i className="fas fa-star" style={{verticalAlign: "top", marginTop: 4, marginRight: 10, color: "#feca57"}}></i>
                                    <input type="range" min="0" max="9.5" step="0.1" name="rating" onChange={this.handleInput} />
                                    <span id="rating-value" style={{marginLeft: 5, verticalAlign: "middle", fontWeight: "bold"}}>{this.state.rating || "9.5"}</span>
                                </div>
                                <div className="yearsRange">
                                    <i className="fas fa-calendar-alt" style={{verticalAlign: "top", marginTop: 4, marginRight: 10, color: "#435160"}}></i>
                                    <input type="range" min="1977" max="2018" step="1" name="yearRate" onChange={this.handleInput} />
                                    <span id="years-prod-value" style={{marginLeft: 5, verticalAlign: "middle", fontWeight: "bold"}}>{this.state.yearRate || "1977"}</span>
                                </div>
                            </div>
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
                                    <Link to={`/movies/${value.imdb_code}`} key={key}>
                                        <div className="linktest">
                                            {}
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
                                    if (value.data && value.imdb_code && value.typeStream === "movie")
                                    {
                                        if (value.data.imdbRating)
                                            ratingWidth = {width: this.getRating(value.data.imdbRating / 2)};

                                        if (!value.data.imdbRating || value.data.imdbRating === "N/A")
                                            ratingWidth = {width: 0};

                                        return (
                                            <Link to={`/movies/${value.imdb_code}`} key={key}>
                                                <div className="linktest">
                                                    {}
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
