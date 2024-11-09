const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Set an AutoMod rule')
        .addIntegerOption(option =>
            option
                .setName('type')
                .setDescription('Type of AutoMod rule (1: Flagged Words, 2: Spam Messages, 3: Keyword, 4: Spam Mentions)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('word')
                .setDescription('The word you want to block.')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('The maximum number of mentions allowed')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: 'You need the `Administrator` permission to execute this command.',
                ephemeral: true
            });
        }

        // Ensure client is properly initialized and user is available
        if (!client.user) {
            return interaction.reply({ content: 'Client is not properly initialized. Please try again later.', ephemeral: true });
        }

        const { guild, options } = interaction;
        const type = options.getInteger('type');
        const word = options.getString('word');
        const number = options.getInteger('number');

        await interaction.reply({ content: 'Loading your AutoMod rule...' });

        try {
            let rule;
            const channel = interaction.channel;

            switch (type) {
                case 1: // Flagged Words
                    rule = await guild.autoModerationRules.create({
                        name: `Block profanity, sexual content, and slurs by ${client.user.username}`,
                        creatorId: client.user.id,
                        enabled: true,
                        eventType: 1,
                        triggerType: 4,
                        triggerMetadata: {
                            presets: [1, 2, 3]
                        },
                        actions: [
                            {
                                type: 1,
                                metadata: {
                                    channel: channel.id,
                                    durationSeconds: 10,
                                    customMessage: `This message was prevented by ${client.user.username}`
                                }
                            }
                        ]
                    });
                    break;

                case 2: // Spam Messages
                    rule = await guild.autoModerationRules.create({
                        name: `Prevent spam by ${client.user.username}`,
                        creatorId: client.user.id,
                        enabled: true,
                        eventType: 1,
                        triggerType: 3,
                        actions: [
                            {
                                type: 1,
                                metadata: {
                                    channel: channel.id,
                                    durationSeconds: 10,
                                    customMessage: `This message was prevented by ${client.user.username}`
                                }
                            }
                        ]
                    });
                    break;

                case 3: // Keyword
                    if (!word) {
                        await interaction.editReply({ content: 'Please provide a word to block.' });
                        return;
                    }

                    rule = await guild.autoModerationRules.create({
                        name: `Prevent a word(s) from being used by ${client.user.username}`,
                        creatorId: client.user.id,
                        enabled: true,
                        eventType: 1,
                        triggerType: 1,
                        triggerMetadata: {
                            keywordFilter: [word]
                        },
                        actions: [
                            {
                                type: 1,
                                metadata: {
                                    channel: channel.id,
                                    durationSeconds: 10,
                                    customMessage: `This message was prevented by ${client.user.username}`
                                }
                            }
                        ]
                    });
                    break;

                case 4: // Spam Mentions
                    if (isNaN(number) || number <= 0) {
                        await interaction.editReply({
                            content: 'Please provide a valid positive number for the maximum mentions.',
                        });
                        return;
                    }

                    rule = await guild.autoModerationRules.create({
                        name: `Prevent spam mentions by ${client.user.username}`,
                        creatorId: client.user.id,
                        enabled: true,
                        eventType: 1,
                        triggerType: 5,
                        triggerMetadata: {
                            mentionTotalLimit: number
                        },
                        actions: [
                            {
                                type: 1,
                                metadata: {
                                    channel: channel.id,
                                    durationSeconds: 10,
                                    customMessage: `This message was prevented by ${client.user.username}`
                                }
                            }
                        ]
                    });
                    break;

                default:
                    await interaction.editReply({ content: 'Invalid rule type specified.' });
                    return;
            }

            if (rule) {
                const description = type === 1
                    ? 'Flagged words will be blocked.'
                    : type === 2
                    ? 'Spam messages will be prevented.'
                    : type === 3
                    ? `Messages containing '${word}' will be blocked.`
                    : `Messages with more than ${number} mentions will be blocked.`;

                const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(`Your Automod rule has been created. ${description} ${client.user.username} will enforce it.`);

                await interaction.editReply({ content: '', embeds: [embed] });
            }

        } catch (err) {
            if (err.message.includes('AUTO_MODERATION_MAX_RULES_OF_TYPE_EXCEEDED')) {
                await interaction.editReply({ content: 'Automod is already set up.' });
            } else {
                await interaction.editReply({ content: `An error occurred: ${err.message}` });
            }
        }
    }
};

