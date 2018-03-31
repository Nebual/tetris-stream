import React from 'react'
import GridLayout from 'react-grid-layout'

import './layout-styles.css'
import './resize-styles.css'

export class Backpack extends React.Component{
    render() {
        const layout = [
            {i: 'a', x: 3, y: 3, w: 1, h: 1, name: 'dagger'},
            {i: 'b', x: 3, y: 0, w: 2, h: 3, name: 'shield'},
            {i: 'c', x: 0, y: 0, w: 3, h: 4, name: 'full plate'},
            {i: 'd', x: 4, y: 3, w: 1, h: 1, name: 'health potion'}
        ]

        return (
            <GridLayout
                className="layout"
                layout={layout}
                cols={10}
                rowHeight={51}
                width={600}
                verticalCompact={false}
                containerPadding={[0,0]}
                isResizable={false}
                preventCollision={true}
                autoSize={false}
                maxRows={4}
                onLayoutChange={(layout) => {
                    console.log(layout)
                }}
            >
                {layout.map(item => (<div className="item" key={item.i.toString()}>{item.name}</div>))}
            </GridLayout>
        )
    }
}