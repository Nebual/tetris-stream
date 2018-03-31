import React from 'react'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'

export class EditItem extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            id: 0,
            name: '',
            price: 1,
            description: '',
        }

        this.saveItem = this.saveItem.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    async saveItem(e) {
        e.preventDefault();
        let response = await fetch('http://localhost:8000/item', {
            method: this.state.id > 0 ? 'PATCH' : 'POST',
            body: JSON.stringify({
                id: this.state.id,
                name: this.state.name,
                price: parseInt(this.state.price, 10),
                description: this.state.description,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        let json = await response.json();
        this.setState({
            id: json['id'],
        });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    render() {


        return (
            <form onSubmit={this.saveItem}>
                <input type="hidden" name="id" value={this.state.id} />
                <TextField type="text" name="name" label="Item Name" value={this.state.name} onChange={this.handleChange} /><br/>
                <TextField type="number" name="price" label="Value (gold)" value={this.state.price} onChange={this.handleChange} /><br/>
                <TextField name="description" multiline label="Description" value={this.state.description} onChange={this.handleChange}
                           placeholder="Deals over 9000 damage to dust mites" rows="3"
                /><br/>

                <br/><br/>
                <Button variant="raised" color="primary" type="submit">
                    Save
                </Button>
            </form>
        )
    }
}