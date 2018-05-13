import React, { Component } from 'react'
import { connect } from "react-redux"
import { oauthActions } from "../actions/oauthActions"
import PropTypes from 'prop-types'
import { getActiveLanguage, getTranslate  } from "react-localize-redux"
import {alertsActions} from "../actions/alertsActions"
import { Link } from "react-router-dom"
import { Translate } from 'react-localize-redux'
import EasyTransition from 'react-easy-transition'
import messages from "../messages"
import axios from "axios"
import CommentForm from "../containers/CommentForm"
import {usersActions} from "../actions/usersActions"
import {moviesActions} from "../actions/moviesActions"
import {usersConstants} from "../constants/usersConstants"
import {moviesConstants} from "../constants/moviesConstants";

class Movies extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {liked: false, likes: 0, hash: 0, quality: "720p", toggle: false, commented: false, avatarUser: ""};
    }

    submit = values => {
        const { dispatch, match } = this.props;

        if (dispatch && values && match && !this.state.commented)
        {
            this.setState({commented: true});
            dispatch(usersActions.postComment(values.message, match.params.video, false));
        }
    };

    componentDidMount()
    {
        const { dispatch, users, history, match, currentLanguage } = this.props;

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
                if (match && match.params.video && users && users.session)
                {
                    axios.get(`http://localhost:8080/api/movies/${match.params.video}`, {headers: {authorization: user && user.token}})
                        .then(response => {
                            if (response && response.data && response.data.movie)
                            {
                                this.setState({imdb: response.data.movie.imdb_code, likes: response.data.movie.likes.length, data: response.data.movie, liked: response.data.movie.liked});
                                dispatch({type: moviesConstants.GET_COMMENTS, comments: response.data.movie.comments, commented: false});
                                document.title = "Hypertube - " + (response.data.movie && response.data.movie.data.Title);
                                this.getAvatar();
                                this.hasComment();
                            }
                            else
                            {
                                dispatch(alertsActions.warning(messages[response.data.code][currentLanguage && currentLanguage]));
                                setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                                history.push('/dashboard');
                            }
                        });
                }
            }
        }
    }

    hasComment = () => {
        const { movies, users } = this.props;

        if (movies && movies.comments.length > 0)
        {
            const me = users && users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));
            let comment = false;
            movies.comments.forEach(function(item){
                if (item.username === me.username)
                    comment = true;
            });
            this.setState({commented: comment});
        }
        else
            this.setState({commented: false});
    };

    showComments = () => {
        this.setState({toggle: !this.state.toggle});

        let contentVideo = document.getElementById('video-player');
        let contentComments = document.getElementById('comments');

        if (!this.state.toggle)
        {
            contentVideo.className = "video fadeOut";
            contentVideo.style.display = "none";

            contentComments.className = "commentsContent fadeIn";
            contentComments.style.display = "flex";
        }
        else
        {
            contentVideo.className = "video fadeIn";
            contentVideo.style.display = "flex";

            contentComments.className = "commentsContent fadeOut";
            contentComments.style.display = "none";
        }
    };

    deleteComment = () => {
        const { dispatch } = this.props;

        if (dispatch)
        {
            dispatch(usersActions.deleteComment(this.state.imdb, false));
            this.setState({commented: false});
        }
    };

    addToBookmarks = () => {
        const { dispatch } = this.props;

        if (dispatch)
            dispatch(usersActions.addToBookmarks(this.state.imdb, false));
    };

    likeMovie = () => {
        const { dispatch } = this.props;

        this.setState({liked: !this.state.liked});

        if (!this.state.liked)
        {
            document.getElementById('like').className = "fas fa-heart";
            document.getElementById('like').style.color = "#eb3b5a";

            if (dispatch)
            {
                dispatch(moviesActions.like(this.state.imdb, false));
                this.setState({likes: this.state.likes + 1});
            }
        }
        else
        {
            document.getElementById('like').className = "far fa-heart";
            document.getElementById('like').style.color = "#fff";

            if (dispatch)
            {
                dispatch(moviesActions.unlike(this.state.imdb, false));
                this.setState({likes: this.state.likes - 1});
            }
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

    getRating = (rating) => {
        const starsTotal = 5;
        if (rating)
        {
            const starPercentage = (rating / starsTotal) * 100;
            const starPercentageRounded = `${(Math.abs(starPercentage / 10) * 10) - 10}px`;
            return starPercentageRounded;
        }
    };

    switchHash = (quality, hash) => {
        if (this.state.data.torrents.length > 0)
            this.setState({quality: quality, hash: hash});
    };

    render()
    {
        const { location, users, alerts, currentLanguage , movies} = this.props;
        const { data, hash } = this.state;

        let me, ratingWidth, writer, bImage;

        if (users)
            me = users.session ? JSON.parse(users.session) : JSON.parse(sessionStorage.getItem('auth'));

        if (data && data.data.imdbRating)
            ratingWidth = {width: this.getRating(data.data.imdbRating / 2)};

        if (data && data.data.Writer)
            writer = data.data.Writer.replace(' ', '_');

        const noComments = (
            <Translate id="noComments" />
        );

        const playerVideo = (
            <video controlsList="nodownload" id="video" src={`http://localhost:8080/api/stream?hash=${hash}&imdb=${this.state.imdb}&token=${users.session && me.token}`} width="800" controls crossOrigin="anonymous" style={{position: "relative", height: "100%", backgroundColor: "black", width: "100%"}}>
                <track kind="subtitles" label="French subtitles" src={`http://localhost:8080/api/subtitle?imdb=${this.state.imdb && this.state.imdb}&lang=fr`} srcLang="fr"></track>
                <track kind="subtitles" label="English subtitles" src={`http://localhost:8080/api/subtitle?imdb=${this.state.imdb && this.state.imdb}&lang=en`} srcLang="en"></track>
                <source src="mov_bbb.ogg" type="video/ogg" />
            </video>
        );

        const noSelected = (
            <div className="no-selected-quality">
                <Translate id="selectQuality" />
            </div>
        );

        const NoTorrents = (
            <div>
                <Translate id="noTorrents" />
            </div>
        );

        if (data && data.data && data.data.Poster)
        {
            bImage = {
                backgroundImage: `url(${data.data.Poster})`
            };
        }

        return (
            <div>
                {alerts.message && <div id="notifications" className={`notifications ${alerts.type} alertsFade`} style={{zIndex: 9999, position: "relative"}}>{alerts.message}</div>}
                <EasyTransition
                    path={location && location.pathname}
                    initialStyle={{opacity: 0, backgroundColor: "#2E3740"}}
                    transition="opacity 0.3s ease-in"
                    finalStyle={{opacity: 1, backgroundColor: "#21242B"}}
                >
                    <div className="global-c">
                        <header className="overlay-header">
                            <div style={{display: "flex"}}>
                                <div className="logo">
                                    <Link to="/dashboard">
                                        <img src={require("../style/images/logo.png")} alt="" height="60"/>
                                    </Link>
                                </div>
                                <a onClick={this.handleLogout} className="logout" style={{height: "unset"}}>
                                    <i className="fas fa-power-off"></i>
                                </a>
                            </div>
                            <div>
                                <div className="responsive-nav">
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
                            <Link to="/profile">
                                <div className="profile-opts" style={{marginRight: 20}}>
                                    <img src={(users && users.avatar) || require("../style/images/no-avatar.jpg")} height="40" alt=""/>
                                    <div className="username">
                                        {users.session && me.username}
                                    </div>
                                </div>
                            </Link>
                        </header>
                        <div className="backdrop fadein" style={bImage}></div>
                        <div className="backdrop-overlay"></div>
                        <i className="fas fa-undo goBack" onClick={() => {this.props.history && this.props.history.goBack()}}></i>
                        <section className="poster-box">
                            <img className="cover-image fadein" src={data && data.data.Poster} alt=""/>
                        </section>
                        <section className="content-box">
                            <div className="infos-movie">
                                <div className="title">
                                    {data && data.data.Title}
                                    <div className="star-ratings-sprite" style={{marginLeft: 15, marginTop: 5}}><span style={ratingWidth} className="star-ratings-sprite-rating"></span></div>
                                </div>
                                <div className="metadatas">
                                    <div className="item">{data && data.data.Year}</div>
                                    <div className="dot"></div>
                                    <div className="item">{data && data.data.Runtime}</div>
                                    <div className="dot"></div>
                                    <div className="item">{data && data.data.Genre}</div>
                                    <div className="by"><Translate id="write" /><a target="_blank" href={`https://${currentLanguage && currentLanguage}.wikipedia.org/wiki/${writer}`}>{data && data.data.Director}</a></div>
                                    <div className="by"><Translate id="played" />{data && data.data.Actors}</div>
                                </div>
                                <div className="overview">{data && data.data.Plot}</div>
                            </div>
                            <div className="video" id="video-player">
                                {hash && hash !== 0 ? playerVideo : noSelected}
                            </div>
                            <div className="commentsContent" id="comments">
                                <div className={`list-comments ${this.state.commented ? 'commented' : 'no-commented'}`}>
                                    {movies && movies.comments.length > 0 ? movies.comments.map((value, key) => {
                                        return (
                                            <div className={`comment-section ${this.state.commented ? 'commented-s' : 'no-commented-s'}`} key={key}>
                                                <div>
                                                    <p className="comment-author"><Link to={`/users/${value.username}`}>{value.username}</Link>{value.username === me.username ? <i onClick={this.deleteComment} style={{marginLeft: 10, fontSize: 14, color: "#ff4d4d"}} className="fas fa-times"></i> : null}</p>
                                                    <p className="comment-content">{value.message}</p>
                                                    <p className="comment-timestamp">
                                                        {value.createdAt.substring(0,10)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }) : noComments}
                                </div>
                                {!this.state.commented ? <div className="post-comment"><CommentForm onSubmit={this.submit} /></div> : null}
                            </div>
                            <div className="options">
                                {!this.state.liked ? <div className="movie-like" onClick={this.likeMovie}><i id="like" className="far fa-heart"></i> {this.state.likes}</div> : <div className="movie-like" onClick={this.likeMovie}><i id="like" style={{color: "#eb3b5a"}} className="fas fa-heart"></i> {this.state.likes}</div>}
                                <div className="add-to-history" onClick={this.addToBookmarks}>
                                    <i className="fas fa-bookmark"></i>
                                </div>
                                <div className="comments" onClick={this.showComments}>
                                    {movies && movies.comments.length}
                                    <i className="fas fa-comment" style={{marginLeft: 5}}></i>
                                </div>
                                <div className="comments">
                                    {data && data.data.seeds} <i className="fas fa-retweet" style={{marginRight: 10}}></i>
                                    {data && data.data.peers} <i className="fas fa-eye"></i>
                                </div>
                                <div className="movie-quality-container">
                                    {data && data.torrents.length <= 0 ? NoTorrents : null}
                                    {data && data.torrents.length > 0 && data.torrents.map((value, key) => {return <div key={key} className={`q${value.quality} ${this.state.quality === value.quality}`} onClick={() => {this.switchHash(value.quality, value.hash)}}>{value.quality}</div>})}
                                </div>
                            </div>
                        </section>
                    </div>
                </EasyTransition>
            </div>
        );
    }
}

Movies.propTypes = {
    history: PropTypes.object.isRequired,
    alerts: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    movies: PropTypes.object.isRequired,
    lang: PropTypes.object.isRequired,
    currentLanguage: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired
};


const mapStateToProps = state => {
    const { alerts } = state;
    return {
        lang: state.lang,
        alerts,
        movies: state.movies,
        users: state.users,
        translate: getTranslate(state.locale),
        currentLanguage: getActiveLanguage(state.locale).code
    };
};

export default connect(mapStateToProps)(Movies)
