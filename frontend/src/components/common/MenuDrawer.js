import React from 'react'
import SwipeableDrawer from 'material-ui/SwipeableDrawer'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider'

import AccountIcon from 'material-ui-icons/People';
import InventoryIcon from 'material-ui-icons/BusinessCenter'
import GameIcon from 'material-ui-icons/Casino'
import ItemIcon from 'material-ui-icons/GolfCourse'
import ContainerIcon from 'material-ui-icons/FreeBreakfast'

export class MenuDrawer extends React.Component{



    render() {

        const fullList = (
            <div className={this.props.classes.fullList}>
                <List>
                    <ListItem button>
                        <ListItemIcon>
                            <AccountIcon />
                        </ListItemIcon>
                        <ListItemText primary="Character Select"/>
                    </ListItem>
                    <ListItem button={true} name="INVENTORY" onClick={() => {return this.props.handleChangePage('INVENTORY')}}>
                        <ListItemIcon>
                            <InventoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Inventory"/>
                    </ListItem>
                </List>
                <Divider />
                {this.props.isGM ? (
                    <List>
                        <ListItem button>
                            <ListItemIcon>
                                <GameIcon />
                            </ListItemIcon>
                            <ListItemText primary="Manage Game"/>
                        </ListItem>
                        <ListItem button={true} name="ADD_ITEM" onClick={() => {return this.props.handleChangePage('ADD_ITEM')}}>
                            <ListItemIcon>
                                <ItemIcon />
                            </ListItemIcon>
                            <ListItemText primary="Items"/>
                        </ListItem>
                        <ListItem button>
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