const { EmbedBuilder } = require('discord.js');
const Log = require('../../../models/Log.js');

module.exports = (client) => {
    client.on('messageDelete', async message => {
        if (message.partial) {
            try {
                await message.fetch(); // Fetch full message details if it's a partial message
            } catch (error) {
                console.error('Error fetching partial message:', error);
                return;
            }
        }

        if (!message.guild) return; // Ensure it's in a guild (ignore DMs)

        const log = await Log.findOne({ guildId: message.guild.id });
        if (log) {
            try {
                const channelName = message.channel.name;
                const channelId = message.channelId;
                const messageId = message.id;
                const guildId = message.guild.id;
                const logChannel = await client.channels.fetch(log.channelId);
                const channelLink = `<#${channelId}>`;
                const messageContent = message.content ? message.content : "No content (possibly an embed or file)";
                const authorTag = message.author ? message.author.tag : "Unknown User";
                const authorAvatar = message.author ? message.author.displayAvatarURL() : null;
                const messageCreatedAt = message.createdAt.toUTCString();

                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor("Blurple")
                        .setTitle('Message Deleted')
                        .setDescription(`A message was deleted in ${channelLink}`)
                        .addFields(
                            { name: 'Author', value: authorTag, inline: true },
                            { name: 'Channel', value: `${channelName}`, inline: true },
                            { name: 'Message Content', value: `\`${messageContent}\``, inline: false },
                            { name: 'Message Created At', value: messageCreatedAt, inline: true }
                        )
                        .setAuthor({ name: authorTag, iconURL: authorAvatar })
                        .setTimestamp()
                        .setFooter({ text: `Message ID: ${messageId}` });

                    await logChannel.send({ embeds: [logEmbed] });
                }
            } catch (error) {
                console.error('Error logging deleted message:', error);
            }
        }
    });
};
