require('dotenv').config()

const express = require('express')

const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


app.use(bodyParser.json())

// CONNECTION EVENTS
const uri = process.env.MONGODB_URI


mongoose.connect(uri, { useNewUrlParser: true })
    .then(() => console.log('Connected!'))

// When successfully connected
mongoose.connection.on('connected', function() {
    console.log('Mongoose default connection open ');
});

// If the connection throws an error
mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ');
});


//?user Schema
const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    age: Number
}, {
    timestamps: true
})

//?model
const User = mongoose.model('User', userSchema)


//?ApI to check connection
app.get('/', (req, res) => {
    res.json({ mesaage: 'Welcome to my app' })
})


//?API to create a user
app.post('/users', async(req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)
        const password = hash
        const userObj = {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            age: req.body.age,
            password: password
        }
        const user = new User(userObj)
        await user.save()
        res.status(201).json(user)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Something is wrong' })
    }
})

app.post('/users/login', async(req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email: email })
        if (!user) {
            res.status(401).json({ message: 'User not found' })
        } else {
            const isValidPassword = await bcrypt.compare(password, user.password)
            if (!isValidPassword) {
                res.status(401).json({ message: 'Password is wrong' })
            } else {
                const token = jwt.sign({ email: user.email, id: user._id }, 'secret')
                const userObj = user.toJSON()
                userObj['accessToken'] = token
                res.status(200).json(userObj)
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something is wrong' })
    }
})

app.get('/users', async(req, res) => {
    try {
        const users = await User.find({})
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: 'Something is wrong' })

    }
})

app.get('/users/:id', async(req, res) => {
    try {
        const id = req.params.id
        const user = await User.findById(id)
        if (user) {
            res.json(user)
        } else {
            res.status(404).json({ message: 'User not found' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something is wrong' })

    }
})

app.put('/users/:id', async(req, res) => {
    try {
        const id = req.params.id
        const body = req.body
        const user = await User.findByIdAndUpdate(id, body, { new: true })
        if (user) {

            res.json(user)
        } else {
            res.status(404).json({ message: 'User not found' })

        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something is wrong' })
    }
})

app.delete('/users/:id', async(req, res) => {
    try {
        const id = req.params.id
        const user = await User.findByIdAndDelete(id)
        if (user) {
            res.json(user)
        } else {
            res.status(404).json({ message: 'User not found' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something is wrong' })
    }
})

const port = process.env.PORT
app.listen(port, () => {
    console.log(`The app is running on port ${port}`)
})