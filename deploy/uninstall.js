// 卸载windows服务
const package = require('../package.json');
const path = require('path');
const service = require('node-windows').Service;

let svc = new service({
  name: package.name,
  description: package.description,
  script: path.resolve(__dirname, '..', 'index.js')
});

svc.on('uninstall', function() {
  console.log('Uninstall complete.');
  console.log('The service exists: ', svc.exists);
});

svc.uninstall();
