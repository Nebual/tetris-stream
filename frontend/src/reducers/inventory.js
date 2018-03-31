const inventory = (state = [], action) => {
    switch(action.type) {
        case 'ADD_ITEM':
            return [
                ...state,
                {
                    i: action.id,
                    x: action.x,
                    y: action.y,
                    w: action.w,
                    h: action.h
                }
            ]
        default:
            return state
    }
}

export default inventory