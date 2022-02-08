require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });
const admins = [742216747, 437699498];

bot.onText(/\/call@user_call_bot (.+)/, (msg, match) => {
  console.log(msg);

  if (admins.indexOf(msg.from.id) !== -1) {
    if (['chat', 'supergroup'].indexOf(msg.chat.type) !== -1) {
      if (match[1][0] === '@') {
        const [user, times] = match[1].split(' ');

        const resend = (count) => {
          console.log({ count });
          bot.sendMessage(msg.chat.id, user).then((sendedMessage) => {
            setTimeout(() => {
              bot.deleteMessage(msg.chat.id, sendedMessage.message_id).then(() => {
                if (count > 0) {
                  setTimeout(() => resend(count - 1), 500);
                }
              });
            }, 500);
          });
        }

        resend(parseInt(times) || 5);
      } else {
        bot.sendMessage(msg.chat.id, 'Avialable only for mentions');
      }
    } else {
      bot.sendMessage(msg.chat.id, 'Avialable only in chats and superchats');
    }
  } else {
    bot.sendMessage(msg.chat.id, 'You do not have the rights to do this')
  }
})