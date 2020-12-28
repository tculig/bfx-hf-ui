import { connect } from 'react-redux'
import {
  getLayouts, getActiveMarket, getActiveExchange,
} from '../../redux/selectors/ui'
import { MARKET_PAGE } from '../../redux/constants/ui'
import UIActions from '../../redux/actions/ui'

import TMarketData from './TMarketData'

const mapStateToProps = (state = {}) => ({
  layouts: getLayouts(state),
  activeMarket: getActiveMarket(state),
  exID: getActiveExchange(state),
  firstLogin: state.ui.firstLogin,
  isGuideActive: state.ui[`${MARKET_PAGE}_GUIDE_ACTIVE`],

})

const mapDispatchToProps = dispatch => ({
  saveLayout: (layout, id) => {
    dispatch(UIActions.saveLayout(layout, id))
  },

  createLayout: (id) => {
    dispatch(UIActions.createLayout(id))
  },

  deleteLayout: (id) => {
    dispatch(UIActions.deleteLayout(id))
  },

  finishGuide() {
    dispatch(UIActions.finishGuide(MARKET_PAGE))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(TMarketData)
