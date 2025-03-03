const dialogflow = require("@google-cloud/dialogflow");
const fs = require("fs");
const path = require("path");
const nanoid = require("nanoid");
require('dotenv').config();

/**
 * 
 * Debes de tener tu archivo con el nombre "chatbot-account.json" en la raíz del proyecto
 */
let PROJECID;
let CONFIGURATION;
let sessionClient;

const checkFileCredentials = () => {
  const ruta = path.join(__dirname, "../../chatbot-account.json");

  if (!fs.existsSync(ruta)) {
    return false;
  }

  console.log(ruta);
  const parseCredentials = JSON.parse(fs.readFileSync(ruta));
  PROJECID = parseCredentials.project_id;
  CONFIGURATION = {
    credentials: {
      private_key: parseCredentials["private_key"],
      client_email: parseCredentials["client_email"],
    },
  };
  sessionClient = new dialogflow.SessionsClient(CONFIGURATION);
};

// Create a new session

// Detect intent method
const detectIntent = async (queryText, session) => {
  let media = null;
  const sessionId = session; //nanoid.nanoid();
  console.log(PROJECID, sessionId, "Sesion que se esta usando");
  const sessionPath = sessionClient.projectAgentSessionPath(
    PROJECID,
    sessionId
  );
  const languageCode = process.env.LANGUAGE;
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: queryText,
        languageCode: languageCode,
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const [singleResponse] = responses;
  const { queryResult } = singleResponse;
  const { intent } = queryResult || { intent: {} };
  const parseIntent = intent["displayName"] || null;
  const parsePayload = queryResult["fulfillmentMessages"].find(
    (a) => a.message === "payload"
  );
  // console.log(singleResponse)
  if (parsePayload && parsePayload.payload) {
    const { fields } = parsePayload.payload;
    media = fields.media.stringValue || null;
  }
  // const customPayload = parsePayload['payload']

  const parseData = {
    replyMessage: queryResult.fulfillmentText,
    media,
    trigger: null,
  };
  return parseData;
};

const getDataIa = (message = "", session = "", cb = () => {}) => {
  detectIntent(message, session).then((res) => cb(res));
};

checkFileCredentials();

module.exports = { getDataIa, checkFileCredentials };
