import React from 'react'
import ChartReactStockcharts from '../ChartReactStockcharts'
import TPanel from '../../ui/TPanel'
import TMarketSelect from '../TMarketSelect'
import { propTypes, defaultProps } from './ChartPanelReactStockcharts.props'

export default class ChartPanelReactStockcharts extends React.Component {
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
      const activeMarketInit = markets[41]
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
        <div style={{ display: 'flex', flexDirection: 'row' }} key='market-titi'>
          <TMarketSelect
            key='market-dropdown-titi'
            disabled={false}
            className={{ yellow: marketDirty }}
            onChange={this.onChangeMarket}
            value={activeMarket}
            markets={markets}
          />
        </div>

      )
    }

    render() {
      const {
        onRemove, moveable, removeable, dark,
        updateXExtends, xExtentsCommon, height,
      } = this.props
      const {
        activeMarket, historicalData, showHistorical,
      } = this.state;
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
          <ChartReactStockcharts
            activeMarket={activeMarket}
            historicalData={historicalData}
            showHistorical={showHistorical}
            updateXExtends={updateXExtends}
            xExtentsCommon={xExtentsCommon}
            height={height}
          />
        </TPanel>
      )
    }
}
