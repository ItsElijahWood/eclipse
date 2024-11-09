const { SlashCommandBuilder } = require('@discordjs/builders');
const { useQueue } = require('discord-player');
const { isInVoiceChannel } = require('../../utils/voicechannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop all songs in the queue!'),
    async execute(interaction) {
        const inVoiceChannel = isInVoiceChannel(interaction);
        if (!inVoiceChannel) {
            return interaction.reply({ content: '❌ | You need to be in a voice channel!', ephemeral: true });
        }

        await interaction.deferReply();
        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.currentTrack) {
            return interaction.followUp({ content: '❌ | No music is being played!' });
        }

        queue.node.stop();
        return interaction.followUp({ content: '🛑 | Stopped the player!' });
    },
};
