import React from 'react'
import TChart from '../TChart'
import TPanel from '../../ui/TPanel'
import TMarketSelect from '../TMarketSelect'
import { propTypes, defaultProps } from './ChartPanelWithDropdown.props'

export default class ChartPanelWithDropdown extends React.Component {
    static propTypes = propTypes
    static defaultProps = defaultProps
    state = {
    }

    constructor(props) {
      super(props)

      const { savedState = {} } = props
      const {
        marketDirty = false, exchangeDirty,
        sumAmounts = true, stackedView = true,
      } = savedState
      const { allMarkets } = this.props
      const markets = allMarkets[props.activeExchange] || []
      const activeMarketInit = markets[41];
      this.state = {
        ...this.state,
        sumAmounts,
        stackedView,
        activeMarket: activeMarketInit,
        currentExchange: props.activeExchange,
        marketDirty,
        exchangeDirty,
      }
    }

    onChangeMarket=(market) => {
      this.setState(() => ({
        activeMarket: market,
      }))
    }

    renderMarketDropdown() {
      const { marketDirty, activeMarket, currentExchange } = this.state
      const { allMarkets } = this.props
      const markets = allMarkets[currentExchange] || []
      return (
        <TMarketSelect
          key='market-dropdown'
          disabled={false}
          className={{ yellow: marketDirty }}
          onChange={this.onChangeMarket}
          value={activeMarket}
          markets={markets}
        />
      )
    }

    render() {
      const {
        onRemove, moveable, removeable, dark,
      } = this.props
      const { activeMarket } = this.state;
      return (
        <TPanel
          dark={dark}
          darkHeader={dark}
          onRemove={onRemove}
          moveable={moveable}
          removeable={removeable}
          headerComponents={[
            this.renderMarketDropdown(),
          ]}
        >
          <TChart
            activeMarket={activeMarket}
          />
        </TPanel>
      )
    }
}
