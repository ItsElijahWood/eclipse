const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a player from the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you want to ban')
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember('user');

        if (!member) {
            return interaction.reply('You need to mention the member you want to ban.');
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You need the `BanMembers` permission to execute this command.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("Banned")
            .setColor("Blurple")
            .setDescription(`User ${member.user.tag} was successfully banned.`)
            .setTimestamp();

        try {
            await member.ban(); // Bans the member

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
