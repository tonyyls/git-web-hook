const fs = require("fs");
const path = require("path");
const http = require("http");
const qs = require("querystring");
const config = require("./config.json");
const port = config.port;

function handleRequest(req, res) {
  if (req.method == "POST") {
    let data = "";

    req.on("data", chunk => {
        data += chunk;
    });

    req.on("end", () => {
        data = decodeURI(data);
        console.log(data);
    });
  }
  const url = req.url;
  console.log(req.url);
  let repository = findRepository(url);
  console.log(repository);
  res.write("ok ba lala");
  res.end();
}

function findRepository(url) {
  let result;
  config.repository.map(item => {
      if(item.url == url) {
        result = item;
        return;
      }
  });
  return result;
}

const server = http.createServer(handleRequest);
server.listen(config.port, () => {
  console.log(`WebHook Server running on port ${port}`);
});
