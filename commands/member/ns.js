const commando = require('discord.js-commando')
const oneLine = require('common-tags').oneLine
const { queue } = require('./../../bot.js')

module.exports = class NowSingingCommand extends commando.Command {
  constructor (client) {
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
      args: [
        {
          key: 'user',
          label: 'user to view ns',
          prompt: 'Who would you like to check the status of?',
          type: 'user',
          infinite: false
        }
      ]
    })
  }

  async run (msg, { user }) {
    const userQueue = queue.get(user.id)
    if (!userQueue) {
      return msg.channel.send('There is nothing being sung.')
    }
    msg.channel.send(`🎶 Now singing: **${userQueue.nowSinging}**`)
    return msg.delete()
  }
}
