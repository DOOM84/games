import formidable from "formidable";
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import im from 'imagemagick';
import slugify from "slugify";
import {
    getFirestore
} from "firebase-admin/firestore";
import * as yup from "yup";
const db = getFirestore();
import getRandom from "~/helpers/getRandom";
import setFilePath from "~/helpers/setFilePath";
import fs from "fs";


const schema = yup.object({

    added: yup.object({
        name: yup.string('Название должно быть строкой')
            .trim('Введите название').required('Введите название'),
    })
})

const fileSchema = yup.object().shape({
    file: yup.mixed().required('File is required'),
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

    let keys = Object.keys(files).filter((key) => key !== 'file' && key !== 'video');

    const added = JSON.parse(fields.data);

    if (err || (files.file && !allowedTypes.includes(files.file.mimetype))/*|| files.avatar.size > maxFileSize*/) {

        event.res.statusCode = 422;
        event.res.end(JSON.stringify({msg: 'Неверный тип или размер файла превышен'}));

    } else {

        try {

            await schema.validate({
                added,
            });

            await fileSchema.validate({
                file: files.file
            });

            added.slug = slugify(added.name, {strict: true, /*remove: /[*+~.()'"!:@]/g*/}).toLowerCase();

            added.id = added.slug;

            added.reviews = 0;

            added.userRate = 0;

            const str = added.name.toLowerCase()
                .replace(/[^\w\s]/gi, '')

            added.searchTerms = [];

            for (let i = 1; i < str.length + 1; i++) {
                added.searchTerms.push(str.substring(0, i));
            }

            await uploadImg(files.file, added, true, files.video);

            if(keys.length){
                added.images = [];
                await Promise.all(keys.map(async (key) => {
                    await uploadImg(files[key], added, false, null);
                }))
            }

            return {result: added};

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

async function uploadImg(file, added, mainImg = false, video){

    let uploadPath = file.filepath;
    let fileName = file.newFilename;
    let ext = fileName.substring(fileName.indexOf('.') + 1);

    let nameWithSalt = Date.now() + getRandom(10000000, 1) + (+new Date).toString(36).slice(-5);

    let newPath = setFilePath('/public/img/games/' + nameWithSalt + '.' + ext);
    let thumbnail = setFilePath('/public/img/games/thumbnails/'+ nameWithSalt + '.' + ext);
    let picPath = setFilePath('/public/img/games/pics/' + nameWithSalt + '.' + ext);
    let picThumbPath = setFilePath('/public/img/games/pics/thumbnails/' + nameWithSalt + '.' + ext);

    if(video){
        const fsPromises = fs.promises;
        let oldVideoPath = video.filepath;
        let videoFileName = video.newFilename;
        let videoExt = videoFileName.substring(videoFileName.indexOf('.') + 1);
        let videoNameWithSalt = Date.now() + getRandom(10000000, 1) + (+new Date).toString(36).slice(-5);
        let newVideoPath = setFilePath('/public/videos/' + videoNameWithSalt + '.' + videoExt);
        added.video = newVideoPath.substring(newVideoPath.indexOf('/videos'));

        await fsPromises.rename(oldVideoPath, newVideoPath);
    }

    if(mainImg){
        added.image = newPath.substring(newPath.indexOf('/img'));
        added.thumbnail = thumbnail.substring(thumbnail.indexOf('/img'));

        im.resize({
            srcPath: uploadPath,
            dstPath: newPath,
            width:   600,
        }, function(err, stdout, stderr){
            if (err) throw err;
        });


        im.resize({
            srcPath: uploadPath,
            dstPath: thumbnail,
            width:   240,
        }, function(err, stdout, stderr){
            if (err) throw err;
        });

        await db.collection('games').doc(added.slug).set(added);


    }else{
        added.images.push({pic: picPath.substring(picPath.indexOf('/img')),
            thumbnail: picThumbPath.substring(picThumbPath.indexOf('/img'))});

        im.resize({
            srcPath: uploadPath,
            dstPath: picPath,
            width:   1920,
        }, function(err, stdout, stderr){
            if (err) throw err;
        });

        im.resize({
            srcPath: uploadPath,
            dstPath: picThumbPath,
            width:   240,
        }, function(err, stdout, stderr){
            if (err) throw err;
        });

        await db.collection('games').doc(added.slug).update({images: added.images});
    }

}

