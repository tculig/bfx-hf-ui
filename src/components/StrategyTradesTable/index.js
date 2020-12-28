import React from 'react'
import StrategyTradesTableColumns from './StrategyTradesTable.columns'

import Panel from '../../ui/Panel'
import Table from '../../ui/Table'
import { propTypes, defaultProps } from './StrategyTradesTable.props'
import './style.scss'

export default class StrategyTradesTable extends React.PureComponent {
  static propTypes = propTypes
  static defaultProps = defaultProps

  render() {
    const {
      label, trades, onTradeClick, dark,
    } = this.props
    const hasTrades = trades.length !== 0

    return (
      <Panel
        dark={dark}
        darkHeader={dark}
        label={label}
        removeable={false}
        moveable={false}
        className='hfui-strategytradestable__wrapper'
      >
        {hasTrades
          ? (
            <Table
              data={trades}
              columns={StrategyTradesTableColumns}
              defaultSortBy='mts'
              defaultSortDirection='DESC'
              onRowClick={({ rowData }) => onTradeClick(rowData)}
            />
          ) : (
            <div className='no-trades__wrapper'>
              <span className='no-trades__notification'>
                There were no trades in this timeframe
              </span>
            </div>
          )}
      </Panel>
    )
  }
}
