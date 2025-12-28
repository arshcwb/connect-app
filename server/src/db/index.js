import mongoose from "mongoose";

export const connectDB = async () => {
        try {
            const connection = await mongoose.connect(process.env.MONGO_URI)

            console.log(`MongoDB connect: ${connection.connection.host}`)
        } catch (error) {
            throw error
        }
}
