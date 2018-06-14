const commando = require('discord.js-commando')
const oneLine = require('common-tags').oneLine

module.exports = class SingCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'sing',
      aliases: ['singsong', 'next'],
      group: 'member',
      memberName: 'sing',
      description: 'Start singing a song. Also deletes it from the Eliza-queue.',
      details: oneLine`
                This command is used to remove a song from
                the Eliza-queue.
			`,
      examples: ['sing', 'next'],
      guildOnly: true
    })
  }

  async run (msg) {
    const userQueue = queue.get(msg.author.id)
    let song
    try {
      song = userQueue.songs[0]
      if (!song) {
        throw new Error('Oh no')
      }
    } catch (err) {
      queue.delete(msg.author.id)
      msg.channel.send('There are no songs to sing!')
      return msg.delete()
    }

    userQueue.nowSinging = song.title
    userQueue.songs.shift()
    msg.channel.send(`🎶 Start singing: **${song.title}**`)
    return msg.delete()
  }
}
