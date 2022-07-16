const MEMORY = {};

let BRAIN = {};

const LOGS = true;

const init = automations => {
  // cargar MENTE (BRAIN)
};

const updateMemory = (symbol, index, interval, value) => {
  const indexKey = interval ? `${index}_${interval}` : index;
  const memoryKey = `${symbol}:${indexKey}`;
  MEMORY[memoryKey] = value;

  if (LOGS)
    console.log(
      `Beholder memory update: ${memoryKey} => ${JSON.stringify(value)}`
    );

  // logica de parocesamiento de estimulo
};

const getMemory = () => {
  return { ...MEMORY };
};

const getBrain = () => {
  return { ...BRAIN };
};

module.exports = {
  updateMemory,
  getMemory,
  getBrain
};
