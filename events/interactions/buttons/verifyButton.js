const Verification = require('../../../models/Verification.js');

module.exports = {
    customId: 'verify',
    async execute(interaction) {
        const guildId = interaction.guildId;
        const verificationSystem = await Verification.findOne({ guildId });

        if (!verificationSystem) return;

        const role = interaction.guild.roles.cache.get(verificationSystem.roleId);
        if (!role) {
            return interaction.reply({ content: 'Role not found.', ephemeral: true });
        }

        try {
            await interaction.member.roles.add(role);
            await interaction.reply({ content: 'You have been verified!', ephemeral: true });
        } catch (error) {
            console.error('Failed to add role:', error);
            await interaction.reply({ content: 'Failed to assign role.', ephemeral: true });
        }
    }
};
