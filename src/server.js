require('./utils/cron');
const app = require('./app');
// const { killProcessOnPort } = require('./killProcessOnPort');
const { sequelize } = require('./models/index'); //Config of DataBase
// const { businessQuery } = require('./services/enterpriseQueryApi');
// const { consultRutDian } = require('./utils/query');
//const appWs = require('./app-ws');
//const notifications = require('./utils/notifications');

sequelize
  //.authenticate()
  .sync({ force: false })
  .then(async () => {
    console.log('Database connection established successfully.');
    console.log('Starting the Server Apps...');

    const startServer = async (port = app.get('port')) => {
      try {
        // Primero intentar matar cualquier proceso en el puerto
        // await killProcessOnPort(port);

        // Esperar un momento para asegurarse de que el puerto se libere
        // await new Promise(resolve => setTimeout(resolve, 1000));

        const server = app.listen(port, () =>
          console.log('App is running at ', port)
        );

        server.on('error', async error => {
          if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} still busy, trying ${port + 1}`);
            // await startServer(port + 1);
          } else console.error('Other server error:', error);
        });

        server.on('listening', () =>
          console.log(`Server successfully started on port ${port}`)
        );

        server.on('close', () => console.log(`Server closed on port ${port}`));
      } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
      }
    };

    await startServer();
    //const wss = await appWs(server);
    //await notifications.init(wss, {}); //passar o beholder

    // await consultRutDian('1082926704');
    // await businessQuery('1', '1082926704');
  })
  .catch(err => console.log('Unable to connect to the database.', err));
