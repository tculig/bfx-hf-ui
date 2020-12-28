import React from 'react'

import Modal from '../../ui/Modal'

import './style.scss'

export default class ComingSoonModal extends React.PureComponent {
  render() {
    return (
      <Modal className='hfui-comingsoonmodal__wrapper'>
        <p>This feature is still in development</p>
      </Modal>
    )
  }
}
