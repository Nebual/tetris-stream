import React from 'react'
import PropTypes from 'prop-types'

import Menu from "material-ui/Menu"
import IconButton from 'material-ui/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

import styled from "../../../utils/styled"

const InventoryMenuButton = styled(IconButton)({
    position: 'absolute',
    top: 0,
    right: 0,
    color: 'white',
    margin: 15,
    zIndex: 5,
    filter: 'drop-shadow( 1px 1px 1px black )',
})

export default class InventoryMenu extends React.PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            anchorEl: null,
        }
    }

    handleClick = event => {
        this.setState({anchorEl: event.currentTarget});
    }

    handleClose = () => {
        this.setState({anchorEl: null});
    }

    render() {
        const {anchorEl} = this.state;
        return <React.Fragment>
            <InventoryMenuButton
                aria-owns={anchorEl ? 'inv-menu' : null}
                aria-haspopup="true"
            >
                <MenuIcon
                    onClick={this.handleClick}
                />
            </InventoryMenuButton>
            <Menu
                id="inv-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClick={this.handleClose}
                onClose={this.handleClose}
            >
                {this.props.children}
            </Menu>
        </React.Fragment>
    }
}
