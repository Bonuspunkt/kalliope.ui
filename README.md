# kalliope.ui

[![Greenkeeper badge](https://badges.greenkeeper.io/Bonuspunkt/kalliope.ui.svg)](https://greenkeeper.io/)

alright, this is the most minimal version of a proxy to test the clientside request/response handling.

You can alter the response in various ways:

- `blackhole` there wont be any respone
- `custom response`
- `delay` add an delay to the response


## how to get it running
- clone it
- run npm install
- configure your browser to use the proxy for http
- navigate to [http://localhost:8000/](http://localhost:8000/) for modifying setting

if you are usign firefox try
[this addon](https://addons.mozilla.org/en-us/firefox/addon/toggle-proxy-51740/)
so you can toggle it instant on/off

## things that need to be done:
- implement inspector for the request/response in the web interface
  - find a solution for `Transfer-Encoding: chunked` / `EventSource`
- support for WebSockets
