require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    AuditLogEvent
} = require('discord.js');
const fs = require('fs');

const DATA_FILE = './raidMessages.json';
const MOD_LOG_FILE = './modLogs.json';
const RAID_CHANNEL_ID = '1386132453017518272';
const SUCCESS_CHANNEL_ID = '1490125476671520939';
const CONSOLE_CHANNEL_ID = '1490491292101251144';
const RAIDBAN_LOG_CHANNEL_ID = '1490125476671520939';
const RAIDBAN_ROLE_ID = '1482487254814294170';
const TEMPRAIDBAN_MEMORY_CHANNEL_ID = '1519798660001435679';
const PREFIX = ';';

const CONSOLE_ALLOWED_USERS = [
    '477575548944777226',
    '1041158415713583185',
    '1154253852476973086'
];

const ALLOWED_ROLES = [
    '1386463199355736114',
    '1418316070560731339',
    '1491522983016140921',
    '1386139144971096115'
];

const SUPERUSERS = [
    '477575548944777226',
    '1041158415713583185'
];

const RAIDBAN_ALLOWED_ROLES = [
    '1310373664998555701',
    '1418316070560731339',
    '1041158415713583185'
];
const RAIDBAN_ALLOWED_USERS = [
    '477575548944777226',
    '1041158415713583185'
];

const VIEW_ALLOWED_ROLES = [
    '1386463199355736114',
    '1418316070560731339',
    '1491522983016140921'
];
const VIEW_ALLOWED_USERS = [
    '477575548944777226'
];

const KNOWN_COMMANDS = ['console', 'raidsetup', 'editst', 'editet', 'help', 'raidban', 'unraidban', 'view', 'tempraidban'];

// ─── Duration parser ──────────────────────────────────────────────────────────
// Parses strings like "1h", "30m", "7d", "2h30m" into milliseconds
function parseDuration(str) {
    const regex = /(\d+)\s*([dhms])/gi;
    let total = 0;
    let match;
    while ((match = regex.exec(str)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === 'd') total += value * 24 * 60 * 60 * 1000;
        else if (unit === 'h') total += value * 60 * 60 * 1000;
        else if (unit === 'm') total += value * 60 * 1000;
        else if (unit === 's') total += value * 1000;
    }
    return total > 0 ? total : null;
}

// Formats ms into a readable string like "2h 30m"
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s && !d && !h) parts.push(`${s}s`);
    return parts.join(' ') || '0m';
}

// ─── Temp raidban memory (persisted in Discord channel) ───────────────────────
// Schema stored as JSON in a single pinned message:
// { "entries": [ { userId, username, reason, duration, durationMs, expiresAt, bannedBy }, ... ] }

let tempRaidbanMemoryMessageId = null;
const activeTimers = new Map(); // userId -> timeout handle

async function fetchMemoryChannel() {
    return await client.channels.fetch(TEMPRAIDBAN_MEMORY_CHANNEL_ID);
}

async function loadTempRaidbanMemory() {
    try {
        const channel = await fetchMemoryChannel();

        // If we already know the message ID, fetch it directly
        if (tempRaidbanMemoryMessageId) {
            try {
                const msg = await channel.messages.fetch(tempRaidbanMemoryMessageId);
                let raw = msg.content;
                const codeBlockMatch = raw.match(/```json\s*([\s\S]*?)```/);
                if (codeBlockMatch) raw = codeBlockMatch[1];
                const data = JSON.parse(raw.trim());
                return data.entries || [];
            } catch {
                // Message gone — fall through to scan
                tempRaidbanMemoryMessageId = null;
            }
        }

        // Scan for oldest bot message (the canonical memory message)
        const messages = await channel.messages.fetch({ limit: 50 });
        const botMessages = messages
            .filter(m => m.author.id === client.user.id)
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp); // oldest first

        if (botMessages.size === 0) return [];

        const msg = botMessages.first();
        tempRaidbanMemoryMessageId = msg.id;

        let raw = msg.content;
        const codeBlockMatch = raw.match(/```json\s*([\s\S]*?)```/);
        if (codeBlockMatch) raw = codeBlockMatch[1];

        const data = JSON.parse(raw.trim());
        return data.entries || [];
    } catch (err) {
        console.error('Failed to load temp raidban memory:', err);
        return [];
    }
}

