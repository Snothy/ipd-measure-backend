const cv = require('opencv4nodejs');
const jsqr = require('jsqr');       //to get the coordinates of the QR code
const jpeg = require('jpeg-js');    //to decode the jpg for the jsqr library
const QrCode = require('qrcode-reader');

/**
 * Calculates the interpupillary distance of a person by using a QR code as a reference object of a known size.
 * @param {string} imgPath - Path to temporary image file. Image contains a human face and a QR code covering their forehead with information about its dimensions
 * @param {integer} QRsize - Real-world size of the QR code in millimeters
 * @returns {object} Result - Calculation of the person's interpupillary distance or an error, if a condition isn't met.
 */
//function calculateIPD(imgPath, QRsize) {
exports.calculateIPD = function calculateIPD(imgPath, QRsize) {
    let error = null;
    //Loading the image
    let mat = cv.imread(imgPath);//('imgPath');//('./pic');
    mat = mat.resizeToMax(1000); //pic was too large, couldn't see most of it & the encoding takes way too long
    let grey = mat.cvtColor(cv.COLOR_BGR2GRAY); //the algorithm requires greyscaling to perform the classification | helps with scanning the qr code
    //cv.imshowWait('pic', mat);
    //Getting QR code coordinates

    let dst = mat;
    //This is to help recognize the QR code, if the QR code is on a reflective surface (mobile device screen)
    dst.threshold(20, 120, cv.THRESH_BINARY);
    //cv.imshowWait('pic', dst);
    let jpg = cv.imencode('.jpeg', mat);//reading the image from the mat (to avoid using fs, as i've already read the image above)
                                        //help with not having to resize the image again

    //var jpgData = fs.readFileSync('./pic');
    const jpgImg = jpeg.decode(jpg);
    let qrCode = jsqr(jpgImg.data, jpgImg.width, jpgImg.height);
    let qrCodeWidth, qrCodeHeight;
    if(qrCode !== null) {
        //jsqr stuff
        //draw the QR code, create own rect object | the QR code has to be in an upright position
        //rect - x, y, width, height (order)
        console.log(qrCode.location);
        const {topRightCorner, topLeftCorner, bottomRightCorner, bottomLeftCorner} = qrCode.location;
        qrCodeWidth = topRightCorner.y - topLeftCorner.y;
        qrCodeHeight = topRightCorner.x - bottomRightCorner.x 
        //draw the QR code, create own rect object | the QR code has to be in an upright position
        //rect - x, y, width, height (order)
        const QRrect2 = new cv.Rect(bottomLeftCorner.x, topLeftCorner.y, qrCodeWidth, qrCodeHeight);
        console.log(QRrect2);
        grey.drawRectangle(QRrect2, new cv.Vec(0, 255, 0), 5);
    } else {
        //qrcode-reader stuff
        let qrCode2;
        const qr = new QrCode();
        qr.callback = function(err, value) {
            if(err) {
                console.error(err);
                return;
            }
            //console.log(value);
            qrCode2 = value;
        };
        qr.decode({width: jpgImg.width, height: jpgImg.height}, jpgImg.data); //object with width and height & buffer data
        //console.log(qrCode2);
        if(typeof(qrCode2) === "undefined") {
            return {error:error = "QR Code not detected. Please try again."};
        } else {
            //qrCode2.points - array - contains the CENTRE points of each finder & a value that helps us calculate the edge points (module size)
            //TODO: if poitns aren't 3, return error for clarifying qr code
            let topLeftEdge = qrCode2.points[0];
            let topRightEdge = qrCode2.points[1];
            let bottomRightEdge = qrCode2.points[2];

            //calculate the actual edge points with the module size
            topLeftEdge.x = topLeftEdge.x - topLeftEdge.estimatedModuleSize*4;
            topLeftEdge.y = topLeftEdge.y - topLeftEdge.estimatedModuleSize*4;

            topRightEdge.x = topRightEdge.x + topRightEdge.estimatedModuleSize*4;
            topRightEdge.y = topRightEdge.y - topRightEdge.estimatedModuleSize*4;

            bottomRightEdge.x = bottomRightEdge.x + bottomRightEdge.estimatedModuleSize*4;
            bottomRightEdge.y = bottomRightEdge.y + bottomRightEdge.estimatedModuleSize*4;

            //draw to confirm corners
            topLeftDraw = new cv.Rect(topLeftEdge.x, topLeftEdge.y, 1, 1);
            //grey.drawRectangle(topLeftDraw, new cv.Vec(0, 255, 0), 5 );
            topRightDraw = new cv.Rect(topRightEdge.x, topRightEdge.y, 1, 1);
            //grey.drawRectangle(topRightDraw, new cv.Vec(0, 255, 0), 5 );
            bottomRightDraw = new cv.Rect(bottomRightEdge.x, bottomRightEdge.y, 1, 1);
            //grey.drawRectangle(bottomRightDraw, new cv.Vec(0, 255, 0), 5 );
            //cv.imshowWait('pic', grey);

            //calculate height and width
            qrCodeWidth = topRightEdge.x - topLeftEdge.x;
            qrCodeHeight = bottomRightEdge.y - topRightEdge.y;

            //draw qr rectangle
            const QRrect2 = new cv.Rect(topLeftEdge.x, topLeftEdge.y, qrCodeWidth, qrCodeHeight);
            //console.log(qrCode2.points);
            //console.log(QRrect2);
            grey.drawRectangle(QRrect2, new cv.Vec(0, 255, 0), 1);
            //cv.imshowWait('pic', grey);
        }
    }

    


    //console.log(qrCode2);
    //qrcodedraw1 = new cv.Rect(qrCode2.points[0].x, qrCode2.points[0].y, 2, 2);
    //grey.drawRectangle(qrcodedraw1, new cv.Vec(0, 255, 0), 10 );
    //cv.imshowWait('pic', grey);




    //console.log(qrCode.location);
    //Face/eye detection using Haar Cascades 
    //there's little to no documentation on this (javascript) library..
    const faceClassifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);  //pretrained model for face detection
    const eyeClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);            //model for eye detection

    //cv.imshowWait('pic', grey);
    


    //has an issue detecting a face if theres something over the forehead
    const face = faceClassifier.detectMultiScale(grey, 1.05, 5);
    //TODO: can only do one face at a time
    if(face.length>1) {
        //return error object - more than 1 faces detected
    } else if(face.length<1) {
        //return error object no face detected
    }

    const faceCoordinates = grey.getRegion(face.objects[0]);//accessing the cv.Rect object, which holds the x,y,width and height values of the face
                                                            //and we pass them over to the eye classifier
    //const eyes = eyeClassifier.detectMultiScale(faceCoordinates);
    //console.log(face);
    //console.log(faceCoordinates);
    grey.drawRectangle(face.objects[0], new cv.Vec(0, 255, 0) );
    


    
    const eyes = eyeClassifier.detectMultiScale(faceCoordinates);
    //TODO: if more than 2 eyes return error
    if(eyes.objects.length !== 2) {
        console.log(eyes.objects.length);
        return {error: error = "Couldn't detect your eyes. Make sure only one person is in view and try again."};
    }
    let eye1 = eyes.objects[0];
    let eye2 = eyes.objects[1];
    const faceObj = face.objects[0];
    //Since the Rect values can't be altered for some reason, we create a new Rect instance
    eye1 = new cv.Rect(eye1.x+faceObj.x, eye1.y+faceObj.y, eye1.width, eye1.height);
    eye2 = new cv.Rect(eye2.x+faceObj.x, eye2.y+faceObj.y, eye2.width, eye2.height);
    /*
    eye1.x = 2;
    eye2.x = eye2.x + faceObj.width;
    console.log(faceObj.width);
    console.log(eye1.x);
    */
    //draw rectangle around the eyes using coordinates returned from the eyeClassifier

    
    grey.drawRectangle(eye1, new cv.Vec(0, 255, 0)); //rect object, color vector - opencv uses BGR, not RGB. took a while to figure it out :D
    grey.drawRectangle(eye2, new cv.Vec(0, 255, 0));


    //Get the centre point coordinate point for both eyes
    //The x, y values from the eyes are in the top left - tested by drawing it with a smaller size


    //Calculate the second x & y points for each eye square
    eye1.x2 = eye1.x + eye1.width;
    eye1.y2 = eye1.y + eye1.height;
    eye2.x2 = eye2.x + eye2.width;
    eye2.y2 = eye2.y + eye2.height;

    //Calculate the centre point for x & y
    eye1.xCentre = (eye1.x + eye1.x2)/2;
    eye1.yCentre = (eye1.y+eye1.y2)/2
    eye2.xCentre = (eye2.x + eye2.x2)/2;
    eye2.yCentre = (eye2.y+eye2.y2)/2

    //Draw them as confirmation
    const eye1CentreRect = new cv.Rect(eye1.xCentre, eye1.yCentre, 1, 1); //a 1x1 rectangle, will draw a thick dot with the drawRectangle method so its more visible
    const eye2CentreRect = new cv.Rect(eye2.xCentre, eye2.yCentre, 1, 1);
    grey.drawRectangle(eye1CentreRect, new cv.Vec(255, 0, 0), 4); //to confirm the x&y values are in the centre of the pupil (top left of square)
    grey.drawRectangle(eye2CentreRect, new cv.Vec(255, 0, 0), 4);

    //Calculate the QR code's width's pixel to millimeter ratio 
    const ratio = QRsize/qrCodeWidth;
    /*
    console.log(ratio);
    console.log(QRsize);
    console.log(qrCodeWidth);
    console.log(eye1.xCentre);
    console.log(eye2.xCentre);
    */
    
    const IPD = (eye1.xCentre-eye2.xCentre)*ratio;
    console.log(IPD);

    //display image
    //cv.imshowWait('pic', grey);

    return({IPD: Math.round(Math.abs(IPD) *10)/10 , error: error}); //make the number positive & round IPD to one decimal point with x*10/10
    //not sure which eye detected by the classifier is going to be eye one, and it doesn't matter, so i just make the number positive
    
    /*
    //attempt to use contours to find the QR code and the eye features
    //not a good approach, learned about haar cascades 
    mat = mat.cvtColor(cv.COLOR_BGR2GRAY); //make the image grey
    mat = mat.gaussianBlur(new cv.Size(7, 7), 0); //and slightly blur

    mat = mat.canny(50,100);

    let contours = mat.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE, new cv.Point2(0, 0));

    console.log(contours[4]);
    //console.log(mat);
    */


    

}

//calculateIPD('a', 60);