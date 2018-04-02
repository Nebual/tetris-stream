import React from 'react'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button'

export class ListTemplateComponent extends React.Component{
    constructor(props) {
        super(props)

        this.state = {
            items: []
        }
    }

    async componentDidMount() {
        const data = await fetch('http://localhost:8000/item', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const newItems = await data.json()
        this.setState({items: newItems})
    }

    handleEditItem(id) {
        this.props.handleChangeTemplate(id)
        return this.props.handleChangePage('EDIT_TEMPLATE')
    }

    render(){

        return(
            <Grid container spacing={24}>
                <Grid item xs={10}/>
                <Grid item xs={2}>
                    <Button variant="raised" color="primary" onClick={() => this.handleEditItem(0)}>
                        Add Template
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Paper>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell numeric>Id</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell numeric>Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.items.map(item => (
                                    <TableRow key={item.id} onClick={() => this.handleEditItem(item.id)}>
                                        <TableCell numeric>{item.id}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.public_description}</TableCell>
                                        <TableCell numeric>{item.price}</TableCell>
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