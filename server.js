require('dotenv').config()

const express = require('express')

const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())

// CONNECTION EVENTS
const uri = process.env.MONGODB_URI
const mongoose = require('mongoose');

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
        const user = new User(req.body)
        await user.save()
        res.status(201).json(user)
    } catch (error) {
        console.error(error)
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