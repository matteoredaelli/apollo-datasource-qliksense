const { ApolloServer, gql } = require("apollo-server");
const responseCachePlugin = require('apollo-server-plugin-response-cache');

const {
  QliksenseDataSource,
  resolvers,
  typeDefs
} = require("./apollo-datasource-qliksense");

const qliksense_config = require("./sample-qlik.json");

var qliksenseDS = {};

Object.keys(qliksense_config.urls).map(function(key, index) {
  qliksenseDS[key] = new QliksenseDataSource(
      qliksense_config.urls[key],
      qliksense_config.certificate,
      qliksense_config.certificate_key
      )
  });

const graphqlSchemaObj = {
    typeDefs: typeDefs,
    resolvers: resolvers,
    tracing: true,
    dataSources: () => (qliksenseDS),
    plugins: [responseCachePlugin()],
    cacheControl: {
	defaultMaxAge: 3600, // 3600 seconds
    },
};
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer(graphqlSchemaObj);

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
