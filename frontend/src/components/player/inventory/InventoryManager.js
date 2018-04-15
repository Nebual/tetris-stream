import React from 'react'
import ReactDOM from 'react-dom'
import {Inventory} from "./Inventory"

export class InventoryManager extends React.PureComponent {
    constructor(props) {
        super(props)

        this.handleDragEnd = this.handleDragEnd.bind(this)
    }

    handleDragEnd(layout, oldItem, newItem, e, draggedElement, sourceInventory) {
        const draggedRect = draggedElement.getBoundingClientRect()
        Object.values(this.refs).forEach((inv) => {
            if (inv === sourceInventory) {
                return
            }
            const bodyRect = document.body.getBoundingClientRect();
            const invRect = ReactDOM.findDOMNode(inv).getBoundingClientRect()

            const pageX = e.pageX || e.changedTouches[0].pageX;
            const pageY = e.pageY || e.changedTouches[0].pageY;

            if (pageX > (invRect.left - bodyRect.x) && pageX < (invRect.right - bodyRect.x)
                    && pageY > (invRect.top - bodyRect.y) && pageY < (invRect.bottom - bodyRect.y)) {
                // mouse cursor is within this inventory! Lets add the item
                const margin = inv.props.margin

                const modifiedItem = Object.assign({}, sourceInventory.state.items.find((item) => item.i === newItem.i), newItem, {
                    x: Math.min(inv.state.cols - newItem.w, Math.max(0, Math.round(
                        (draggedRect.left - (invRect.left + inv.props.borderSize + margin)) / (inv.getSquareSize() + margin)
                    ))),
                    y: Math.min(inv.state.rows - newItem.h, Math.max(0, Math.round(
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
                inv.addItem(modifiedItem, sourceInventory.props.inventoryId)
                return false;
            }
        })
    }

    render() {
        return (
            [this.props.primaryInventoryId, ...this.props.inventoryIds].map(inventoryId => (
                <Inventory
                    key={inventoryId}
                    ref={inventoryId}
                    inventoryId={inventoryId}
                    handleDragEnd={this.handleDragEnd}
                    setSubpageText={this.props.primaryInventoryId === inventoryId && this.props.setSubpageText || undefined}
                />
            ))
        )
    }
}