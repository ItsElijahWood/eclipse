const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a specified number of messages from the channel (max 100).')
        .addIntegerOption(option =>
            option.setName('num')
                .setDescription('Number of messages to delete (between 2 and 100).')
                .setRequired(true)
                .setMinValue(2)
                .setMaxValue(100)
        ),
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: 'You need the `Manage Messages` permission to use this command.',
                ephemeral: true
            });
        }

        const deleteCount = interaction.options.getInteger('num');

        try {
            // Fetch messages to delete
            const fetched = await interaction.channel.messages.fetch({ limit: deleteCount });
            await interaction.channel.bulkDelete(fetched);

            // Confirmation embed
            const embed = new EmbedBuilder()
                .setTitle('Messages Purged')
                .setColor('#5865F2')  // Discord's blurple color
                .setDescription(`Successfully deleted **${deleteCount}** messages from this channel.`)
                .setFooter({ text: 'Purge Command Executed', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error deleting messages:', error);
            return interaction.reply({
                content: `Failed to delete messages due to: \`${error.message}\`.`,
                ephemeral: true
            });
        }
    },
};
