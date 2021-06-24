const Router = require('koa-router');

const koaBody = require('koa-body')({multipart: true, uploadDir: './uploads'});



const router = Router({ prefix: '/api/methodOne' });

router.get('/', getAll);
router.post('/', koaBody, processImages);

async function getAll(ctx) {
    return ctx.body = {msg: "hi"};
}

async function processImages(ctx) {
    //console.log(ctx.request.body);
    const body = ctx.request.body;
    const eyeCoordinates = JSON.parse(body.eyeCoordinates);
    const squareSize = JSON.parse(body.squareSize);
    
    //use size of square to determine distance from camera

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

module.exports = router;