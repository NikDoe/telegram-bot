const tbot = require('node-telegram-bot-api');
const config = require('./config');
const helper = require('./helper');
const kb = require('./keyboard-buttons')
const keyboard = require('./keyboard')

helper.logStart()

const bot = new tbot(config.TOKEN, {
    polling: true
})

bot.on('message', msg => {
    console.log('Всё работает!', msg.from.first_name);

    switch (msg.text) {
        case kb.home.favourite:
            break
        case kb.home.films:
            break
        case kb.home.cinemas:
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