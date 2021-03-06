import React from 'react'
import PropTypes from 'prop-types'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import List from '@material-ui/core/List';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import Divider from '@material-ui/core/Divider'

import AccountIcon from '@material-ui/icons/People';
import InventoryIcon from '@material-ui/icons/BusinessCenter'
import GameIcon from '@material-ui/icons/Casino'
import ItemIcon from '@material-ui/icons/GolfCourse'
import ContainerIcon from '@material-ui/icons/FreeBreakfast'

export class MenuDrawer extends React.Component{
    static propTypes = {
        toggleMenu: PropTypes.func.isRequired,
        handleChangePage: PropTypes.func.isRequired,
        classes: PropTypes.object.isRequired,
        isGM: PropTypes.bool.isRequired,
        menuOpen: PropTypes.bool.isRequired
    }

    render() {

        const fullList = (
            <div className={this.props.classes.fullList}>
                <List>
                    <ListItem button onClick={() => {this.props.handleChangePage('CHARACTER_SELECT')}}>
                        <ListItemIcon>
                            <AccountIcon />
                        </ListItemIcon>
                        <ListItemText primary="Character Select"/>
                    </ListItem>
                    <ListItem button onClick={() => {this.props.handleChangePage('INVENTORY')}}>
                        <ListItemIcon>
                            <InventoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Inventory"/>
                    </ListItem>
                    <ListItem button onClick={() => {this.props.handleChangePage('LIST_GAMES')}}>
                        <ListItemIcon>
                            <GameIcon />
                        </ListItemIcon>
                        <ListItemText primary="Game Sessions"/>
                    </ListItem>
                </List>
                <Divider />
                {this.props.isGM ? (
                    <List>
                        <ListSubheader>Gm Zone</ListSubheader>
                        <ListItem button onClick={() => {this.props.handleChangePage('LIST_PLAYERS')}}>
                            <ListItemIcon>
                                <GameIcon />
                            </ListItemIcon>
                            <ListItemText primary="Players"/>
                        </ListItem>
                        <ListItem button onClick={() => {this.props.handleChangePage('LIST_TEMPLATES')}}>
                            <ListItemIcon>
                                <ItemIcon />
                            </ListItemIcon>
                            <ListItemText primary="Templates"/>
                        </ListItem>
                        <ListItem button onClick={() => {this.props.handleChangePage('LIST_ITEMS')}}>
                            <ListItemIcon>
                                <ItemIcon />
                            </ListItemIcon>
                            <ListItemText primary="Items"/>
                        </ListItem>
                        <ListItem button onClick={() => {this.props.handleChangePage('EDIT_ITEM')}}>
                            <ListItemIcon>
                                <ItemIcon />
                            </ListItemIcon>
                            <ListItemText primary="Quick Edit Last Item"/>
                        </ListItem>
                        <ListItem button onClick={() => {this.props.handleChangePage('LIST_CONTAINERS')}}>
                            <ListItemIcon>
                                <ContainerIcon />
                            </ListItemIcon>
                            <ListItemText primary="Containers"/>
                        </ListItem>
                    </List>
                ) : null}
            </div>
        )

        return (
            <SwipeableDrawer
                open={this.props.menuOpen}
                onClose={this.props.toggleMenu(false)}
                onOpen={this.props.toggleMenu(true)}
            >
                <div
                    tabIndex={0}
                    role="button"
                    onClick={this.props.toggleMenu(false)}
                    onKeyDown={this.props.toggleMenu(false)}
                >
                    {fullList}
                </div>
            </SwipeableDrawer>
        )
    }
}