const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { isInVoiceChannel } = require('../../utils/voicechannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song in your channel!')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song you want to play')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        try {
            if (!isInVoiceChannel(interaction)) {
                return interaction.reply({
                    content: 'You need to be in a voice channel to use this command!',
                    ephemeral: true,
                });
            }

            await interaction.deferReply();

            const player = useMainPlayer();
            if (!player) {
                return interaction.followUp({
                    content: 'The music player is not available at the moment. Please try again later.',
                    ephemeral: true,
                });
            }

            const query = interaction.options.getString('query');
            if (!query || query.trim().length === 0) {
                return interaction.followUp({
                    content: 'Please provide a valid song name or URL.',
                    ephemeral: true,
                });
            }

            const searchResult = await player.search(query);
            if (!searchResult || !searchResult.hasTracks()) {
                return interaction.followUp({
                    content: 'No results found for your query!',
                    ephemeral: true,
                });
            }

            const Conf = (await import('conf')).default;
            const config = new Conf({ projectName: 'volume' });
            const volume = config.get('volume') || 40;

            await player.play(interaction.member.voice.channel.id, searchResult, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        client: interaction.guild?.members.me,
                        requestedBy: interaction.user.username,
                    },
                    leaveOnEmptyCooldown: 300000,
                    leaveOnEmpty: true,
                    leaveOnEnd: false,
                    bufferingTimeout: 0,
                    volume,
                },
            });

            const embed = new EmbedBuilder()
                .setTitle('🎶 Now Playing')
                .setDescription(`**[${searchResult.tracks[0].title}](${searchResult.tracks[0].url})**`)
                .setThumbnail(searchResult.tracks[0].thumbnail)
                .addFields(
                    { name: 'Duration', value: searchResult.tracks[0].duration, inline: true },
                    { name: 'Requested by', value: interaction.user.username, inline: true },
                )
                .setColor('Blurple')
                .setFooter({ text: 'Enjoy your music!' })
                .setTimestamp();

            await interaction.followUp({ embeds: [embed] });

        } catch (error) {
            console.error('Command execution error:', error);
            await interaction.reply({
                content: 'There was an error while processing your request: ' + error.message,
                ephemeral: true,
            });
        }
    },
};
