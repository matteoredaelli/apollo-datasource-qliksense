## Qliksense datasource for GraphQL Apollo server

[apollo-datasource-qliksense](https://github.com/matteoredaelli/apollo-datasource-qliksense) is a Qliksense datasource for the GraphQL [Apollo server](https://www.apollographql.com/). "Apollo is the industry-standard GraphQL implementation, providing the data graph layer that connects modern apps to the cloud."

### Installation

npm install apollo-datasource-qliksense

### Usage

Below a very basic sample

File index.js file:

```javascript
const resolvers = require('./resolvers');

const { ApolloServer, gql } = require('apollo-server');
const { makeExecutableSchema } = require('graphql-tools');
const { QliksenseDataSource } = require('apollo-datasource-qliksense');

const qliksense = new QliksenseDataSource("https://myqlikserver.redaelli.org:4242",
				process.env.QLIK_CERTIFICATE,
				process.env.QLIK_CERTIFICATE_KEY);

const { readFileSync } = require('fs')

const typeDefs = readFileSync('./schema.graphql).toString('utf-8')

const graphqlSchemaObj = { //makeExecutableSchema({
	typeDefs: typeDefs,
	resolvers: resolvers,
	tracing: true,
	dataSources: () => ({ qliksense: qliksense })
};

const server = new ApolloServer(graphqlSchemaObj);

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

File schema.graphql

```graphql
type Json {
	 json: String
	 }

type Query {
  qliksense_entity(
	entity: String!,
	count: Boolean,
	filter:String): Json
}
```

File resolvers.js

```javascript
module.exports = {
  Query: {
	  qliksense_entity: async (_source, { entity, count, filter }, { dataSources }) => {
	  resp = await dataSources.qliksense.getEntity(entity, count, filter);
	  return {json:  JSON.stringify(resp) }
	  },
  },
}
```

Sample graphql queries

```graphql
{
  qliksense_entity(
	entity: "custompropertydefinition"
	filter: "Name eq 'GroupAccess'"
  ) {
	json
  }
}
```

```graphql
{
  qliksense_entity(
	entity: "user"
	count: true
  ) {
	json
  }
}
```

### Graphql schema for Qliksense entities

I suggest the tool https://github.com/walmartlabs/json-to-simple-graphql-schema for building a graphql schema from a sample json file (an export of a Qliksense entity like app, user, custompropertydefinition, datasource, ...).
