import React from 'react'
import PropTypes from 'prop-types'
import Table, {TableBody, TableCell, TableHead, TableRow} from 'material-ui/Table'
import Paper from 'material-ui/Paper'
import Button from 'material-ui/Button'
import {fetchApi} from "../../util"
import {EditableText} from "../common/EditableText"

export class GameSelect extends React.PureComponent {
    static propTypes = {
        handleChangeGame: PropTypes.func.isRequired,
        handleChangePage: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            games: [],
        }
    }

    async componentDidMount() {
        const data = await fetchApi(`game`)
        const games = await data.json()
        this.setState({games: games})
    }

    handleLoad = (id, isHosting) => {
        this.props.handleChangeGame(id, isHosting)
        this.props.handleChangePage('INVENTORY')
    }
    createNew = async () => {
        let response = await fetchApi('game', 'POST', {
            'name': `New Game`,
        })
        let game = await response.json();
        this.setState({
            games: this.state.games.concat(game),
        })
    }
    updateInventoryProperty = async (id, name, value) => {
        let response = await fetchApi(`game/${id}`, 'PATCH', {
            [name]: value,
        })
        if (response.ok) {
            this.setState({
                games: this.state.games.map((row) => {
                    if (row.id === id) {
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
                            <TableCell>Players</TableCell>
                            <TableCell>
                                <Button variant="raised" color="primary" onClick={this.createNew}>New</Button>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.games.map(row => (
                            <TableRow key={row.id}>
                                <TableCell numeric>{row.id}</TableCell>
                                <TableCell>
                                    <EditableText
                                        onSave={(value) => this.updateInventoryProperty(row.id, 'name', value)}
                                        text={row.name}/>
                                </TableCell>
                                <TableCell>
                                    {row.players.join(', ')}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        color="primary"
                                        onClick={() => this.handleLoad(row.id, false)}
                                    >Join</Button>
                                    <Button
                                        color="secondary"
                                        onClick={() => this.handleLoad(row.id, true)}
                                    >Host</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        )
    }
}
