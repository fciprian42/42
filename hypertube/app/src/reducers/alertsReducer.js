import { alertsConstants } from '../constants/alertsConstants'

function alertsReducer(state = {}, action)
{
    switch (action.type)
    {
        case alertsConstants.SUCCESS:
            return {
                type: 'alert-success',
                message: action.message
            };
        case alertsConstants.WARNING:
            return {
                type: 'alert-warning',
                message: action.message
            };
        case alertsConstants.INFO:
            return {
                type: 'alert-info',
                message: action.message
            };
        case alertsConstants.CLEAR:
            if (state.type && state.message)
                return {};
            else
                return {...state};
        default:
            return state;
    }
}

export default alertsReducer
