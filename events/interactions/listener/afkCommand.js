const afkSchema = require('../../../models/afkSchema');
const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        // Check if the message is from a user who was previously AFK
        const afkData = await afkSchema.findOne({
            Guild: message.guild.id,
            User: message.author.id,
        });

        if (afkData) {
            const nickname = afkData.Nickname;
            await afkSchema.deleteMany({
                Guild: message.guild.id,
                User: message.author.id,
            });

            try {
                await message.member.setNickname(nickname);
            } catch (err) {
                console.error('Failed to set nickname:', err);
            }

            const welcomeBackMsg = await message.reply({
                content: `Welcome back, ${message.author}! I have removed your AFK status.`,
                ephemeral: true,
            });

            setTimeout(() => {
                welcomeBackMsg.delete();
            }, 4000);
        } else {
            // Check if the message mentions a user who is AFK
            const mentionedUser = message.mentions.users.first();
            if (!mentionedUser) return;

            const afkInfo = await afkSchema.findOne({
                Guild: message.guild.id,
                User: mentionedUser.id,
            });

            if (!afkInfo) return;

            const member = message.guild.members.cache.get(mentionedUser.id);
            const afkMessage = afkInfo.Message || 'No reason given';

            if (message.content.includes(mentionedUser.id)) {
                const afkEmbed = new EmbedBuilder()
                    .setColor('RED')
                    .setDescription(
                        `${member.user.tag} is currently AFK. Don't mention them at this time. Reason: ${afkMessage}`
                    )
                    .setTimestamp();

                const afkReply = await message.reply({ embeds: [afkEmbed] });
                setTimeout(() => {
                    afkReply.delete();
                    message.delete();
                }, 7000);
            }
        }
    });
};
