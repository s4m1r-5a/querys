require('./utils/cron');
const app = require('./app');
const { sequelize } = require('./models/index'); //Config of DataBase
//const appWs = require('./app-ws');
//const notifications = require('./utils/notifications');

sequelize
  .authenticate()
  .then(async () => {
    console.log('Database connection established successfully.');
    console.log('Starting the Server Apps...');
    const server = app.listen(app.get('port'), () =>
      console.log('App is running at ', app.get('port'))
    );
    //const wss = await appWs(server);
    //await notifications.init(wss, {}); //passar o beholder
  })
  .catch(err => console.log('Unable to connect to the database.', err));
