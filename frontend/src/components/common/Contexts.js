import React from "react"

export const PermissionsContext = React.createContext()
export const WSPacketContext = React.createContext()

export function withWSPacketContext(Component) {
    return (props) => {
        return <WSPacketContext.Consumer>
            {(wsPacket) => <Component {...props} wsPacket={wsPacket}/>}
        </WSPacketContext.Consumer>
    }
}
