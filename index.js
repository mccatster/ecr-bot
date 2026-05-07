require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    EmbedBuilder
} = require('discord.js');
const fs = require('fs');

const DATA_FILE = './raidMessages.json';

function loadRaidMessages() {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        return new Map(Object.entries(data));
    }
    return new Map();
}

function saveRaidMessages(map) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(map)));
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

const PREFIX = ';';
const RAID_CHANNEL_ID = '1386132453017518272';
const ALLOWED_ROLE_ID = '1386463199355736114';
const raidMessages = loadRaidMessages();

client.once(Events.ClientReady, () => {
    console.log(`ECR Console online as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(`${PREFIX}raidsetup`)) return;

    if (!message.member.roles.cache.has(ALLOWED_ROLE_ID)) {
        return message.reply('You do not have permission to use this command.');
    }

    const args = message.content
        .slice(`${PREFIX}raidsetup`.length)
        .trim()
        .split(',');

    if (args.length < 4) {
        return message.reply(
            'Usage:\n' +
            '`;raidsetup Raid Name, Start Timestamp, End Timestamp, Role Name`'
        );
    }

    const raidName = args[0].trim();
    const startTime = args[1].trim();
    const endTime = args[2].trim();
    const roleName = args[3].trim();

    try {
        let role = message.guild.roles.cache.find(
            r => r.name.toLowerCase() === roleName.toLowerCase()
        );
        if (!role) {
            role = await message.guild.roles.create({
                name: roleName,
                reason: 'Raid signup role'
            });
        }

        const embed = new EmbedBuilder()
            .setDescription(
                `# **${raidName}**\n\n` +
                `**Start Time:** ${startTime}\n` +
                `**End Time:** ${endTime}\n\n` +
                `React with 🚨 to sign up for the raid.`
            )
            .setColor(0xff0000)
            .setFooter({ text: 'ECR Console' })
            .setTimestamp();

        const raidChannel = await client.channels.fetch(RAID_CHANNEL_ID);
        const raidMessage = await raidChannel.send({ embeds: [embed] });
        await raidMessage.react('🚨');

        raidMessages.set(raidMessage.id, role.id);
        saveRaidMessages(raidMessages);

        await message.delete().catch(() => {});
    } catch (error) {
        console.error(error);
        message.reply('Failed to create raid post.');
    }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    try {
        if (reaction.partial) await reaction.fetch();
        const roleId = raidMessages.get(reaction.message.id);
        if (!roleId) return;
        if (reaction.emoji.name !== '🚨') return;
        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.add(roleId);
    } catch (error) {
        console.error(error);
    }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return;
    try {
        if (reaction.partial) await reaction.fetch();
        const roleId = raidMessages.get(reaction.message.id);
        if (!roleId) return;
        if (reaction.emoji.name !== '🚨') return;
        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.remove(roleId);
    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.TOKEN);