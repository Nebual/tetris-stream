import React from 'react'
import PropTypes from 'prop-types'

import CloseIcon from '@material-ui/icons/Close'
import CheckIcon from '@material-ui/icons/Check'
import Input from "material-ui/Input/Input"
import InputAdornment from "material-ui/Input/InputAdornment"
import IconButton from "material-ui/IconButton/IconButton"
import {CircularProgress} from "material-ui/Progress"

export class EditableText extends React.PureComponent {
    static propTypes = {
        onSave: PropTypes.func.isRequired,
        text: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            text: null,
            editText: null,
            active: false,
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        return {
            text: nextProps.text,
            editText: nextProps.text,
        }
    }

    activate = () => {
        if (this.props.disabled) {
            return;
        }
        this.setState({
            active: true,
        })
    }
    deactivate = () => {
        this.setState({
            active: false,
        })
    }
    onSave = () => {
        this.props.onSave(this.state.editText)
        this.setState({
            active: false,
            text: (<span>{this.state.editText} <CircularProgress size={16} thickness={4}/></span>),
        })
    }
    handleChange = (event) => {
        this.setState({editText: event.target.value})
    }

    render() {
        return (
            <React.Fragment>
                {!this.state.active ? (
                    <span onClick={this.activate}>{this.state.text}</span>
                ) : (
                    <Input
                        value={this.state.editText}
                        onChange={this.handleChange}
                        autoFocus={true}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton color="secondary" onClick={this.deactivate}>
                                    <CloseIcon/>
                                </IconButton>
                                <IconButton color="primary" onClick={this.onSave}>
                                    <CheckIcon/>
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                )}
            </React.Fragment>
        )
    }
}
