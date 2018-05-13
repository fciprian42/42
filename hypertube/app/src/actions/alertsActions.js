import { alertsConstants } from '../constants/alertsConstants'

export const alertsActions = {
    success,
    warning,
    info,
    clear
};

function success(message)
{
    if (message)
        return {type: alertsConstants.SUCCESS, message};
}

function warning(message)
{
    if (message)
        return {type: alertsConstants.WARNING, message};
}

function info(message)
{
    if (message)
        return {type: alertsConstants.INFO, message};
}

function clear()
{
    return {type: alertsConstants.CLEAR};
}
