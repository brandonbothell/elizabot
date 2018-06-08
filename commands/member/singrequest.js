const commando = require('discord.js-commando');
const Util = require('discord.js')
const oneLine = require('common-tags').oneLine;
const stripIndents = require('common-tags').stripIndents;
const { client, queue } = require('../../bot.js')
const ytdl = require('ytdl-core')
const YouTube = require('simple-youtube-api')
const { youtubeKey } = require('../../config')
const youtube = new YouTube(youtubeKey)
const ec = require('embed-creator')

module.exports = class PlayCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'singrequest',
      aliases: ['play'],
      group: 'member',
      memberName: 'play',
      description: 'Add a song to the Eliza-queue.',
      details: oneLine`
                This command is used to add a song to the current Eliza-queue
                of songs.
			`,
      examples: ['play [youtube link or search term]'],
      guildOnly: true,

      args: [
        {
          key: 'user',
          label: 'user to request to sing',
          prompt: 'Who would you like to request to sing?',
          type: 'user',
          infinite: false
        },
        {
          key: 'link',
          label: 'youtube link or term',
          prompt: 'What song would you like to queue?',
          type: 'string',
          infinite: false
        }
      ]
    });
  }

  async run(msg, { link, user }) {
    const url = link ? link.replace(/<(.+)>/g, '$1') : ''
    const searchString = link
    const userQueue = queue.get(user.id);

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      msg.channel.send(`🆘 Playlists aren't supported.`)
      return msg.delete()
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;
          let realDesc = stripIndents`
            ${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}`
          msg.channel.send(ec(
            "#4286F4", { "name": msg.author.username, "icon_url": client.user.displayAvatarURL, "url": null }, 'Song Selection:', realDesc,
            [],
            { "text": `Please provide a value to select one of the search results ranging from 1-10.`, "icon_url": null },
            { "thumbnail": null, "image": null }, false
          ))
          // eslint-disable-next-line max-depth
          try {
            var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
              maxMatches: 1,
              time: 10000,
              errors: ['time']
            });
          } catch (err) {
            console.error(err);
            msg.channel.send('No or invalid value entered, cancelling video selection.')
            try {
              return msg.delete()
            } catch (err) {
              return
            }
          }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          msg.channel.send('🆘 I could not obtain any search results.')
          return msg.delete()
        }
      }
      handleVideo(video, user, msg)
      try {
        user.send(`**${msg.author.username}** has requested for you to sing **${Util.escapeMarkdown(video.title)}** in ${msg.guild.name}.`)
      } catch (err) {

      }
      return msg.delete()
    }

    async function handleVideo(video, user, msg) {
      const userQueue = queue.get(user.id);
      const song = {
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`,
      };
      if (!userQueue) {
        const queueConstruct = {
          songs: [],
          nowSinging: 'Nothing'
        };
        queue.set(user.id, queueConstruct);
    
        queueConstruct.songs.push(song);
      } else {
        userQueue.songs.push(song);
      }
      return msg.channel.send(`✅ **${song.title}** has been added to the Eliza-Queue!`);
    }
  }
};
