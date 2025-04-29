import { SapphireClient } from '@sapphire/framework';
import { ActivityType, GatewayIntentBits } from 'discord.js';
import 'dotenv/config'

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
    loadMessageCommandListeners: true,
    presence: {
        activities: [
            { name: 'the Outback', type: ActivityType.Watching },
            { name: 'against the scrooges', type: ActivityType.Competing }
        ]
    }
});

client.login(process.env.DISCORD_TOKEN);