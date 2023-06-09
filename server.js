const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())


//?ApI to check connection
app.get('/', (req, res) => {
    res.json({ mesaage: 'Welcome to my app' })
})

let users = []
let lastId = 0

//?API to create a user
app.post('/users', (req, res) => {
    const user = req.body
    user.id = ++lastId
    users.push(user)
    res.status(201).json({ mesaage: 'Welcome to our app' })
})

app.get('/users', (req, res) => {
    res.json(users)
})

app.get('/users/:id', (req, res) => {
    const id = req.params.id
    const user = users.find((u) => u.id == id)
    if (user) {
        res.json(user)
    } else {
        res.status(404).json({ message: 'User not found' })
    }
})

app.put('/users/:id', (req, res) => {
    const id = req.params.id
    const body = req.body
    const user = users.find((u) => u.id == id)
    if (user) {
        user.fname = body.fname
        user.lname = body.lname
        res.json(user)
    } else {
        res.status(404).json({ message: 'User not found' })

    }
})

app.delete('/users/:id', (req, res) => {
    const id = req.params.id
    const userIndex = users.findIndex((u) => u.id == id)
    if (userIndex) {
        users.splice(userIndex, 1)
        res.json(users)
    } else {
        res.status(404).json({ message: 'User not found' })
    }
})

const port = 6000
app.listen(port, () => {
    console.log(`The app is running on port ${port}`)
})