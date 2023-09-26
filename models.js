import mongoose from "mongoose";

let models = {};

// Copy your mongodb connection string here
// and make sure you are connecting to the right database in it
await mongoose.connect(
    "mongodb+srv://peijiezheng:peijie36@cluster0.riwtaaa.mongodb.net/websharer?retryWrites=true&w=majority"
);

//Create schemas and models to connect to the mongodb collections
const postSchema = new mongoose.Schema({
    url: String,
    username: String,
    description: String,
    created_date: Date,
    likes: [String],
});

const commentSchema = new mongoose.Schema({
    username: String,
    comment: String,
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    created_date: Date,
});

const userInfoSchema = new mongoose.Schema({
    username: String,
    userBio: String
})

models.Post = mongoose.model("Post", postSchema);
models.Comment = mongoose.model("Comment", commentSchema);
models.userInfo = mongoose.model("UserInfo", userInfoSchema);

export default models;
