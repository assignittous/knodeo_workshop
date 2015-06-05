var request;

request = require('sync-request');

require('sugar');

exports.Http = {
  objectify: function(response) {
    var body, obj;
    body = response.body.toString('utf8');
    obj = JSON.parse(body);
    return obj;
  },
  getObject: function(url, options, attribute) {
    var response, that;
    response = request("get", url, options);
    that = this;
    if (attribute != null) {
      return that.objectify(response[attribute]);
    } else {
      return that.objectify(response);
    }
  }
};
