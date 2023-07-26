const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

const logger = require('../utils/logger')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
        .populate('blogs', { url: 1, title: 1, author: 1 })

    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    // tarkistetaan salasanan oikeellisuus
    // ei undefined tai null
    // Kopioidaan mongoosen tai mongoose-unique-validator validaation virheilmoitus
    // User validation failed: username: Path `username` is required.
    // - vähintään 3 merkkiä pitkä
    // Näitä on paljon, saisiko nämä jotenkin virheenkäsittelijä
    // middlewaren käsittelyyn?
    if (!username && !password) {
        logger.error(`Router Thrown Custom Validator Error:`)
        logger.error('User creation failed: data missing for required `username`, `password`.')
        return response.status(400).json({ error: 'User creation failed: data missing for required `username`, `password`.' })
    }
    if (!password) {
        logger.error(`Router Thrown Custom Validator Error:`)
        logger.error('User validation failed: password: Path `password` is required.')
        return response.status(400).json({ error: 'User validation failed: password: Path `password` is required.' })
    } else if (password.length < 3) {
        return response.status(400).json({ error: 'Password must have at least 3 characters'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

module.exports = usersRouter