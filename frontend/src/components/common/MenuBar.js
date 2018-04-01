import React from 'react'
import Button from 'material-ui/Button'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui-icons/Menu'

export class MenuBar extends React.Component{
    render() {

        const pageTitles = {
            INVENTORY: 'Player Inventory',
            ADD_ITEM: 'Item Editor',
            LIST_ITEMS: 'List Items'
        }

        return (
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" aria-label="Menu">
                        <MenuIcon onClick={this.props.toggleMenu(true)} />
                    </IconButton>
                    <Typography variant="title" color="inherit" className={this.props.classes.flex}>
                        {`Tetris.Stream - ${pageTitles[this.props.page]}`}
                    </Typography>
                    <Button color="inherit">Do Nothing</Button>
                </Toolbar>
            </AppBar>
        )
    }
}
