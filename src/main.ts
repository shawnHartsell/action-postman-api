import * as core from '@actions/core'
import {getConfig} from './config'
import {PostmanClient} from './client'
import {PostmanService} from './service'

async function run(): Promise<void> {
  try {
    const config = getConfig()
    core.info(`using config: ${JSON.stringify(config)}`)

    const client = new PostmanClient(config.postmanApiKey)
    const service = new PostmanService(client)

    core.info('starting Postman api updgarde')
    await service.upgradeApi(config)
  } catch (error) {
    const e = new Error(`could not upgrade api: ${error}`)
    core.setFailed(e)
  }
}

run()
