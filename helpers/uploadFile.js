import fs from "fs";
import sharp from "sharp";
import prepareFileInfo from "~/helpers/prepareFileInfo";

export default (file, defaultPath, image = null) => {

    return new Promise( (resolve, reject) => {

        //const metadata =  await sharp(file.filepath).metadata();

        const stream = fs.createReadStream(file.filepath);

        const result = {};

        const newPath = !image ? prepareFileInfo(file.newFilename, defaultPath) : null

        stream.on('open', () => {

            if(image){

                let outputStream = null;

                let transformer = null;


                if(image.mainImage){

                    outputStream = fs.createWriteStream(image.mainImagePath);

                    result.mainImage = image.mainImagePath;

                    const resize = {
                        width: image.mainImageWidth,
                        height: image.mainImageHeight,
                        fit: sharp.fit.cover,
                        position: sharp.strategy.entropy
                        //fit: 'cover', position: 'right top',
                    }

                    if(!resize.width){delete resize.width}
                    if(!resize.height){delete resize.height}

                    transformer = sharp()
                        .resize(resize);

                    stream
                        .pipe(transformer)
                        .pipe(outputStream);

                    if(image.thumbnail){

                        outputStream = fs.createWriteStream(image.thumbnailPath);

                        result.thumbnail = image.thumbnailPath;

                        const resize = {
                            width: image.thumbnailWidth,
                            height: image.thumbnailHeight,
                            //fit: sharp.fit.cover,
                            //position: sharp.strategy.entropy
                            fit: 'cover', position: 'right top',
                        }

                        if(!resize.width){delete resize.width}
                        if(!resize.height){delete resize.height}

                        transformer = sharp()
                            .resize(resize);

                        stream
                            .pipe(transformer)
                            .pipe(outputStream);

                    }
                    if(image.thumbMin){

                        outputStream = fs.createWriteStream(image.thumbMinPath);

                        result.thumbMin = image.thumbMinPath;

                        const resize = {
                            width: image.thumbMinWidth,
                            height: image.thumbMinHeight,
                            //fit: sharp.fit.cover,
                            //position: sharp.strategy.entropy
                            fit: 'cover', position: 'right top',
                        }

                        if(!resize.width){delete resize.width}
                        if(!resize.height){delete resize.height}

                        transformer = sharp()
                            .resize(resize);

                        stream
                            .pipe(transformer)
                            .pipe(outputStream);

                    }
                }

                if(image.multipleImages){

                    outputStream = fs.createWriteStream(image.multipleImagesPath);

                    result.pic = image.multipleImagesPath;


                    const resize = {
                        width: image.multipleImagesWidth,
                        height: image.multipleImagesHeight,
                        fit: sharp.fit.cover,
                        position: sharp.strategy.entropy
                    }

                    if(!resize.width){delete resize.width}
                    if(!resize.height){delete resize.height}

                    transformer = sharp()
                        .resize(resize);

                    stream
                        .pipe(transformer)
                        .pipe(outputStream);

                    if(image.multipleImagesThumbnail){

                        outputStream = fs.createWriteStream(image.multipleImagesThumbnailPath);

                        result.picThumbnail = image.multipleImagesThumbnailPath;

                        const resize = {
                            width: image.multipleImagesThumbnailWidth,
                            height: image.multipleImagesThumbnailHeight,
                            fit: sharp.fit.cover,
                            position: sharp.strategy.entropy
                        }

                        if(!resize.width){delete resize.width}
                        if(!resize.height){delete resize.height}

                        transformer = sharp()
                            .resize(resize);

                        stream
                            .pipe(transformer)
                            .pipe(outputStream);

                    }

                }

            }else {
                const outputStream = fs.createWriteStream(newPath);
                stream.pipe(outputStream)
            }

        });

        /*stream.on('data', function (chunk) {
            progress += chunk.length;
            let perc = ((progress / total) * 100).toFixed(2);
            console.log('percent complete: ' + perc + '%\n');
            //status = perc;
        })*/

        stream.on('close', () => {

            setTimeout(() => {
                resolve(image ? result : {newPath});
            }, 2000);



        });
        // If something goes wrong, reject the promise
        stream.on('error', err => {
            console.error(err);
            reject(err);
        });
    });

}








/*const image = {
    mainImage: true,
    mainImagePath: '/public/img/',
    mainImageWidth: 800,
    mainImageHeight: 800,
    thumbnail: false,
    thumbnailPath: '/public/img/thumbnails/',
    thumbnailWidth: 200,
    thumbnailHeight: 200,
    multipleImages: false,
    multipleImagesPath: '/public/img/pics/',
    multipleImagesWidth: 600,
    multipleImagesHeight: 600,
    multipleImagesThumbnail: false,
    multipleImagesThumbnailPath: '/public/img/pics/thumbnails/',
    multipleImagesThumbnailWidth: 200,
    multipleImagesThumbnailHeight: 200,
}*/



/* MAIN IMAGE --------------------

{

 mainImage: true,
 mainImagePath: newPath,
 mainImageWidth: 800,
 mainImageHeight: 800,
 thumbnail: true,
 thumbnailPath: prepareFileInfo(files.file,
 '/public/img/thumbnails/',
 picPath.substring(picPath.lastIndexOf('/')+1)),
 thumbnailWidth: 200,
 thumbnailHeight: 200,
 thumbMin: true,
 thumbMinPath: prepareFileInfo(files.file,
 '/public/img/thumbnails/min/',
 picPath.substring(picPath.lastIndexOf('/')+1)),
 thumbMinWidth: 30,
 thumbMinHeight: 20,

 }

*/


/* MULTIPLE IMAGES --------------------

{

 multipleImages: true,
 multipleImagesPath: newPath,
 multipleImagesWidth: 600,
 multipleImagesHeight: 600,
 multipleImagesThumbnail: true,
 multipleImagesThumbnailPath: prepareFileInfo(files.file,
 '/public/img/pics/thumbnails/',
 picPath.substring(picPath.lastIndexOf('/')+1)),
 multipleImagesThumbnailWidth: 200,
 multipleImagesThumbnailHeight: 200

}

*/




