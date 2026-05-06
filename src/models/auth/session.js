import mongoose from "mongoose";

const userSession = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const User = mongoose.model("session", userSession);

export default User