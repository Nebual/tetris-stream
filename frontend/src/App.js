import React, {Component} from 'react'

import './App.css'
import { withStyles } from 'material-ui/styles'

import {MenuBar} from './components/common/MenuBar'
import {MenuDrawer} from './components/common/MenuDrawer'
import {EditItem} from './components/game_master/edit_item/EditItem'
import {Backpack} from './components/backpack'

import Button from 'material-ui/Button'

const styles = {
	flex: {
		flex: 1,
	},
};


class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
            mode: 'ADD_ITEM',
            menu: {
			    open: false,
                isGM: true
            }
		}
		this.toggleMenu = this.toggleMenu.bind(this)
        this.handleChangePage = this.handleChangePage.bind(this)
        this.getPageContents = this.getPageContents.bind(this)
	}

	toggleMenu = (open) => () => {
		if (this.state.menu.open !== open) {
		    const state = {...this.state}
		    state.menu.open = open
            this.setState(state)
		}
	}

	saveMode(page) {
	    this.setState({mode: page})
    }

	handleChangePage(newPage) {
	    console.log('e', newPage)
        this.saveMode(newPage)
    }

    getPageContents () {
	    console.log('getPageContents: ', this.state.mode)
        switch (this.state.mode) {
            case 'INVENTORY':
                return ( <Backpack /> )
            case 'ADD_ITEM':
                return ( <EditItem /> )
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
                <Button onClick={() => {this.setState({page: 'INVENTORY'})}}>Go to inventory</Button>
                {this.getPageContents()}
			</div>
		);
	}
}

export default withStyles(styles)(App);
