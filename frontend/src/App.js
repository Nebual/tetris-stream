import React, {Component} from 'react'
import Immutable from 'immutable'

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
import {InventorySelect} from "./components/common/InventorySelect"
import {PermissionsContext} from "./components/common/Contexts"
import {GameSelect} from "./components/player/GameSelect"

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
            subpage: null,
            template_id: template_id || null,
            item_id: item_id || null,
            characterInventoryId: 0,
            currentInventoryId: 0,
            game_id: parseInt(localStorage.getItem('game_id'), 10) || null,
            inventories: new Immutable.Set(JSON.parse(localStorage.getItem('openInventories')) || []),
            permissions: {
                isGM: localStorage.getItem('isGM') > 0,
            },
            menu: {
                open: false,
            }
        }

        this.state.characterInventoryId = parseInt(localStorage.getItem('currentPlayerInventory'), 10)
        if (!this.state.characterInventoryId) {
            fetchApi('inventory', 'POST', {
                'name': 'Unnamed Player',
                'class': 'player',
                'width': 10,
                'height': 4,
            }).then((response) => {
                return response.json();
            }).then((json) => {
                this.setState({characterInventoryId: json.id})
            })
        }
    }

	toggleMenu = (open) => () => {
		if (this.state.menu.open !== open) {
            this.setState({menu: {...this.state.menu, open: open}})
		}
	}

	handleChangePage = (newpage) => {
        if (this.state.mode !== newpage) {
            this.setState({
                mode: newpage,
                subpage: null,
            })
            localStorage.setItem('current_page', newpage)
        }
    }

    handleChangeGame = async (gameId, isHosting) => {
        await fetchApi(`inventory/${this.state.characterInventoryId}/game`, 'POST', {'game_id': isHosting ? null : gameId})
        this.setState({game_id: gameId, permissions: {...this.state.permissions, isGM: isHosting}})
    }

    setSubpageText = (text) => {
        this.setState({
            subpage: text,
        })
    }

    handleChangeTemplate = (newTemplate) => {
        this.setState({template_id: newTemplate})
    }

    handleChangeInventoryItem = (newItem) => {
        this.setState({item_id: newItem})
    }
    handleChangeCurrentInventory = (id) => {
        this.setState({currentInventoryId: id})
    }

    handleChangeCharacter = (id) => {
        this.setState({
            characterInventoryId: id,
        })
    }
    handleOpenInventory = (inventoryId) => {
        this.setState({inventories: this.state.inventories.add(inventoryId)})
    }
    handlePresentInventory = async (inventoryId) => {
        await fetchApi(`inventory/${inventoryId}/game`, 'POST', {'game_id': this.state.game_id})
    }

    handleCloseInventory = (inventoryId) => {
        this.setState({inventories: this.state.inventories.remove(inventoryId)})
    }

	createSampleCrate = async () => {
		let crateResponse = await fetchApi('inventory', 'POST', {
			'name': 'A Box',
			'width': 10,
			'height': 4,
			'class': 'crate',
		})
		let inventoryId = (await crateResponse.json()).id;

		await Promise.all(
			[
				{name: "CrateA", width: 2, height: 3, x: 0, y: 0, image_url: 'http://nebtown.info/s/2Y1.png'},
				{name: "CrateB", width: 1, height: 1, x: 0, y: 3, image_url: 'http://nebtown.info/s/2XZ.png'},
				{name: "CrateC", width: 1, height: 1, x: 1, y: 3, image_url: 'http://nebtown.info/s/2XZ.png'},
				{name: "CrateD", width: 1, height: 4, x: 2, y: 0, image_url: 'http://nebtown.info/s/2Y0.png'},
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
		this.handleOpenInventory(inventoryId)
		this.handleChangePage('INVENTORY')
	}

    componentDidUpdate(prevProps, prevState) {
        if (prevState.inventories !== this.state.inventories) {
            localStorage.setItem("openInventories", JSON.stringify(this.state.inventories))
        }
        if (prevState.characterInventoryId !== this.state.characterInventoryId) {
            localStorage.setItem('currentPlayerInventory', this.state.characterInventoryId)
        }
        if (prevState.template_id !== this.state.template_id) {
            localStorage.setItem('template_id', this.state.template_id)
        }
        if (prevState.item_id !== this.state.item_id) {
            localStorage.setItem('item_id', this.state.item_id)
        }
        if (prevState.game_id !== this.state.game_id) {
            localStorage.setItem('game_id', this.state.game_id)
        }
        if (prevState.permissions.isGM !== this.state.permissions.isGM) {
            localStorage.setItem('isGM', this.state.permissions.isGM ? '1' : '0')
        }
    }

    getPageContents = () => {
        switch (this.state.mode) {
            case 'CHARACTER_SELECT':
                return <InventorySelect
                    handleChangePage={this.handleChangePage}
                    handleInventorySelect={this.handleChangeCharacter}
                    inventoryClass="player"
                />
            case 'INVENTORY':
                return (
                    <InventoryManager
                        setSubpageText={this.setSubpageText}
                        primaryInventoryId={this.state.characterInventoryId}
                        inventoryIds={this.state.inventories}
                        handleClose={this.handleCloseInventory}
                        handleChangePage={this.handleChangePage}
                        handleChangeInventoryItem={this.handleChangeInventoryItem}
                        handleChangeCurrentInventory={this.handleChangeCurrentInventory}
                    />
                )
            case 'LIST_GAMES':
                return <GameSelect
                    handleChangePage={this.handleChangePage}
                    handleChangeGame={this.handleChangeGame}
                />
			case 'LIST_PLAYERS':
				return null
            case 'EDIT_TEMPLATE':
                return (
                    <EditTemplateComponent
                        handleChangePage={this.handleChangePage}
                        handleChangeInventoryItem={this.handleChangeInventoryItem}
                        template_id={this.state.template_id}
                    />
				)
            case 'LIST_TEMPLATES':
                return (
                    <ListTemplateComponent
                        handleChangePage={this.handleChangePage}
                        handleChangeTemplate={this.handleChangeTemplate}
                        handleChangeInventoryItem={this.handleChangeInventoryItem}
                    />
				)
            case 'EDIT_ITEM':
                return (
                    <EditItemComponent
                        item_id={this.state.item_id}
                        inventory_id={this.state.currentInventoryId || this.state.characterInventoryId}
                        template_id={parseInt(this.state.template_id, 10)}
                        handleChangePage={this.handleChangePage}
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
                return <React.Fragment>
                    <InventorySelect
                        handleChangePage={this.handleChangePage}
                        handleInventorySelect={this.handleOpenInventory}
                        handlePresentInventory={this.handlePresentInventory}
                        inventoryClass="crate"
                    />
                    <Button
                        variant="raised"
                        onClick={this.createSampleCrate}
                        style={{marginTop: 15}}
                    >
                        Create a Sample Crate
                    </Button>
                </React.Fragment>
        }
	}


	// this page should mostly just hold the app bar and drawer, then switch the contents of the page based of the state,
	// each page should have it's own folder in the components folder under wither the player folder or game_master folder

	render() {
		const { classes } = this.props;
		return (
            <div className="App">
                <PermissionsContext.Provider value={this.state.permissions}>
                    <MenuBar
                        classes={classes}
                        toggleMenu={this.toggleMenu}
                        page={this.state.mode}
                        subpage={this.state.subpage}
                    />
                    <MenuDrawer
                        classes={classes}
                        toggleMenu={this.toggleMenu}
                        menuOpen={this.state.menu.open}
                        isGM={this.state.permissions.isGM}
                        handleChangePage={this.handleChangePage}
                    />
                    {this.getPageContents()}
                </PermissionsContext.Provider>
            </div>
		);
	}
}

export default withStyles(styles)(App);
