const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/Users')
const authenticateToken = require('../../middleware/auth')



const router = express.Router()

router.post('/', async(req, res) => {
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


router.post('/login', async(req, res) => {
    try {
        const { email, password, type, refreshToken } = req.body
        if (!type) {
            res.status(401).json({ message: 'Type is not define' })

        } else {
            if (type == 'email') {
                await handleEmailLogin(email, res, password);
            } else {
                handleRefreshLogin(refreshToken, res);
            }

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something is wrong with the server' })
    }
})

router.get('/profile', authenticateToken, async(req, res) => {
    try {
        const id = req.user.id
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

router.get('/', async(req, res) => {
    try {
        const users = await User.find({})
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: 'Something is wrong' })

    }
})

router.get('/:id', authenticateToken, async(req, res) => {
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

router.put('/:id', async(req, res) => {
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

router.delete('/:id', async(req, res) => {
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



module.exports = router


function handleRefreshLogin(refreshToken, res) {
    if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token is not define' });

    } else {
        jwt.verify(refreshToken, process.env.JWT_SECRET, async(err, payload) => {
            if (err) {
                res.status(401).json({ message: 'Unauthorized' });
            } else {
                const id = payload.id;
                const user = await User.findById(id);
                if (!user) {
                    res.status(401).json({ message: 'Unauthorized' });
                } else {
                    getUserTokens(user, res);
                }
            }
        });
    }
}

async function handleEmailLogin(email, res, password) {
    const user = await User.findOne({ email: email });
    if (!user) {
        res.status(401).json({ message: 'User not found' });
    } else {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Password is wrong' });
        } else {
            getUserTokens(user, res);
        }
    }
}

function getUserTokens(user, res) {
    const accessToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '2m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3m' });

    const userObj = user.toJSON();
    userObj['accessToken'] = accessToken;
    userObj['refreshToken'] = refreshToken;

    res.status(200).json(userObj);
}