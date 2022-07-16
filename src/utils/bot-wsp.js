const venom = require('venom-bot');
const nanoid = require('nanoid');
const { getDataIa } = require('./dialogflow');
const { browserArgs } = require('./browserArgs');
const { transpoter } = require('../controllers/mail.controller');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const ruta = path.join(__dirname, '../../screenshots');

const exists = fs.existsSync(ruta);
if (!exists)
  fs.mkdir(ruta, err => {
    if (err) console.log(err);
    console.log('Carpeta creada exitosamente');
  });

let qrBase64 = false;
const sessionsBusiness = new Map();
const userSession = new Map();

const statusQr = () => {
  const imgRoute2 = fs.readFileSync('wtsp-offline.png');
  return !qrBase64
    ? 'data:image/png;base64,' + imgRoute2.toString('base64')
    : qrBase64;
};

const setSession = (trade, session) => {
  const business = sessionsBusiness.get(trade);
  if (!business) {
    sessionsBusiness.set(trade, session);
    return true;
  } else if (!business?.tradeSession) {
    sessionsBusiness.set(trade, session);
    return true;
  }
  return false;
};

const setUserSession = sender => {
  if (!userSession.has(sender)) userSession.set(sender, nanoid.nanoid());
};

const getIA = (message, session) =>
  new Promise((resolve, reject) => {
    let resData = { replyMessage: '', media: null, trigger: null };
    getDataIa(message, session, dt => {
      resData = { ...resData, ...dt };
      resolve(resData);
    });
  });

const bothResponse = async (message, session) => {
  const data = await getIA(message, session);
  console.log(data, 'samir');
  /* if (data && data.media) {
    const file = await saveExternalFile(data.media);
    return { ...data, ...{ media: file } };
  } */
  return data;
};

const sendMessage = (message, webhook, cb = () => {}) => {
  axios
    .post(webhook, message)
    .then(res => cb(res))
    .catch(err => console.error(err));
};

const incomingMessage = (message, webhook) => {
  new Promise((resolve, reject) =>
    sendMessage(message, webhook, data => resolve(data))
  );
};

const start = (client, router) => {
  setSession(client.session, { webhook: router, tradeSession: client });
  //qrBase64 = inline;
  //
  client.onMessage(async msg => {
    const { webhook } = sessionsBusiness.get(client.session);
    const { from, isGroupMsg } = msg;

    if (from === 'status@broadcast') return;
    if (!isGroupMsg) await incomingMessage(msg, webhook);
  });

  // función para detectar conflictos y cambiar de estado
  // Forzarlo a mantener la sesión actual
  // Posibles valores de estado:
  // CONFLICT
  // CONNECTED
  // DEPRECATED_VERSION
  // OPENING
  // PAIRING
  // PROXYBLOCK
  // SMB_TOS_BLOCK
  // TIMEOUT
  // TOS_BLOCK
  // UNLAUNCHED
  // UNPAIRED
  // UNPAIRED_IDLE
  client.onStateChange(state => {
    console.log('State changed: ', state);
    // obligar a whatsapp a hacerse cargo
    if ('CONFLICT'.includes(state)) client.useHere();
    // detectar desconexión en whatsapp
    if ('UNPAIRED'.includes(state)) console.log('logout');
  });

  // DISCONNECTED
  // SYNCING
  // RESUMING
  // CONNECTED
  let time = 0;
  client.onStreamChange(state => {
    console.log('State Connection Stream: ' + state);
    clearTimeout(time);
    if (state === 'DISCONNECTED' || state === 'SYNCING') {
      time = setTimeout(() => {
        client.close();
      }, 80000);
    }
  });

  // función para detectar llamada entrante
  client.onIncomingCall(async call => {
    console.log(call);
    client.sendText(
      call.peerJid,
      `Lo siento, todavía no puedo contestar llamadas.\n\n_*Bot-${client.session}*_`
    );
  });
  return true;
};

