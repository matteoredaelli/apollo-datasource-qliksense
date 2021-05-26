## Qliksense datasource for GraphQL Apollo server

[apollo-datasource-qliksense](https://github.com/matteoredaelli/apollo-datasource-qliksense) is a Qliksense datasource for the GraphQL [Apollo server](https://www.apollographql.com/). "Apollo is the industry-standard GraphQL implementation, providing the data graph layer that connects modern apps to the cloud."

### Installation

npm install apollo-datasource-qliksense

### Usage

See sample-qlik-server.js and sample-qlik.json in the source repository

Sample config file qlik.json

```json
{"certificate": "../../certificates/dev/client.pem",
 "certificate_key": "../../certificates/dev/client_key.pem",
 "urls": {
	 "qlik_default":   "https://qlk04ww.example.com:4242",
	 "qlik_node1_rep": "https://qlk01ww.example.com:4242",
	 "qlik_node1_eng": "https://qlk01ww.example.com:4747"
 }
}
```

```javascript

const { ApolloServer, gql } = require("apollo-server");
const responseCachePlugin = require('apollo-server-plugin-response-cache');

const {
  QliksenseDataSource,
  resolvers,
  typeDefs
} = require("apollo-datasource-qliksense");

const qliksense_config = require("./qlik.json");

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

const server = new ApolloServer(graphqlSchemaObj);
```

Sample graphql queries

Generic queries

```graphql
{
  u: qliksense_get(
	proxy: "qlik_default"
	path: "/qrs/user/full?filter=userId eq matteo"
  ) {
	__typename
	... on QlikUser {
	  name
	}
  },
	d: qliksense_entity(
	proxy: "qlik_default"
	entity: "dataconnection"
	filter: "name sw 'Ama'"
  ) {
	__typename
	... on QlikDataConnection {
	  name
	}
  }
}

"
```

Specific queries

```graphql
{
  qliksense_user(proxy: "qlik_default", filter: "userId eq matteo") {
	name
	id
	groups
	accessible_objects(resource_type: "Stream") {
	  name
	}
  }
}
```

```json
{
  "data": {
	"qliksense_user": [
	  {
		"name": "Redaelli Matteo [matteo]",
		"id": "11111-111-111111",
		"groups": [
		  "Qliksense_Professional_User",
		  "Qliksense_User",
		],
		"accessible_objects": [
		  {
			"name": "Everyone"
		  },
	  ...
```

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
  qliksense_user(
	entity: "user"
  ) {
	userId
  }
}
```

Retreive user sessions

```graphql
query UserSessions(
  $user_directory: String! = "MYDIR"
  $user_id: String! = "matteo"
) {
  node1_azure: qliksense_user_sessions(
	proxy: "qlik_node1_proxy"
	virtualproxy: "azure"
	user_directory: $user_directory
	user_id: $user_id
  ) {
	...user_sessions
  }
  node1_default: qliksense_user_sessions(
	proxy: "qlik_node1_proxy"
	virtualproxy: ""
	user_directory: $user_directory
	user_id: $user_id
  ) {
	...user_sessions
  }
  node1_sf: qliksense_user_sessions(
	proxy: "qlik_node1_proxy"
	virtualproxy: "sf"
	user_directory: $user_directory
	user_id: $user_id
  ) {
	...user_sessions
  }
}
fragment user_sessions on QlikUserSession {
  VirtualProxy
  SessionId
  UserDirectory
  UserId
}
```
