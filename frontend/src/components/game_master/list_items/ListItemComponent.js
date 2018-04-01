import React from 'react'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';

export class ListItemComponent extends React.Component{
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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell numeric>{item.id}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.description}</TableCell>
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