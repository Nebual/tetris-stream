import React from 'react'
import PropTypes from 'prop-types'
import Button from 'material-ui/Button'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

export class MenuBar extends React.Component{
    static propTypes = {
        toggleMenu: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        page: PropTypes.string.isRequired,
        subpage: PropTypes.string,
    }

    render() {

        const pageTitles = {
            CHARACTER_SELECT: 'Character Select',
            INVENTORY: 'Player Inventory',
            LIST_GAMES: 'List Games',
            LIST_PLAYERS: 'List Players',
            EDIT_TEMPLATE: 'Template Editor',
            LIST_TEMPLATES: 'List Templates',
            EDIT_ITEM: 'Item Editor',
            LIST_ITEMS: 'List Items',
            EDIT_CONTAINER: 'Container Editor',
            LIST_CONTAINERS: 'List Containers'
        }

        return (
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" aria-label="Menu" onClick={this.props.toggleMenu(true)}>
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="title" color="inherit" className={this.props.classes.flex}>
                        {`Tetris.Stream - ${pageTitles[this.props.page] || ''}`}{this.props.subpage && ` - ${this.props.subpage}`}
                    </Typography>
                </Toolbar>
            </AppBar>
        )
    }
}
