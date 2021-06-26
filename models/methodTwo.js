const cv = require('opencv4nodejs');
const jsqr = require('jsqr');       //to get the coordinates of the QR code
const jpeg = require('jpeg-js');    //to decode the jpg for the jsqr library

/**
 * Takes in an imgPath
 * @param {string} imgPath - Path to temporary image file. Image contains a human face and a QR code covering their forehead with information about its dimensions
 * @param {integer} QRsize - Real-world size of the QR code in millimeters
 * @returns {object} Result - Calculation of the person's interpupillary distance or an error, if a condition isn't met.
 */
exports.calculateIPD = function calculateIPD(imgPath, QRsize) {
    let error = null;
    //Loading the image
    let mat = cv.imread(imgPath);
    mat = mat.resizeToMax(1000); //pic was too large, couldn't see most of it & the encoding takes way too long

    //cv.imshowWait('pic', mat);
    //Getting QR code coordinates
    let jpg = cv.imencode('.jpeg', mat);//reading the image from the mat (to avoid using fs, as i've already read the image above)
                                        //help with not having to resize the image again

    //var jpgData = fs.readFileSync('./pic');
    const jpgImg = jpeg.decode(jpg);
    const qrCode = jsqr(jpgImg.data, jpgImg.width, jpgImg.height);
    //QR CODE SQUARE COORDINATES
    //If QR code wasn't detected properly
    if(qrCode === null) {
        error = "QR Code not detected. Please try again."
    }
    const {topRightCorner, topLeftCorner, bottomRightCorner, bottomLeftCorner} = qrCode.location;

    //Face/eye detection using Haar Cascades 
    //there's little to no documentation on this (javascript) library..
    const faceClassifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);  //pretrained model for face detection
    const eyeClassifier = new cv.CascadeClassifier(cv.HAAR_EYE);            //model for eye detection

    let grey = mat.cvtColor(cv.COLOR_BGR2GRAY); //the algorithm requires greyscaling to perform the classification
    


    /* has an issue detecting a face if theres something over the forehead
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
    */



    const eyes = eyeClassifier.detectMultiScale(grey);
    //TODO: if more than 2 eyes return error
    if(eyes.objects.length !== 2) {
        error = "Couldn't detect your eyes. Make sure only one person is in view and try again."
    }
    //draw rectangle around the eyes using coordinates returned from the eyeClassifier


    grey.drawRectangle(eyes.objects[0], new cv.Vec(0, 255, 0)); //rect object, color vector - opencv uses BGR, not RGB. took a while to figure it out :D
    grey.drawRectangle(eyes.objects[1], new cv.Vec(0, 255, 0));

    //draw the QR code, create own rect object | the QR code has to be in an upright position
    //rect - x, y, width, height (order)
    const qrCodeWidth = topRightCorner.x-topLeftCorner.x;
    const qrCodeHeight = bottomLeftCorner.y-topLeftCorner.y;
    const QRrect2 = new cv.Rect(bottomLeftCorner.x, topLeftCorner.y, qrCodeWidth, qrCodeHeight);
    grey.drawRectangle(QRrect2, new cv.Vec(0, 255, 0), 2);

    //Get the centre point coordinate point for both eyes
    //The x, y values from the eyes are in the top left - tested by drawing it with a smaller size
    let eye1 = eyes.objects[0];
    let eye2 = eyes.objects[1];

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
    const IPD = (eye1.xCentre-eye2.xCentre)*ratio;
    //console.log(IPD);

    //display image
    cv.imshowWait('pic', grey);

    return({IPD: IPD, error: error});
    
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

