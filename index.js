const https = require('https');
const fs = require('fs');
const { RESTDataSource } = require('apollo-datasource-rest');
const getXrfKey  = () => {
    return "1234567890123456";
}

class QliksenseDataSource extends RESTDataSource {
    constructor(baseurl, cert_file, key_file) {
	super();
	this.baseURL = baseurl;
	this.sslConfiguredAgent = new https.Agent({
	    rejectUnauthorized: false, // (NOTE: this will disable client verification)
	    cert: fs.readFileSync(cert_file),
	    key: fs.readFileSync(key_file),
	    //passphrase: "YYY",
	    keepAlive: false, // switch to true if you're making a lot of calls from this client
	});
    }

    willSendRequest(request) {
	request.params.set('xrfkey', getXrfKey());
	request.headers.set('Accept', 'application/json');
	request.headers.set('Content-Type', 'application/json');
	request.headers.set('x-qlik-xrfkey', getXrfKey());
	request.headers.set('X-Qlik-User', 'UserDirectory= Internal;UserId=sa_repository');
	request.agent = this.sslConfiguredAgent;
    }

    async getEntity(entity) {
	const self = this;
	const resp = await this.get(`/qrs/${entity}/full`); // , null, {agent: self.sslConfiguredAgent}); // (`/qrs/${entity}/full`,
	console.log(resp)
	return {text:  JSON.stringify(resp) };
    }
};

module.exports = { QliksenseDataSource };
