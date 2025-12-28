import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            max: 50
        },
        middleName: {
            type: String,
            max: 50
        },
        lastName: {
            type: String,
            max: 50
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            min: 6,
            select: false
        },
        picture: {
            url: {type: String,
                default: ""
            },
            public_id: {
                type: String,
                default: ""
            }
        },
        bio : {
            type: String,
            default: ""
        },
        profileVisibility: {
            type: String,
            enum: ["public", "private"],
            default: "public"
        },
        location: {
            type: String
        },
        occupation: {
            type: String
        },
        refreshToken: {
            type: String,
            select: false
        }
    },
    {timestamps: true}
)

userSchema.pre("save", async function (){
    if(!this.isModified("password")) return

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordValid = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d"}
    )
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "20m"}
    )
}



const User = mongoose.model("User", userSchema)
export default User