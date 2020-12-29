import React from 'react'
import _isEmpty from 'lodash/isEmpty'

import Button from '../../ui/Button'
import Input from '../../ui/Input'
import { propTypes, defaultProps } from './AuthenticationUnlockForm.props'

const ENTER_KEY_CODE = 13

export default class AuthenticationInit extends React.Component {
  static propTypes = propTypes
  static defaultProps = defaultProps

  state = {
    password: 'JwQcSR2VMN86fa73mAODu7TVtFkliPMsHmrLxxkLEwE',
  }

  constructor(props) {
    super(props)

    this.onPasswordChange = this.onPasswordChange.bind(this)
    this.onUnlock = this.onUnlock.bind(this)
    this.onReset = this.onReset.bind(this)
    this.onEnterPress = this.onEnterPress.bind(this)
  }

  componentDidMount() {
    this.onUnlock();
  }

  onPasswordChange(password) {
    this.setState(() => ({ password }))
  }

  onUnlock() {
    const { password } = this.state
    const { onUnlock } = this.props
    onUnlock(password)
  }

  onReset() {
    const { onReset } = this.props
    onReset()
  }

  onEnterPress({ keyCode }) {
    if (keyCode === ENTER_KEY_CODE) {
      const { password } = this.state
      this.onUnlock(password)
    }
  }

  render() {
    const { password } = this.state
    const submitReady = !_isEmpty(password)

    return (
      <div className='hfui-authenticationpage__content' onKeyDown={this.onEnterPress}>
        <h2>Honey Framework UI</h2>
        <p>Enter your password to unlock.</p>

        <form className='hfui-authenticationpage__inner-form'>
          <Input
            type='text'
            name='username'
            autocomplete='username'
            style={{ display: 'none' }}
          />

          <Input
            type='password'
            autocomplete='current-password'
            placeholder='Password'
            value={password}
            onChange={this.onPasswordChange}
          />

          <Button
            onClick={this.onUnlock}
            disabled={!submitReady}
            label='Unlock'
            green
          />
        </form>

        <div className='hfui-authenticationpage__clear'>
          <p>Alternatively, clear your credentials &amp; and stored data to set a new password.</p>

          <Button
            onClick={this.onReset}
            label='Clear Data &amp; Reset'
            red
          />
        </div>
      </div>
    )
  }
}
