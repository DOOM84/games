import getRandom from "~/helpers/getRandom";
import setFilePath from "~/helpers/setFilePath";

export default (newFilename, folder, forceName = null) => {

    let uploadedName;

    if(forceName){

        uploadedName = forceName

    }else{

        let ext = newFilename.substring(newFilename.lastIndexOf('.') + 1);

        let salt = (+new Date).toString(36).slice(-5) + getRandom(1000000, 0);

        uploadedName = Date.now() + salt + '.' + ext
    }

    return setFilePath(folder + uploadedName);

}