async function saveTempRaidbanMemory(entries) {
    try {
        const channel = await fetchMemoryChannel();
        const content = '```json\n' + JSON.stringify({ entries }, null, 2) + '\n```';

        if (tempRaidbanMemoryMessageId) {
            try {
                const msg = await channel.messages.fetch(tempRaidbanMemoryMessageId);
                await msg.edit(content);
                return;
            } catch {
                // Message deleted or unavailable, fall through to create new
                tempRaidbanMemoryMessageId = null;
            }
        }

        const newMsg = await channel.send(content);
        tempRaidbanMemoryMessageId = newMsg.id;
    } catch (err) {
        console.error('Failed to save temp raidban memory:', err);
    }
}

let memoryWriteLock = Promise.resolve();

async function addTempRaidbanEntry(entry) {
    memoryWriteLock = memoryWriteLock.then(async () => {
        const entries = await loadTempRaidbanMemory();
        const filtered = entries.filter(e => e.userId !== entry.userId);
        filtered.push(entry);
        await saveTempRaidbanMemory(filtered);
    });
    await memoryWriteLock;
}

async function removeTempRaidbanEntry(userId) {
    memoryWriteLock = memoryWriteLock.then(async () => {
        const entries = await loadTempRaidbanMemory();
        const filtered = entries.filter(e => e.userId !== userId);
        await saveTempRaidbanMemory(filtered);
    });
    await memoryWriteLock;
}

async function scheduleTempRaidbanExpiry(guild, entry) {
    const now = Date.now();
    const remaining = entry.expiresAt - now;

    if (remaining <= 0) {
        // Already expired — lift immediately
        await liftTempRaidban(guild, entry);
        return;
    }

    // Clear any existing timer for this user
    if (activeTimers.has(entry.userId)) {
        clearTimeout(activeTimers.get(entry.userId));
    }

    const timer = setTimeout(async () => {
        activeTimers.delete(entry.userId);
        try {
            const freshGuild = client.guilds.cache.first() ?? await client.guilds.fetch(guild.id);
            await liftTempRaidban(freshGuild, entry);
        } catch (err) {
            console.error('Failed to lift temp raidban on expiry:', err);
        }
    }, remaining);

    activeTimers.set(entry.userId, timer);
}

async function liftTempRaidban(guild, entry) {
    try {
        const member = await guild.members.fetch(entry.userId);
        await member.roles.remove(RAIDBAN_ROLE_ID);
    } catch {
        // User may have left the server — still clean up the log
    }

    await removeTempRaidbanEntry(entry.userId);

    try {
        const logChannel = await client.channels.fetch(RAIDBAN_LOG_CHANNEL_ID);
        await logChannel.send(
            `🔓 Temp raid-ban for **${entry.username} (${entry.userId})** has expired and been lifted.`
        );
    } catch (err) {
        console.error('Failed to send expiry log message:', err);
    }
}

// ─── Mod log storage ──────────────────────────────────────────────────────────
function loadModLogs() {
    if (fs.existsSync(MOD_LOG_FILE)) {
        return JSON.parse(fs.readFileSync(MOD_LOG_FILE, 'utf8'));
    }
    return {};
}

function saveModLogs(logs) {
    fs.writeFileSync(MOD_LOG_FILE, JSON.stringify(logs, null, 2));
}

function addModLog(userId, type, date = new Date().toISOString()) {
    const logs = loadModLogs();
    if (!logs[userId]) logs[userId] = { bans: [], mutes: [], kicks: [], warns: [], raidbans: [], unraidbans: [] };
    if (!logs[userId][type]) logs[userId][type] = [];
    logs[userId][type].push(date);
    saveModLogs(logs);
}

