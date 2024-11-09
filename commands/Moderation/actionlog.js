const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const Log = require('../../models/Log.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('actionlog')
        .setDescription('Set a channel to output logs')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Set a channel to output logs')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to log command usage.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove the log channel')
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'You need the `Administrator` permission to execute this command.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add': {
                const channel = interaction.options.getChannel('channel');
                const channelId = channel.id;
                const guildId = interaction.guild.id;

                // Check if the selected channel is a text channel
                if (channel.type !== ChannelType.GuildText) {
                    return interaction.reply({ content: 'Please select a valid text channel.', ephemeral: true });
                }

                await interaction.deferReply({ ephemeral: true });

                try {
                    let log = await Log.findOne({ guildId });
                    if (!log) {
                        log = new Log({ guildId, channelId });
                    } else {
                        log.previousChannelId = log.channelId; // Store previous channel
                        log.channelId = channelId;
                    }

                    await log.save();

                    const successEmbed = new EmbedBuilder()
                        .setTitle('Log Channel Added')
                        .setDescription(`Log channel has been set to <#${channelId}>`)
                        .setColor('Green')
                        .setTimestamp();

                    interaction.editReply({ embeds: [successEmbed] });
                } catch (error) {
                    console.error(`Error setting log channel: ${error}`);
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('An error occurred while setting the log channel.')
                        .setColor('Red')
                        .setTimestamp();

                    interaction.editReply({ embeds: [errorEmbed] });
                }
                break;
            }

            case 'remove': {
                const guildId = interaction.guild.id;

                await interaction.deferReply({ ephemeral: true });

                try {
                    // Delete the log document for the guild
                    await Log.deleteOne({ guildId });

                    const successEmbed = new EmbedBuilder()
                        .setTitle('Log Channel Removed')
                        .setDescription('Log channel successfully removed.')
                        .setColor('Yellow')
                        .setTimestamp();

                    interaction.editReply({ embeds: [successEmbed] });
                } catch (error) {
                    console.error(`Error removing log channel: ${error}`);
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('An error occurred while removing the log channel.')
                        .setColor('Red')
                        .setTimestamp();

                    interaction.editReply({ embeds: [errorEmbed] });
                }
                break;
            }
        }
    },
};
