import { oauthServices } from '../services/oauthServices'
import { oauthConstants } from "../constants/oauthConstants"
import {usersConstants} from "../constants/usersConstants"
import {usersServices} from "../services/usersServices"
import {alertsActions} from "./alertsActions"
import messages	from '../messages'

export const oauthActions = {
    checkOnlineOAuth
};

function checkOnlineOAuth(history)
{
    return (dispatch, getState) => {
        if (getState().users.session || sessionStorage.getItem('auth'))
        {
            let readSession = getState().users.session ? JSON.parse(getState().users.session) : JSON.parse(sessionStorage.getItem('auth'));

            oauthServices.checkOnlineOAuth(readSession.token).then(
                response => {
                    if (response.data.user)
                        dispatch({type: oauthConstants.OAUTH_CHECKER, payload: {online: response.data.online, session: sessionStorage.getItem('auth') ? sessionStorage.getItem('auth') : getState().users.session}});
                    else
                    {
                        usersServices.logout();
                        dispatch({type: usersConstants.LOGOUT});
                        if (response && response.data && response.data.error && response.data.code)
                        {
                            dispatch(alertsActions.warning(messages[response.data.code][getState().lang.languageDefault]));
                            setTimeout(() => {dispatch(alertsActions.clear())}, 5000);
                        }
                        history.push('/');
                    }
                });
        }
        else
            dispatch({type: oauthConstants.OAUTH_CHECKER, payload: {online: false, isOauth: false, session: sessionStorage.getItem('auth')}});
    }
}