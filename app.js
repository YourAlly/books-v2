const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.static('static'));

const urlencoder = express.urlencoded({extended: true});
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/test', 
    { useNewUrlParser: true, useUnifiedTopology: true,
        useCreateIndex: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected To Database');
});

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true
    }
});

const reviewSchema = new mongoose.Schema({
    review: String,
    book: bookSchema
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: [1, 'Should at least contain one character!'],
        unique: true,
        maxlength: [24, 'Length should not exist 24 characters!'],
    },
    password: {
        type: String,
        required: true,
        minlength: [5, 'Should at least be 5 characters long!'],
    },
    reviews: [reviewSchema]
});

var logged_in = null;
const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Review = mongoose.model('Review', reviewSchema);


app.listen(PORT, ()=>{
    console.log('Server Started');
});


// index route
app.get('/', (req, res)=>{
    if (!logged_in){
        res.redirect('/login');
    }
});


// login route
app.get('/login', (req, res)=>{
    if (logged_in){
        res.redirect('/');
    }
    else{
        res.sendFile(__dirname + 'templates/login.html')
    }
});

app.post('/login', urlencoder, (req, res)=>{
    username = req.body.username;
    password = req.body.password;
    User.findOne({username: username, password: password}, (err, user)=>{
        if (err){
            res.redirect('/login');
        } else {
            logged_in = user.username;
            res.redirect('/');
        }
    });
    
});


// register route
app.get('/register', (req, res)=>{

});