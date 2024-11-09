const { SlashCommandBuilder } = require('@discordjs/builders');
const { useQueue } = require('discord-player');
const { isInVoiceChannel } = require('../../utils/voicechannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Change the volume!')
        .addIntegerOption(option => 
            option.setName('volume')
                .setDescription('Number between 0-200')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
        if (!isInVoiceChannel(interaction)) {
                return await interaction.reply({
                    content: 'You need to be in a voice channel to use this command!',
                    ephemeral: true,
                });
            }

        const { default: Conf } = await import('conf');

        await interaction.deferReply();

        let volume = interaction.options.getInteger('volume');
        volume = Math.max(0, volume);  // Ensure volume is at least 0
        volume = Math.min(200, volume); // Ensure volume doesn't exceed 200

        // Set the general volume (persisted)
        const config = new Conf({ projectName: 'volume' });
        config.set('volume', volume);

        // Set the volume of the current queue
        const queue = useQueue(interaction.guild.id);
        const inVoiceChannel = isInVoiceChannel(interaction);

        if (inVoiceChannel && queue && queue.currentTrack) {
            queue.node.setVolume(volume);
        }

        return void interaction.followUp({
            content: `🔊 | Volume set to ${volume}!`,
        });
        } catch (err) {
            console.log(err);
        }
    },
};
