const { updateOrderByOrderId } = require('./repositories/orders.repository');
const { RSI, MACD, indexKeys } = require('./utils/indexes');
const {
  getActiveMonitors,
  monitorTypes
} = require('./repositories/monitors.repository');

let WSS, beholder, exchange;

const startMiniTickerMonitor = (broadcastLabel, logs) => {
  if (!exchange) return new Error(`Exchange Monitor not initialized yet!`);

  exchange.miniTickerStream(markets => {
    if (logs) console.log(markets);

    // Enviar para beholder

    if (broadcastLabel && WSS) WSS.broadcast({ [broadcastLabel]: markets });
  });
  console.log(`Mini-Ticker Monitor has started at ${broadcastLabel}!`);
};

let book = [];
const startBookMonitor = (broadcastLabel, logs) => {
  if (!exchange) return new Error(`Exchange Monitor not initialized yet!`);

  exchange.bookStream(order => {
    if (logs) console.log(order);

    if (book.length === 900) {
      if (broadcastLabel && WSS) WSS.broadcast({ [broadcastLabel]: book });
      book = [];
    } else book.push(order);

    // Enviar para beholder
  });
  console.log(`Book Monitor has started at ${broadcastLabel}!`);
};

const loadWallet = async () => {
  if (!exchange) return new Error(`Exchange Monitor not initialized yet!`);
  const info = await exchange.balance();
  const wallet = Object.entries(info).map(item => {
    // Enviar para beholder
    return {
      symbol: item[0],
      available: item[1].available,
      onOrder: item[1].inOrder
    };
  });
  return wallet;
};

const processExecutionData = (executionData, broadcastLabel) => {
  if (executionData.x === 'NEW') return;

  const order = {
    symbol: executionData.s,
    orderId: executionData.i,
    clientOrderId:
      executionData.x === 'CANCELED' ? executionData.C : executionData.c,
    side: executionData.S,
    type: executionData.o,
    status: executionData.X,
    isMaker: executionData.m,
    transactTime: executionData.T
  };

  if (order.status === 'FILLED') {
    const quoteAmount = parseFloat(executionData.Z);
    order.avgPrice = quoteAmount / parseFloat(executionData.z);
    order.commission = executionData.n;
    const isQuoteCommission =
      executionData.N && order.symbol.endsWith(executionData.N);
    order.net = isQuoteCommission
      ? quoteAmount - parseFloat(order.commission)
      : quoteAmount;
  }

  if (order.status === 'REJECTED') order.obs = executionData.r;

  setTimeout(
    () =>
      updateOrderByOrderId(order.orderId, order.clientOrderId, order)
        .then(order => {
          if (order) {
            // Enviar para beholder
            if (broadcastLabel && WSS)
              WSS.broadcast({ [broadcastLabel]: order });
          }
        })
        .catch(err => console.error(err)),
    3000
  );
};

const startUserDataMonitor = (broadcastLabel, logs) => {
  if (!exchange) return new Error(`Exchange Monitor not initialized yet!`);
  const [balanceBroadcast, executionBroadcast] = broadcastLabel.split(',');

  loadWallet();

  exchange.userDataStream(
    balanceData => {
      if (logs) console.log(balanceData);
      const wallet = loadWallet();
      if (balanceBroadcast && WSS)
        WSS.broadcast({ [balanceBroadcast]: balanceData });
    },
    executionData => {
      if (logs) console.log(executionData);
      processExecutionData(executionData, executionBroadcast);
    }
  );

  console.log(`User Data Monitor has started at ${broadcastLabel}!`);
};

const processChartData = (symbol, indexes, interval, ohlc) => {
  indexes.map(index => {
    switch (index) {
      case indexKeys.RSI: {
        //RSI(ohlc.close);
        // calcular e enviar para o Beholder
      }
      case indexKeys.MACD: {
        //MACD(ohlc.close);
        // calcular e enviar para o Beholder
      }
      default:
        return;
    }
  });
};

const startChartMonitor = (symbol, interval, indexes, broadcastLabel, logs) => {
  if (!symbol)
    return new Error(`You can't start a Chart Monitor without a symbol!`);

  if (!exchange) return new Error(`Exchange Monitor not initialized yet!`);

  exchange.chartStream(symbol, interval || '1m', ohlc => {
    const lastCandle = {
      open: ohlc.open[ohlc.open.length - 1],
      close: ohlc.close[ohlc.close.length - 1],
      high: ohlc.high[ohlc.high.length - 1],
      low: ohlc.low[ohlc.low.length - 1]
    };

    if (logs) console.log(lastCandle);

    // Enviar para beholder

    if (broadcastLabel && WSS) WSS.broadcast({ [broadcastLabel]: lastCandle });

    processChartData(symbol, indexes, interval, ohlc);
  });

  console.log(`Chart Monitor has started at ${symbol}_${interval}`);
};

const init = async (settings, wssInstance, beholderInstance) => {
  if (!settings || !beholderInstance)
    throw new Error(
      `Can't start Exchange Monitor without settings and/or Beholder.`
    );

  WSS = wssInstance;
  beholder = beholderInstance;
  exchange = require('./utils/exchange')(settings);

  const monitors = await getActiveMonitors();
  monitors.map(monitor => {
    setTimeout(() => {
      switch (monitor.type) {
        case monitorTypes.MINI_TICKER:
          return startMiniTickerMonitor(monitor.broadcastLabel, monitor.logs);
        case monitorTypes.BOOK:
          return startBookMonitor(monitor.broadcastLabel, monitor.logs);
        case monitorTypes.USER_DATA:
          return startUserDataMonitor(monitor.broadcastLabel, monitor.logs);
        case monitorTypes.CANDLES:
          return startChartMonitor(
            monitor.symbol,
            monitor.interval,
            monitor.indexes.split(','),
            monitor.broadcastLabel,
            monitor.logs
          );
      }
    }, 250);
  });

  console.log('App Exchange Monitor is running!');
};

module.exports = { init, startChartMonitor };
