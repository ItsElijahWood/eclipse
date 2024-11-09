const { SlashCommandBuilder } = require('@discordjs/builders');
const { QueueRepeatMode, useQueue } = require('discord-player');
const { isInVoiceChannel } = require('../../utils/voicechannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Sets loop mode')
        .addIntegerOption(option =>
            option.setName('mode')
                .setDescription('Loop type')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: QueueRepeatMode.OFF },
                    { name: 'Track', value: QueueRepeatMode.TRACK },
                    { name: 'Queue', value: QueueRepeatMode.QUEUE },
                    { name: 'Autoplay', value: QueueRepeatMode.AUTOPLAY }
                )),

    async execute(interaction) {
        try {
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
                return interaction.followUp({ content: '❌ | No music is being played!' });
            }

            const loopMode = interaction.options.getInteger('mode');
            queue.setRepeatMode(loopMode);

            const mode = loopMode === QueueRepeatMode.TRACK ? '🔂' :
                         loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶';

            return interaction.followUp({
                content: `${mode} | Updated loop mode!`,
            });
        } catch (error) {
            console.error('Error executing command:', error);
            return interaction.followUp({
                content: 'There was an error trying to execute that command: ' + error.message,
            });
        }
    },
};

