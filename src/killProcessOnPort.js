const { exec } = require('child_process');

module.exports.killProcessOnPort = port => {
  return new Promise(resolve => {
    // Comando para Windows
    const command = `netstat -ano | findstr :${port}`;

    exec(command, (error, stdout) => {
      if (error || !stdout) {
        console.log(`No process found on port ${port}`);
        resolve(false);
        return;
      }

      // Extraer el PID del resultado
      const lines = stdout.split('\n');
      for (const line of lines) {
        const match = line.match(/LISTENING\s+(\d+)/);
        if (match && match[1]) {
          const pid = match[1];
          // Intentar matar el proceso
          exec(`taskkill /PID ${pid} /F`, killError => {
            if (killError) {
              console.log(`Failed to kill process ${pid}`);
              resolve(false);
            } else {
              console.log(`Successfully killed process ${pid} on port ${port}`);
              resolve(true);
            }
          });
          return;
        }
      }
      resolve(false);
    });
  });
};
