import React from 'react'
import Joyride, { STATUS } from 'react-joyride'
import TGridLayoutPage from '../../components/TGridLayoutPage'
import { propTypes } from './TMarketData.props'
import './style.scss'

export default class TMarketData extends React.PureComponent {
  static propTypes = propTypes

  state = {
    steps: [
      {
        locale: { last: 'Finish' },
        target: '.hfui-button.green',
        content: 'To customize your layout, you can add components to it',
      },
    ],
  }
  constructor(props) {
    super(props)
    this.onGuideFinish = this.onGuideFinish.bind(this)
  }
  onGuideFinish(data) {
    const { finishGuide } = this.props
    const { status } = data
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED]
    const CLOSE = 'close'
    if (finishedStatuses.includes(status) || data.action === CLOSE) {
      finishGuide()
    }
  }

  render() {
    const commonComponentProps = {
    }
    const { steps } = this.state
    const { isGuideActive, firstLogin } = this.props
    return (
      <div className='hfui-marketdatapage__wrapper'>
        {firstLogin
         && (
         <Joyride
           callback={this.onGuideFinish}
           steps={steps}
           run={isGuideActive}
           continuous
           showProgress
           showSkipButton
           styles={{
             options: {
               zIndex: 10000,
             },
           }}
         />
         )}
        <TGridLayoutPage
          defaultLayoutID='Analysis'
          tradesProps={commonComponentProps}
          bookProps={commonComponentProps}
          chartProps={commonComponentProps}
        />
      </div>
    )
  }
}
