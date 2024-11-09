const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clean')
        .setDescription('Cleanup messages by Eclipse')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'You need to input a number between 1 and 100.', ephemeral: true });
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const messages = await interaction.channel.messages.fetch({ limit: amount });
        const botMessages = messages.filter(msg => msg.author.id === interaction.client.user.id);

        await interaction.channel.bulkDelete(botMessages, true).catch(error => {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to delete messages in this channel!', ephemeral: true });
        });

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle('Clean Command Executed')
            .setDescription(`Successfully deleted ${botMessages.size} messages.`)
            .setTimestamp()

        interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
