import React from 'react'
import PropTypes from 'prop-types'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import {fetchApi} from "../../../../util"

export class ListTemplateComponent extends React.Component{
    static propTypes = {
        handleChangeTemplate: PropTypes.func.isRequired,
        handleChangePage: PropTypes.func.isRequired,
        handleChangeInventoryItem: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            items: []
        }
    }

    async componentDidMount() {
        const data = await fetchApi('item')
        const newItems = await data.json()
        this.setState({items: newItems})
    }

    handleEditItem(id) {
        this.props.handleChangeTemplate(id)
        return this.props.handleChangePage('EDIT_TEMPLATE')
    }

    handleAddToItem = (id) => {
        this.props.handleChangeTemplate(id)
        this.props.handleChangeInventoryItem(0)
        return this.props.handleChangePage('EDIT_ITEM')
    }

    render(){

        return(
            <Grid container spacing={24}>
                <Grid item xs={12}>
                    <Paper>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell numeric>Id</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell numeric>Price</TableCell>
                                    <TableCell>
                                        <Button variant="raised" color="primary" onClick={() => this.handleEditItem(0)}>Add Template</Button>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell numeric>{item.id}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.public_description}</TableCell>
                                        <TableCell numeric>{item.price}</TableCell>
                                        <TableCell>
                                            <Button color="primary" onClick={() => this.handleEditItem(item.id)}>Edit</Button>
                                            <Button color="primary" onClick={() => this.handleAddToItem(item.id)}>Add to Inventory</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>
        )
    }
}