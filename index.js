const Koa = require('koa');
const app = new Koa();

const methodOne = require('./routes/methodOne.js');

app.use(methodOne.routes());

const port = process.env.PORT || 3000;
module.exports = app.listen(port);
console.log(`API server running on port ${port}`);