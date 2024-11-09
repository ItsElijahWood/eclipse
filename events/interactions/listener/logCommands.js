const { EmbedBuilder } = require('discord.js');
const Log = require('../../../models/Log.js'); 

module.exports = (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const commandsToLog = ['purge', 'ban', 'slowmode'];

        if (commandsToLog.includes(interaction.commandName)) {
            const log = await Log.findOne({ guildId: interaction.guild.id });
            if (log) {
                try {
                    const channelName = interaction.channel.name; // Channel name
                    const channelId = interaction.channelId;
                    const messageId = interaction.id; // Message ID
                    const guildId = interaction.guildId;
                    const messageLink = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
                    const logChannel = await client.channels.fetch(log.channelId);
                    const channelLink = `<#${channelId}>`;

                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor("Blurple")
                            .setDescription(
                                `Used **${interaction.commandName}** command in ${channelLink}\n/${interaction.commandName} discord channel: ${channelId}\n\n[Jump to Message](${messageLink})`
                            )
                            .setAuthor({
                                name: interaction.member.displayName,
                                iconURL: interaction.user.displayAvatarURL(),
                            })
                            .setTimestamp();

                        await logChannel.send({ embeds: [logEmbed] });
                    }
                } catch (error) {
                    console.error('Error logging interaction:', error); // Add error logging
                }
            }
        }
    });
};
