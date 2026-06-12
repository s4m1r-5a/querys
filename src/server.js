const app = require('./app');
const { sequelize } = require('./models/index'); //Config of DataBase

sequelize
  .sync({ force: false })
  .then(async () => {
    console.log('Database connection established successfully.');
    console.log('Starting the Server Apps...');

    const startServer = async (port = app.get('port')) => {
      try {
        const server = app.listen(port, () =>
          console.log('App is running at ', port)
        );

        server.on('error', async error => {
          if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} still busy, trying ${port + 1}`);
            await startServer(port + 1);
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
  })
  .catch(err => console.log('Unable to connect to the database.', err));
