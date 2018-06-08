const commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
const stripIndents = require('common-tags').stripIndents;
const { client, queue } = require('./../../bot.js')
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const { youtubeKey } = require('../../config')
const youtube = new YouTube(youtubeKey)
const ec = require('embed-creator')

module.exports = class QueueCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      aliases: ['songs', 'eliza-queue'],
      group: 'member',
      memberName: 'queue',
      description: 'Lists every song in the current Eliza-Queue.',
      details: oneLine`
        This command is used to list every song currently
        in the Eliza-Queue.
			`,
      examples: ['queue', 'songs'],
      guildOnly: true,

      args: [
        {
          key: 'user',
          label: 'user',
          prompt: 'Who\'s queue would you like to look at?',
          type: 'user',
          infinite: false,
        },
        {
          key: 'pageArg',
          label: 'page',
          prompt: 'What page would you like to look at?',
          type: 'integer',
          infinite: false,
          default: 1
        }
      ]
    });
  }

  async run(msg, { pageArg, user }) {
    let pageNum = pageArg
    const userQueue = queue.get(user.id);
    if (!userQueue) {
      msg.channel.send('There is nothing to show here.');
      return msg.delete()
    }
    let songs = userQueue.songs.map(song => `**-** [${song.title}](${song.url})`)
    let pages = new Map()
    let page = 1
    for (let i = 0; i < songs.length; i++) {
      if (pages.has(page)) {
        pages.set(page, pages.get(page) + songs[i] + "\n")
      } else {
        pages.set(page, songs[i] + "\n")
      }
      if ((i + 1) % 10 == 0) {
        page = page + 1
      }
    }
    if (pages.get(pageNum) == undefined) {
      msg.channel.send("There aren't that many pages!")
      return msg.delete()
    }
    let realDesc = stripIndents`
			${pages.get(pageNum)}
			**Now singing:** ${userQueue.nowSinging}`
    msg.channel.send(ec(
      "#4286F4", { "name": msg.author.username, "icon_url": client.user.displayAvatarURL, "url": null }, `${user.username}'s Queue:`, realDesc,
      [],
      { "text": `Page ${pageNum}/${pages.size}. View different pages with ${msg.guild.commandPrefix}queue [number].`, "icon_url": null },
      { "thumbnail": null, "image": null }, false
    ))
    return msg.delete()
  }
};
