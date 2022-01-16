module.exports = {
    logStart(){
        console.log('Бот запущен...')
    },

    getChatId(message) {
        return message.chat.id
    },

    getItemUuid(source) {
        return source.substr(2, source.length)
    },
}