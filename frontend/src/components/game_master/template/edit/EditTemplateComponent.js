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
            const template = await data.json()
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
                name: this.state.name || '',
                price: parseInt(this.state.price, 10) || 0,
                public_description: this.state.public_description || '',
                mechanical_description: this.state.mechanical_description || '',
                hidden_description: this.state.hidden_description || '',
                width: this.state.width || 1,
                height: this.state.height || 1,
                image_url: this.state.image_url || ''
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
                <TextField
                    type="text"
                    name="name"
                    label="Item Name"
                    value={this.state.name}
                    onChange={this.handleChange}
                /><br/>
                <TextField
                    type="number"
                    name="price"
                    label="Value (gold)"
                    value={this.state.price}
                    onChange={this.handleChange}
                /><br/>
                <TextField
                    name="public_description"
                    multiline label="Public Description"
                    value={this.state.public_description}
                    onChange={this.handleChange}
                    placeholder="A rusty sword with a sharp edge" rows="3"
                /><br/>
                <TextField
                    name="mechanical_description"
                    multiline label="Mechanical Description"
                    value={this.state.mechanical_description}
                    onChange={this.handleChange}
                    placeholder="+1 Longsword, on a natural one tell the GM" rows="3"
                /><br/>
                <TextField
                    name="hidden_description"
                    multiline label="Hidden Description"
                    value={this.state.hidden_description}
                    onChange={this.handleChange}
                    placeholder="When a nat 1 is rolled the sword breaks" rows="3"
                /><br/>
                <TextField
                    name="width"
                    multiline label="Width"
                    value={this.state.width}
                    onChange={this.handleChange}
                /><br/>
                <TextField
                    name="height"
                    multiline label="Height"
                    value={this.state.height}
                    onChange={this.handleChange}
                /><br/>
                <TextField
                    name="image_url"
                    multiline label="Image_url"
                    value={this.state.image_url}
                    onChange={this.handleChange}
                /><br/>

                <br/><br/>
                <Button variant="raised" color="primary" type="submit">
                    Save
                </Button>
            </form>
        )
    }
}