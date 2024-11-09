const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const translate = require('@iamtraction/google-translate');

module.exports = {
   data: {
    name: "utranslate",
    description: "Tranlate text",
    "integration_types": [1],
    "contexts": [1, 2], // 0 = guild, 1 = dms, 2 = group dmsiption: "Translate text to a specified language",

    options: [
        {
            name: "text",
            description: "The text you want to translate.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "language",
            description: `The language to translate the text into (e.g., "fr" for French).`,
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "English", value: "en" },
                { name: "French", value: "fr" },
                { name: "Spanish", value: "es" },
                { name: "German", value: "de" },
                { name: "Italian", value: "it" },
                { name: "Japanese", value: "ja" },
                { name: "Korean", value: "ko" },
                { name: "Russian", value: "ru" },
                { name: "Chinese (Simplified)", value: "zh-CN" },
                { name: "Chinese (Traditional)", value: "zh-TW" }
            ]
        }
    ],
   },
    
    async execute(interaction, client) {
        const textToTranslate = interaction.options.getString('text');
        const targetLanguage = interaction.options.getString('language');

        try {
            const translatedText = await translate(textToTranslate, { to: targetLanguage });

            const embed = new EmbedBuilder()
                .setTitle('Translation Result')
                .setDescription(`**Original Text:**\n${textToTranslate}\n\n**Translated Text:**\n${translatedText.text}`)
                .setFooter({ text: `Translated to ${targetLanguage.toUpperCase()} Powered by ${client.user.username}` })
                .setColor('Blurple');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error translating text:', error);
            await interaction.reply('Sorry, there was an error translating the text.');
        }
    }
};
