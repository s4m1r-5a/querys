const { config } = require("dotenv");
config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost/apicompany",
  PORT: process.env.PORT || 4000,
  SECRET: process.env.JWT_SECRET,
  SMTP: {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "inmovily@gmail.com",
      pass: "ubhohzssrwojhpdw",
    },
  },
  API_URL: process.env.API_URL, //https://api.binance.com/api https://testnet.binance.vision/api
  API_KEY: process.env.API_KEY, //MDopxTMOUmQ6KFpIx1VFvhb6uY4krznxqt28Q8MIAhAsHc7L5fY617BHxJ8OitfY NRwfPxZuWhSURjNGQTMcvY5Vc4XCTC7FfrPMExIlEMJo6VPDmxBqzszQWJFkx3Me
  SECRET_KEY: process.env.SECRET_KEY, //K6iJvMSSVdEck1JIubwJuRRyrOPZE7Cmm2ZzSz7lbOMNNmsZrUljoW2582cn2d5I 2l6xgSs878lrv40QFOq1j0JlxlGQlgZMWR2eh2sgJ6AvGckXQsyjuD4saQUuPd8s
  CRAWLER_INTERVAL: process.env.CRAWLER_INTERVAL,
  PROFITABILITY: process.env.PROFITABILITY,
  CAPITALIZATION: process.env.CAPITALIZATION,
  SYMBOL: process.env.SYMBOL,
  AUTHGOOGLE: {
    client_id:
      "507835578448-tcsk19bgg5df3p45suqsq1q936vkqoa6.apps.googleusercontent.com",
    project_id: "inmovili-341717",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "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",
    javascript_origins: ["http://localhost:4000", "https://inmovili.com"],
  },
};
