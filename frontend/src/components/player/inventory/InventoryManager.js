import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {Inventory} from "./Inventory"
import {ItemOverlay} from "./ItemOverlay"
import {WSPacketContext} from '../../common/Contexts'

export class InventoryManager extends React.PureComponent {
    static propTypes = {
        setSubpageText: PropTypes.func.isRequired,
        primaryInventoryId: PropTypes.number.isRequired,
        inventoryIds: PropTypes.object.isRequired,
        handleClose: PropTypes.func.isRequired,
        handleChangeInventoryItem: PropTypes.func.isRequired,
        handleChangeCurrentInventory: PropTypes.func.isRequired,
        handleChangePage: PropTypes.func.isRequired,
    }
    constructor(props) {
        super(props)
        this.state = {
          overlayItem: null,
        }
        this.inventoryRefs = new Map()

        this.handleDragEnd = this.handleDragEnd.bind(this)
    }

    handleDragEnd(layout, oldItem, newItem, e, draggedElement, sourceInventory) {
        const draggedRect = draggedElement.getBoundingClientRect()
        this.inventoryRefs.forEach((inv, key) => {
            if (inv._destroyed) {
                this.inventoryRefs.delete(key)
                return
            }

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
        this.props.handleChangeInventoryItem(newItem.i)
    }
    addInventoryRef = (ref) => {
        if (!ref) return
        this.inventoryRefs.set(ref.props.inventoryId, ref)
    }
    handleOpenOverlay = (item) => {
        this.setState({overlayItem: item})
    }
    handleDiscard = (item) => {
        // todo: tell server its removed, update Inventory component somehow
        this.setState({overlayItem: null})
    }

    render() {
        return <WSPacketContext.Consumer>{(wsPacket) => {
            const inventoryUpdates = wsPacket.action === 'inventoryItems' ? wsPacket.value : {}
            return <React.Fragment>
                {[this.props.primaryInventoryId, ...this.props.inventoryIds].map(inventoryId => (
                    <Inventory
                        key={inventoryId}
                        ref={this.addInventoryRef}
                        inventoryId={inventoryId}
                        handleDragEnd={this.handleDragEnd}
                        handleClose={this.props.handleClose}
                        handleChangeCurrentInventory={this.props.handleChangeCurrentInventory}
                        handleChangePage={this.props.handleChangePage}
                        handleOpenOverlay={this.handleOpenOverlay}
                        isPrimary={this.props.primaryInventoryId === inventoryId}
                        setSubpageText={this.props.primaryInventoryId === inventoryId ? this.props.setSubpageText : undefined}
                        inventoryUpdate={inventoryUpdates[inventoryId]}
                    />
                ))}
                <ItemOverlay
                    visible={this.state.overlayItem ? true : false}
                    item={this.state.overlayItem || {}}
                    handleClose={this.handleOpenOverlay}
                    handleDiscard={this.handleDiscard}
                />
            </React.Fragment>
        }}</WSPacketContext.Consumer>
    }
}