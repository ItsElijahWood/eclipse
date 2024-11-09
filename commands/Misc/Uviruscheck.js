const { SlashCommandBuilder,   } = require('@discordjs/builders');
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const axios = require("axios");

module.exports = {
    data: {
        name: 'uviruscheck',
        description: 'Check a URL for a virus',
        "integration_types": [1],
        "contexts": [1, 2],

        options: [
        {
            name: "url",
            description: "The URL to check for a virus",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        ],
       },

    async execute(interaction, client) {
        const url = interaction.options.getString('url');

        await interaction.deferReply({ ephemeral: true });

        async function sendMessage(message) {
            const embed = new EmbedBuilder()
                .setColor('Blurple')
                .setDescription(message);

            await interaction.editReply({ embeds: [embed] });
        }

        async function checkURL(url) {
            try {
                const urlToCheck = encodeURI(url);
                const apiUrl = ``;

                const response = await axios.get(apiUrl);
                const data = response.data;

                if (data.verbose_msg === "Resource does not exist in the dataset")
                    return "⚠️ That is either not a valid URL or does not exist in the dataset.";

                const scanDate = new Date(data.scan_date);
                const formattedScanDate = `<t:${Math.floor(scanDate.getTime() / 1000)}:F>`;

                let results = "";
                if (data.positives > 0) {
                    results = `> ⚠️ **This website contains viruses! Use the link below to track each virus on this site**`;
                } else {
                    results = "> 🧼 This site is clean and safe to use!";
                }

                const dataObj = {
                    url: `> 🔗 Checked URL: \`${url}\``,
                    scanDate: `> 📆 Scan Date: ${formattedScanDate}`,
                    positives: `> 📫 Viruses: \`${data.positives}/${data.total}\``,
                    result: results,
                    full: `> Click [here](${data.permalink}) to view the full results of this scan.`,
                };

                return `🌍 **Your Virus Scan Report:** \n\n${Object.values(dataObj).join("\n")}\n\n *Please note: the scan date is not the time you ran this command—it's the time the virus API most recently checked the website for viruses.*`;
            } catch (e) {
                return "⚠️ An error occurred while checking this URL.";
            }
        }

        const output = await checkURL(url);
        await sendMessage(output);
    },
};
