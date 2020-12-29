import React from 'react'
import ClassNames from 'classnames'
import Select from '../../../ui/Select'

import { propTypes, defaultProps } from './TMarketSelect.props'
import './style.scss'

export default class TMarketSelect extends React.PureComponent {
  static propTypes = propTypes
  static defaultProps = defaultProps

  render() {
    const {
      selectkey, value, onChange, markets, className, renderLabel, ...otherProps
    } = this.props

    return (
      <Select
        label={renderLabel && 'Market'}
        className={ClassNames('hfui-marketselect', className)}
        onChange={(selection) => {
          onChange(markets.find(m => m.uiID === selection.value), selectkey)
        }}
        value={{
          label: value.uiID || `${value.base}/${value.quote}`,
          value: value.uiID,
        }}
        options={markets.map(m => ({
          label: m.uiID || `${m.base}/${m.quote}`,
          value: m.uiID,
        }))}
        {...otherProps}
      />
    )
  }
}
