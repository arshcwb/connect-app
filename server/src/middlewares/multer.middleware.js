import multer from "multer"

const storage = multer.diskStorage({
    destination: function( _, file, cb){
        cb(null, "public/uploads")
    },
    filename: function( _, file, cb){
        cb(null, Date.now() + "_" + file.originalname)
    }
})

export const uploadMulter = multer({storage: storage, limits: {fileSize: 5*1024*1024}})
