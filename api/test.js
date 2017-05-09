var api = require("./index.js");

api.get("COMP", "S2", (data) => {
    console.log(JSON.stringify(data, null, '    '));
});
