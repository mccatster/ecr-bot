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
    TextInputStyle
} = require('discord.js');
const fs = require('fs');

const DATA_FILE = './raidMessages.json';
const RAID_CHANNEL_ID = '1386132453017518272';
const SUCCESS_CHANNEL_ID = '1490125476671520939';
const CONSOLE_CHANNEL_ID = '1490491292101251144';
const RAIDBAN_LOG_CHANNEL_ID = '1490125476671520939';
const RAIDBAN_ROLE_ID = '1482487254814294170';
const PREFIX = ';';

// Only these user IDs can use ;console
const CONSOLE_ALLOWED_USERS = [
    '477575548944777226',
    '1041158415713583185',
    '1154253852476973086'
];

// Roles that can use general staff commands (raidsetup, editst, editet, help)
const ALLOWED_ROLES = [
    '1386463199355736114',
    '1418316070560731339',
    '1491522983016140921',
    '1386139144971096115'
];

// Roles/users that can use ;raidban
const RAIDBAN_ALLOWED_ROLES = [
    '1310373664998555701'
];
const RAIDBAN_ALLOWED_USERS = [
    '477575548944777226',
    '1041158415713583185'
];

const KNOWN_COMMANDS = ['console', 'raidsetup', 'editst', 'editet', 'help', 'raidban'];

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
    return ALLOWED_ROLES.some(id => member.roles.cache.has(id));
}

function hasRaidBanPermission(member) {
    return RAIDBAN_ALLOWED_USERS.includes(member.user.id) ||
        RAIDBAN_ALLOWED_ROLES.some(id => member.roles.cache.has(id));
}

function buildConsoleModal() {
    const modal = new ModalBuilder()
        .setCustomId('console_input_modal')
        .setTitle('owners');

    const input = new TextInputBuilder()
        .setCustomId('console_input')
        .setLabel('type a command')
        .setPlaceholder('raidsetup | editst | editet')
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
                    '**Description:** Creates a new raid signup post in the raid channel and generates a unique Raid ID.',
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
                    '**Fields:**',
                    '› `Raid ID` — the 10-digit ID returned when the raid was created',
                    '› `New Timestamp` — Discord timestamp e.g. `<t:1700000000:F>`',
                    '**Who can use:** Members with an allowed staff role',
                ].join('\n'),
            },
            {
                name: '🕙  ;editet',
                value: [
                    '**Description:** Edits the end time of an existing raid post.',
                    '**Usage:** `;editet <Raid ID> <New Timestamp>`',
                    '**Fields:**',
                    '› `Raid ID` — the 10-digit ID returned when the raid was created',
                    '› `New Timestamp` — Discord timestamp e.g. `<t:1700003600:F>`',
                    '**Who can use:** Members with an allowed staff role',
                ].join('\n'),
            },
            {
                name: '🔨  ;raidban',
                value: [
                    '**Description:** Permanently assigns the raid-ban role to a user and logs the action.',
                    '**Usage:** `;raidban <@user or user ID> [reason]`',
                    '**Fields:**',
                    '› `@user or user ID` — mention or paste the user\'s ID',
                    '› `reason` — optional reason (shows *no reason given* if omitted)',
                    '**Who can use:** Senior staff roles and server owners',
                ].join('\n'),
            },
            {
                name: '⌨️  ;console',
                value: [
                    '**Description:** Opens a private console panel in the console channel with a text input to run commands.',
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

// Parse console input — splits on first space only for editst/editet,
// and on first 3 spaces for raidsetup to preserve timestamps
function parseConsoleInput(raw) {
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (cmd === 'raidsetup') {
        // Format: raidsetup "Raid Name" startTimestamp endTimestamp roleName
        // We split into exactly 5 parts: cmd, name, start, end, role
        // Everything after the cmd is re-joined and split by | delimiter
        const rest = raw.trim().slice('raidsetup'.length).trim();
        const fields = rest.split('|').map(s => s.trim());
        if (fields.length < 4) return null;
        return { cmd, raidName: fields[0], startTime: fields[1], endTime: fields[2], roleName: fields[3] };
    }

    if (cmd === 'editst' || cmd === 'editet') {
        // Format: editst raidId timestamp
        const raidId = parts[1];
        const timestamp = parts.slice(2).join(' ');
        if (!raidId || !timestamp) return null;
        return { cmd, raidId, timestamp };
    }

    return { cmd };
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

    if (!KNOWN_COMMANDS.includes(command)) return;

    // ;console — console users only, before any role gate
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

    // ;raidban — its own permission check, before general role gate
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
            const issuerName = message.author.username;
            const targetName = targetMember.user.username;
            const logChannel = await client.channels.fetch(RAIDBAN_LOG_CHANNEL_ID);
            await logChannel.send(
                `✅ **${issuerName}** raid-banned **${targetName} (${targetId})**\n` +
                `Reason: *${reason}*`
            );
        } catch (error) {
            console.error(error);
            await message.reply('❌ Failed to apply raid-ban role.');
        }

        return;
    }

    // All remaining commands require an allowed role
    if (!hasPermission(message.member)) return;

    // ;help
    if (command === 'help') {
        await message.channel.send({ embeds: [buildHelpEmbed()] });
        return;
    }

    // ;raidsetup
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

    // ;editst
    if (command === 'editst') {
        const parts = fullContent.slice('editst'.length).trim().split(/\s+(.+)/);
        if (!parts[0] || !parts[1]) return message.reply('Usage: `;editst <raid id> <timestamp>`');
        await handleEditStartTime(message, parts[0], parts[1]);
        return;
    }

    // ;editet
    if (command === 'editet') {
        const parts = fullContent.slice('editet'.length).trim().split(/\s+(.+)/);
        if (!parts[0] || !parts[1]) return message.reply('Usage: `;editet <raid id> <timestamp>`');
        await handleEditEndTime(message, parts[0], parts[1]);
        return;
    }
});

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
                return interaction.editReply(
                    '❌ Usage:\n`raidsetup Raid Name | <t:timestamp:F> | <t:timestamp:F> | Role Name`'
                );
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
            if (!parsed.raidId || !parsed.timestamp) {
                return interaction.editReply('❌ Usage: `editst <raid id> <timestamp>`');
            }
            await handleEditStartTime(interaction, parsed.raidId, parsed.timestamp);
            return;
        }

        if (cmd === 'editet') {
            if (!parsed.raidId || !parsed.timestamp) {
                return interaction.editReply('❌ Usage: `editet <raid id> <timestamp>`');
            }
            await handleEditEndTime(interaction, parsed.raidId, parsed.timestamp);
            return;
        }

        return interaction.editReply(`❌ Unknown command: \`${cmd}\``);
    }
});

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

client.login(process.env.TOKEN);
