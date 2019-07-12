// 安装成windows服务
const package = require('../package.json');
const path = require('path');
let service = require('node-windows').Service;

let svc = new service({
  name: package.name,
  description: package.description, 
  script: path.resolve(__dirname, '..', 'index.js')
});

svc.on('install', () => {
  svc.start();
});

svc.install();