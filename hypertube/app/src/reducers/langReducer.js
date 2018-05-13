const initialState = {languageDefault: 'en'};

function langReducer(state = initialState, action)
{
    switch (action.type)
    {
        case 'SWITCH_LANG':
            return {languageDefault: action.lang};
        default:
            return state;
    }
}

export default langReducer