import * as fs from 'fs'
import {resolve} from 'path'
import * as env from 'dotenv'
import * as core from '@actions/core'

const envFilePath = resolve(__dirname, '..', '.env')

// TODO: eventually support other schemas that Postman accespts like openapi3, raml, and graphql
export enum PostmanSchemaType {
  OpenApi2 = 'openapi2'
}

export interface Config {
  postmanApiKey: string
  postmanApiId: string
  postmanWorkspaceId: string
  specFilePath: string
  specFileType: PostmanSchemaType
}

export function getConfig(): Config {
  /*
    if there is a local .env present then set process env vars
    to the format that GH actions expects

    examples: 
        MY_VAR becomes INPUT_MY_VAR and accessed via 'my_var'
        MYVAR becomes INPUT_MYVAR and is acessed via 'myVar'
    
    See: https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions
  */
  core.info(`Checking for local .env in ${envFilePath}`)
  if (fs.readFileSync(envFilePath)) {
    core.info('found .env file. loading env vars')
    const envConfig = env.parse(fs.readFileSync(envFilePath))

    for (const k in envConfig) {
      process.env[`INPUT_${k}`] = envConfig[k]
    }
  }

  const c: Config = {
    postmanApiKey: core.getInput('postman_api_key', {required: true}),
    postmanApiId: core.getInput('postman_api_id', {required: true}),
    postmanWorkspaceId: core.getInput('postman_workspace_id', {required: true}),
    specFilePath: core.getInput('schema_file', {required: true}),
    specFileType: PostmanSchemaType.OpenApi2
  }

  c.specFilePath = resolve(__dirname, c.specFilePath)
  if (!fs.existsSync(c.specFilePath)) {
    throw new Error(`could not find spec file at ${c.specFilePath}`)
  }

  const specFileType = core.getInput('schema_file_type', {
    required: true
  }) as PostmanSchemaType

  if (!specFileType) {
    throw new Error('only the openaapi2 postman schema type is supported')
  }

  return c
}
