import React from 'react'

import OrderForm from '../../../components/OrderForm'
import OrderBookPanel from '../../../components/OrderBookPanel'
import ChartPanel from '../../../components/ChartPanel'
import AtomicOrdersTablePanel from '../../../components/AtomicOrdersTablePanel'
import AlgoOrdersTablePanel from '../../../components/AlgoOrdersTablePanel'
import OrderHistoryTable from '../../../components/OrderHistoryTable'
import TradesTablePanel from '../../../components/TradesTablePanel'
import PositionsTablePanel from '../../../components/PositionsTablePanel'
import BalancesTablePanel from '../../../components/BalancesTablePanel'
import TradingStatePanel from '../../../components/TradingStatePanel'

import TGridLayout from './TGridLayout'
import ChartPanelWithDropdown from '../ChartPanelWithDropdown'
import ChartPanelReactStockcharts from '../ChartPanelReactStockcharts'

const COMPONENT_TYPES = {
  CHART: 'CHART',
  CHARTWITHDROPDOWN: 'CHARTWITHDROPDOWN',
  CHARTREACTSTOCKCHARTS: 'CHARTREACTSTOCKCHARTS',
  ORDER_BOOK: 'ORDER_BOOK',
  ORDER_FORM: 'ORDER_FORM',
  TRADES_TABLE: 'TRADES_TABLE',
  POSITIONS_TABLE: 'POSITIONS_TABLE',
  BALANCES_TABLE: 'BALANCES_TABLE',
  ALGO_ORDERS_TABLE: 'ALGO_ORDERS_TABLE',
  ATOMIC_ORDERS_TABLE: 'ATOMIC_ORDERS_TABLE',
  ORDER_HISTORY_TABLE: 'ORDER_HISTORY_TABLE',
  TRADING_STATE_PANEL: 'TRADING_STATE_PANEL',
}

const COMPONENT_LABELS = {
  [COMPONENT_TYPES.CHART]: 'Chart',
  [COMPONENT_TYPES.CHARTWITHDROPDOWN]: 'Chart With Dropdown',
  [COMPONENT_TYPES.CHARTREACTSTOCKCHARTS]: 'Chart React Stockcharts',
  [COMPONENT_TYPES.ORDER_BOOK]: 'Order Book',
  [COMPONENT_TYPES.ORDER_FORM]: 'Order Form',
  [COMPONENT_TYPES.TRADES_TABLE]: 'Trades Table',
  [COMPONENT_TYPES.BALANCES_TABLE]: 'Balances Table',
  [COMPONENT_TYPES.POSITIONS_TABLE]: 'Positions Table',
  [COMPONENT_TYPES.ALGO_ORDERS_TABLE]: 'Algo Orders Table',
  [COMPONENT_TYPES.ATOMIC_ORDERS_TABLE]: 'Atomic Orders Table',
  [COMPONENT_TYPES.ORDER_HISTORY_TABLE]: 'Order History Table',
  [COMPONENT_TYPES.TRADING_STATE_PANEL]: 'Trading State Panel',
}

const COMPONENT_DIMENSIONS = {
  [COMPONENT_TYPES.CHART]: { w: 33, h: 10 },
  [COMPONENT_TYPES.CHARTWITHDROPDOWN]: { w: 33, h: 10 },
  [COMPONENT_TYPES.CHARTREACTSTOCKCHARTS]: { w: 33, h: 10 },
  [COMPONENT_TYPES.ORDER_BOOK]: { w: 24, h: 20 },
  [COMPONENT_TYPES.ORDER_FORM]: { w: 24, h: 10 },
  [COMPONENT_TYPES.TRADES_TABLE]: { w: 24, h: 10 },
  [COMPONENT_TYPES.BALANCES_TABLE]: { w: 20, h: 6 },
  [COMPONENT_TYPES.POSITIONS_TABLE]: { w: 40, h: 6 },
  [COMPONENT_TYPES.ALGO_ORDERS_TABLE]: { w: 40, h: 6 },
  [COMPONENT_TYPES.ATOMIC_ORDERS_TABLE]: { w: 40, h: 6 },
  [COMPONENT_TYPES.ORDER_HISTORY_TABLE]: { w: 40, h: 6 },
  [COMPONENT_TYPES.TRADING_STATE_PANEL]: { w: 40, h: 6 },
}

const componentForType = (c) => {
  switch (c) {
    case COMPONENT_TYPES.CHART:
      return ChartPanel

    case COMPONENT_TYPES.CHARTWITHDROPDOWN:
      return ChartPanelWithDropdown

    case COMPONENT_TYPES.CHARTREACTSTOCKCHARTS:
      return ChartPanelReactStockcharts

    case COMPONENT_TYPES.ORDER_BOOK:
      return OrderBookPanel

    case COMPONENT_TYPES.ORDER_FORM:
      return OrderForm

    case COMPONENT_TYPES.TRADES_TABLE:
      return TradesTablePanel

    case COMPONENT_TYPES.ATOMIC_ORDERS_TABLE:
      return AtomicOrdersTablePanel

    case COMPONENT_TYPES.ALGO_ORDERS_TABLE:
      return AlgoOrdersTablePanel

    case COMPONENT_TYPES.ORDER_HISTORY_TABLE:
      return OrderHistoryTable

    case COMPONENT_TYPES.POSITIONS_TABLE:
      return PositionsTablePanel

    case COMPONENT_TYPES.BALANCES_TABLE:
      return BalancesTablePanel

    case COMPONENT_TYPES.TRADING_STATE_PANEL:
      return TradingStatePanel

    default:
      return null
  }
}

const renderLayoutElement = (layoutID, def = {}, componentProps = {}, onRemoveComponent) => {
  const {
    i, c, h, props = {},
  } = def
  const gridHeight = (TGridLayout.rowHeight + 7) * h - 50 // idk??? TITI CHANGE
  const C = componentForType(c)
  const cProps = {
    ...props,
    ...componentProps.sharedProps,
    xExtentsCommon: componentProps.xExtentsCommon,
    layoutID,
    height: gridHeight,
    layoutI: i,
    onRemove: () => onRemoveComponent(i),
  }

  if (!C) {
    return (
      <p>
        Unknown component type:
        {c}
      </p>
    )
  }

  if (C === ChartPanel && componentProps.chart) {
    Object.assign(cProps, componentProps.chart)
  } else if (C === OrderBookPanel && componentProps.book) {
    Object.assign(cProps, componentProps.book)
  } else if (C === TradesTablePanel && componentProps.trades) {
    Object.assign(cProps, componentProps.trades)
  } else if (C === OrderForm && componentProps.orderForm) {
    Object.assign(cProps, componentProps.orderForm)
  } else if (C === AtomicOrdersTablePanel && componentProps.orders) {
    Object.assign(cProps, componentProps.orders)
  } else if (C === ChartPanelWithDropdown && componentProps.chart) {
    Object.assign(cProps, componentProps.chart)
  } else if (C === ChartPanelReactStockcharts && componentProps.chart) {
    Object.assign(cProps, componentProps.chart)
  }
  return <C {...cProps} />
}

export {
  COMPONENT_TYPES,
  COMPONENT_DIMENSIONS,
  COMPONENT_LABELS,
  renderLayoutElement,
  componentForType,
}