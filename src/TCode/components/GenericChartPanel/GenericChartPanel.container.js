import { connect } from 'react-redux'
import { getMarkets } from '../../../redux/selectors/meta'
import {
  getActiveMarket, getActiveExchange,
} from '../../../redux/selectors/ui'

import GenericChartPanel from './GenericChartPanel'

const mapStateToProps = (state = {}) => {
  const activeExchange = getActiveExchange(state)
  const activeMarket = getActiveMarket(state)
  const allMarkets = getMarkets(state)

  return {
    activeExchange,
    activeMarket,
    allMarkets,
  }
}

const mapDispatchToProps = dispatch => ({ }) //eslint-disable-line

export default connect(mapStateToProps, mapDispatchToProps)(GenericChartPanel)
