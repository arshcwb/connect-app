import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    content: {
      type: String,
      trim: true,
      maxlength: 3000
    },
    
    media: [
      {
        url: String,
        public_id: String,
        type: {
          type: String,
          enum: ["image", "video", "text"]
        }
      }
    ],

    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public"
    },

    likesCount: {
      type: Number,
      default: 0
    },

    commentsCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

export default mongoose.model("Post", postSchema)
