import React from 'react'
import PropTypes from 'prop-types'
import GridLayout from 'react-grid-layout'

import '../../../layout-styles.css'
import '../../../resize-styles.css'

/**
 * Given two layoutitems, check if they collide.
 */
function collides(l1, l2) {
    if (l1 === l2) return false; // same element
    if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
    if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
    if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
    if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
    return true; // boxes overlap
}
function getAllCollisions(layout, layoutItem) {
    return layout.filter(function (l) {
        return collides(l, layoutItem);
    });
}

export class Inventory extends React.PureComponent{
    static propTypes = {
        widthTotal: PropTypes.number,
        cols: PropTypes.number,
        rows: PropTypes.number,
        margin: PropTypes.number,
        borderSize: PropTypes.number,
    }
    static defaultProps = {
        widthTotal: 600,
        cols: 10,
        rows: 4,
        margin: 10,
        borderSize: 15,
    }

    constructor(props) {
        super(props)
        this.state = {
            items: [
                {i: this.props.prefix + 'a', x: 3, y: 3, w: 1, h: 1},
                {i: this.props.prefix + 'b', x: 3, y: 0, w: 2, h: 3},
                {i: this.props.prefix + 'c', x: 0, y: 0, w: 3, h: 4},
                {i: this.props.prefix + 'd', x: 4, y: 3, w: 1, h: 1}
            ]
        }

        this.removeItem = this.removeItem.bind(this)
        this.addItem = this.addItem.bind(this)
        this.getAllCollisionsWithItem = this.getAllCollisionsWithItem.bind(this)
        this.onLayoutChange = this.onLayoutChange.bind(this)
    }

    // Warning: this doesn't seem to work inside onDragStop, due to https://github.com/STRML/react-grid-layout/pull/733
    removeItem(removedItem) {
        this.setState({
            items: this.state.items.filter((item) => {
                return item.i !== removedItem.i
            })
        })
    }
    addItem(newItem) {
        this.setState({
            items: this.state.items.concat(newItem)
        })
    }
    getAllCollisionsWithItem(layoutItem) {
        return getAllCollisions(this.state.items, layoutItem)
    }

    getSquareSize() {
        return (this.props.widthTotal - (this.props.cols - 1)*this.props.margin) / this.props.cols
    }

    onLayoutChange(layout) {
        console.log(`${this.props.prefix} layout changed`, layout)
        if (layout !== this.state.items) {
            this.setState({items: layout})
        }
    }

    render() {
        const gridStyle = {
            width: this.props.widthTotal,
            height: this.props.rows * (this.getSquareSize() + this.props.margin) - this.props.margin
        }
        return (
            <GridLayout
                style={gridStyle}
                cols={this.props.cols}
                margin={[this.props.margin, this.props.margin]}
                rowHeight={this.getSquareSize()}
                width={this.props.widthTotal}
                compactType={null}
                containerPadding={[0,0]}
                isResizable={false}
                preventCollision={true}
                autoSize={false}
                maxRows={this.props.rows}
                onDragStop={(layout, oldItem, newItem, _, e, ele) => {this.props.handleDragEnd(layout, oldItem, newItem, e, ele, this)}}
                onLayoutChange={this.onLayoutChange}
            >
                {this.state.items.map(item => (
                    <div className="item" key={item.i} data-grid={item}>{item.name}</div>
                ))}
            </GridLayout>
        )
    }
}