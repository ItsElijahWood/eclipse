const { SlashCommandBuilder } = require('@discordjs/builders');
const { QueryType, useQueue, useMainPlayer } = require('discord-player');
const { isInVoiceChannel } = require('../../utils/voicechannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playtop')
        .setDescription('Play a song before the next in your channel!')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song you want to play')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            if (!isInVoiceChannel(interaction)) {
                return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
            }

            await interaction.deferReply();

            const player = useMainPlayer();
            const query = interaction.options.getString('query');
            const searchResult = await player.search(query, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO,
            }).catch(() => {});

            if (!searchResult || !searchResult.tracks.length) {
                return interaction.followUp({ content: 'No results were found!' });
            }

            const queue = useQueue(interaction.guild.id);

            try {
                if (!queue.connection) {
                    await queue.connect(interaction.member.voice.channel);
                }
            } catch {
                return interaction.followUp({ content: 'Could not join your voice channel!' });
            }

            await interaction.followUp({
                content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...`,
            });

            if (searchResult.playlist) {
                queue.node.insert(searchResult.tracks, 0);
            } else {
                queue.node.insert(searchResult.tracks[0], 0);
            }

            if (!queue.currentTrack) {
                await player.play();
            }
        } catch (error) {
            console.error('Error executing playtop command:', error);
            await interaction.followUp({
                content: 'There was an error trying to execute that command: ' + error.message,
            });
        }
    },
};
