const mongoose = require("mongoose");
const config = require("../config");

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((db) => console.log(`DB conectada`))
  .catch((err) => console.log(`DB no conectada ${err}`));

mongoose.connection.once("open", (_) => {
  console.log("La base de datos a sido abierta en " + config.MONGODB_URI);
});

mongoose.connection.on("error", (err) => {
  console.log(`existe un error en la coneccion a la base de datos ` + err);
});
