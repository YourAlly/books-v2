const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
app.use(express.static('static'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1)
app.use(session({
    secret: 'awesome armadillo',
    cookie: { maxAge: 60000 }
}))

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

const User = mongoose.model('User', userSchema);
const Book = mongoose.model('Book', bookSchema);
const Review = mongoose.model('Review', reviewSchema);


app.listen(PORT, ()=>{
    console.log('Server Started');
});


// index route
app.get('/', (req, res)=>{
    if (!req.session.logged_in){
        res.redirect('/login');
    } else {
        res.render(__dirname + '/templates/index', {pageTitle: 'Index'});
    }
});


// login route
app.get('/login', (req, res)=>{
    if (req.session.logged_in){
        res.redirect('/');
    }
    else{
        res.render(__dirname + '/templates/form', {formName: 'Login'})
    }
});

app.post('/login', urlencoder, (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({username: username, password: password}, (err, user)=>{
        if (err){
            console.log(err);
            res.redirect('/login');
        } else {
            if(user){
                req.session.logged_in = user.username;
                res.redirect('/');
            } else {
                res.redirect('/login');
            }
        }
    });
    
});


// register route
app.get('/register', (req, res)=>{
    if (req.session.logged_in) {
        res.redirect('/');
    } else {
        res.render(__dirname + '/templates/form', {formName: 'Register'})
    }
});

app.post('/register', urlencoder, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        registered = new User({
            username: username,
            password: password
        })
        registered.save();
        res.redirect('/');

    } catch (error) {
        console.log(error);
        res.redirect('/register');
    }
    
});


// logout route
app.get('/logout', (req, res)=>{
    req.session.logged_in = null;
    res.redirect('/');
});