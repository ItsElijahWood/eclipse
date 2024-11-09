const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a player from the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you want to kick')
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember('user');

        if (!member) {
            return interaction.reply('You need to mention the member you want to kick.');
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: "You need the `KickMembers` permission to execute this command.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("Kicked")
            .setColor("Blurple")
            .setDescription(`User ${member.user.tag} was successfully kicked.`)
            .setTimestamp();

        try {
            await member.kick(); // Kicks the member

            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        } catch (error) {
            interaction.reply({
                content: `Sorry, an error occurred: ${error.message}`,
                ephemeral: true,
            });
        }
    },
};
