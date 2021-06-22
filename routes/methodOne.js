const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
//const model = require('../models/mothodOne');

const router = Router({ prefix: '/api/methodOne' });

router.get('/', getAll);
router.post('/', processImages);

async function getAll(ctx) {
    return ctx.body = {msg: "hi"};
}

async function processImages(ctx) {
    return ctx.body = {msg: "bye"};
}

module.exports = router;