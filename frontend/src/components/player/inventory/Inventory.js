import React from 'react'
import PropTypes from 'prop-types'
import GridLayout from 'react-grid-layout'

import '../../../layout-styles.css'
import '../../../resize-styles.css'
import {fetchApi} from "../../../util"

import styled from "../../../utils/styled"
import MenuItem from "material-ui/Menu/MenuItem"
import InventoryMenu from "./InventoryMenu"
import {PermissionsContext} from '../../common/Contexts'


const InventoryContainer = styled('div')({
    margin: "0 auto",
    position: "relative",
})

/**
 * Given two layoutitems, check if they collide.
 */
function collides(l1, l2) {
    if (l1.i === l2.i) return false; // same element
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
        margin: PropTypes.number,
        borderSize: PropTypes.number,
        inventoryId: PropTypes.number,
        isPrimary: PropTypes.bool,
        setSubpageText: PropTypes.func,
        handleClose: PropTypes.func.isRequired,
        handleChangeCurrentInventory: PropTypes.func.isRequired,
        handleChangePage: PropTypes.func.isRequired,
    }
    static defaultProps = {
        widthTotal: window.innerWidth < 768 ? (window.innerWidth -30) : 738,
        margin: 10,
        isPrimary: false,
        borderSize: 15,
    }

    constructor(props) {
        super(props)
        this.state = {
            items: [],
            cols: 10,
            rows: 0,
            inventoryTitle: '',
        }

        this.removeItem = this.removeItem.bind(this)
        this.addItem = this.addItem.bind(this)
        this.getAllCollisionsWithItem = this.getAllCollisionsWithItem.bind(this)
        this.onLayoutChange = this.onLayoutChange.bind(this)
        this.tellServerAboutMove = this.tellServerAboutMove.bind(this)
    }

    async componentDidMount() {
        await this.refreshInventory()
    }
    componentWillUnmount() {
        this._destroyed = true;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.inventoryUpdate) {
            return {items: nextProps.inventoryUpdate.map((row) => {
                row.i = row.id.toString()
                row.w = row.width
                row.h = row.height
                return row
            })}
        }
        return null;
    }

    refreshInventory = async () => {
        let response = await fetchApi(`inventory/${this.props.inventoryId}`)
        if (response.ok) {
            let json = await response.json()
            this.setState({
                cols: json.width,
                rows: json.height,
                inventoryTitle: json.name,
                items: json.items.map((row) => {
                    row.i = row.id.toString()
                    row.w = row.width
                    row.h = row.height
                    return row
                })
            })
            if (this.props.setSubpageText) {
                this.props.setSubpageText(json.name)
            }
        } else {
            console.log("Inventory fetch failed")
        }
    }

    // Warning: this doesn't seem to work inside onDragStop, due to https://github.com/STRML/react-grid-layout/pull/733
    removeItem(removedItem) {
        this.setState({
            items: this.state.items.filter((item) => {
                return item.i !== removedItem.i
            })
        })
    }
    addItem(newItem, sourceInventoryId) {
        this.tellServerAboutMove(newItem, sourceInventoryId, this.state.items.slice())
        this.setState({
            items: this.state.items.concat(newItem)
        })
    }
    getAllCollisionsWithItem(layoutItem) {
        return getAllCollisions(this.state.items, layoutItem)
    }

    getSquareSize() {
        return (this.props.widthTotal - (this.state.cols - 1)*this.props.margin) / this.state.cols
    }

    onLayoutChange(layout) {
        console.log(`${this.props.inventoryId} layout changed`, layout.length, this.state.items, layout)
        if (layout !== this.state.items) {
            const oldState = this.state.items.slice()
            const oldStateObject = oldState
                .reduce((acc, cur) => {
                    acc[cur.i] = cur
                    return acc
                }, {})
            this.setState({
                items: layout.map((item) => {
                    if (!oldStateObject[item.i]) { // new item
                        console.log("This branch isn't hit, due to how state flows through the grid layout", item)
                        return item
                    } else {
                        if (oldStateObject[item.i].x !== item.x || oldStateObject[item.i].y !== item.y) {
                            this.tellServerAboutMove(item, this.props.inventoryId, oldState)
                        }
                        return Object.assign({}, oldStateObject[item.i], item)
                    }
                })
            })

        }
    }

    tellServerAboutMove(item, sourceInventoryId, oldState) {
        fetchApi(`inventory/${this.props.inventoryId}/items/move`, 'POST', {
            inventory_item_id: parseInt(item.i, 10),
            source_inventory_id: sourceInventoryId,
            x: parseInt(item.x, 10),
            y: parseInt(item.y, 10),
        }).then((response) => {
            if (!response.ok) {
                console.log("Server didn't like our move, reverting", oldState)
                this.setState({items: oldState})
            }
        })
    }

    handleClose = () => {
        this.props.handleClose(this.props.inventoryId)
    }
    addNewItemFromTemplate = () => {
        this.props.handleChangeCurrentInventory(this.props.inventoryId)
        this.props.handleChangePage('LIST_TEMPLATES')
    }

    render() {
        const gridStyle = {
            width: this.props.widthTotal,
            height: this.state.rows * (this.getSquareSize() + this.props.margin) - this.props.margin
        }
        return (
            <InventoryContainer style={{
                width: gridStyle.width + this.props.borderSize * 2,
                height: gridStyle.height + this.props.borderSize * 2,
            }}>
                <GridLayout
                    style={gridStyle}
                    cols={this.state.cols}
                    margin={[this.props.margin, this.props.margin]}
                    rowHeight={this.getSquareSize()}
                    width={this.props.widthTotal}
                    compactType={null}
                    containerPadding={[0, 0]}
                    isResizable={false}
                    preventCollision={true}
                    autoSize={false}
                    maxRows={this.state.rows}
                    layout={this.state.items}
                    onDragStop={(layout, oldItem, newItem, _, e, ele) => {
                        this.props.handleDragEnd(layout, oldItem, newItem, e, ele, this)
                    }}
                    onLayoutChange={this.onLayoutChange}
                >
                    {this.state.items.map(item => (
                        <div className="item" key={item.i} style={{
                            backgroundImage: `url('${item.image_url}')`,
                            backgroundSize: "100% 100%",
                        }} />
                    ))}
                </GridLayout>
                <PermissionsContext.Consumer>
                    {({isGM}) => (
                        <InventoryMenu>
                            <MenuItem disabled={true}>{this.state.inventoryTitle}</MenuItem>
                            <MenuItem onClick={this.refreshInventory}>Refresh</MenuItem>
                            {isGM && <MenuItem onClick={this.addNewItemFromTemplate}>Add Item</MenuItem>}
                            {!this.props.isPrimary ? <MenuItem onClick={this.handleClose}>Close</MenuItem> : null}
                        </InventoryMenu>
                    )}
                </PermissionsContext.Consumer>
            </InventoryContainer>
        )
    }
}