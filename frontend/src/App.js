import React, {Component} from 'react'

import './App.css'
import { withStyles } from 'material-ui/styles'
import Button from 'material-ui/Button'

import {MenuBar} from './components/common/MenuBar'
import {MenuDrawer} from './components/common/MenuDrawer'

import {InventoryManager} from './components/player/inventory/InventoryManager'
import {ListTemplateComponent} from './components/game_master/template/list/ListTemplateComponent'
import {EditTemplateComponent} from './components/game_master/template/edit/EditTemplateComponent'
import {ListItemComponent} from './components/game_master/item/list/ListItemComponent'
import {EditItemComponent} from './components/game_master/item/edit/EditItemComponent'
import {fetchApi} from "./util"

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
		const item_id = parseInt(localStorage.getItem('item_id'), 10)

		this.state = {
            mode: current_page || 'INVENTORY',
			template_id: template_id || null,
			item_id: item_id || null,
			currentInventoryId: 0,
			inventories: JSON.parse(localStorage.getItem('openInventories')) || [],
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
		this.createSampleCrate = this.createSampleCrate.bind(this)

		this.state.currentInventoryId = parseInt(localStorage.getItem('currentPlayerInventory'), 10)
		if (!this.state.currentInventoryId) {
			fetchApi('inventory', 'POST', {
				'name': 'no-name',
				'width': 10,
				'height': 8,
			}).then((response) => {
				return response.json();
			}).then((json) => {
				this.setState({currentInventoryId: json.id})
			})
		}
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

	async createSampleCrate() {
		let crateResponse = await fetchApi('inventory', 'POST', {
			'name': 'A Box',
			'width': 10,
			'height': 4,
		})
		let inventoryId = (await crateResponse.json()).id;

		await Promise.all(
			[
				{name: "CrateA", width: 2, height: 3, x: 0, y: 0},
				{name: "CrateB", width: 1, height: 1, x: 0, y: 3},
				{name: "CrateC", width: 1, height: 1, x: 1, y: 3},
				{name: "CrateD", width: 1, height: 4, x: 2, y: 0},
			].map((item) => {
				return fetchApi('inventoryitem', 'POST', {
					template_id: parseInt(item.template_id, 10) || 9000,
					inventory_id: inventoryId,
					name: item.name || '',
					price: parseInt(item.price, 10) || 0,
					public_description: item.public_description || '',
					mechanical_description: item.mechanical_description || '',
					hidden_description: item.hidden_description || '',
					visible_mechanical: false,
					visible_hidden: false,
					x: parseInt(item.x, 10),
					y: parseInt(item.y, 10),
					width: parseInt(item.width, 10) || 1,
					height: parseInt(item.height, 10) || 1,
					image_url: item.image_url || ''
				}).then(response => {
					return response.json()
				})
			})
		)
		this.setState({inventories: this.state.inventories.concat(inventoryId)})
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.inventories !== this.state.inventories) {
			localStorage.setItem("openInventories", JSON.stringify(this.state.inventories))
		}
		if (prevState.currentInventoryId !== this.state.currentInventoryId) {
			localStorage.setItem('currentPlayerInventory', this.state.currentInventoryId)
		}
	}

    getPageContents () {
        switch (this.state.mode) {
			case 'CHARACTER_SELECT':
				return null
            case 'INVENTORY':
                return (
                    <InventoryManager
                        inventoryIds={this.state.inventories.concat(this.state.currentInventoryId)}
                    />
                )
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
						inventory_id={this.state.currentInventoryId}
					/>
				)
			case 'LIST_ITEMS':
				return (
					<ListItemComponent
                        handleChangePage={this.handleChangePage}
                        handleChangeInventoryItem={this.handleChangeInventoryItem}
					/>
				)
            default:
                console.log("Invalid mode: " + this.state.mode)
            	// noinspection FallThroughInSwitchStatementJS
			case 'LIST_CONTAINERS':
				return (
					<Button
						variant="raised"
						onClick={this.createSampleCrate}
					>
						Create a Crate
					</Button>
				)
        }
	}


	// this page should mostly just hold the app bar and drawer, then switch the contents of the page based of the state,
	// each page should have it's own folder in the components folder under wither the player folder or game_master folder

	render() {
		const { classes } = this.props;
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
