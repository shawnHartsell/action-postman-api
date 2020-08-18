# (In Progress): THIS IS NOT READY FOR PRODUCTION USE

GitHub action to update a Postman API by:
 - adding a new version to the API
 - creating a api version schema based on a spec file
 - generating a collection and documentation based on the schema

## Running locally
- run `npm install`
- add a `.env` file using `.env.example` as a reference
- run `npm run run-local` to bundle the code into `/dist` and run the bundled code

## Limitations
- An API for your project must have already been created
- The names of your version in Postman must be a valid semver
- Only OAS 2 and 3 specs are supported
- YAML spec files have not been fully tested

## How it works

In a nutshell, the script works in the following way:
- The provided spec file is read and validated
- Using the version in the spec file (assuming semver), the API in Postman is checked if a version with that same name exists
- If a version already exists, the process aborts. Otherwise a version is created, a schema is created under that version, and a collection and documentation are generated in the provided Postman workspace

## TODO:
- write tests :D
- support all supported Postman specs (i.e. find validators for each one)
- fully support YAML files (i.e. mapping .yaml/.yml to Postman's `yaml` spec type)
- try and upsert the Postman API
- test out exact permissions for generating collections. Sometimes the collection is added to a local workpace instead of the one that was specified
- reseach creating other Postman relations like tests and monitors
- research supporting Postman environments and variables