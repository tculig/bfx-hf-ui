import React from 'react'
import _isEmpty from 'lodash/isEmpty'

import Modal from '../../../ui/Modal'
import Button from '../../../ui/Button'
import Dropdown from '../../../ui/Dropdown'
import {
  COMPONENT_TYPES, COMPONENT_LABELS,
} from '../TGridLayout/TGridLayout.helpers'

import { propTypes, defaultProps } from './TAddLayoutComponentModal.props'
import './style.scss'

export default class TAddLayoutComponentModal extends React.Component {
  static propTypes = propTypes
  static defaultProps = defaultProps

  state = {
    componentType: COMPONENT_LABELS.CHART,
    error: '',
  }

  constructor(props) {
    super(props)

    this.onComponentTypeChange = this.onComponentTypeChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onComponentTypeChange(componentType) {
    this.setState(() => ({ componentType }))
  }

  onSubmit() {
    const { componentType } = this.state
    const { onSubmit, onClose } = this.props

    if (_isEmpty(componentType) || !COMPONENT_LABELS[componentType]) {
      this.setState(() => ({ error: 'Invalid Component' }))
      return
    }

    onSubmit(componentType)
    onClose()
  }

  render() {
    const { onClose } = this.props
    const { componentType, error } = this.state

    return (
      <Modal
        onClose={onClose}
        className='hfui-addlayoutcomponentmodal__wrapper'
        label='Add Component'
        actions={(
          <Button
            green
            onClick={this.onSubmit}
            label={[
              <i key='icon' className='icon-plus' />,
              <p key='text'>Add Component</p>,
            ]}
          />
        )}
      >
        <Dropdown
          value={componentType}
          onChange={this.onComponentTypeChange}
          options={Object.values(COMPONENT_TYPES).map(type => ({
            label: COMPONENT_LABELS[type],
            value: type,
          }))}
        />

        {!_isEmpty(error) && (
          <p className='error'>{error}</p>
        )}
      </Modal>
    )
  }
}
