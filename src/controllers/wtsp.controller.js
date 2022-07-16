const fs = require('fs');
const path = require('path');
const { whatsapp, sessionsBusiness, statusQr } = require('../utils/bot-wsp');

module.exports.conection = async (req, res) => {
  //const { trade, webhook } = req.body;
  const business = sessionsBusiness.get(res.trade);

  if (!business) return res.send(await whatsapp(res.trade, res.webhook));
  else if (!business?.tradeSession)
    return res.send('Existe una coneccion en proceso aguarde');

  const { tradeSession } = business;
  const status = await tradeSession.getConnectionState();
  console.log(status);
  res.send(status);
}; // bueno

module.exports.getQr = async (req, res) => {
  const ruta = path.join(__dirname, `../../screenshots/${res.trade}/qr.png`);
  const exists = fs.existsSync(ruta);
  console.log(ruta, exists);
  if (exists) return res.sendFile(ruta);
  res.send(false);
};

module.exports.postQr = async (req, res) => {
  res.json({ qrBase64: await statusQr() });
};

module.exports.sendText = async (req, res) => {
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendText(to, message)
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // bueno

module.exports.sendListMenu = async (req, res) => {
  // Menú Lista de envío
  // Esta función no funciona para contactos comerciales
  const { to, list } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendListMenu(to, 'Title', 'subTitle', 'Description', 'menu', list)
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // bueno

module.exports.sendButtons = async (req, res) => {
  // Enviar mensajes con botones Responder
  const { to, buttons } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendButtons(to, 'Title', buttons, 'Description')
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // bueno

module.exports.sendVoice = async (req, res) => {
  // Enviar archivo de audio MP3
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendVoice(to, './audio.mp3')
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; //pendiente

module.exports.sendVoiceBase64 = async (req, res) => {
  // Enviar archivo de audio base64
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendVoiceBase64(to, base64MP3)
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; //pendiente

module.exports.sendContactVcard = async (req, res) => {
  // Enviar contacto
  const { to, contact, contactName } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendContactVcard(to, contact, contactName)
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // bueno Deben ser numeros registrados en el cel

module.exports.sendContactVcardList = async (req, res) => {
  // Enviar una lista de tarjetas de contacto
  const { to, contacts } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendContactVcardList(to, contacts)
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // bueno Deben ser numeros registrados en el cel

module.exports.sendLocation = async (req, res) => {
  // Enviar ubicación
  const { to, latitude, Longitude, country } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendLocation(to, latitude, Longitude, country)
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // no funciona

module.exports.sendLinkPreview = async (req, res) => {
  // Envía automáticamente un enlace con la vista previa del enlace generada automáticamente. También puede agregar un mensaje personalizado para agregar.
  const { to, link, descripcion } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendLinkPreview(to, link, descripcion)
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // no funciona

module.exports.sendImage = async (req, res) => {
  // Enviar imagen (también puede cargar una imagen utilizando un protocolo HTTP válido)
  const { to, route, name, caption } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendImage(to, route, name, caption) // 'path/to/img.jpg', 'image-name', 'Caption text'
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // bueno

module.exports.sendImageFromBase64 = async (req, res) => {
  // Enviar archivo de imagen base64
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendImageFromBase64(to, base64Image, 'name file')
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // pendiente

module.exports.sendFile = async (req, res) => {
  // Enviar archivo (venom se encargará de los tipos mime, solo necesita la ruta)
  // también puede cargar una imagen utilizando un protocolo HTTP válido
  const { to, route, name, caption } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendFile(to, route, name, 'See my file in pdf')
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // bueno

module.exports.sendFileFromBase64 = async (req, res) => {
  // Envía archivo
  // el parámetro base64 debe tener el tipo mime ya definido
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendFileFromBase64(to, base64PDF, 'file_name.pdf', 'See my file in pdf')
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // pendiente

module.exports.sendImageAsStickerGif = async (req, res) => {
  // Genera una pegatina a partir de la imagen gif animada proporcionada y la envía (Enviar imagen como pegatina animada)
  // ruta de la imagen imageBase64 Se requiere una imagen gif y webp válida. También puede enviar a través de http/https (http://www.website.com/img.gif)
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendImageAsStickerGif(to, './image.gif')
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // pendiente

module.exports.sendImageAsSticker = async (req, res) => {
  // Genera una pegatina a partir de una imagen dada y la envía (Enviar imagen como pegatina)
  // ruta de la imagen imageBase64 Se requiere una imagen png, jpg y webp válida. También puede enviar a través de http/https (http://www.website.com/img.jpg)
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendImageAsSticker(to, './image.jpg')
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // pendiente

module.exports.forwardMessages = async (req, res) => {
  // Reenvía mensajes
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .forwardMessages(to, [
      'false_000000000000@c.us_B70847EE89E22D20FB86ECA0C1B11609',
      'false_000000000000@c.us_B70847EE89E22D20FB86ECA0C1B11777'
    ])
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // pendiente

module.exports.sendMentioned = async (req, res) => {
  // Enviar mensaje @etiquetado
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendMentioned(to, 'Hello @5218113130740 and @5218243160777!', [
      '5218113130740',
      '5218243160777'
    ])
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
};

module.exports.reply = async (req, res) => {
  // Responder a un mensaje
  const { to, message, id } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .reply(
      to,
      message, //'This is a reply!',
      id //'true_551937311025@c.us_7C22WHCB6DKYHJKQIEN9' false_573012673944@c.us_224F0BFEED4CAD83FBDBA5DD75C3C6B8
    )
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
};

module.exports.sendMessageOptions = async (req, res) => {
  // Enviar mensaje con opciones
  const { to, message, id } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendMessageOptions(to, message, {
      quotedMessageId: reply
    })
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
}; // pendiente

module.exports.sendVideoAsGif = async (req, res) => {
  // Send gif
  const { to, message } = req.body;
  const business = res.trade;
  const { tradeSession } = sessionsBusiness.get(business);
  await tradeSession
    .sendMessageOptions(to, 'path/to/video.mp4', 'video.gif', 'Gif image file')
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error when sending: ', err);
      res.status(402).json(err);
    });
};

module.exports.otros = async (req, res) => {
  //comprueba y devuelve si un mensaje y una respuesta
  // ejemplo:
  // await client.onMessage(async (message) => {
  //     console.log(await client.returnReply(message)); // replicated message
  //     console.log(message.body ); //customer message
  //   })
  checkReply = await client.returnReply(messagem);

  // Enviar visto ✔️✔️
  await client.sendSeen('000000000000@c.us');

  // Empieza a escribir...
  await client.startTyping('000000000000@c.us');

  // deja de escribir
  await client.stopTyping('000000000000@c.us');

  // Establecer el estado del chat (0: escribiendo, 1: grabando, 2: en pausa)
  await client.setChatState('000000000000@c.us', 0 | 1 | 2);
};
