module.exports = {
    logStart(){
        console.log('Бот запущен...')
    },

    getChatId(message) {
        return message.chat.id
    },
}