function getUserLogs(userId) {
    const logs = loadModLogs();
    return logs[userId] || { bans: [], mutes: [], kicks: [], warns: [], raidbans: [], unraidbans: [] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function hasPermission(member) {
    if (SUPERUSERS.includes(member.user.id)) return true;
    return ALLOWED_ROLES.some(id => member.roles.cache.has(id));
}

function hasRaidBanPermission(member) {
    return RAIDBAN_ALLOWED_USERS.includes(member.user.id) ||
        RAIDBAN_ALLOWED_ROLES.some(id => member.roles.cache.has(id));
}

function hasViewPermission(member) {
    return VIEW_ALLOWED_USERS.includes(member.user.id) ||
        VIEW_ALLOWED_ROLES.some(id => member.roles.cache.has(id));
}

function formatDates(dates) {
    if (!dates || dates.length === 0) return 'none';
    return dates.map(d => `<t:${Math.floor(new Date(d).getTime() / 1000)}:D>`).join(', ');
}

function buildConsoleModal() {
    const modal = new ModalBuilder()
        .setCustomId('console_input_modal')
        .setTitle('owners');

    const input = new TextInputBuilder()
        .setCustomId('console_input')
        .setLabel('type a command')
        .setPlaceholder('e.g. raidsetup Raid Name | <t:...> | <t:...> | Role')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return modal;
}

function buildConsoleButton() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('console_open')
            .setLabel('Open Console')
            .setEmoji('⌨️')
            .setStyle(ButtonStyle.Secondary)
    );
}

function buildHelpEmbed() {
    return new EmbedBuilder()
        .setTitle('ECR Console — Command List')
        .setColor(0xB9B4FF)
        .setFooter({ text: 'ECR Console' })
        .setTimestamp()
        .addFields(
            {
                name: '⚔️  ;raidsetup',
                value: [
                    '**Description:** Creates a new raid signup post and generates a unique Raid ID.',
                    '**Usage:** `;raidsetup Raid Name, Start Timestamp, End Timestamp, Role Name`',
                    '**Fields:**',
                    '› `Raid Name` — the name of the raid',
                    '› `Start Timestamp` — Discord timestamp e.g. `<t:1700000000:F>`',
                    '› `End Timestamp` — Discord timestamp e.g. `<t:1700003600:F>`',
                    '› `Role Name` — role to assign to signups (created if it doesn\'t exist)',
                    '**Who can use:** Members with an allowed staff role',
                ].join('\n'),
            },
            {
                name: '🕐  ;editst',
                value: [
                    '**Description:** Edits the start time of an existing raid post.',
                    '**Usage:** `;editst <Raid ID> <New Timestamp>`',
                    '**Who can use:** Members with an allowed staff role',
                ].join('\n'),
            },
            {
                name: '🕙  ;editet',
                value: [
                    '**Description:** Edits the end time of an existing raid post.',
                    '**Usage:** `;editet <Raid ID> <New Timestamp>`',
                    '**Who can use:** Members with an allowed staff role',
                ].join('\n'),
            },
            {
                name: '🔨  ;raidban',
                value: [
                    '**Description:** Assigns the raid-ban role to a user and logs the action.',
                    '**Usage:** `;raidban <@user or user ID> [reason]`',
                    '**Who can use:** Senior staff roles and server owners',
                ].join('\n'),
            },
            {
                name: '⏱️  ;tempraidban',
                value: [
                    '**Description:** Temporarily assigns the raid-ban role to a user, then lifts it automatically.',
                    '**Usage:** `;tempraidban <@user or user ID> <duration> [reason]`',
                    '**Duration format:** `1h`, `30m`, `7d`, `2h30m`',
                    '**Who can use:** Senior staff roles and server owners',
                ].join('\n'),
            },
            {
                name: '🔓  ;unraidban',
                value: [
                    '**Description:** Removes the raid-ban role from a user and logs the action.',
                    '**Usage:** `;unraidban <@user or user ID>`',
                    '**Who can use:** Senior staff roles and server owners',
                ].join('\n'),
            },
            {
                name: '📋  ;view',
                value: [
                    '**Description:** Generates a moderation log for a user.',
                    '**Usage:** `;view <@user or user ID>`',
                    '**Who can use:** Staff roles',
                ].join('\n'),
            },
            {
                name: '⌨️  ;console',
                value: [
                    '**Description:** Opens a private console panel to run commands.',
                    '**Usage:** `;console`',
                    '**Who can use:** Server owners only (restricted by user ID)',
                ].join('\n'),
            },
            {
                name: '📋  ;help',
                value: [
                    '**Description:** Displays this command list.',
                    '**Usage:** `;help`',
                    '**Who can use:** Members with an allowed staff role',
                ].join('\n'),
            }
        );
}

