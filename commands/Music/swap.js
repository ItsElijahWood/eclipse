const { SlashCommandBuilder } = require('@discordjs/builders');
const { useQueue } = require('discord-player');
const { isInVoiceChannel } = require('../../utils/voicechannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('swap')
        .setDescription('Swap song positions in the queue!')
        .addIntegerOption(option =>
            option.setName('track1')
                .setDescription('The track number you want to swap')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('track2')
                .setDescription('The track number you want to swap')
                .setRequired(true)),
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
        
        const queueNumbers = [interaction.options.getInteger('track1') - 1, interaction.options.getInteger('track2') - 1];
        queueNumbers.sort((a, b) => a - b);
        if (queueNumbers[1] >= queue.getSize()) {
            return interaction.followUp({ content: '❌ | Track number greater than queue depth!' });
        }

        try {
            const track2 = queue.node.remove(queueNumbers[1]);
            const track1 = queue.node.remove(queueNumbers[0]);
            queue.node.insert(track2, queueNumbers[0]);
            queue.node.insert(track1, queueNumbers[1]);
            return interaction.followUp({
                content: `✅ | Swapped **${track1.title}** & **${track2.title}**!`,
            });
        } catch (error) {
            console.error(error);
            return interaction.followUp({
                content: '❌ | Something went wrong!',
            });
        }
    },
};