const connectionStatus = async (session, webhook, cb = () => {}) => {
  venom
    .create(
      //session
      session, //Pase el nombre del cliente que desea iniciar el bot
      //catchQR
      (base64Qr, asciiQR, attempts, urlCode) => {
        console.log('Número de intentos de leer el código qr: ', attempts);
        console.log('Código qr del terminal: ', asciiQR);
        //console.log('Cadena de imagen base64 qrcode: ', base64Qrimg);
        //console.log('Cadena de imagen base64 qrcode: ', base64Qr);
        //console.log('urlCode (data-ref): ', urlCode);
        qrBase64 = base64Qr;
        const data = {
          from: "'inmovili' <inmovily@gmail.com>",
          to: 's4m1r.5a@gmail.com',
          subject: 'Esto es una prueba de Whatsapp',
          text: 'Qr de whatsapp',
          attachments: [{ path: base64Qr }]
        };

        /* transpoter
      .sendMail(data)
      .then(reslt => {
        console.log(reslt);
      })
      .catch(e => {
        if (e.response) console.log(e.response.data.message);
        else console.log(e.message);
      }); */

        var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        var response = {};

        if (matches.length !== 3) return new Error('Invalid input string');

        response.type = matches[1];
        response.data = new Buffer.from(matches[2], 'base64');

        var imgBfr = response;
        fs.writeFile(
          `screenshots/${session}/qr.png`,
          imgBfr['data'],
          'binary',
          err => err && console.log(err)
        );
        cb('qr');
      },
      // statusFind
      (statusSession, session) => {
        console.log('Estado de la sesión: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser
        //Create session wss return "serverClose" case server for close
        console.log('Nombre de la sesión: ', session);
        const exists = fs.existsSync(`screenshots/${session}/qr.png`);
        if (exists)
          fs.unlink(`screenshots/${session}/qr.png`, err => {
            if (err) throw err;
            console.log('Archivo eliminado');
          });
        const imgRoute = fs.readFileSync('wtsp-inline.png');
        qrBase64 = 'data:image/png;base64,' + imgRoute.toString('base64');
        var matches = qrBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        var response = {};

        if (matches.length !== 3) return new Error('Invalid input string');

        response.type = matches[1];
        response.data = new Buffer.from(matches[2], 'base64');

        var imgBfr = response;
        fs.writeFile(
          `screenshots/${session}/wtsp-inline.png`,
          imgBfr['data'],
          'binary',
          err => err && console.log(err)
        );
      },
      // options
      {
        multidevice: true, // para la versión que no es multidispositivo, use falso. (predeterminado: verdadero)
        folderNameToken: 'tokens', //nombre de la carpeta al guardar tokens
        mkdirFolderToken: '', //tokens de directorio de carpetas, justo dentro de la carpeta de venom, ejemplo: { mkdir Folder Token: '/node_modules', } //guardará la carpeta de tokens en el directorio node_modules
        headless: true, // chrome sin cabeza
        devtools: false, // Abrir devtools por defecto
        useChrome: true, // Si es falso, usará la instancia de Chromium
        debug: false, // Abre una sesión de depuración.
        logQR: false, // Registra QR automáticamente en la terminal
        //browserWS: '', // Si desea utilizar browserWSEndpoint
        browserArgs, //Parámetros originales ---Parámetros que se agregarán a la instancia del navegador Chrome
        //puppeteerOptions: {}, // Se pasará a puppeteer.launch (titiritero.lanzamiento )
        disableSpins: false, // Deshabilitará la animación de Spinnies, útil para contenedores (docker) para un mejor registro
        disableWelcome: true, // Deshabilitará el mensaje de bienvenida que aparece al principio.
        updatesLog: false // Registra actualizaciones de información automáticamente en la terminal
        //autoClose: 60000, // Cierra automáticamente el venom-bot solo cuando se escanea el código QR (predeterminado 60 segundos, si desea apagarlo, asigne 0 o falso)
        //createPathFileToken: false, // crea una carpeta al insertar un objeto en el navegador del cliente, para que funcione es necesario pasarle los parámetros en la función crear token de sesión del navegador
        //chromiumVersion: '818858', // Versión del navegador que se utilizará. Las cadenas de revisión se pueden obtener en omahaproxy.appspot.com.
        //addProxy: [''], // Agregar ejemplo de servidor proxy: [e1.p.webshare.io:01, e1.p.webshare.io:01]
        //userProxy: '', // Nombre de usuario de inicio de sesión de proxy
        //userPass: '' // Proxy password
      },
      // BrowserInstance
      (browser, waPage) => {
        console.log('Navegador PID:', browser.process().pid);
        waPage.screenshot({ path: `screenshots/${session}/screenshot.png` });
      }
    )
    .then(async sesion => {
      const res = await start(sesion, webhook);
      cb(res);
    })
    .catch(err => {
      console.error('Error when sending: ', err);
      const imgRoute2 = fs.readFileSync('wtsp-offline.png');
      qrBase64 = 'data:image/png;base64,' + imgRoute2.toString('base64');
      cb(false);
    });
};

const whatsapp = async (session, webhook) => {
  const conection = setSession(session, { webhook, tradeSession: false });
  if (!conection) return false;
  fs.mkdir(ruta + `/${session}`, err => err && console.log(err.code));
  return new Promise((resolve, reject) =>
    connectionStatus(session, webhook, data => resolve(data))
  );
};

module.exports = { whatsapp, sessionsBusiness, statusQr };
