const Koa = require('koa');
const app = new Koa();

const IPDCalc = require('./routes/IPDCalc.js');

app.use(IPDCalc.routes());

const port = process.env.PORT || 3000;
module.exports = app.listen(port);
console.log(`API server running on port ${port}`);