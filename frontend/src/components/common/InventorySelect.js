import React from 'react'
import PropTypes from 'prop-types'
import Table, {TableBody, TableCell, TableHead, TableRow} from 'material-ui/Table'
import Paper from 'material-ui/Paper'
import Button from 'material-ui/Button'
import {fetchApi} from "../../util"
import {EditableText} from "./EditableText"
import {PermissionsContext} from './Contexts'

export class InventorySelect extends React.PureComponent {
    static propTypes = {
        handleInventorySelect: PropTypes.func.isRequired,
        handlePresentInventory: PropTypes.func,
        handleChangePage: PropTypes.func.isRequired,
        inventoryClass: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            inventories: []
        }
    }

    async componentDidMount() {
        const data = await fetchApi(`inventory?class=${this.props.inventoryClass}`)
        const newInventories = await data.json()
        this.setState({inventories: newInventories})
    }

    handleLoadInventory = (id) => {
        this.props.handleInventorySelect(id)
        return this.props.handleChangePage('INVENTORY')
    }
    createNewInventory = async () => {
        let response = await fetchApi('inventory', 'POST', {
            'name': `New ${this.props.inventoryClass}`,
            'class': this.props.inventoryClass,
            'width': 10,
            'height': 4,
        })
        let newInventory = await response.json();
        this.setState({
            inventories: this.state.inventories.concat(newInventory)
        })
    }
    updateInventoryProperty = async (inventoryId, name, value) => {
        let response = await fetchApi(`inventory/${inventoryId}`, 'PATCH', {
            [name]: value,
        })
        if (response.ok) {
            this.setState({
                inventories: this.state.inventories.map((row) => {
                    if (row.id === inventoryId) {
                        row[name] = value
                    }
                    return row
                })
            })
        }
    }

    render() {
        return (
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell numeric>Id</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Width</TableCell>
                            <TableCell>Height</TableCell>
                            <TableCell>
                                <Button variant="raised" color="primary" onClick={this.createNewInventory}>New</Button>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.inventories.map(row => (
                            <TableRow key={row.id}>
                                <TableCell numeric>{row.id}</TableCell>
                                <TableCell>
                                    <EditableText
                                        onSave={(value) => this.updateInventoryProperty(row.id, 'name', value)}
                                        text={row.name}/>
                                </TableCell>
                                <TableCell>
                                    <EditableText
                                        onSave={(value) => this.updateInventoryProperty(row.id, 'width', parseInt(value, 10) || row.width)}
                                        text={row.width.toString()}/>
                                </TableCell>
                                <TableCell>
                                    <EditableText
                                        onSave={(value) => this.updateInventoryProperty(row.id, 'height', parseInt(value, 10) || row.height)}
                                        text={row.height.toString()}/>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        color="primary"
                                        onClick={() => this.handleLoadInventory(row.id)}
                                    >Load</Button>
                                    {this.props.inventoryClass === "crate" &&
                                        <PermissionsContext.Consumer>
                                            {({isGM}) => isGM && (
                                                <Button color="secondary" onClick={() => this.props.handlePresentInventory(row.id)}>Present to Players</Button>
                                            )}
                                        </PermissionsContext.Consumer>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        )
    }
}
