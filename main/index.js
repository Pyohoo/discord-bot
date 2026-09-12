require('dotenv').config()
const {Client, GatewayIntentBits, Events} = require('discord.js')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.on(Events.MessageCreate, (msg) => {
    if (msg.author.bot) return

    if (msg.content === "!ping"){
        msg.reply("Sam się pingnij OwO")
    }
})

client.login(process.env.DISCORD_BOT_TOKEN)