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
const RAID_CHANNEL_ID = '1386132453017518272';
const SUCCESS_CHANNEL_ID = '1490125476671520939';
const PREFIX = ';';
const ALLOWED_ROLES = [
    '1386463199355736114',
    '1418316070560731339',
    '1491522983016140921',
    '1386139144971096115'
];

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

function generateRaidId(existingIds) {
    let id;
    do {
        id = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    } while (existingIds.has(id));
    return id;
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

const raidMessages = loadRaidMessages();
const raidIds = new Map();

for (const [messageId, data] of raidMessages.entries()) {
    if (data.raidId) raidIds.set(data.raidId, messageId);
}

client.once(Events.ClientReady, () => {
    console.log(`ECR Console online as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const fullContent = message.content.slice(PREFIX.length).trim();
    const command = fullContent.split(/\s+/)[0].toLowerCase();

    if (!ALLOWED_ROLES.some(id => message.member.roles.cache.has(id))) {
        return message.reply('You do not have permission to use this command.');
    }

    // ─── ;raidsetup ───────────────────────────────────────────────
    if (command === 'raidsetup') {
        const args = fullContent.slice('raidsetup'.length).trim().split(',');

        if (args.length < 4) {
            return message.reply(
                'Usage: `;raidsetup Raid Name, Start Timestamp, End Timestamp, Role Name`'
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

            const raidId = generateRaidId(raidIds);

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

            raidMessages.set(raidMessage.id, {
                roleId: role.id,
                raidId,
                raidName,
                startTime,
                endTime
            });
            raidIds.set(raidId, raidMessage.id);
            saveRaidMessages(raidMessages);

            const successEmbed = new EmbedBuilder()
                .setDescription(
                    `Success ✅\n\n` +
                    `**${raidName}**\n` +
                    `Raid ID: ${raidId}`
                )
                .setColor(0x00cc66)
                .setFooter({ text: 'ECR Console' })
                .setTimestamp();

            const successChannel = await client.channels.fetch(SUCCESS_CHANNEL_ID);
            await successChannel.send({
                content: `<@${message.author.id}>`,
                embeds: [successEmbed]
            });

        } catch (error) {
            console.error(error);
            message.reply('Failed to create raid post.');
        }
        return;
    }

    // ─── ;editst ──────────────────────────────────────────────────
    if (command === 'editst') {
        const parts = fullContent.slice('editst'.length).trim().split(/\s+(.+)/);
        const raidId = parts[0];
        const newTimestamp = parts[1];

        if (!raidId || !newTimestamp) {
            return message.reply('Usage: `;editst <raid id> <timestamp>`');
        }

        const messageId = raidIds.get(raidId);
        if (!messageId) {
            return message.reply('No raid found with that ID.');
        }

        const data = raidMessages.get(messageId);

        try {
            const raidChannel = await client.channels.fetch(RAID_CHANNEL_ID);
            const raidMessage = await raidChannel.messages.fetch(messageId);

            data.startTime = newTimestamp;
            raidMessages.set(messageId, data);
            saveRaidMessages(raidMessages);

            const updatedEmbed = new EmbedBuilder()
                .setDescription(
                    `# **${data.raidName}**\n\n` +
                    `**Start Time:** ${newTimestamp}\n` +
                    `**End Time:** ${data.endTime}\n\n` +
                    `React with 🚨 to sign up for the raid.`
                )
                .setColor(0xff0000)
                .setFooter({ text: 'ECR Console' })
                .setTimestamp();

            await raidMessage.edit({ embeds: [updatedEmbed] });
            message.reply(`Start time updated for raid **${data.raidName}**.`);
        } catch (error) {
            console.error(error);
            message.reply('Failed to edit raid.');
        }
        return;
    }

    // ─── ;editet ──────────────────────────────────────────────────
    if (command === 'editet') {
        const parts = fullContent.slice('editet'.length).trim().split(/\s+(.+)/);
        const raidId = parts[0];
        const newTimestamp = parts[1];

        if (!raidId || !newTimestamp) {
            return message.reply('Usage: `;editet <raid id> <timestamp>`');
        }

        const messageId = raidIds.get(raidId);
        if (!messageId) {
            return message.reply('No raid found with that ID.');
        }

        const data = raidMessages.get(messageId);

        try {
            const raidChannel = await client.channels.fetch(RAID_CHANNEL_ID);
            const raidMessage = await raidChannel.messages.fetch(messageId);

            data.endTime = newTimestamp;
            raidMessages.set(messageId, data);
            saveRaidMessages(raidMessages);

            const updatedEmbed = new EmbedBuilder()
                .setDescription(
                    `# **${data.raidName}**\n\n` +
                    `**Start Time:** ${data.startTime}\n` +
                    `**End Time:** ${newTimestamp}\n\n` +
                    `React with 🚨 to sign up for the raid.`
                )
                .setColor(0xff0000)
                .setFooter({ text: 'ECR Console' })
                .setTimestamp();

            await raidMessage.edit({ embeds: [updatedEmbed] });
            message.reply(`End time updated for raid **${data.raidName}**.`);
        } catch (error) {
            console.error(error);
            message.reply('Failed to edit raid.');
        }
        return;
    }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    try {
        if (reaction.partial) await reaction.fetch();
        const data = raidMessages.get(reaction.message.id);
        if (!data) return;
        if (reaction.emoji.name !== '🚨') return;
        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.add(data.roleId);
    } catch (error) {
        console.error(error);
    }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return;
    try {
        if (reaction.partial) await reaction.fetch();
        const data = raidMessages.get(reaction.message.id);
        if (!data) return;
        if (reaction.emoji.name !== '🚨') return;
        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.remove(data.roleId);
    } catch (error) {
        console.error(error);
    }
});

client.login(process.env.TOKEN);