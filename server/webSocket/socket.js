const WebSocket = require('ws');

const pixieWs = new WebSocket('ws://192.168.0.154:4444');
const clients = []

pixieWs.on('open', () => {
  console.log('Connected to other server');
  clients.push(this.pixieWs);
});

pixieWs.on('error', (error) => {
  console.error('WebSocket client error:', error);
});

module.exports = pixieWs
