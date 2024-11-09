const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { isInVoiceChannel } = require('../../utils/voicechannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('View the current song queue.'),
    async execute(interaction) {
        const inVoiceChannel = isInVoiceChannel(interaction);
        if (!inVoiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const queue = useQueue(interaction.guild.id);
        if (queue && queue.tracks.data.length > 0) {
            const trimString = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);

            let queueStr = queue.tracks.data.map((track, index) => {
                return `\`${index + 1}.\` **[${track.title}](${track.url})** by *${track.author}* [${track.duration}]`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('🎶 Now Playing')
                .setDescription(`**[${queue.currentTrack.title}](${queue.currentTrack.url})** by *${queue.currentTrack.author}*`)
                .addFields(
                    { name: 'Upcoming Songs', value: trimString(queueStr, 1024) || 'No upcoming songs!', inline: false },
                    { name: 'Total Songs in Queue', value: `${queue.tracks.data.length}`, inline: true }
                )
                .setThumbnail(queue.currentTrack.thumbnail)
                .setColor('Blurple')
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } else {
            return interaction.reply({ content: 'There are no songs in the queue!', ephemeral: true });
        }
    },
};
