import React from 'react'
import PearsonChart from './PearsonChart'
import TPanel from '../../../ui/TPanel'
import TMarketSelect from '../../TMarketSelect'
import { propTypes, defaultProps } from './GenericChartPanel.props'

export default class GenericChartPanel extends React.Component {
    static propTypes = propTypes
    static defaultProps = defaultProps
    static marketIDS = ['market1', 'market2']
    state = {
    }
    market1Filtered = ['tBTCUSD'];
    market2Filtered = ['tETHBTC'];

    constructor(props) {
      super(props)

      const { savedState = {} } = props
      const {
        marketDirty = false, exchangeDirty,
        sumAmounts = true, stackedView = true,
      } = savedState
      const { allMarkets } = this.props
      const markets = allMarkets[props.activeExchange] || []
      const allowedMarkets1 = markets.filter(el => this.market1Filtered.includes(el.restID))
      const allowedMarkets2 = markets.filter(el => this.market2Filtered.includes(el.restID))
      const activeMarketInit1 = allowedMarkets1[0]
      const activeMarketInit2 = allowedMarkets2[0]
      this.state = {
        ...this.state,
        sumAmounts,
        stackedView,
        activeMarket: {
          [GenericChartPanel.marketIDS[0]]: activeMarketInit1,
          [GenericChartPanel.marketIDS[1]]: activeMarketInit2,
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

    renderMarketDropdown(selectkey, filterArray) {
      const { marketDirty, activeMarket, currentExchange } = this.state
      const { allMarkets } = this.props
      const markets = allMarkets[currentExchange] || []
      const allowedMarkets = markets.filter(el => filterArray.includes(el.restID))
      return (
        <div style={{ display: 'flex', flexDirection: 'row' }} key={selectkey}>
          <TMarketSelect
            key={selectkey}
            selectkey={selectkey}
            disabled={false}
            className={{ yellow: marketDirty }}
            onChange={this.onChangeMarket}
            value={activeMarket[selectkey]}
            markets={allowedMarkets}
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
                this.renderMarketDropdown(GenericChartPanel.marketIDS[0], this.market1Filtered),
                this.renderMarketDropdown(GenericChartPanel.marketIDS[1], this.market2Filtered),
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
            <PearsonChart
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
