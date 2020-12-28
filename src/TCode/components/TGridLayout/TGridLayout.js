import React from 'react'
import { Responsive as RGL, WidthProvider } from 'react-grid-layout'

import { propTypes, defaultProps } from './TGridLayout.props'
import { renderLayoutElement } from './TGridLayout.helpers'
import './style.scss'

const GridLayoutP = WidthProvider(RGL)

export default class TGridLayout extends React.PureComponent {
  static propTypes = propTypes
  static defaultProps = defaultProps
  static rowHeight = 25

  constructor(props) {
    super(props)

    this.onLayoutChange = this.onLayoutChange.bind(this)
  }

  onLayoutChange(layout) {
    const { onLayoutChange } = this.props
    onLayoutChange(layout)
  }

  render() {
    const {
      layoutDef, chartProps, bookProps, tradesProps, orderFormProps, ordersProps,
      onRemoveComponent, layoutID, darkPanels, sharedProps, xExtentsCommonProps,
    } = this.props

    const componentProps = {
      xExtentsCommon: xExtentsCommonProps,
      orderForm: orderFormProps,
      trades: tradesProps,
      chart: chartProps,
      orders: ordersProps,
      book: bookProps,
      dark: darkPanels,
      sharedProps,
    }
    return (
      <GridLayoutP
        autoSize
        className='layout'
        draggableHandle='.icon-move'
        cols={{
          lg: 100, md: 100, sm: 100, xs: 100, xxs: 100,
        }}
        rowHeight={TGridLayout.rowHeight}
        layouts={{ lg: layoutDef.layout }}
        breakpoints={{
          lg: 1000, md: 996, sm: 768, xs: 480, xxs: 0,
        }}
        onLayoutChange={this.onLayoutChange}
      >
        {layoutDef.layout.map(def => (
          <div key={def.i}>
            {renderLayoutElement(layoutID, def, componentProps, onRemoveComponent)}
          </div>
        ))}
      </GridLayoutP>
    )
  }
}
