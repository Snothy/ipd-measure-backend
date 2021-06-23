const Router = require('koa-router');

const koaBody = require('koa-body')({multipart: true, uploadDir: './uploads'});



const router = Router({ prefix: '/api/methodOne' });

router.get('/', getAll);
router.post('/', koaBody, processImages);

async function getAll(ctx) {
    return ctx.body = {msg: "hi"};
}

async function processImages(ctx) {
    console.log(ctx.request);
    //console.log(Object.keys(ctx.request.body));
    console.log(ctx.request.files);
    //const photo = ctx.request.body.photo;
    //console.log(photo);
    
    return ctx.body = {msg: "bye"};
}

module.exports = router;