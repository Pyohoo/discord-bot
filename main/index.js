const fs = require('fs');
const path = require('path');
require('dotenv').config()
const {Client, GatewayIntentBits, Events, Collection, MessageFlags} = require('discord.js')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})


// ładowanie komend

client.commands = new Collection()
client.cooldowns = new Collection()

const folderPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(folderPath)

for (const folder of commandFolders){
    const commandsPath = path.join(folderPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    for (const file of commandFiles){
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)

        if('data' in command && 'execute' in command){
            client.commands.set(command.data.name, command)
        } else{
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
        }

    }
}



const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}



client.login(process.env.DISCORD_BOT_TOKEN)