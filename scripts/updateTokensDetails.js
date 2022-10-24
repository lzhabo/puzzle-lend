const axios = require("axios");
const fs = require("fs");

const requestUrl =
  "https://opensheet.vercel.app/1c_Rr-5LdCmkv3ViVJMYK6_7Q9zVtN-UnEcRINg8ft4s/details";
(async () => {
  const { data } = await axios.get(requestUrl);
  fs.writeFileSync(
    "./src/constants/tokenDetails.json",
    JSON.stringify(
      data.reduce((acc, v) => ({ ...acc, [v.symbol]: v.description }), {}),
      null,
      4
    )
  );
})();
