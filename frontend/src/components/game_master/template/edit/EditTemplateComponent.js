import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import {fetchApi} from "../../../../util"

export class EditTemplateComponent extends React.Component{
    static propTypes = {
        handleChangePage: PropTypes.func.isRequired,
        handleChangeInventoryItem: PropTypes.func.isRequired,
        template_id: PropTypes.string
    }

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

        this.handleChange = this.handleChange.bind(this)
    }

    async componentDidMount() {
        if (this.props.template_id) {
            const data = await fetchApi(`item/${this.props.template_id}`)
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

    handleSubmit = async (e) => {
        e.preventDefault();
        await this.saveItem()
    }
    saveItem = async () => {
        let url = 'item';
        let method = 'POST';
        if (this.state.id > 0) {
            url += '/' + this.state.id;
            method = 'PATCH';
        }
        let response = await fetchApi(url, method, {
            id: this.state.id,
            name: this.state.name || '',
            price: parseInt(this.state.price, 10) || 0,
            public_description: this.state.public_description || '',
            mechanical_description: this.state.mechanical_description || '',
            hidden_description: this.state.hidden_description || '',
            width: parseInt(this.state.width, 10) || 1,
            height: parseInt(this.state.height, 10) || 1,
            image_url: this.state.image_url || '',
        });
        let json = await response.json();
        this.setState({
            id: json['id'],
        });
    }

    handleAddToItem = async () => {
        await this.saveItem()
        this.props.handleChangeInventoryItem(0)
        return this.props.handleChangePage('INVENTORY')
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    render() {

        return <Paper style={{padding: '10px 0'}}>
            <form onSubmit={this.handleSubmit}>
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
                    label="Width"
                    type="number"
                    value={this.state.width}
                    onChange={this.handleChange}
                /><br/>
                <TextField
                    name="height"
                    label="Height"
                    type="number"
                    value={this.state.height}
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
                <Button variant="raised" color="default" type="button" onClick={this.handleAddToItem}>
                    Add to Inventory
                </Button>
            </form>
        </Paper>
    }
}