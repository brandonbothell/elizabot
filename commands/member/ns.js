const commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
const { client, queue } = require('./../../bot.js')
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const { youtubeKey } = require('../../config')
const youtube = new YouTube(youtubeKey)

module.exports = class NowSingingCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'ns',
      aliases: ['nowsinging', 'current', 'song'],
      group: 'member',
      memberName: 'ns',
      description: 'See what song someone is currently singing.',
      details: oneLine`
                This command is used to see what song being sung
                in a certain server.
			`,
      examples: ['ns', 'song'],
      guildOnly: true,
    });
  }

  async run(msg) {
    const serverQueue = queue.get(msg.guild.id)
    if (!serverQueue) {
      return msg.channel.send('There is nothing playing.')
    }
    msg.channel.send(`🎶 Now singing: **${serverQueue.nowSinging}**`)
    return msg.delete()
  }
};
