import React from 'react'
import PropTypes from 'prop-types'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'
import Paper from "material-ui/Paper"
import {fetchApi} from "../../../../util"

export class EditItemComponent extends React.Component{
    static propTypes = {
        item_id: PropTypes.number,
        inventory_id: PropTypes.number,
        template_id: PropTypes.number,
    }

    constructor(props) {
        super(props)
        this.state = {
            id: 0,
            template_id: 0,
            name: '',
            public_description: '',
            mechanical_description: '',
            hidden_description: '',
            price: 0,
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            image_url: ''
        }

        this.saveItem = this.saveItem.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    async componentDidMount() {
        if (this.props.item_id) {
            const data = await fetchApi(`inventoryitem/${this.props.item_id}`)
            const item = await data.json()
            const payload = {
                id: item.id || 0,
                template_id: item.template_id,
                inventory_id: item.inventory_id,
                name: item.name || '',
                public_description: item.public_description || '',
                mechanical_description: item.mechanical_description || '',
                hidden_description: item.hidden_description || '',
                price: item.price || 0,
                x: item.x,
                y: item.y,
                width: item.width || 1,
                height: item.height || 1,
                image_url: item.image_url || ''
            }
            this.setState(payload)
        } else if (this.props.template_id) {
            const data = await fetchApi(`item/${this.props.template_id}`)
            const item = await data.json()
            this.setState({
                id: 0,
                template_id: this.props.template_id,
                inventory_id: this.props.inventory_id,
                name: item.name || '',
                public_description: item.public_description || '',
                mechanical_description: item.mechanical_description || '',
                hidden_description: item.hidden_description || '',
                price: item.price || 0,
                x: '',
                y: '',
                width: item.width || 1,
                height: item.height || 1,
                image_url: item.image_url || ''
            })
        }
    }

    async saveItem(e) {
        e.preventDefault();
        let url = 'inventoryitem';
        let method = 'POST';
        if (this.state.id > 0) {
            url += '/' + this.state.id;
            method = 'PATCH';
        }
        let response = await fetchApi(url, method, {
            id: parseInt(this.state.id, 10),
            template_id: parseInt(this.state.template_id, 10) || 0,
            inventory_id: this.props.inventory_id,
            name: this.state.name || '',
            price: parseInt(this.state.price, 10) || 0,
            public_description: this.state.public_description || '',
            mechanical_description: this.state.mechanical_description || '',
            hidden_description: this.state.hidden_description || '',
            visible_mechanical: false,
            visible_hidden: false,
            x: parseInt(this.state.x, 10) || 0,
            y: parseInt(this.state.y, 10) || 0,
            width: parseInt(this.state.width, 10) || 1,
            height: parseInt(this.state.height, 10) || 1,
            image_url: this.state.image_url || ''
        });
        let json = await response.json();
        this.setState({
            id: json['id'],
        });
        this.props.handleChangePage('INVENTORY')
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    render() {


        return <Paper style={{padding: '10px 0'}}>
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
                    name="template_id"
                    label="Template ID"
                    style={{display: this.state.template_id > 0 && 'none'}}
                    value={this.state.template_id}
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
                    label="Width"
                    type="number"
                    value={this.state.width}
                    onChange={this.handleChange}
                />
                <TextField
                    name="height"
                    label="Height"
                    type="number"
                    value={this.state.height}
                    onChange={this.handleChange}
                /><br/>
                <TextField
                    name="x"
                    label="X"
                    type="number"
                    value={this.state.x}
                    onChange={this.handleChange}
                />
                <TextField
                    name="y"
                    label="Y"
                    type="number"
                    value={this.state.y}
                    onChange={this.handleChange}
                /><br/>
                <TextField
                    name="image_url"
                    label="Image_url"
                    value={this.state.image_url}
                    onChange={this.handleChange}
                />
                <img src={this.state.image_url} width={48} height={48} alt="" style={{
                    position: 'relative',
                    top: 12,
                    left: 64,
                    marginTop: -12,
                    marginLeft: -48,
                    minWidth: 48,
                    opacity: this.state.image_url ? 1 : 0,
                }}/>

                <br/><br/>
                <Button variant="raised" color="primary" type="submit">
                    Save
                </Button>
            </form>
        </Paper>
    }
}