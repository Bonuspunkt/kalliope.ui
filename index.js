var http = require('http');
var path = require('path');
var url = require('url');

var mu = require('mu2');
var send = require('send');
var formidable = require('formidable');

http.globalAgent.maxSockets = 1e3;

var wwwRoot = path.resolve(__dirname, 'wwwRoot');
mu.root = path.resolve(__dirname, 'templates');

function proxy(parsed, proxyReq, proxyRes) {
  parsed.method = proxyReq.method;
  parsed.headers = proxyReq.headers;

  var cliReq = http.request(parsed, function(cliRes) {
    proxyRes.writeHead(cliRes.statusCode, cliRes.headers);
    cliRes.pipe(proxyRes);
  });

  proxyReq.pipe(cliReq);
}


var getId = (function() {
  var id = 0;
  return function() { return ++id; };
}());

var actions = [];

function processBody(body) {
  if (body.id) {
    body.id = Number(body.id);
    var toDelete = actions.filter(function(action) {
      return action.id === body.id;
    })[0];
    if (toDelete) {
      var index = actions.indexOf(toDelete);
      actions.splice(index, 1);
    }
    return;
  }

  var urlRx = new RegExp(body.url, 'i');
  var methodRx = new RegExp(body.method, 'i');

  switch (body.action) {
    case 'b':
      actions.push({
        id: getId(),
        action: 'blackhole',
        url: urlRx,
        method: methodRx,
        fn: function(parsed, req, res) {}
      });
      break;

    case 'c':
      var headers = {};
      body.headers.split(/\n|\r/g).forEach(function(header) {
        var split = header.split(':');
        headers[split[0]] = split[1];
      });
      actions.push({
        id: getId(),
        action: 'customResponse',
        url: urlRx,
        method: methodRx,
        fn: function(parsed, req, res) {
          res.writeHead(body.statusCode, headers);
          res.end(body.body);
        }
      });
      break;

    case 'd':
      actions.push({
        id: getId(),
        action: 'delay',
        url: urlRx,
        method: methodRx,
        fn: function(parsed, req, res) {
          setTimeout(function() {
            proxy(parsed, req, res);
          }, body.delay);
        }
      });
      break;
  }
}

http.createServer(function(proxyReq, proxyRes) {

  console.log(proxyReq.url);

  parsed = url.parse(proxyReq.url, true);

  if (parsed.host) {
    var action = actions.filter(function(action) {
      return action.method.test(proxyReq.url) && action.url.test(proxyReq.url);
    })[0];

    return ((action && action.fn) || proxy)(parsed, proxyReq, proxyRes);
  }

  function renderPage() {
    var stream = mu.compileAndRender('index.html', {actions: actions});
    proxyRes.writeHead(200, {'content-type': 'text/html'});
    stream.pipe(proxyRes);
    return;
  }

  var form;
  if (proxyReq.url === '/') {
    var hasBody = proxyReq.method === 'POST';

    if (hasBody) {
      form = new formidable.IncomingForm();

      form.parse(proxyReq, function(err, fields, files) {
        processBody(fields);

        renderPage();
      });
    } else {
      renderPage();
    }
    return;
  }
  if (proxyReq.url === '/rules') {
    form = new formidable.IncomingForm();

    form.parse(proxyReq, function(err, fields, files) {
      processBody(fields);
      proxyRes.writeHead(200, {'content-type': 'application/json'});
      proxyRes.end(
        JSON.stringify(
          actions.map(function(action) {
            return {
              id: action.id,
              action: action.action,
              method: action.method.toString(),
              url: action.url.toString()
            };
          })
        )
      );
    });

  }

  // provide settings page
  // config
  send(proxyReq, url.parse(proxyReq.url).pathname)
    .root(wwwRoot)
    .pipe(proxyRes);

}).listen(8000, '127.0.0.1');
console.log('proxy running at http://127.0.0.1:8000');