function parseConsoleInput(raw) {
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (cmd === 'raidsetup') {
        const rest = raw.trim().slice('raidsetup'.length).trim();
        const fields = rest.split('|').map(s => s.trim());
        if (fields.length < 4) return null;
        return { cmd, raidName: fields[0], startTime: fields[1], endTime: fields[2], roleName: fields[3] };
    }

    if (cmd === 'editst' || cmd === 'editet') {
        const raidId = parts[1];
        const timestamp = parts.slice(2).join(' ');
        if (!raidId || !timestamp) return null;
        return { cmd, raidId, timestamp };
    }

    if (cmd === 'raidban') {
        const rest = raw.trim().slice('raidban'.length).trim();
        const mentionMatch = rest.match(/^<@!?(\d+)>/);
        const idMatch = rest.match(/^(\d+)/);
        let targetId, reason;
        if (mentionMatch) {
            targetId = mentionMatch[1];
            reason = rest.slice(mentionMatch[0].length).trim() || 'no reason given';
        } else if (idMatch) {
            targetId = idMatch[1];
            reason = rest.slice(idMatch[0].length).trim() || 'no reason given';
        } else return null;
        return { cmd, targetId, reason };
    }

    if (cmd === 'tempraidban') {
        const rest = raw.trim().slice('tempraidban'.length).trim();
        const mentionMatch = rest.match(/^<@!?(\d+)>/);
        const idMatch = rest.match(/^(\d+)/);
        let targetId, remaining;
        if (mentionMatch) {
            targetId = mentionMatch[1];
            remaining = rest.slice(mentionMatch[0].length).trim();
        } else if (idMatch) {
            targetId = idMatch[1];
            remaining = rest.slice(idMatch[0].length).trim();
        } else return null;
        // Next token is duration
        const durationMatch = remaining.match(/^(\d+[dhms](?:\d+[dhms])*)/i);
        if (!durationMatch) return null;
        const durationStr = durationMatch[1];
        const reason = remaining.slice(durationStr.length).trim() || 'no reason given';
        return { cmd, targetId, durationStr, reason };
    }

    if (cmd === 'unraidban') {
        const rest = raw.trim().slice('unraidban'.length).trim();
        const mentionMatch = rest.match(/^<@!?(\d+)>/);
        const idMatch = rest.match(/^(\d+)/);
        let targetId;
        if (mentionMatch) targetId = mentionMatch[1];
        else if (idMatch) targetId = idMatch[1];
        else return null;
        return { cmd, targetId };
    }

    if (cmd === 'view') {
        const rest = raw.trim().slice('view'.length).trim();
        const mentionMatch = rest.match(/^<@!?(\d+)>/);
        const idMatch = rest.match(/^(\d+)/);
        let targetId;
        if (mentionMatch) targetId = mentionMatch[1];
        else if (idMatch) targetId = idMatch[1];
        else return null;
        return { cmd, targetId };
    }

    return { cmd };
}

