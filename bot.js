require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const Structure = require('./structure');

const bot = new TelegramBot(process.env.TOKEN, { polling: true });
const admins = new Structure('admins.json');
const bannedStickers = new Structure('banned_stickers.json');

bannedStickers.load();
admins.load();
// const admins = ;

function isPossibleToSend(msg) {
  if (admins.data.indexOf(msg.from.id) !== -1) {
    if (['chat', 'supergroup'].indexOf(msg.chat.type) !== -1) {
      return true;
    } else {
      bot.sendMessage(msg.chat.id, 'Avialable only in chats and superchats');
    }
  } else {
    bot.sendMessage(msg.chat.id, 'You do not have the rights to do this');
  }

  return false;
}

bot.on('sticker', (msg) => {
  if (bannedStickers.data.indexOf(msg.sticker.file_id) !== -1 || bannedStickers.data.indexOf(msg.sticker.set_name) !== -1) {
    bot.deleteMessage(msg.chat.id, msg.message_id)
  }
});

bot.onText(/\/admin@user_call_bot/, (msg) => {
  if (isPossibleToSend(msg)) {
    if (msg.reply_to_message) {
      if (msg.reply_to_message.from) {
        if (!msg.reply_to_message.from.is_bot) {
          if (admins.data.indexOf(msg.reply_to_message.from.id) === -1) {
            admins.data.push(msg.reply_to_message.from.id);
            admins.save();

            bot.sendMessage(msg.chat.id, 'User added to admin group');
          } else {
            bot.sendMessage(msg.chat.id, 'User alredy in admin group');
          }
        } else {
          bot.sendMessage(msg.chat.id, 'Cannot add bots in admin group');
        }
      } else {
        bot.sendMessage(msg.chat.id, 'Cannot find user in replied message');
      }
    } else {
      bot.sendMessage(msg.chat.id, 'Reply on user message to dismiss him from admin group');
    }
  }
});

bot.onText(/\/dismiss@user_call_bot/, (msg) => {
  console.log(admins.data);

  if (isPossibleToSend(msg)) {
    if (msg.reply_to_message) {
      if (msg.reply_to_message.from) {
        if (!msg.reply_to_message.from.is_bot) {
          const userIdIndex = admins.data.indexOf(msg.reply_to_message.from.id);

          if (userIdIndex !== -1) {
            admins.data.splice(userIdIndex, 1);
            admins.save();

            bot.sendMessage(msg.chat.id, 'User dismissed from admin group');
          } else {
            bot.sendMessage(msg.chat.id, 'User are not in admin group yet');
          }
        } else {
          bot.sendMessage(msg.chat.id, 'Bots are not in admin group');
        }
      } else {
        bot.sendMessage(msg.chat.id, 'Cannot find user in replied message');
      }
    } else {
      bot.sendMessage(msg.chat.id, 'Reply on user message to dismiss him from admin group');
    }
  }
});

bot.onText(/\/ban@user_call_bot/, (msg) => {
  console.log(msg);

  if (isPossibleToSend(msg)) {
    if (msg.reply_to_message) {
      if (msg.reply_to_message.sticker) {
        if (msg.reply_to_message.sticker.set_name) {
          bannedStickers.data.push(msg.reply_to_message.sticker.set_name);
          bannedStickers.save();

          bot.sendMessage(msg.chat.id, 'Sticker pack was banned');
        } else {
          bannedStickers.data.push(msg.reply_to_message.sticker.file_id);
          bot.sendMessage(msg.chat.id, 'Sticker was banned');
        }
      } else {
        bot.sendMessage(msg.chat.id, 'Cannot find sticker in replied message');
      }
    } else {
      bot.sendMessage(msg.chat.id, 'Reply on sticker to ban it');
    }
  }
})

bot.onText(/\/call@user_call_bot (.+?) (\d+)/, (msg, match) => {
  console.log(msg);

  if (isPossibleToSend(msg)) {
    if (match[1].split(' ').every((item) => item[0] === '@')) {
      const [user, times] = [match[1], match[2]];

      const resend = (count) => {
        console.log({ count });
        bot.sendMessage(msg.chat.id, user).then((sendedMessage) => {
          setTimeout(() => {
            if (count > 1) {
              setTimeout(() => resend(count - 1), 500);
            }
          }, 100);
        });
      }

      resend(parseInt(times) || 5);
    } else {
      bot.sendMessage(msg.chat.id, 'Avialable only for mentions');
    }
  }
})