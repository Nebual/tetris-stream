import React, {Component} from 'react'

import './App.css'
import { withStyles } from 'material-ui/styles'

import {MenuBar} from './components/common/MenuBar'
import {MenuDrawer} from './components/common/MenuDrawer'

import {Inventory} from './components/player/inventory/inventory'
import {ListTemplateComponent} from './components/game_master/template/list/ListTemplateComponent'
import {EditTemplateComponent} from './components/game_master/template/edit/EditTemplateComponent'
import {ListItemComponent} from './components/game_master/item/list/ListItemComponent'
import {EditItemComponent} from './components/game_master/item/edit/EditItemComponent'

const styles = {
	flex: {
		flex: 1,
	},
};


class App extends Component {
	constructor(props) {
		super(props)

        const current_page = localStorage.getItem('current_page')
		const template_id = localStorage.getItem('template_id')
		const item_id = localStorage.getItem('item_id')

		this.state = {
            mode: current_page || 'INVENTORY',
			template_id: template_id || null,
			item_id: item_id || null,
            menu: {
			    open: false,
                isGM: true
            }
		}
		this.toggleMenu = this.toggleMenu.bind(this)
        this.handleChangePage = this.handleChangePage.bind(this)
        this.handleChangeTemplate = this.handleChangeTemplate.bind(this)
		this.handleChangeInventoryItem = this.handleChangeInventoryItem.bind(this)
        this.getPageContents = this.getPageContents.bind(this)
	}

	toggleMenu = (open) => () => {
		if (this.state.menu.open !== open) {
            this.setState({menu: {...this.state.menu, open: open}})
		}
	}

	handleChangePage(newpage) {
        if (this.state.mode !== newpage) {
            this.setState({mode: newpage})
            localStorage.setItem('current_page', newpage)
        }
    }

    handleChangeTemplate(newTemplate) {
        if (this.state.template_id !== newTemplate) {
            this.setState({template_id: newTemplate})
            localStorage.setItem('template_id', newTemplate)
        }
    }

    handleChangeInventoryItem(newItem) {
        if (this.state.item_id !== newItem) {
            this.setState({item_id: newItem})
            localStorage.setItem('item_id', newItem)
        }
	}

    getPageContents () {
        switch (this.state.mode) {
			case 'CHARACTER_SELECT':
				return null
            case 'INVENTORY':
                return ( <Inventory /> )
			case 'LIST_GAMES':
				return null
			case 'LIST_PLAYERS':
				return null
            case 'EDIT_TEMPLATE':
                return (
                	<EditTemplateComponent
						template_id={this.state.template_id}
					/>
				)
            case 'LIST_TEMPLATES':
                return (
                	<ListTemplateComponent
                        handleChangePage={this.handleChangePage}
                        handleChangeTemplate={this.handleChangeTemplate}
					/>
				)
            case 'EDIT_ITEM':
                return (
                	<EditItemComponent
						item_id={this.state.item_id}
					/>
				)
			case 'LIST_ITEMS':
				return (
					<ListItemComponent
                        handleChangePage={this.handleChangePage}
                        handleChangeInventoryItem={this.handleChangeInventoryItem}
					/>
				)
			case 'LIST_CONTAINERS':
				return null
        }

	}


	// this page should mostly just hold the app bar and drawer, then switch the contents of the page based of the state,
	// each page should have it's own folder in the components folder under wither the player folder or game_master folder

	render() {
		const { classes } = this.props;
        console.log("doin a render", this.state)
		return (
			<div className="App">
				<MenuBar
                    classes={classes}
                    toggleMenu={this.toggleMenu}
                    page={this.state.mode}
                />
				<MenuDrawer
                    classes={classes}
                    toggleMenu={this.toggleMenu}
                    menuOpen={this.state.menu.open}
                    isGM={this.state.menu.isGM}
                    handleChangePage={this.handleChangePage}
                />
                {this.getPageContents()}
			</div>
		);
	}
}

export default withStyles(styles)(App);
