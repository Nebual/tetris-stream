import React from 'react'
import PropTypes from 'prop-types'
import styled from "../../../utils/styled"

import CloseIcon from '@material-ui/icons/Close'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Paper from 'material-ui/Paper'
import Immutable from 'immutable'
import IconButton from 'material-ui/IconButton'
import Button from 'material-ui/Button'

const OverlayContainer = styled(Paper)({
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "0 15px",
    opacity: 0.75,
    zIndex: 10,
    pointerEvents: "none",
})
const OverlayIconButton = styled(IconButton)({
    pointerEvents: 'initial',
})
const OverlayButton = styled(Button)({
    pointerEvents: 'initial',
})

export class ItemOverlay extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            attuned: new Immutable.Set(JSON.parse(localStorage.getItem('attunedItems')) || []),
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.attuned !== this.state.attuned) {
            localStorage.setItem("attunedItems", JSON.stringify(this.state.attuned))
        }
    }

    attuneItem = () => {
        this.setState({attuned: this.state.attuned.add(this.props.item.id)})
    }
    unattuneItem = () => {
        this.setState({attuned: this.state.attuned.remove(this.props.item.id)})
    }
    handleClose = () => {
        this.props.handleClose()
    }
    handleDiscard = () => {
        this.props.handleDiscard(this.props.item.id)
        this.unattuneItem()
    }

    render() {
        if (!this.props.visible) {
            return null
        }
        const item = this.props.item
        return <OverlayContainer>
            <Toolbar>
                <Typography variant="title" color="inherit" style={{flex: 1}}>
                    {item.name}{item.price && <React.Fragment>- {item.price}G</React.Fragment>}
                </Typography>
                <OverlayIconButton size="small" onClick={this.handleClose} style={{position: 'absolute', right: -16}}><CloseIcon/></OverlayIconButton>
            </Toolbar>
            <Toolbar>
                {!this.state.attuned.has(item.id)
                    ? <OverlayButton variant="raised" color="primary" onClick={this.attuneItem}>Attune</OverlayButton>
                    : <OverlayButton variant="raised" color="primary" onClick={this.unattuneItem}>Unattune</OverlayButton>
                }
                {/*<OverlayButton variant="raised" color="default" onClick={this.handleDiscard}>Discard</OverlayButton>*/}
            </Toolbar>
            {item.public_description && <Typography variant="body1">{item.public_description}</Typography>}
            {(item.visible_mechanical && item.mechanical_description) && <p>{item.mechanical_description}</p>}
            {(item.visible_hidden && item.hidden_description) && <p>{item.hidden_description}</p>}
        </OverlayContainer>
    }
}
