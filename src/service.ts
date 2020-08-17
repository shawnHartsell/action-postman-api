import {PostmanClient} from './client'
import {Config, PostmanSchemaType} from './config'
import SwaggerParser from '@apidevtools/swagger-parser'
import * as core from '@actions/core'
import * as path from 'path'

export class PostmanService {
  private readonly postmanClient: PostmanClient

  constructor(client: PostmanClient) {
    this.postmanClient = client
  }

  // TODO:
  //    - this needs to be idempotent
  //    - researching upserting an api (i.e. first time run)
  async upgradeApi(config: Config): Promise<void> {
    // Validate other kinds of specs like GraphQL and RAML
    if (
      !(
        config.specFileType === PostmanSchemaType.OpenApi2 ||
        config.specFileType === PostmanSchemaType.OpenApi3
      )
    ) {
      throw new Error(
        `only API spces of ${PostmanSchemaType.OpenApi2} and ${PostmanSchemaType.OpenApi3}`
      )
    }

    core.info(`validating schema document at ${config.specFilePath}`)
    // TODO: if info and info.version are not required do a validation check
    const specDoc = await SwaggerParser.validate(config.specFilePath)

    core.info(`retrieving Postman API ${config.postmanApiId}`)
    const api = await this.postmanClient.getApi(config.postmanApiId)

    core.info(`seraching for api version ${specDoc.info.version}`)
    const apiVersions = await this.postmanClient.getApiVersions(api.id)

    const matchedVersions = apiVersions.filter(
      v => v.name === specDoc.info.version
    )

    if (matchedVersions.length >= 1) {
      core.info(
        `found an existing api version for ${specDoc.info.version}. Exiting`
      )
      return
    }

    core.info('no existing version found. Creating new api version')
    const apiVersion = await this.postmanClient.createApiVersion(
      api.id,
      specDoc.info.version
    )
    core.info(`successfully created api version ${apiVersion.name}`)

    core.info(`creating version schema`)
    // TODO: this won't work for yaml files with a .yml
    // valid values here are 'json' and 'yaml'
    // TODO: add better validation
    const schemaLanguage = path.extname(config.specFilePath).slice(1)
    const schema = await this.postmanClient.createApiSchema(
      api.id,
      apiVersion.id,
      config.specFileType,
      schemaLanguage,
      JSON.stringify(specDoc)
    )
    core.info(`successfully created version schema ${schema.id}`)

    core.info('creating collection and documentation from schema')
    const collectionName = `${api.name}-v${apiVersion.name}`

    await this.postmanClient.createCollectionWithDocumentation(
      api.id,
      apiVersion.id,
      schema.id,
      config.postmanWorkspaceId,
      collectionName
    )
    core.info(`successfully create collection ${collectionName}`)
  }
}
