const http = require("http");
const url = require("url");
const api = require("../api/index.js");

const server = http.createServer((req, res) => {
    const params = url.parse(req.url, true).query;

    // TODO: IMPLEMENT CACHING.

    if (Object.keys(params).length !== 2 || typeof params.s === "undefined" || typeof params.f === "undefined") {
        res.writeHead(400, {"Content-type": "text/json; charset=utf-8"});
        res.write(JSON.stringify({
            err: "Usage: /?f=<faculty>&s=<session>"
        }));
        res.end();
        return;
    }

    api.get(params.f.toUpperCase(), params.s.toUpperCase(), (data) => {

        if (typeof data.err !== "undefined") {
            res.writeHead(400, {"Content-type": "text/json; charset=utf-8"});
            res.write(JSON.stringify({
                err: "Invalid faculty or session."
            }));
            res.end();
            return;
        }

        res.writeHead(200, {"Content-type": "text/json; charset=utf-8"});
        res.write(JSON.stringify(data, null, '    '));

        res.end();
    });

});

server.listen(8010);
