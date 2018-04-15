import React from 'react'
import PropTypes from 'prop-types'
import Table, {TableBody, TableCell, TableHead, TableRow} from 'material-ui/Table'
import Paper from 'material-ui/Paper'
import Button from 'material-ui/Button'
import {fetchApi} from "../../../util"
import {EditableText} from "../../common/EditableText"

export class CharacterSelect extends React.PureComponent {
    static propTypes = {
        handleCharacterSelect: PropTypes.func.isRequired,
        handleChangePage: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            characters: []
        }
    }

    async componentDidMount() {
        const data = await fetchApi('inventory?class=player')
        const newCharacters = await data.json()
        this.setState({characters: newCharacters})
    }

    handleLoadCharacter = (id) => {
        this.props.handleCharacterSelect(id)
        return this.props.handleChangePage('INVENTORY')
    }
    createNewCharacter = async () => {
        let response = await fetchApi('inventory', 'POST', {
            'name': 'New Inventory',
            'class': 'player',
            'width': 10,
            'height': 4,
        })
        let newInventory = await response.json();
        this.setState({
            characters: this.state.characters.concat(newInventory)
        })
    }
    updateInventoryProperty = async (inventoryId, name, value) => {
        let response = await fetchApi(`inventory/${inventoryId}`, 'PATCH', {
            [name]: value,
        })
        if (response.ok) {
            this.setState({
                characters: this.state.characters.map((row) => {
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
                                <Button variant="raised" color="primary" onClick={this.createNewCharacter}>New
                                    Character</Button>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.characters.map(row => (
                            <TableRow key={row.id}>
                                <TableCell numeric>{row.id}</TableCell>
                                <TableCell>
                                    <EditableText
                                        onSave={(value) => this.updateInventoryProperty(row.id, 'name', value)}
                                        text={row.name}/>
                                </TableCell>
                                <TableCell>
                                    <EditableText
                                        onSave={(value) => this.updateInventoryProperty(row.id, 'width', parseInt(value) || row.width)}
                                        text={row.width.toString()}/>
                                </TableCell>
                                <TableCell>
                                    <EditableText
                                        onSave={(value) => this.updateInventoryProperty(row.id, 'height', parseInt(value) || row.height)}
                                        text={row.height.toString()}/>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        color="primary"
                                        onClick={() => this.handleLoadCharacter(row.id)}
                                    >Load</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        )
    }
}