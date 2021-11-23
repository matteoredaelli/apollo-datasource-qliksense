const { ApolloServer, gql } = require("apollo-server");
const responseCachePlugin = require("apollo-server-plugin-response-cache");

const fs = require("fs");

const { QliksenseDataSource, resolvers, typeDefs } = require("./index"); //"apollo-datasource-qliksense");

const cache_age = process.env.CACHE_AGE ? process.env.CACHE_AGE : 0;
const tracing = process.env.TRACING ? true : false;

process.env.QLIKSENSE_URLS || process.exit(1);
process.env.QLIKSENSE_CERTIFICATE || process.exit(2);
process.env.QLIKSENSE_CERTIFICATE_KEY || process.exit(3);

const qliksense_urls = JSON.parse(process.env.QLIKSENSE_URLS);
const qliksense_config = require("./sample-qlik.json");

const qliksense_cert = fs.readFileSync(process.env.QLIKSENSE_CERTIFICATE);
const qliksense_cert_key = fs.readFileSync(
  process.env.QLIKSENSE_CERTIFICATE_KEY
);

var qliksenseDS = {};
Object.keys(qliksense_urls).map(function (key, index) {
  qliksenseDS[key] = new QliksenseDataSource(
    qliksense_urls[key],
    qliksense_cert,
    qliksense_cert_key
  );
});

const graphqlSchemaObj = {
  typeDefs: typeDefs,
  resolvers: resolvers,
  tracing: true,
  dataSources: () => qliksenseDS,
  plugins: [],
  cacheControl: {
    defaultMaxAge: cache_age,
  },
};
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer(graphqlSchemaObj);

// The `listen` method launches a web server.
server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
