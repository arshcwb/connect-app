import dotenv from "dotenv"
dotenv.config({
    path: "../.env"
})


import app from "./app.js"
import {connectDB} from "./db/index.js"
const PORT = process.env.PORT || 6000

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at: ${PORT}`)
    })
}).catch(err => {
    console.log("Failed to connect to DB: ", err)
    process.exit(1)
})