const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message you want the bot to say')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You need the `ManageMessages` permission to execute this command.', ephemeral: true });
        }

        const message = interaction.options.getString('message');

        try {
            // Send the message directly to the channel
            await interaction.channel.send(message);

            // Acknowledge the command
            await interaction.reply({ content: 'Message sent!', ephemeral: true });
        } catch (error) {
            console.error(`Error sending message: ${error}`);
            await interaction.reply({ content: '❌ | An error occurred while sending the message.', ephemeral: true });
        }
    },
};
