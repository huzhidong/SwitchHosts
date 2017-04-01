/**
 * @author oldj
 * @blog http://oldj.net
 */

'use strict'

import React from 'react'
import MyFrame from './frame'
import classnames from 'classnames'
import Agent from '../Agent'
import { version as current_version } from '../../app/version'
import formatVersion from '../../app/libs/formatVersion'
import './preferences.less'

const AUTO_LAUNCH = 'auto_launch'

export default class PreferencesPrompt extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      show: false,
      lang_key: '',
      after_cmd: '',
      choice_mode: '',
      auto_launch: false,
      hide_at_launch: false,
      update_found: false // 发现新版本
    }

    Agent.pact('getPref')
      .then(pref => {
        this.setState(pref)
      })
  }

  componentDidMount () {
    Agent.on('show_preferences', () => {
      this.setState({
        show: true
      })
    })

    Agent.on('update_found', (v) => {
      console.log(v)
      this.setState({
        update_found: true
      })
    })
  }

  onOK () {
    this.setState({
      show: false
    }, () => {
      setTimeout(() => {
        Agent.pact('relaunch')
      }, 200)
    })
  }

  onCancel () {
    this.setState({
      show: false
    })
  }

  getLanguageOptions () {
    let {lang} = this.props
    return lang.lang_list.map(({key, name}, idx) => {
      return (
        <option value={key} key={idx}>{name}</option>
      )
    })
  }

  updateLangKey (v) {
    Agent.pact('setPref', 'user_language', v)
    this.setState({lang_key: v})
  }

  updateChoiceMode (v) {
    Agent.pact('setPref', 'choice_mode', v)
    this.setState({
      choice_mode: v
    })
  }

  updateAfterCmd (v) {
    Agent.pact('setPref', 'after_cmd', v)
    this.setState({
      after_cmd: v
    })
  }

  updateAutoLaunch (v) {
    Agent.pact('setPref', AUTO_LAUNCH, v)
    this.setState({
      auto_launch: v
    })

    // todo set auto launch
  }

  updateMinimizeAtLaunch (v) {
    Agent.pact('setPref', 'hide_at_launch', v)
    this.setState({
      hide_at_launch: v
    })
  }

  prefLanguage () {
    let {lang} = this.props

    return (
      <div className="ln">
        <div className="title">{lang.language}</div>
        <div className="cnt">
          <select
            value={this.state.lang_key || ''}
            onChange={(e) => this.updateLangKey(e.target.value)}
          >
            {this.getLanguageOptions()}
          </select>

          <div
            className="inform">{lang.should_restart_after_change_language}</div>
        </div>
      </div>
    )
  }

  prefChoiceMode () {
    let {lang} = this.props

    return (
      <div className="ln">
        <div className="title">{lang.pref_choice_mode}</div>
        <div className="cnt">
          <input type="radio" id="pref-choice-mode-single" name="choice_mode"
                 value="single"
                 defaultChecked={this.state.choice_mode === 'single'}
                 onChange={(e) => this.updateChoiceMode(e.target.value)}
          />
          <label
            htmlFor="pref-choice-mode-single">{lang.pref_choice_mode_single}</label>
          <input type="radio" id="pref-choice-mode-multiple" name="choice_mode"
                 value="multiple"
                 defaultChecked={this.state.choice_mode === 'multiple'}
                 onChange={(e) => this.updateChoiceMode(e.target.value)}
          />
          <label
            htmlFor="pref-choice-mode-multiple">{lang.pref_choice_mode_multiple}</label>
        </div>
      </div>
    )
  }

  prefAfterCmd () {
    let {lang} = this.props

    return (
      <div className="ln">
        <div className="title">{lang.pref_after_cmd}</div>
        <div className="cnt">
          <div className="inform">{lang.pref_after_cmd_info}</div>
          <textarea
            name=""
            defaultValue={this.state.after_cmd}
            placeholder={lang.pref_after_cmd_placeholder}
            onChange={(e) => this.updateAfterCmd(e.target.value)}
          />
        </div>
      </div>
    )
  }

  prefAutoLaunch () {
    let {lang} = this.props

    return (
      <div className="ln">
        <div className="title">{lang.auto_launch}</div>
        <div className="cnt">
          <input type="checkbox" name=""
                 defaultChecked={this.state.auto_launch}
                 onChange={(e) => this.updateAutoLaunch(e.target.checked)}
          />
        </div>
      </div>
    )
  }

  prefMinimizeAtLaunch () {
    let {lang} = this.props

    return (
      <div className="ln">
        <div className="title">{lang.hide_at_launch}</div>
        <div className="cnt">
          <input type="checkbox" name=""
                 defaultChecked={this.state.hide_at_launch}
                 onChange={(e) => this.updateMinimizeAtLaunch(e.target.checked)}
          />
        </div>
      </div>
    )
  }

  static openDownloadPage () {
    Agent.pact('openUrl', require('../../app/configs').url_download)
  }

  body () {
    return (
      <div ref="body">
        {/*<div className="title">{SH_Agent.lang.host_title}</div>*/}
        {/*<div className="cnt">*/}
        {/*</div>*/}
        <div
          className={classnames('current-version', {'update-found': this.state.update_found})}>
          <a href="#"
             onClick={PreferencesPrompt.openDownloadPage}>{formatVersion(current_version)}</a>
        </div>
        {this.prefLanguage()}
        {this.prefChoiceMode()}
        {this.prefAfterCmd()}
        {/*{this.prefAutoLaunch()}*/}
        {this.prefMinimizeAtLaunch()}
      </div>
    )
  }

  render () {
    let {lang} = this.props

    return (
      <MyFrame
        show={this.state.show}
        head={lang.preferences}
        body={this.body()}
        onOK={() => this.onOK()}
        onCancel={() => this.onCancel()}
        cancel_title={lang.set_and_back}
        ok_title={lang.set_and_relaunch_app}
      />
    )
  }
}
