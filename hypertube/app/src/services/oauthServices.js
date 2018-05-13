import axios from "axios"

export const oauthServices = {
    checkOnlineOAuth
};

function checkOnlineOAuth(token)
{
    return axios.get('http://localhost:8080/api/auth', {headers: { authorization: token }});
}