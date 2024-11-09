const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whois')
        .setDescription('This gets user info')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you want to get info on.')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!interaction || !interaction.guild) {
            return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
        }

        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        const icon = user.displayAvatarURL();
        const tag = user.tag;

        const joinedServerTimestamp = member.joinedAt ? parseInt(member.joinedAt.getTime() / 1000) : null;
        const joinedServerField = joinedServerTimestamp ? `<t:${joinedServerTimestamp}:F>` : "Not available";
        const joinedDiscordTimestamp = parseInt(user.createdAt.getTime() / 1000);
        const joinedDiscordField = `<t:${joinedDiscordTimestamp}:F>`;

        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setAuthor({ name: tag, iconURL: icon })
            .setThumbnail(icon)
            .addFields({ name: "Member", value: `${user}`, inline: false })
            .addFields({ name: "Roles", value: `${member.roles.cache.map(r => r).join(' ')}`, inline: false })
            .addFields({ name: "Joined Server", value: joinedServerField, inline: true })
            .addFields({ name: "Joined Discord", value: joinedDiscordField, inline: true })
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
