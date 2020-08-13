import axios, {AxiosRequestConfig, AxiosPromise} from 'axios'
import SwaggerParser from '@apidevtools/swagger-parser'
import {Config, PostmanSchemaType} from './config'
import * as core from '@actions/core'
// import * as fs from 'fs'

const postmanApiBase = 'https://api.getpostman.com'

interface GetApiResponse {
  name: string
}

// TODO: handle other types of schemas besides openapi2/3
export async function updatePostmanApi(config: Config): Promise<void> {
  core.info(`validating schema document at ${config.specFilePath}`)
  const api = await SwaggerParser.validate(config.specFilePath)
  // TODO: remove
  core.debug(`validated spec: ${JSON.stringify(api)}`)

  /*
 TODO:
    - retrieve api from id
    - check for pm version using api version and create if version doesn't exist
        - create schema under new version
        - create documentation and collection from schema
        - handle errors...do we need to roll back or can we re-run?
 */
}

async function makeRequest<T>(req: AxiosRequestConfig): Promise<T> {
  const res = await axios.request<T>(req)
  // TODO: return response error
  if (res.status !== 200) {
    throw new Error('received non 200 response')
  }

  return res.data
}

// const main = async () => {
//   try {

//     // TODO: will need to validate the spec...creating the schema via Postman does not seem to validate it. Postman
//     // will accept an invalid spec and then throw 'invalid spec' errors when attempting to generate artifacts from it (collections, documentation, etc)
//     console.log('reading spec file')
//     const rawSpec = fs.readFileSync('./swagger.json', 'utf-8')
//     const specJSON = JSON.parse(rawSpec)
//     const specOasVersion = specJSON.openapi
//     const specApiVersion = specJSON.info.version

//     console.log(`spec oas version is ${specOasVersion}`)
//     console.log(`spec api version is: ${specApiVersion}`)

//     console.log(`retrieving Postman API ${apiId}`)
//     const getAPIRes = await axios({
//       method: 'get',
//       url: `https://api.getpostman.com/apis/${apiId}`,
//       headers: {
//         'x-api-key': apiKey,
//         'Content-Type': 'application/json'
//       }
//     })

//     const apiName = getAPIRes.data.api.name
//     console.log(`retrieving versions for Postman API ${apiName}`)

//     const getVersionsRes = await axios({
//       method: 'get',
//       url: `https://api.getpostman.com/apis/${apiId}/versions`,
//       headers: {
//         'x-api-key': apiKey,
//         'Content-Type': 'application/json'
//       }
//     })

//     console.log(
//       `searching Postman API versions for a version named ${specApiVersion}`
//     )
//     /*
//             Check if there is already a version in Postman for this API version, based on the spec file

//             It is assumed that changes to a schema always correspond with a version update. Otherwise, consumers
//             of the API would not be notified of the change.

//             TODO: to make this smarter over time with existing APIs we'll need to:
//                 - check if there is a schema associated with the version.
//                 - check if the spec is specifying a new oas version within the same api version. For example, under 1.0.0 there could be
//                   an existing schema under OAS 2.0 and the new spec is updagraded to OAS 3.0.
//                 - check if there are relations associated to this version such as documentation, collections, etc
//                 - to support non schema related changes under the same version, we can preform an object diff on parts
//                     of the spec that are not the schema (info, description, etc) and update those parts accordingly.
//         */
//     const matchedVersions = getVersionsRes.data.versions.filter(v => {
//       return v.name === specApiVersion
//     })

//     if (matchedVersions.length >= 1) {
//       console.log(
//         `existing Postman API version found for ${specApiVersion}. Exiting`
//       )
//       return
//     }

//     console.log('creating new Postman version')

//     const createVersionBody = {
//       version: {
//         name: specApiVersion
//       }
//     }

//     const createVersionReq = {
//       method: 'post',
//       url: `https://api.getpostman.com/apis/${apiId}/versions`,
//       headers: {
//         'x-api-key': apiKey,
//         'Content-Type': 'application/json'
//       },
//       data: JSON.stringify(createVersionBody)
//     }

//     createVersionRes = await axios(createVersionReq)
//     const newVersionId = createVersionRes.data.version.id

//     console.log(
//       `Successfully created new Postman API version ${newVersionId}. Adding schema to version`
//     )
//     // TODO: Use the spec file to determin which openapi type to use in addition to the language (YAML or JSON)
//     const createSchemaBody = {
//       schema: {
//         language: 'json',
//         type: 'openapi2',
//         schema: rawSpec
//       }
//     }

//     const createSchemaReq = {
//       method: 'post',
//       url: `https://api.getpostman.com/apis/${apiId}/versions/${newVersionId}/schemas`,
//       headers: {
//         'x-api-key': apiKey,
//         'Content-Type': 'application/json'
//       },
//       data: JSON.stringify(createSchemaBody)
//     }

//     const createSchemaRes = await axios(createSchemaReq)
//     const newSchemaId = createSchemaRes.data.schema.id

//     console.log(
//       `Successfully added schema ${newSchemaId}. Creating new collection and documentation under workspace ${workspaceId}`
//     )
//     // TODO: use input params to determine if a collection should be created as well as what other relations
//     const createCollectionBody = {
//       name: `${apiName}-${specApiVersion}`,
//       relations: [
//         {
//           type: 'documentation'
//         }
//       ]
//     }

//     const createCollectionReq = {
//       method: 'post',
//       url: `https://api.getpostman.com/apis/${apiId}/versions/${newVersionId}/schemas/${newSchemaId}/collections?workspace=${workspaceId}`,
//       headers: {
//         'x-api-key': apiKey,
//         'Content-Type': 'application/json'
//       },
//       data: JSON.stringify(createCollectionBody)
//     }

//     const createCollectionRes = await axios(createCollectionReq)
//     console.log(
//       `Successfully created collection ${createCollectionRes.data.collection.id}`
//     )

//     console.log('all done!')
//   } catch (e) {
//     console.log(e)
//   }
// }

// main().catch(e => {
//   console.error(`unhandled error in main(): ${e}`)
// })
