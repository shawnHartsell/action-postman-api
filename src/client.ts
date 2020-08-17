import axios, {AxiosInstance, AxiosRequestConfig} from 'axios'

const postmanApiBaseURL = 'https://api.getpostman.com'

interface PostmanApiResponse {
  api: PostmanApi
}

interface PostmanApiVersionsResponse {
  versions: PostmanApiVersion[]
}

interface CreatePostmanApiVersionResponse {
  version: PostmanApiVersion
}

interface PostmanApi {
  id: string
  name: string
  description: string
}

interface PostmanApiVersion {
  id: string
  name: string
  summary: string
  createdAt: string
  updatedAt: string
}

interface CreatePostmanVersionSchemaResponse {
  schema: PostmanVersionSchema
}

interface PostmanVersionSchema {
  id: string
  language: string
  apiVersion: string
  type: string
  createdAt: string
  updatedAt: string
}

interface CreatePostmanCollectionResponse {
  collection: PostmanCollection
}

interface PostmanCollection {
  id: string
  relations: PostmanRelation[]
}

interface PostmanRelation {
  type: string
  id: string
}

export class PostmanClient {
  private readonly client: AxiosInstance

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: postmanApiBaseURL
    })

    this.client.interceptors.request.use(this._setHeaders(apiKey))
    this.client.interceptors.response.use()
  }

  async getApi(id: string): Promise<PostmanApi> {
    const p = `apis/${id}`

    try {
      const api = await this.client.get<PostmanApiResponse>(p)
      return api.data.api
    } catch (error) {
      throw new Error(`non-200 response calling ${p}: ${error.message}`)
    }
  }

  async getApiVersions(apiId: string): Promise<PostmanApiVersion[]> {
    const p = `apis/${apiId}/versions`
    try {
      const api = await this.client.get<PostmanApiVersionsResponse>(p)
      return api.data.versions
    } catch (error) {
      throw new Error(`non-200 response calling ${p}: ${error.message}`)
    }
  }

  async createApiVersion(
    apiId: string,
    versionNumber: string
  ): Promise<PostmanApiVersion> {
    const p = `apis/${apiId}/versions`

    try {
      const body = {
        version: {
          name: versionNumber
        }
      }
      const res = await this.client.post<CreatePostmanApiVersionResponse>(
        p,
        body
      )
      return res.data.version
    } catch (error) {
      throw new Error(`non-200 response calling ${p}: ${error.message}`)
    }
  }

  async createApiSchema(
    apiId: string,
    versionId: string,
    schemaType: string,
    schemaLanguage: string,
    schema: string
  ): Promise<PostmanVersionSchema> {
    const p = `/apis/${apiId}/versions/${versionId}/schemas`
    try {
      const body = {
        schema: {
          language: schemaLanguage,
          type: schemaType,
          schema
        }
      }

      const res = await this.client.post<CreatePostmanVersionSchemaResponse>(
        p,
        body
      )
      return res.data.schema
    } catch (error) {
      throw new Error(`non-200 response calling ${p}: ${error.message}`)
    }
  }

  async createCollectionWithDocumentation(
    apiId: string,
    versionId: string,
    schemaId: string,
    workspaceId: string,
    collectionName: string
  ): Promise<PostmanCollection> {
    const p = `/apis/${apiId}/versions/${versionId}/schemas/${schemaId}/collections?worksapce=${workspaceId}`
    try {
      const body = {
        name: collectionName,
        relations: [
          {
            type: 'documentation'
          }
        ]
      }

      const res = await this.client.post<CreatePostmanCollectionResponse>(
        p,
        body
      )
      return res.data.collection
    } catch (error) {
      throw new Error(`non-200 response calling ${p}: ${error.message}`)
    }
  }

  // factory function to create the request interceptor to add auth headers
  // this is needed to get around 'unbounded this' issues
  // see: https://github.com/typescript-eslint/typescript-eslint/blob/v3.7.0/packages/eslint-plugin/docs/rules/unbound-method.md
  private _setHeaders(
    apiKey: string
  ): (a: AxiosRequestConfig) => AxiosRequestConfig {
    return (req: AxiosRequestConfig): AxiosRequestConfig => {
      req.headers['x-api-key'] = apiKey
      req.headers['Content-Type'] = 'application/json'
      return req
    }
  }
}
