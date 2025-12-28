import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadCloudinary = async (localPath) => {
    try{
        if(!localPath) return null
        const uploadInstance = await cloudinary.uploader.upload(
            localPath,
            {resource_type: "auto"}
        )

        fs.unlinkSync(localPath)

        return{
            url: uploadInstance.secure_url,
            public_id: uploadInstance.public_id
        }
    }
    catch(error){
        if(fs.existsSync(localPath)) fs.unlinkSync(localPath)
        console.log("File Upload error: ", error)
        return null
    }
}
export {uploadCloudinary}