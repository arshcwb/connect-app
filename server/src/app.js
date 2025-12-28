import {fileURLToPath} from "url"
import {dirname} from "path"
import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import bodyParser from "body-parser"
import cors from "cors"
import path from "path"
import cookieParser from "cookie-parser"


const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const app = express()

app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}))
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true
}));
app.use(cookieParser())
app.use(morgan("common"))
app.use(bodyParser.json({limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}))
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))


import userRouter from "./routes/user.route.js"
app.use("/api/v1/user", userRouter)

import friendRouter from "./routes/friend.route.js"
app.use("/api/v1/friend", friendRouter)

import postRouter from "./routes/post.route.js"
app.use("/api/v1/post", postRouter)

import likeRouter from "./routes/like.route.js"
app.use("/api/v1/like", likeRouter)

import conversationRouter from "./routes/conversation.route.js"
app.use("/api/v1/conversation", conversationRouter)

import commentRouter from "./routes/comment.route.js"
app.use("/api/v1/comment", commentRouter)

import bookmarkRouter from "./routes/bookmark.route.js"
app.use("/api/v1/bookmark", bookmarkRouter)

import messageRouter from "./routes/message.route.js"
app.use("/api/v1/message", messageRouter)

import notificationRouter from "./routes/notification.route.js"
app.use("/api/v1/notification", notificationRouter)

import feedRouter from "./routes/feed.route.js"
app.use("/api/v1/feed", feedRouter)


export default app
