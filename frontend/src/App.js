import React, {Component} from 'react';
import Button from 'material-ui/Button';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
		};
		this.getFromRust = this.getFromRust.bind(this);
		this.saveItem = this.saveItem.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	async getFromRust() {
		let response = await fetch('http://localhost:8000');
		let text = await response.text();
		console.log(text);
	}

	saveItem(e) {
		console.log(this.state);
		e.preventDefault();
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	render() {
		return (
			<div className="App">
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload.
				</p>
				<button onClick={this.getFromRust}>Rust Me</button>
				<form onSubmit={this.saveItem}>
					<label>
						Item Name:
						<input type="text" name="name" value={this.state.name} onChange={this.handleChange} />
					</label>
					<Button variant="raised" color="primary">
						Save
					</Button>
				</form>
			</div>
		);
	}
}

export default App;
