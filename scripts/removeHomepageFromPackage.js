console.log("ok");
const fs = require("fs");
const packageJson = require("../package.json");
delete packageJson.homepage;
fs.writeFileSync("package.json", JSON.stringify(packageJson));
