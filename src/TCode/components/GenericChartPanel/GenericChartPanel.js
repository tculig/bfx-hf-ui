import React from 'react'
import XYChart from '../GenericCharts/XYChart'
import TPanel from '../../ui/TPanel'
import TMarketSelect from '../TMarketSelect'
import { propTypes, defaultProps } from './GenericChartPanel.props'

export default class GenericChartPanel extends React.Component {
    static propTypes = propTypes
    static defaultProps = defaultProps
    static marketIDS = ['market1', 'market2']
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
        activeMarket: {
          [GenericChartPanel.marketIDS[0]]: activeMarketInit,
          [GenericChartPanel.marketIDS[1]]: activeMarketInit,
        },
        currentExchange: props.activeExchange,
        marketDirty,
        exchangeDirty,
      }
    }

    onChangeMarket=(market, key) => {
      this.setState((oldState) => ({
        activeMarket: {
          ...oldState.activeMarket,
          [key]: market,
        },
      }))
    }

    renderMarketDropdown(selectkey) {
      const { marketDirty, activeMarket, currentExchange } = this.state
      const { allMarkets } = this.props
      const markets = allMarkets[currentExchange] || []
      return (
        <div style={{ display: 'flex', flexDirection: 'row' }} key={selectkey}>
          <TMarketSelect
            key={selectkey}
            selectkey={selectkey}
            disabled={false}
            className={{ yellow: marketDirty }}
            onChange={this.onChangeMarket}
            value={activeMarket[selectkey]}
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
            <div style={{ display: 'flex', flexDirection: 'row' }} key='root-header'>
              {[
                this.renderMarketDropdown(GenericChartPanel.marketIDS[0]),
                this.renderMarketDropdown(GenericChartPanel.marketIDS[1]),
              ]}
            </div>,
          ]}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              backgroundColor: '#131722',
              height: '100%',
            }}
          >
            <XYChart
              activeMarket={activeMarket}
              historicalData={historicalData}
              showHistorical={showHistorical}
              updateXExtends={updateXExtends}
              xExtentsCommon={xExtentsCommon}
              height={height}
            />
          </div>
        </TPanel>
      );
    }
}
