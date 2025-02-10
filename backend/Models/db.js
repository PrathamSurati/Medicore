const mongoose = require('mongoose');

const mongo_url = "mongodb+srv://prathamsurati27:LwAZmDepzLJxO1Gd@interndata.mc7mx.mongodb.net/internData";

mongoose.connect(mongo_url)
    .then(() => {
        console.log('MongoDB Connected...');
    }).catch((err) => {
        console.log('MongoDB Connection Error: ', err);
    })