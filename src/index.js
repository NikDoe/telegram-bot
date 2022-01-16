const tbot = require('node-telegram-bot-api');
const mongoose =  require('mongoose')
const config = require('./config');
const helper = require('./helper');
const kb = require('./keyboard-buttons');
const keyboard = require('./keyboard');
const database =  require('../db.json');

helper.logStart()

mongoose.Promise = global.Promise

mongoose.connect(config.DB_URL, {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))

require('./models/film.model');

const Film = mongoose.model('films')

// database.films.forEach(f => new Film(f).save())

const bot = new tbot(config.TOKEN, {
    polling: true
})

bot.on('message', msg => {
    console.log('Всё работает!', msg.from.first_name);

    const chatId = helper.getChatId(msg)

    switch (msg.text) {
        case kb.home.favourite:
            break
        case kb.home.films:
            bot.sendMessage(chatId, `Выберите жанр`, {
                reply_markup: {keyboard: keyboard.films}
            })
            break
        case kb.film.random:
            sendFilmsByQuery(chatId, {})
            break
        case kb.film.action:
            sendFilmsByQuery(chatId, {type: 'action'})
            break
        case kb.film.comedy:
            sendFilmsByQuery(chatId, {type: 'comedy'})
            break
        case kb.home.cinemas:
            break
        case kb.back:
            bot.sendMessage(chatId, `Что хотите посмотреть?`, {
                reply_markup: {keyboard: keyboard.home}
            })
            break
    }
})

// start bot
bot.onText(/\/start/, msg => {
    const text = `Здравствуйте, ${msg.from.first_name}!\nВыберите команду для начала`
    bot.sendMessage(helper.getChatId(msg), text, {
        reply_markup: {
            keyboard: keyboard.home
        }
    })
})

// find all films by type
function sendFilmsByQuery(chatId, query) {
    Film.find(query).then(films => {
        const html = films.map((f, i) => {
            return `<b>${i + 1}</b> ${f.name} - /f${f.uuid}`
        }).join('\n')

        sendHtml(chatId, html, 'films')
    })
}

// helper. send bot html
function sendHtml(chatId, html, keyboardName = null) {
    const options = {
        parse_mode: 'HTML'
    }

    if (keyboardName) {
        options['reply_markup'] = {
            keyboard: keyboard[keyboardName]
        }
    }

    bot.sendMessage(chatId, html, options)
}
