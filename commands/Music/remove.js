const { SlashCommandBuilder } = require('@discordjs/builders');
const { useQueue } = require('discord-player');
const { isInVoiceChannel } = require('../../utils/voicechannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the queue!')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('The queue number you want to remove')
                .setRequired(true)
        ),
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

        const number = interaction.options.getInteger('number') - 1;
        if (number >= queue.tracks.size || number < 0) {
            return interaction.followUp({ content: '❌ | Track number out of range!' });
        }

        const removedTrack = queue.node.remove(number);
        return interaction.followUp({
            content: removedTrack ? `✅ | Removed **${removedTrack}**!` : '❌ | Something went wrong!',
        });
    },
};
