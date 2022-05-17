import formidable from "formidable";
import {firstValues} from 'formidable/src/helpers/firstValues.js';
import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from "yup";
const db = getFirestore();
import setFilePath from "~/helpers/setFilePath";
import fs from "fs";
import uploadFile from "~/helpers/uploadFile";
import prepareFileInfo from "~/helpers/prepareFileInfo";


const schema = yup.object({

    added: yup.object({
        name: yup.string('Название должно быть строкой')
            .trim('Введите название').required('Введите название'),
    })
})

export default defineEventHandler(async (event) => {

    const form = formidable({
        encoding: 'utf-8',
        keepExtensions: true,
        // 2 mb for news image and attachments. override otherwise
        maxFileSize: 500 * 1024 * 1024,
        //multiples: true,
    });

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    //const maxFileSize = 2000000;

    const {files, fields, err} = await new Promise((resolve, reject) => {
        form.parse(event.req, (err, fields, files) => {
            resolve({files: firstValues(form, files), fields: firstValues(form, fields), err})
        });
    })

    let keys = Object.keys(files).filter((key) => key !== 'file' && key !== 'video')

    const added = JSON.parse(fields.data);

    if (err || (files.file && !allowedTypes.includes(files.file.mimetype))/*|| files.avatar.size > maxFileSize*/) {
        event.res.statusCode = 422;
        event.res.end(JSON.stringify({msg: 'Неверный тип или размер файла превышен'}));
    } else {

        try {

            await schema.validate({
                added,
            });

            if (files.video) {

                if (fs.existsSync(setFilePath('/public' + added.video))) {
                    fs.unlinkSync(setFilePath('/public' + added.video));
                }

                const {newPath} = await uploadFile(files.video, '/public/videos/');

                added.video = newPath.substring(newPath.indexOf('/videos'));

            }

            if (files.file) {
                if (fs.existsSync(setFilePath('/public' + added.image))) {
                    fs.unlinkSync(setFilePath('/public' + added.image));
                }

                if (fs.existsSync(setFilePath('/public' + added.thumbnail))) {
                    fs.unlinkSync(setFilePath('/public' + added.thumbnail));
                }

                const picPath = prepareFileInfo(files.file.newFilename, '/public/img/games/');

                const {mainImage, thumbnail} =  await uploadFile(files.file, '/public/',  {
                    mainImage: true,
                    mainImagePath: picPath,
                    mainImageWidth: 600,
                    mainImageHeight: null,
                    thumbnail: true,
                    thumbnailPath: prepareFileInfo(files.file,
                        '/public/img/games/thumbnails/',
                        picPath.substring(picPath.lastIndexOf('/')+1)),
                    thumbnailWidth: 240,
                    thumbnailHeight: null,
                });

                added.image = mainImage.substring(mainImage.indexOf('/img'));

                added.thumbnail = thumbnail.substring(thumbnail.indexOf('/img'));

            }

            if (keys.length) {

                if (!added.images) {
                    added.images = []
                }

                const images = await Promise.all(keys.map(async (key, index) => {

                    const picPath = prepareFileInfo(files[key].newFilename, '/public/img/games/pics/');

                    return await uploadFile(files[key], '/public/', {
                        multipleImages: true,
                        multipleImagesPath: picPath,
                        multipleImagesWidth: 1920,
                        multipleImagesHeight: null,
                        multipleImagesThumbnail: true,
                        multipleImagesThumbnailPath: prepareFileInfo(files.file,
                            '/public/img/games/pics/thumbnails/',
                            picPath.substring(picPath.lastIndexOf('/')+1)),
                        multipleImagesThumbnailWidth: 240,
                        multipleImagesThumbnailHeight: null
                    });
                }))

                const newImages = images.map((image)=>{

                    image.pic = image.pic.substring(image.pic.indexOf('/img'));
                    image.thumbnail = image.picThumbnail.substring(image.picThumbnail.indexOf('/img'));

                    return {pic : image.pic, thumbnail: image.thumbnail}
                })

                added.images.push(...newImages)

            }

            await db.collection('games').doc(added.slug).update(added);

            return {result: added}

        } catch (e) {

            if (e.path) {
                event.res.statusCode = 422;
                event.res.end(JSON.stringify({
                    msg: e.errors[0]
                }));

            } else {

                event.res.setHeader('Content-Type', 'application/json');
                event.res.statusCode = 401;
                event.res.end(JSON.stringify({msg: 'Ошибка! Вы не авторизованы!'}));

            }
        }
    }
})