import React from 'react'
import PropTypes from 'prop-types'

export class InventoryItem extends React.PureComponent {
    static propTypes = {
        item: PropTypes.object.isRequired,
        handleOpenOverlay: PropTypes.func.isRequired,
    }

    render() {
        const {className, style, item, handleOpenOverlay, ...otherProps} = this.props;
        return <div
            className={["item", className].join(' ')}
            style={{
                ...style,
                backgroundImage: `url('${item.image_url}')`,
                backgroundSize: "100% 100%",
            }}
            onMouseOver={(e) => {
                // todo: touch. Probably via tap vs long press
                handleOpenOverlay(item)
            }}
            {...otherProps}
        >
        </div>
    }
}