async function buildViewEmbed(guild, targetId) {
    let member, user;
    try {
        member = await guild.members.fetch(targetId);
        user = member.user;
    } catch {
        return null;
    }

    // Pull from our own logs
    const stored = getUserLogs(targetId);

    // Pull from Discord audit log
    const auditBans = [];
    const auditKicks = [];
    try {
        const banLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 100 });
        for (const entry of banLogs.entries.values()) {
            if (entry.target?.id === targetId) {
                auditBans.push(entry.createdAt.toISOString());
            }
        }
        const kickLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 100 });
        for (const entry of kickLogs.entries.values()) {
            if (entry.target?.id === targetId) {
                auditKicks.push(entry.createdAt.toISOString());
            }
        }
    } catch (_) {}

    // Merge audit log + stored, deduplicate by date proximity
    const allBans = [...new Set([...stored.bans, ...auditBans])].sort();
    const allKicks = [...new Set([...stored.kicks, ...auditKicks])].sort();
    const allMutes = [...(stored.mutes || [])].sort();
    const allWarns = [...(stored.warns || [])].sort();
    const allRaidbans = [...(stored.raidbans || [])].sort();

    const roles = member.roles.cache
        .filter(r => r.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => `<@&${r.id}>`)
        .join(', ') || 'none';

    const joinDate = member.joinedAt
        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
        : 'Unknown';

    return new EmbedBuilder()
        .setTitle(`Moderation Log — ${user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .setColor(0xB9B4FF)
        .setFooter({ text: `User ID: ${targetId}` })
        .setTimestamp()
        .addFields(
            { name: 'Joined', value: joinDate, inline: true },
            { name: 'Roles', value: roles },
            { name: `Bans (${allBans.length})`, value: formatDates(allBans) },
            { name: `Mutes (${allMutes.length})`, value: formatDates(allMutes) },
            { name: `Kicks (${allKicks.length})`, value: formatDates(allKicks) },
            { name: `Warns (${allWarns.length})`, value: formatDates(allWarns) },
            { name: `Raid Bans (${allRaidbans.length})`, value: formatDates(allRaidbans) },
        );
}

// ─── Client ───────────────────────────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
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

client.once(Events.ClientReady, async () => {
    console.log(`ECR Console online as ${client.user.tag}`);

    // Restore temp raidban timers from memory channel
    try {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        const entries = await loadTempRaidbanMemory();
        console.log(`Restoring ${entries.length} temp raidban(s) from memory...`);

        for (const entry of entries) {
            await scheduleTempRaidbanExpiry(guild, entry);
        }
    } catch (err) {
        console.error('Failed to restore temp raidban timers:', err);
    }
});

// ─── Auto-log bans and kicks from audit log ───────────────────────────────────
client.on(Events.GuildBanAdd, async ban => {
    try {
        await new Promise(r => setTimeout(r, 1000));
        const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
        const entry = logs.entries.first();
        if (entry?.target?.id === ban.user.id) {
            addModLog(ban.user.id, 'bans');
        }
    } catch (_) {}
});

client.on(Events.GuildMemberRemove, async member => {
    try {
        await new Promise(r => setTimeout(r, 1000));
        const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
        const entry = logs.entries.first();
        if (entry?.target?.id === member.id && Date.now() - entry.createdTimestamp < 5000) {
            addModLog(member.id, 'kicks');
        }
    } catch (_) {}
});

// ─── Core tempraidban handler ─────────────────────────────────────────────────
async function handleTempRaidban(ctx, { targetId, durationStr, reason }) {
    const durationMs = parseDuration(durationStr);
    if (!durationMs) {
        return reply(ctx, '❌ Invalid duration. Use formats like `1h`, `30m`, `7d`, `2h30m`.');
    }

    const guild = ctx.guild;
    let targetMember;
    try {
        targetMember = await guild.members.fetch(targetId);
    } catch {
        return reply(ctx, '❌ Could not find that user in this server.');
    }

    const expiresAt = Date.now() + durationMs;
    const durationFormatted = formatDuration(durationMs);
    const expiresTimestamp = Math.floor(expiresAt / 1000);
    const actorName = ctx.author?.username ?? ctx.user?.username;

    try {
        await targetMember.roles.add(RAIDBAN_ROLE_ID);
        addModLog(targetId, 'raidbans');

        const entry = {
            userId: targetId,
            username: targetMember.user.username,
            reason,
            duration: durationFormatted,
            durationMs,
            expiresAt,
            bannedBy: actorName
        };

        await addTempRaidbanEntry(entry);
        await scheduleTempRaidbanExpiry(guild, entry);

        const logChannel = await client.channels.fetch(RAIDBAN_LOG_CHANNEL_ID);
        await logChannel.send(
            `✅ **${actorName}** temp raid-banned **${targetMember.user.username} (${targetId})**\n` +
            `Reason: *${reason}*\n` +
            `Duration: *${durationFormatted}* (expires <t:${expiresTimestamp}:R>)`
        );
    } catch (error) {
        console.error(error);
    }
}

// ─── Message handler ──────────────────────────────────────────────────────────
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const fullContent = message.content.slice(PREFIX.length).trim();
    const command = fullContent.split(/\s+/)[0].toLowerCase();

    if (!KNOWN_COMMANDS.includes(command)) return;

    // ;console
    if (command === 'console') {
        if (!CONSOLE_ALLOWED_USERS.includes(message.author.id)) return;
        try { await message.delete(); } catch (_) {}
        const consoleChannel = await client.channels.fetch(CONSOLE_CHANNEL_ID);
        await consoleChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription('## owners\ntype a command')
                    .setColor(0xB9B4FF)
                    .setFooter({ text: 'ECR Console' })
            ],
            components: [buildConsoleButton()],
        });
        return;
    }

    // ;raidban
    if (command === 'raidban') {
        if (!hasRaidBanPermission(message.member)) return;
        const args = fullContent.slice('raidban'.length).trim();
        const mentionMatch = args.match(/^<@!?(\d+)>/);
        const idMatch = args.match(/^(\d+)/);
        let targetId, remainingText;
        if (mentionMatch) {
            targetId = mentionMatch[1];
            remainingText = args.slice(mentionMatch[0].length).trim();
        } else if (idMatch) {
            targetId = idMatch[1];
            remainingText = args.slice(idMatch[0].length).trim();
        } else {
            return message.reply('Usage: `;raidban <@user or user ID> [reason]`');
        }
        const reason = remainingText || 'no reason given';
        let targetMember;
        try {
            targetMember = await message.guild.members.fetch(targetId);
        } catch {
            return message.reply('❌ Could not find that user in this server.');
        }
        try {
            await targetMember.roles.add(RAIDBAN_ROLE_ID);
            addModLog(targetId, 'raidbans');
            const logChannel = await client.channels.fetch(RAIDBAN_LOG_CHANNEL_ID);
            await logChannel.send(
                `✅ **${message.author.username}** raid-banned **${targetMember.user.username} (${targetId})**\n` +
                `Reason: *${reason}*`
            );
        } catch (error) {
            console.error(error);
        }
        return;
    }

    // ;tempraidban
    if (command === 'tempraidban') {
        if (!hasRaidBanPermission(message.member)) return;
        const args = fullContent.slice('tempraidban'.length).trim();
        const mentionMatch = args.match(/^<@!?(\d+)>/);
        const idMatch = args.match(/^(\d+)/);
        let targetId, remaining;
        if (mentionMatch) {
            targetId = mentionMatch[1];
            remaining = args.slice(mentionMatch[0].length).trim();
        } else if (idMatch) {
            targetId = idMatch[1];
            remaining = args.slice(idMatch[0].length).trim();
        } else {
            return message.reply('Usage: `;tempraidban <@user or user ID> <duration> [reason]`\nDuration examples: `1h`, `30m`, `7d`, `2h30m`');
        }
        const durationMatch = remaining.match(/^(\d+[dhms](?:\d+[dhms])*)/i);
        if (!durationMatch) {
            return message.reply('❌ Please provide a valid duration. Examples: `1h`, `30m`, `7d`, `2h30m`');
        }
        const durationStr = durationMatch[1];
        const reason = remaining.slice(durationStr.length).trim() || 'no reason given';
        await handleTempRaidban(message, { targetId, durationStr, reason });
        return;
    }

    // ;unraidban
    if (command === 'unraidban') {
        if (!hasRaidBanPermission(message.member)) return;
        const args = fullContent.slice('unraidban'.length).trim();
        const mentionMatch = args.match(/^<@!?(\d+)>/);
        const idMatch = args.match(/^(\d+)/);
        let targetId;
        if (mentionMatch) targetId = mentionMatch[1];
        else if (idMatch) targetId = idMatch[1];
        else return message.reply('Usage: `;unraidban <@user or user ID>`');
        let targetMember;
        try {
            targetMember = await message.guild.members.fetch(targetId);
        } catch {
            return message.reply('❌ Could not find that user in this server.');
        }
        try {
            await targetMember.roles.remove(RAIDBAN_ROLE_ID);
            const logChannel = await client.channels.fetch(RAIDBAN_LOG_CHANNEL_ID);
            await logChannel.send(
                `✅ **${message.author.username}** unraid-banned **${targetMember.user.username} (${targetId})**`
            );
        } catch (error) {
            console.error(error);
        }
        return;
    }

    // ;view
    if (command === 'view') {
        if (!hasViewPermission(message.member)) return;
        const args = fullContent.slice('view'.length).trim();
        const mentionMatch = args.match(/^<@!?(\d+)>/);
        const idMatch = args.match(/^(\d+)/);
        let targetId;
        if (mentionMatch) targetId = mentionMatch[1];
        else if (idMatch) targetId = idMatch[1];
        else return message.reply('Usage: `;view <@user or user ID>`');
        const embed = await buildViewEmbed(message.guild, targetId);
        if (!embed) return message.reply('❌ Could not find that user in this server.');
        await message.channel.send({ embeds: [embed] });
        return;
    }

    // Role-gated commands
    if (!hasPermission(message.member)) return;

    if (command === 'help') {
        await message.channel.send({ embeds: [buildHelpEmbed()] });
        return;
    }

    if (command === 'raidsetup') {
        const args = fullContent.slice('raidsetup'.length).trim().split(',');
        if (args.length < 4) return message.reply('Usage: `;raidsetup Raid Name, Start Timestamp, End Timestamp, Role Name`');
        await handleRaidSetup(message, {
            raidName:  args[0].trim(),
            startTime: args[1].trim(),
            endTime:   args[2].trim(),
            roleName:  args[3].trim()
        });
        return;
    }

    if (command === 'editst') {
        const parts = fullContent.slice('editst'.length).trim().split(/\s+(.+)/);
        if (!parts[0] || !parts[1]) return message.reply('Usage: `;editst <raid id> <timestamp>`');
        await handleEditStartTime(message, parts[0], parts[1]);
        return;
    }

    if (command === 'editet') {
        const parts = fullContent.slice('editet'.length).trim().split(/\s+(.+)/);
        if (!parts[0] || !parts[1]) return message.reply('Usage: `;editet <raid id> <timestamp>`');
        await handleEditEndTime(message, parts[0], parts[1]);
        return;
    }
});

// ─── Interaction handler ──────────────────────────────────────────────────────
client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isButton() && interaction.customId === 'console_open') {
        if (!CONSOLE_ALLOWED_USERS.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission.', ephemeral: true });
        }
        await interaction.showModal(buildConsoleModal());
        return;
    }

    if (interaction.isModalSubmit() && interaction.customId === 'console_input_modal') {
        if (!CONSOLE_ALLOWED_USERS.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const raw = interaction.fields.getTextInputValue('console_input').trim();
        const parsed = parseConsoleInput(raw);

        if (!parsed) {
            return interaction.editReply('❌ Could not parse command. Check your formatting.');
        }

        const { cmd } = parsed;

        if (cmd === 'raidsetup') {
            if (!parsed.raidName || !parsed.startTime || !parsed.endTime || !parsed.roleName) {
                return interaction.editReply('❌ Usage: `raidsetup Raid Name | <t:...> | <t:...> | Role Name`');
            }
            await handleRaidSetup(interaction, {
                raidName:  parsed.raidName,
                startTime: parsed.startTime,
                endTime:   parsed.endTime,
                roleName:  parsed.roleName
            });
            return;
        }

        if (cmd === 'editst') {
            if (!parsed.raidId || !parsed.timestamp) return interaction.editReply('❌ Usage: `editst <raid id> <timestamp>`');
            await handleEditStartTime(interaction, parsed.raidId, parsed.timestamp);
            return;
        }

        if (cmd === 'editet') {
            if (!parsed.raidId || !parsed.timestamp) return interaction.editReply('❌ Usage: `editet <raid id> <timestamp>`');
            await handleEditEndTime(interaction, parsed.raidId, parsed.timestamp);
            return;
        }

        if (cmd === 'raidban') {
            if (!parsed.targetId) return interaction.editReply('❌ Usage: `raidban <user ID> [reason]`');
            let targetMember;
            try { targetMember = await interaction.guild.members.fetch(parsed.targetId); }
            catch { return interaction.editReply('❌ Could not find that user.'); }
            try {
                await targetMember.roles.add(RAIDBAN_ROLE_ID);
                addModLog(parsed.targetId, 'raidbans');
                const logChannel = await client.channels.fetch(RAIDBAN_LOG_CHANNEL_ID);
                await logChannel.send(
                    `✅ **${interaction.user.username}** raid-banned **${targetMember.user.username} (${parsed.targetId})**\n` +
                    `Reason: *${parsed.reason}*`
                );
                return interaction.editReply(`✅ **${targetMember.user.username}** has been raid-banned.`);
            } catch (error) {
                console.error(error);
                return interaction.editReply('❌ Failed to apply raid-ban role.');
            }
        }

        if (cmd === 'tempraidban') {
            if (!parsed.targetId || !parsed.durationStr) {
                return interaction.editReply('❌ Usage: `tempraidban <user ID> <duration> [reason]`\nDuration examples: `1h`, `30m`, `7d`, `2h30m`');
            }
            await handleTempRaidban(interaction, {
                targetId: parsed.targetId,
                durationStr: parsed.durationStr,
                reason: parsed.reason
            });
            return;
        }

        if (cmd === 'unraidban') {
            if (!parsed.targetId) return interaction.editReply('❌ Usage: `unraidban <user ID>`');
            let targetMember;
            try { targetMember = await interaction.guild.members.fetch(parsed.targetId); }
            catch { return interaction.editReply('❌ Could not find that user.'); }
            try {
                await targetMember.roles.remove(RAIDBAN_ROLE_ID);
                const logChannel = await client.channels.fetch(RAIDBAN_LOG_CHANNEL_ID);
                await logChannel.send(
                    `✅ **${interaction.user.username}** unraid-banned **${targetMember.user.username} (${parsed.targetId})**`
                );
                return interaction.editReply(`✅ Raid-ban removed from **${targetMember.user.username}**.`);
            } catch (error) {
                console.error(error);
                return interaction.editReply('❌ Failed to remove raid-ban role.');
            }
        }

        if (cmd === 'view') {
            if (!parsed.targetId) return interaction.editReply('❌ Usage: `view <user ID>`');
            const embed = await buildViewEmbed(interaction.guild, parsed.targetId);
            if (!embed) return interaction.editReply('❌ Could not find that user.');
            return interaction.editReply({ embeds: [embed] });
        }

        if (cmd === 'help') {
            return interaction.editReply({ embeds: [buildHelpEmbed()] });
        }

        return interaction.editReply(`❌ Unknown command: \`${cmd}\``);
    }
});

