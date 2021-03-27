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

  async getEntity(entity, count = false, filter = null) {
    const full_or_count = count ? "count" : "full";
    let url = `/qrs/${entity}/${full_or_count}`;
    //if (filter) {
    //  url = url + `?filter=${filter}`;
    //}
    const options = filter ? { params: { filter: filter } } : null;
    console.log(options);
    const resp = await this.get(url, null, options); // {agent: self.sslConfiguredAgent});
    console.log(resp);
    return resp;
  }
}

module.exports = { QliksenseDataSource };
