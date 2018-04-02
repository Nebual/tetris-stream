import React from 'react'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'

export class EditTemplateComponent extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            id: 0,
            name: '',
            public_description: '',
            mechanical_description: '',
            hidden_description: '',
            price: 0,
            width: 1,
            height: 1,
            image_url: ''
        }

        this.saveItem = this.saveItem.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    async componentDidMount() {
        if (this.props.template_id) {
            const data = await fetch(`http://localhost:8000/item/${this.props.template_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const template = await data.json
            const payload = {
                id: template.id || 0,
                name: template.name || '',
                public_description: template.public_description || '',
                mechanical_description: template.mechanical_description || '',
                hidden_description: template.hidden_description || '',
                price: template.price || 0,
                width: template.width || 0,
                height: template.height || 0,
                image_url: template.image_url || ''
            }
            this.setState(payload)
        }
    }

    async saveItem(e) {
        e.preventDefault();
        let url = 'http://localhost:8000/item';
        let method = 'POST';
        if (this.state.id > 0) {
            url += '/' + this.state.id;
            method = 'PATCH';
        }
        let response = await fetch(url, {
            method: method,
            body: JSON.stringify({
                id: this.state.id,
                name: this.state.name,
                price: parseInt(this.state.price, 10),
                public_description: this.state.description,
                mechanical_description: '',
                hidden_description: '',
                width: 1,
                height: 1,
                image_url: ''
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