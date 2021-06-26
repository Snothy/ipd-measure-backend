const Router = require('koa-router');

const koaBody = require('koa-body')({multipart: true, uploadDir: './uploads'});
const model = require('../models/methodTwo');

const router = Router({ prefix: '/api/methods' });

router.get('/', getAll);
router.post('/methodOne', koaBody, processImages);
router.post('/methodTwo', koaBody, processImagesTwo)

async function getAll(ctx) {
    return ctx.body = {msg: "hi"};
}

async function processImages(ctx) {
    //console.log(ctx.request.body);
    const body = ctx.request.body;
    const eyeCoordinates = JSON.parse(body.eyeCoordinates);
    const squareSize = JSON.parse(body.squareSize);


    const distanceFromObject = 185; //approx
    const distObjRatio = distanceFromObject/squareSize.size;

    //console.log(squareSize.size);
    //ratio between the distance from the camera and the size of the square
    const convertToMm = distObjRatio;

    const realX = 300-squareSize.size;
    const X1 = (eyeCoordinates.leftEye.x-realX)*convertToMm;
    const X2 = (eyeCoordinates.rightEye.x-realX)*convertToMm;
    //really poor estimate
    const dist = (X1-X2);
    //console.log(dist);
    return ctx.body = {success: true, IPD: Math.round(dist)};
}

async function processImagesTwo(ctx) {
    const body = JSON.parse(ctx.request.body.QR);
    const IPD = model.calculateIPD(ctx.request.files.photo.path, body.size);
    if(IPD.error !== null) {
        return ctx.body = {success: false , IPD: IPD.error};
    }
    return ctx.body = {success: true, IPD: IPD.IPD};
}

module.exports = router;