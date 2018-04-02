import React from 'react'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table'
import Paper from 'material-ui/Paper'
import Grid from 'material-ui/Grid'
import Button from 'material-ui/Button'

export class ListItemComponent extends React.Component{
    constructor(props) {
        super(props)

        this.state = {
            items: []
        }
    }

    async componentDidMount() {
        const data = await fetch('http://localhost:8000/inventoryitem', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const newItems = await data.json()
        this.setState({items: newItems})
    }

    handleEditItem(id) {
        this.props.handleChangeInventoryItem(id)
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
                                        <Button variant="raised" color="primary" onClick={() => this.handleEditItem(0)}>Add Item</Button>
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