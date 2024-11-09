const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, CommandInteraction, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const Verification = require('../../models/Verification');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription('Subcommands for setting up and removing the verification system.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Setup verification system.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel where the verification message will be sent.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText) // Ensure this method is correct for your version
                )
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to be assigned upon verification.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove verification system.')
        ),

    async execute(interaction) {
        if (!(interaction instanceof CommandInteraction)) return;

        try {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'add') {
                const channel = interaction.options.getChannel('channel');
                const role = interaction.options.getRole('role');

                if (channel.type !== ChannelType.GuildText) {
                    if (!interaction.replied) {
                        await interaction.reply({ content: 'Please select a text channel.', ephemeral: true });
                    }
                    return;
                }

                // Save the verification setup in the database
                await Verification.updateOne(
                    { guildId: interaction.guildId },
                    { channelId: channel.id, roleId: role.id },
                    { upsert: true }
                );

                const embed = new EmbedBuilder()
                    .setTitle('Verification Setup')
                    .setDescription('Click the button below to verify your account.')
                    .setColor('Blurple')
                    .setFooter({ text: 'Verification System' });

                // Send verification message with button
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('verify')
                            .setLabel('Verify')
                            .setStyle(ButtonStyle.Primary)
                    );

                await channel.send({
                    embeds: [embed],
                    components: [row]
                });

                if (!interaction.replied) {
                    await interaction.reply({ content: 'Verification system has been set up.', ephemeral: true });
                }

            } else if (subcommand === 'remove') {
                // Remove verification system
                await Verification.deleteOne({ guildId: interaction.guildId });
                if (!interaction.replied) {
                    await interaction.reply({ content: 'Verification system has been removed.', ephemeral: true });
                }
            }
        } catch (error) {
            console.error('Error handling verification command:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error while executing the command.', ephemeral: true });
            }
        }
    }
}
