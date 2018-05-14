import React from 'react';
import { connect } from 'react-redux';
import Comment from '../../components/Comment';
import { fetch } from './actions';

class Post extends React.PureComponent {

    componentDidMount() {
        this.props.dispatch(fetch(this.props.match.params.id));
    }

    render() {

        const { post } = this.props;

        return (
            <div>
                <h1>{ post.post && post.post.title }</h1>
                <p><i>By { post.user && post.user.name }, { post.user && post.user.company.name }, { post.user && post.user.address.city }</i></p>
                <p>{ post.post && post.post.body }</p>
                <h3>Comments</h3>
                <ul>
                    {this.props.post && this.props.post.comments && this.props.post.comments.length > 0 ? this.props.post.comments.map((value, key) => {
                        return <Comment authorEmail={value.email} authorName={value.name} content={value.body} key={key} />
                    }) : <p>Pas de commentaires sur ce post</p>}
                </ul>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
       post: state.post
    };
};

export default connect(mapStateToProps)(Post)

