import axios from 'axios';

const endpoint = 'https://jsonplaceholder.typicode.com/';

const call = (route) => {
    return new Promise((resolve, reject) => {

        const url = `${endpoint}${route}`;

        axios.get(url)
            .then(response => {
                resolve(JSON.parse(response.request.responseText));
            })
            .catch(error => {
                reject(error.request.responseText);
            });
    });
};


const Api = {

    getPosts: () => {
        return call('posts');
    },

    getUser: (userId) => {
        return call(`users/${userId}`);
    },

    getPost: (idPost) => {
        return call(`posts/${idPost}`);
    },

    getPostComments: (idPost) => {
        return call(`posts/${idPost}/comments/`);
    },
};

export default Api;