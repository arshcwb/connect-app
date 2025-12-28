import mongoose from "mongoose"

const friendSchema = new mongoose.Schema(
  {
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: v => v.length === 2
    }
  },
  { timestamps: true }
);

friendSchema.index({ users: 1 }, { unique: true });

export default mongoose.model("Friend", friendSchema);
