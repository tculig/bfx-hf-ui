import React from 'react'
import './style.scss'

export default class Spinner extends React.PureComponent {
  render() {
    return (
      <div className='hfui-spinner__wrapper'>
        <i className='fa fa-circle-notch' />
      </div>
    )
  }
}