// ─── Command handlers ─────────────────────────────────────────────────────────
async function reply(ctx, content) {
    if (ctx.isModalSubmit?.() || ctx.isButton?.()) {
        if (ctx.deferred) return ctx.editReply(typeof content === 'string' ? { content } : content);
        return ctx.reply({ ...(typeof content === 'string' ? { content } : content), ephemeral: true });
    }
    return ctx.reply(typeof content === 'string' ? content : content.content ?? '');
}

async function handleRaidSetup(ctx, { raidName, startTime, endTime, roleName }) {
    try {
        const guild = ctx.guild;
        let role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        if (!role) role = await guild.roles.create({ name: roleName, reason: 'Raid signup role' });

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

        raidMessages.set(raidMessage.id, { roleId: role.id, raidId, raidName, startTime, endTime });
        raidIds.set(raidId, raidMessage.id);
        saveRaidMessages(raidMessages);

        const successEmbed = new EmbedBuilder()
            .setDescription(`Success ✅\n\n**${raidName}**\nRaid ID: ${raidId}`)
            .setColor(0x00cc66)
            .setFooter({ text: 'ECR Console' })
            .setTimestamp();

        const successChannel = await client.channels.fetch(SUCCESS_CHANNEL_ID);
        const authorId = ctx.author?.id ?? ctx.user?.id;
        await successChannel.send({ content: `<@${authorId}>`, embeds: [successEmbed] });

        await reply(ctx, `✅ Raid **${raidName}** created! ID: \`${raidId}\``);
    } catch (error) {
        console.error(error);
        await reply(ctx, '❌ Failed to create raid post.');
    }
}

async function handleEditStartTime(ctx, raidId, newTimestamp) {
    const messageId = raidIds.get(raidId);
    if (!messageId) return reply(ctx, '❌ No raid found with that ID.');
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
        await reply(ctx, `✅ Start time updated for raid **${data.raidName}**.`);
    } catch (error) {
        console.error(error);
        await reply(ctx, '❌ Failed to edit raid.');
    }
}

async function handleEditEndTime(ctx, raidId, newTimestamp) {
    const messageId = raidIds.get(raidId);
    if (!messageId) return reply(ctx, '❌ No raid found with that ID.');
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
        await reply(ctx, `✅ End time updated for raid **${data.raidName}**.`);
    } catch (error) {
        console.error(error);
        await reply(ctx, '❌ Failed to edit raid.');
    }
}

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

// hi bob
client.login(process.env.TOKEN);
