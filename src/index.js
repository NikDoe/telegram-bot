const tbot = require('node-telegram-bot-api');
const mongoose =  require('mongoose')
const config = require('./config');
const helper = require('./helper');
const kb = require('./keyboard-buttons')
const keyboard = require('./keyboard')

helper.logStart()

mongoose.Promise = global.Promise

mongoose.connect(config.DB_URL, {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))

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