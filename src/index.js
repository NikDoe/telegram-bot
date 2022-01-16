const tbot = require('node-telegram-bot-api');
const config = require('./config');
const helper = require('./helper');

helper.logStart()

const bot = new tbot(config.TOKEN, {
    polling: true
})

bot.on('message', msg => {
    console.log('Всё работает!', msg.from.first_name);
})