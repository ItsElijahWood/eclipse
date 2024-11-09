const { SlashCommandBuilder } = require('@discordjs/builders');
const { useQueue } = require('discord-player');
const { isInVoiceChannel } = require("../../utils/voicechannel");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the queue!'),
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

        try {
            queue.tracks.shuffle();
            const trimString = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
            return interaction.followUp({
                embeds: [
                    {
                        title: 'Queue Shuffled',
                        description: trimString(
                            `The current song playing is 🎶 | **${queue.currentTrack.title}**! \n 🎶 | ${queue.tracks.size} tracks in the queue.`,
                            4095,
                        ),
                    },
                ],
            });
        } catch (error) {
            console.log(error);
            return interaction.followUp({
                content: '❌ | Something went wrong!',
            });
        }
    },
};
