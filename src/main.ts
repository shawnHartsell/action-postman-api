import * as core from '@actions/core'
import {getConfig} from './config'
import {updatePostmanApi} from './api'

async function run(): Promise<void> {
  try {
    const config = getConfig()
    core.info(`using config: ${JSON.stringify(config)}`)

    await updatePostmanApi(config)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
