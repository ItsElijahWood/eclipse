const { SlashCommandBuilder } = require('@discordjs/builders');
const { useQueue } = require('discord-player');
const { isInVoiceChannel } = require("../../utils/voicechannel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip a song!'),
    async execute(interaction) {
        const inVoiceChannel = isInVoiceChannel(interaction);
        if (!inVoiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
        }

        await interaction.deferReply();

        const queue = useQueue(interaction.guild.id);
        if (!queue || !queue.currentTrack) {
            return interaction.followUp({ content: '❌ | No music is being played!' });
        }

        const currentTrack = queue.currentTrack;

        const success = queue.node.skip();
        return interaction.followUp({
            content: success ? `✅ | Skipped **${currentTrack}**!` : '❌ | Something went wrong!',
        });
    },
};
