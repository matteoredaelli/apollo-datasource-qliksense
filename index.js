/**
 * Copyright (c) 2021 Matteo Redaelli
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const https = require("https");
const fs = require("fs");
const { RESTDataSource } = require("apollo-datasource-rest");

const getXrfKey = () => {
  return "1234567890123456";
};

class QliksenseDataSource extends RESTDataSource {
  constructor(baseurl, cert_file, key_file) {
    super();
    this.baseURL = baseurl;
    this.sslConfiguredAgent = new https.Agent({
      rejectUnauthorized: false, // (NOTE: this will disable client verification)
      cert: fs.readFileSync(cert_file),
      key: fs.readFileSync(key_file),
      //passphrase: "YYY",
      keepAlive: false // switch to true if you're making a lot of calls from this client
    });
  }

  willSendRequest(request) {
    request.params.set("xrfkey", getXrfKey());
    request.headers.set("Accept", "application/json");
    request.headers.set("Content-Type", "application/json");
    request.headers.set("x-qlik-xrfkey", getXrfKey());
    request.headers.set(
      "X-Qlik-User",
      "UserDirectory= Internal;UserId=sa_repository"
    );
    request.agent = this.sslConfiguredAgent;
  }


    async getUrl(url, options = null) {
	const resp = await this.get(url, null, options); // {agent: self.sslConfiguredAgent});
	console.log(resp);
	return resp;
    }

    async postUrl(url, body) {
	const resp = await this.post(url, body); // {agent: self.sslConfiguredAgent});
	console.log(resp);
	return resp;
    }
    async getEntity(entity, id = "full", filter = null) {
	let url = `/qrs/${entity}/${id}`;
	const options = filter ? { params: { filter: filter } } : null;
	const resp = await this.getUrl(url, options);
	if (Array.isArray(resp))
	    return resp;
	else
	    return [resp];
    }

    async getEntitiesBuIDs(entity, ids) {
	var result = [];
	for (const id of ids) {
	    // TODO skip SessionApp
	    if (! id.startsWith("SessionApp") ) {
		const a1 = await this.getEntity(entity, id, null);
		result = result.concat(a1);
	    }
	}
	return result;
    }
}

const typeDefs = `
type Json {
     json: String
}

type QlikCustomProperty @cacheControl(maxAge: 3600) {
  id: ID!
  createdDate: String
  modifiedDate: String
  modifiedByUserName: String
  name: String
  valueType: String
  description: String
  privileges: String
  schemaPath: String
  objectTypes: [String]
  choiceValues: [String]
}

type QlikDetail {
  id: String
  detailsType: Int
  message: String
  detailCreatedDate: String
  privileges: String
}

type QlikLastExecutionResult {
  id: ID!
  value: Int
  executingNodeName: String
  status: Int
  startTime: String
  stopTime: String
  duration: Int
  fileReferenceID: String
  scriptLogAvailable: Boolean
  scriptLogLocation: String
  scriptLogSize: Int
  privileges: String
  details: [QlikDetail]
}

type QlikOperational {
  id: String
  nextExecution: String
  privileges: String
  lastExecutionResult: QlikLastExecutionResult
}

type QlikStreamSimple {
  id: String
  name: String
  privileges: String
}

type QlikAppSimple {
  id: String
  name: String
  appId: String
  publishTime: String
  published: Boolean
  savedInProductVersion: String
  migrationHash: String
  availabilityStatus: Int
  privileges: String
  stream: QlikStreamSimple
}

type QlikReloadTask {
  id: ID!
  value: Int
  createdDate: String
  modifiedDate: String
  modifiedByUserName: String
  isManuallyTriggered: Boolean
  name: String
  taskType: Int
  enabled: Boolean
  taskSessionTimeout: Int
  maxRetries: Int
  privileges: String
  schemaPath: String
  tags: [String]
  operational: QlikOperational
  app: QlikAppSimple
  app_details: QlikApp
  customProperties: [QlikCustomProperty]
}

type QlikApp @cacheControl(maxAge: 3600) {
  id: ID!
  value: Int
  createdDate: String
  modifiedDate: String
  modifiedByUserName: String
  name: String!
  appId: String
  sourceAppId: String
  targetAppId: String
  publishTime: String
  published: Boolean
  description: String
  stream: String
  fileSize: Int
  lastReloadTime: String
  thumbnail: String
  savedInProductVersion: String
  migrationHash: String
  dynamicColor: String
  availabilityStatus: Int
  privileges: String
  schemaPath: String
  tags: [String]
  owner: QlikOwner
  owner_details: QlikUser
  customProperties: [QlikCustomProperty]
}
type QlikDataConnection @cacheControl(maxAge: 3600) {
  id: String
  value: Int
  createdDate: String
  modifiedDate: String
  modifiedByUserName: String
  name: String
  connectionstring: String
  type: String
  engineObjectId: String
  username: String
  password: String
  logOn: Int
  architecture: Int
  privileges: String
  schemaPath: String
  tags: [String]
  owner: QlikOwner
  owner_details: QlikUser
  customProperties: [QlikCustomProperty]
}

type QlikStream @cacheControl(maxAge: 3600) {
  id: ID!
  value: Int
  createdDate: String
  modifiedDate: String
  modifiedByUserName: String
  name: String
  privileges: String
  schemaPath: String
  tags: [String]
  owner_simple: QlikOwner
  owner: QlikUser
  customProperties: [QlikCustomProperty]
}

type QlikAttribute {
  id: ID!
  createdDate: String
  modifiedDate: String
  modifiedByUserName: String
  attributeType: String
  attributeValue: String
  externalId: String
  schemaPath: String
}

type QlikOwner {
  id: String
  userId: String
  userDirectory: String
  name: String
  privileges: String
}

type QlikUser @cacheControl(maxAge: 3600) {
  id: ID!
  value: Int
  createdDate: String
  modifiedDate: String
  modifiedByUserName: String
  userId: String
  userDirectory: String
  name: String
  inactive: Boolean
  removedExternally: Boolean
  blacklisted: Boolean
  deleteProhibited: Boolean
  privileges: String
  schemaPath: String
  tags: [String]
  attributes: [QlikAttribute]
  roles: [String]
  customProperties: [QlikCustomProperty]
  accessible_objects(resource_type: String, action:String = "read"): [AuditAccessibleObject]
  groups: [String]
}

type QlikUserSimple {
  id: String
  userId: String
  userDirectory: String
  name: String
  privileges: String
}

type QlikLicenseAccessType {
  id: String
  createdDate: String
  modifiedDate: String
  modifiedByUserName: String
  lastUsed: String
  excess: Boolean
  quarantined: Boolean
  quarantineEnd: String
  deletedUserId: String
  deletedUserDirectory: String
  privileges: String
  schemaPath: String
  user: QlikUserSimple
}

type AuditAccessibleObject {
  name: String
  schemaPath: String
}

type QlikCache {
  hits: Int
  lookups: Int
  added: Int
  replaced: Int
  bytes_added: Int
}

type QlikUsers {
  active: Int
  total: Int
}

type QlikApps {
  proxy: String!
  calls: Int
  selections: Int
  in_memory_docs: [String]
  in_memory_apps: [QlikApp]
  loaded_docs: [String]
  loaded_apps: [QlikApp]
  active_docs: [String]
}

type QlikSession {
  active: Int
  total: Int
}

type QlikCpu {
  total: Int
}

type QlikMem {
  committed: Float
  allocated: Float
  free: Float
}

type QlikHealthCheck @cacheControl(maxAge: 3600) {
  version: String
  started: String
  saturated: Boolean
  cache: QlikCache
  users: QlikUsers
  apps: QlikApps
  session: QlikSession
  cpu: QlikCpu
  mem: QlikMem
}
type QlikAnalyzerTimeAccess {
  enabled: Boolean
  allocatedMinutes: Int
  usedMinutes: Int
  unavailableMinutes: Int
  schemaPath: String
}

type QlikAnalyzerAccess {
  enabled: Boolean
  total: Int
  allocated: Int
  used: Int
  quarantined: Int
  excess: Int
  available: Int
  schemaPath: String
}

type QlikProfessionalAccess {
  enabled: Boolean
  total: Int
  allocated: Int
  used: Int
  quarantined: Int
  excess: Int
  available: Int
  schemaPath: String
}

type QlikLoginAccess {
  enabled: Boolean
  tokenCost: Float
  allocatedTokens: Int
  usedTokens: Int
  unavailableTokens: Int
  schemaPath: String
}

type QlikUserAccess {
  enabled: Boolean
  tokenCost: Int
  allocatedTokens: Int
  usedTokens: Int
  quarantinedTokens: Int
  schemaPath: String
}

type QlikLicenseAccessTypeOverview {
  totalTokens: Int
  availableTokens: Int
  tokensEnabled: Boolean
  schemaPath: String
  analyzerTimeAccess: QlikAnalyzerTimeAccess
  analyzerAccess: QlikAnalyzerAccess
  professionalAccess: QlikProfessionalAccess
  loginAccess: QlikLoginAccess
  userAccess: QlikUserAccess
}

type Query {
  qliksense_get(
    proxy: String!,
    path: String!): Json
  qliksense_entity(
    proxy: String!,
    entity: String!,
    id: String = "full",
    filter:String): Json
  qliksense_app(
    proxy: String!,
    id: String,
    filter:String): [QlikApp]
  qliksense_dataconnection(
    proxy: String!,
    id: String,
    filter:String="full"): [QlikDataConnection]
  qliksense_healthcheck(
    proxy: String): QlikHealthCheck
  qliksense_license_access_type(
    proxy: String!,
    type: String,
    id: String = "full",
    filter:String): [QlikLicenseAccessType]
  qliksense_license_access_type_overview(
    proxy: String!,
    filter:String): QlikLicenseAccessTypeOverview
  qliksense_stream(
    proxy: String!,
    id: String,
    filter:String): [QlikStream]
  qliksense_user(
    proxy: String!,
    id: String,
    filter:String): [QlikUser]
}

`;

const resolvers = {
    QlikApp: {
	owner_details: async (app, _args, { dataSources }) => {
	    const id = app.owner.id;
	    const path = `/qrs/user/${id}`;
	    const result =  await dataSources.qlik_default.getUrl(path);
	    return result;
	},
    },
    QlikUser: {
	accessible_objects: async (user, {resource_type, action}, { dataSources }) => {
	    const body = {resourceType: resource_type,
			  action: action,
			  userID: user.id}
	    const result =  await dataSources.qlik_default.postUrl("/qrs/systemrule/security/audit/accessibleobjects", body);
	    return result;
	},
	groups: async (user, _args, { dataSources }) => {
	    const groups_sttributes = user.attributes.filter(attr => attr.attributeType.toUpperCase() === "GROUP");
	    const result = groups_sttributes.map(attr => attr.attributeValue);
	    return result;
	},
    },
    QlikApps: {
	in_memory_apps: async (
	    parent,
	    args,
	    { dataSources }
	) => {
	    const result =  await dataSources.qlik_default.getEntitiesBuIDs("app", parent.in_memory_docs);
	    return result;
	},
	loaded_apps: async (
	    parent,
	    args,
	    { dataSources }
	) => {
	    const result =  await dataSources.qlik_default.getEntitiesBuIDs("app", parent.loaded_docs);
	    return result;
	},
    },
  Query: {
      qliksense_entity: async (
	  _parent,
	  { proxy, entity, id, filter },
	  { dataSources }
      ) => {
	  console.log(dataSources[proxy]);
	  const resp = await dataSources[proxy].getEntity(entity, id, filter);
	  return { json: JSON.stringify(resp) };
      },

      qliksense_dataconnection: async (
	  _parent,
	  {proxy, id, filter },
	  { dataSources }
      ) => {
	  const resp = await dataSources[proxy].getEntity(
	      "dataconnection",
	      id,
	      filter
	  );
	  return resp;
      },

      qliksense_app: async (_parent, {proxy, id, filter }, { dataSources }) => {
	  const resp = await dataSources[proxy].getEntity("app", id, filter);
	  return resp;
      },

      qliksense_stream: async (_parent, {proxy, id, filter }, { dataSources }) => {
	  const resp = await dataSources[proxy].getEntity(
	      "stream",
	      id,
	      filter
	  );
	  console.log(resp);
	  return resp;
      },

      qliksense_user: async (_parent, {proxy, id, filter }, { dataSources }) => {
	  const resp = await dataSources[proxy].getEntity("user", id, filter);
	  return resp;
      },

      qliksense_license_access_type: async (_parent, {proxy, type, id }, context) => {
	  const url = `/qrs/license/${type}accesstype/${id}`;
	  const resp = await context.dataSources[proxy].getUrl(url);
	  return resp;
      },
      qliksense_license_access_type_overview: async (_parent, {proxy}, context) => {
	  const url = `/qrs/license/accesstypeoverview`;
	  const resp = await context.dataSources[proxy].getUrl(url);
	  return resp;
      },

      qliksense_get: async (_parent, {proxy, path }, context) => {
	  const resp = await context.dataSources[proxy].getUrl(path);
	  return { json: JSON.stringify(resp) };
      },

      qliksense_healthcheck: async (_parent, {proxy}, context) => {
	  const resp = await context.dataSources[proxy].getUrl("/healthcheck");
	  return resp;
      },
  }
};

module.exports = { QliksenseDataSource, resolvers, typeDefs };
