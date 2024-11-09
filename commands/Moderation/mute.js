const { Client, Interaction, PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return interaction.reply({ content: "You need the `MuteMembers` permission to execute this command.", ephemeral: true });
        }

        const mentionable = interaction.options.get('target-user').value;
        const duration = interaction.options.get('duration').value;
        const reason = interaction.options.get('reason')?.value || 'No reason provided';

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(mentionable);
        if (!targetUser) {
            await interaction.editReply("That user doesn't exist in this server.");
            return;
        }

        if (targetUser.user.bot) {
            await interaction.editReply("I can't timeout a bot.");
            return;
        }

        const msDuration = ms(duration);
        if (isNaN(msDuration)) {
            await interaction.editReply('Please provide a valid timeout duration.');
            return;
        }

        if (msDuration < 5000 || msDuration > 2.419e9) {
            await interaction.editReply('Timeout duration cannot be less than 5 seconds or more than 28 days.');
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply("You can't timeout that user because they have the same/higher role than you.");
            return;
        }

        if (targetUserRolePosition >= botRolePosition) {
            await interaction.editReply("I can't timeout that user because they have the same/higher role than me.");
            return;
        }

        // Timeout the user
        try {
            const { default: prettyMs } = await import('pretty-ms');

            if (targetUser.isCommunicationDisabled()) {
                await targetUser.timeout(msDuration, reason);
                await interaction.editReply(`${targetUser}'s timeout has been updated to ${prettyMs(msDuration, { verbose: true })}\nReason: ${reason}`);
                return;
            }

            await targetUser.timeout(msDuration, reason);
            const embed = new EmbedBuilder()
                .setTitle("🔇 User Timed Out")
                .setColor("Blurple")
                .setDescription(`**${targetUser.user.tag}** has been timed out.`)
                .addFields(
                    { name: "Duration", value: prettyMs(msDuration, { verbose: true }), inline: true },
                    { name: "Reason", value: reason, inline: true },
                    { name: "Issued by", value: interaction.member.user.tag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: `User ID: ${targetUser.id}` });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log(`There was an error when timing out: ${error}`);
        }
    },

    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user so they cannot talk')
        .addMentionableOption(option =>
            option.setName('target-user')
                .setDescription('The user you want to timeout.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration make sure you pass the m, h or d (30m, 1h, 1 day).')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the timeout.')),
};
