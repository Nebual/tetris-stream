import React from 'react'
import ReactDOM from 'react-dom'
import {Inventory} from "./Inventory"

export class InventoryManager extends React.Component {
    constructor(props) {
        super(props)

        this.handleDragEnd = this.handleDragEnd.bind(this)
    }

    handleDragEnd(layout, oldItem, newItem, e, draggedElement, sourceInventory) {
        const draggedRect = draggedElement.getBoundingClientRect()
        this.inventories.forEach((inv) => {
            if (inv === sourceInventory) {
                return
            }
            const bodyRect = document.body.getBoundingClientRect();
            const invRect = ReactDOM.findDOMNode(inv).getBoundingClientRect()

            if (e.pageX > (invRect.left - bodyRect.x) && e.pageX < (invRect.right - bodyRect.x)
                    && e.pageY > (invRect.top - bodyRect.y) && e.pageY < (invRect.bottom - bodyRect.y)) {
                // mouse cursor is within this inventory! Lets add the item
                const margin = inv.props.margin

                const modifiedItem = Object.assign({}, newItem, {
                    x: Math.min(inv.props.cols - newItem.w, Math.max(0, Math.round(
                        (draggedRect.left - (invRect.left + inv.props.borderSize + margin)) / (inv.getSquareSize() + margin)
                    ))),
                    y: Math.min(inv.props.rows - newItem.h, Math.max(0, Math.round(
                        (draggedRect.top - (invRect.top + inv.props.borderSize + margin)) / (inv.getSquareSize() + margin)
                    ))),
                })

                if (inv.getAllCollisionsWithItem(modifiedItem).length > 0) {
                    return false
                }

                // Remove the item from the sourceInventory via mutating layout
                layout.splice(layout.findIndex((item) => {
                    return item.i === modifiedItem.i
                }), 1)
                inv.addItem(modifiedItem)
            }
        })
    }

    render() {
        this.inventories = []
        return (
            this.props.inventoryIds.map(inventoryId => (
                <Inventory
                    key={inventoryId}
                    ref={(ele) => {
                        this.inventories.push(ele)
                    }}
                    prefix={inventoryId}
                    rows={inventoryId === 'player' ? 6 : 4}
                    handleDragEnd={this.handleDragEnd}
                />
            ))
        )
    }
}