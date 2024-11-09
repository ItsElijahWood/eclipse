const axios = require('axios');

async function isPremiumServer(guildId) {
    try {
        const response = await axios.get(
            ``,
            {
                headers: {
                    Authorization: `Bot ${process.env.TOKEN}`,
                },
            }
        );

        for (const data of response.data) {
            if (data.guild_id === guildId) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error("Error checking premium status:", error);
        return false; // Default to non-premium if there's an error
    }
}

module.exports = { isPremiumServer };
