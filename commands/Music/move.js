const { SlashCommandBuilder, ApplicationCommandOptionType } = require('@discordjs/builders');
const { useQueue } = require('discord-player');
const { isInVoiceChannel } = require('../../utils/voicechannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move song position in the queue!')
        .addIntegerOption(option => 
            option.setName('track')
                .setDescription('The track number you want to move')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('position')
                .setDescription('The position to move it to')
                .setRequired(true)),

    async execute(interaction) {
        const inVoiceChannel = isInVoiceChannel(interaction);
        if (!inVoiceChannel) {
            return interaction.reply({
                content: '❌ | You need to be in a voice channel to use this command!',
                ephemeral: true
            });
        }

        await interaction.deferReply();
        const queue = useQueue(interaction.guild.id);

        if (!queue || !queue.currentTrack) {
            return interaction.followUp({
                content: '❌ | No music is being played!',
            });
        }

        const queueNumbers = [interaction.options.getInteger('track') - 1, interaction.options.getInteger('position') - 1];

        if (queueNumbers[0] >= queue.tracks.size || queueNumbers[1] >= queue.tracks.size) {
            return interaction.followUp({
                content: '❌ | Track number or position greater than queue depth!',
            });
        }

        try {
            const track = queue.node.remove(queueNumbers[0]);
            queue.node.insert(track, queueNumbers[1]);
            return interaction.followUp({
                content: `✅ | Moved **${track.title}**!`, // Assuming `track.title` provides the track name.
            });
        } catch (error) {
            console.error(error);
            return interaction.followUp({
                content: '❌ | Something went wrong!',
            });
        }
    },
};
