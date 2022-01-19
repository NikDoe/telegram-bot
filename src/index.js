const tbot = require('node-telegram-bot-api');
const mongoose =  require('mongoose')
const config = require('./config');
const helper = require('./helper');
const kb = require('./keyboard-buttons');
const keyboard = require('./keyboard');
const database =  require('../db.json');
const geolib = require('geolib')
const _ = require('lodash')

helper.logStart()

mongoose.Promise = global.Promise

mongoose.connect(config.DB_URL, {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))

require('./models/film.model');
require('./models/cinema.model');
require('./models/user.model')

const Film = mongoose.model('films');
const Cinema = mongoose.model('cinemas');
const User = mongoose.model('users');

// database.films.forEach(f => new Film(f).save())
// database.cinemas.forEach(c => new Cinema(c).save())

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
            bot.sendMessage(chatId, `Отправить местоположение`, {
                reply_markup: {
                    keyboard: keyboard.cinemas
                }
            })
            break
        case kb.back:
            bot.sendMessage(chatId, `Что хотите посмотреть?`, {
                reply_markup: {keyboard: keyboard.home}
            })
            break
    }

    if (msg.location) {
        sendCinemasInCords(chatId, msg.location);
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

// find film by id
bot.onText(/\/f(.+)/, (msg, [source, match]) => {
    const filmUuid = helper.getItemUuid(source);
    const chatId = helper.getChatId(msg);

    Film.findOne({uuid: filmUuid}).then(film => {
        const caption = `Название: ${film.name}\nГод: ${film.year}\nРейтинг: ${film.rate}\nДлинна: ${film.length}\nСтрана: ${film.country}`;

        bot.sendPhoto(chatId, film.picture, {
            caption,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Добавить в избранное',
                            callback_data: film.uuid
                        },
                        {
                            text: 'Показать кинотеатры',
                            callback_data: film.uuid
                        }
                    ],
                    [
                        {
                            text: `Кинопоиск: ${film.name}`,
                            url: film.link
                        }
                    ]
                ]
            }
        })
    })
})

// find cinema by id
bot.onText(/\/c(.+)/, (msg, [source, match]) => {
    const cinemaUuid = helper.getItemUuid(source)

    Cinema.findOne({uuid: cinemaUuid}).then(cinema => {
        bot.sendMessage(helper.getChatId(msg), `Кинотеатр - ${cinema.name}`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Сайт',
                            url: cinema.url
                        },
                        {
                            text: `Показать на карте`,
                            callback_data: JSON.stringify(cinema.uuid)
                        }
                    ],
                    [
                        {
                            text: `Показать фильмы`,
                            callback_data: JSON.stringify(cinema.films)
                        }
                    ]
                ]
            }
        }).catch(err => console.log(err))
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

// find cinemas with cords
function sendCinemasInCords(chatId, location) {

    Cinema.find({}).then(cinemas => {

        cinemas.forEach(c => {
            c.distance = geolib.getDistance(location, c.location) / 1000
        })

        cinemas = _.sortBy(cinemas, 'distance')

        const html = cinemas.map((c, i) => {
            return `<b>${i + 1}</b> ${c.name}. <em>Расстояние</em> - <strong>${c.distance}</strong> км. /c${c.uuid}`
        }).join('\n')

        sendHtml(chatId, html, 'home')
    })
}
