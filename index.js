
var request = require('superagent')
  , falafel = require('falafel')
  , select  = require('soupselect').select
  , htmlparser  = require('htmlparser')
  , _ = require('underscore')._

function parseServers(script){
  var servers = [];

  var out = falafel(script, function(node){
    var args = node.arguments
      , arg = function(n) { return args[n].value; }
    
    if (node.type === 'CallExpression')
    if (node.callee.name === 'e') {
      var s = arg(2)
      var entry = {
        world: arg(0),
        members: arg(1),
        status: s == 0 ? "online" : s == 1 ? "offline" : "full",
        domain: arg(3),
        players: arg(4),
        country: arg(5),
        countryCode: arg(6),
        name: arg(7)
      };

      servers.push(entry);
    }
  });

  return servers;
}

module.exports = function(opts, cb){
  var timeout = opts.timeout || 1000;
  if (_.isFunction(opts)) {
    cb = opts;
    opts = {};
  }

  function parsed(dom, o, cb){
    var tags = o("script");
    var tag = _(tags).find(function(tag){
      return tag.attribs && tag.attribs.language != null;
    });

    if (tag == null) return cb("Not found in tags");

    var script = tag.children[0].raw;
    var servers = parseServers(script);

    return cb(null, servers);
  }

  function handle(res, cb){
    var body    = res.body;
    var handler = new htmlparser.DefaultHandler(function(err, dom){
      if(err) return cb(err);
      parsed(dom, select.bind(null, dom), cb);
    });
    var parser  = new htmlparser.Parser(handler);

    parser.parseComplete(res.text);
  }

  function download(n){
    var rate  = opts.rate || 1.5
      , stop  = opts.stop || 4
      , delay = (n * opts.rate) || 1;

    function retry(err, servers) {
      if (err) {
        if (n > stop) return cb(err);
        return download(n + 1);
      }
      return cb(err, servers);
    }

    request
      .get(opts.url || 'http://oldschool.runescape.com/slu')
      .timeout(timeout * delay)
      .end(function(err, res){
        if (err) return retry(err);
        handle(res, retry);
      });
  }

  download(0);
};
