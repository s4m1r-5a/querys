require('dotenv').config();
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const authCtrl = require('./controllers/auth.controller');

const corsValidation = origin => process.env.CORS_ORIGIN.startsWith(origin);

const verifyClient = async (info, callback) => {
  // CORS
  if (!corsValidation(info.origin)) return callback(false, 401);

  // JWT
  const token = info.req.url.split('token=')[1];
  console.log('siempre esta verificando');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const isBlacklist = await authCtrl.isBlacklisted(token);
      if (decoded && !isBlacklist && !isConnected(decoded.id))
        return callback(true);
    } catch (e) {
      console.log(token, e);
    }
  }

  return callback(false, 401);
};

const onMessage = data => {
  console.log(`onMessage: ${data}`);
};

const onError = err => {
  console.error(`onError: ${err.message}`);
};

const onConection = (ws, req) => {
  const token = jwt.decode(req.url.split('token=')[1]);
  ws.id = token.profile === 'ADMIN' ? 'ADMIN' : token.id;
  console.log('Nuevo cliente su id: ', ws.id, token);
  ws.on('message', onMessage);
  ws.on('error', onError);
  //console.log(`New onConection id: ${ws.id}`);
};

function isConnected(userId) {
  if (!this.clients) return false;
  return [...this.clients].some(c => c.id == userId);
}

function getConnections() {
  if (!this.clients) return false;
  return [...this.clients].some(c => c.id);
}

function direct(userId, jsonObject) {
  if (!this.clients) return;
  this.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.id == userId) {
      client.send(JSON.stringify(jsonObject));
    }
  });
}

function broadcast(jsonObject) {
  if (!this.clients) return;
  this.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(jsonObject));
    }
  });
}

module.exports = server => {
  const wss = new WebSocket.Server({
    server,
    verifyClient
  });

  wss.on('connection', onConection);
  wss.broadcast = broadcast;
  wss.direct = direct;
  wss.getConnections = getConnections;
  console.log(`App Web Socket Server is running!`);

  return wss;
};
