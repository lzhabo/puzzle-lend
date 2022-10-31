const fs = require("fs");
const packageJson = require("../package.json");
packageJson.homepage = "https://lzhabo.github.io/puzzle-lend/";
fs.writeFileSync("package.json", JSON.stringify(packageJson));
