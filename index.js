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

const CONSOLE_COMMANDS = [
    {
        id: 'raidsetup',
        label: 'Raid Setup',
        emoji: '⚔️',
        style: ButtonStyle.Danger,
        modalTitle: 'Create Raid',
        fields: [
            { id: 'raidName',    label: 'Raid Name',       placeholder: 'e.g. Friday Night Raid',  style: TextInputStyle.Short, required: true },
            { id: 'startTime',   label: 'Start Timestamp', placeholder: 'e.g. <t:1700000000:F>',   style: TextInputStyle.Short, required: true },
            { id: 'endTime',     label: 'End Timestamp',   placeholder: 'e.g. <t:1700003600:F>',   style: TextInputStyle.Short, required: true },
            { id: 'roleName',    label: 'Role Name',       placeholder: 'e.g. Friday Raiders',     style: TextInputStyle.Short, required: true },
        ]
    },
    {
        id: 'editst',
        label: 'Edit Start Time',
        emoji: '🕐',
        style: ButtonStyle.Primary,
        modalTitle: 'Edit Start Time',
        fields: [
            { id: 'raidId',       label: 'Raid ID',         placeholder: 'The 10-digit raid ID',    style: TextInputStyle.Short, required: true },
            { id: 'newTimestamp', label: 'New Start Time',  placeholder: 'e.g. <t:1700000000:F>',   style: TextInputStyle.Short, required: true },
        ]
    },
    {
        id: 'editet',
        label: 'Edit End Time',
        emoji: '🕙',
        style: ButtonStyle.Primary,
        modalTitle: 'Edit End Time',
        fields: [
            { id: 'raidId',       label: 'Raid ID',         placeholder: 'The 10-digit raid ID',    style: TextInputStyle.Short, required: true },
            { id: 'newTimestamp', label: 'New End Time',    placeholder: 'e.g. <t:1700003600:F>',   style: TextInputStyle.Short, required: true },
        ]
    },
    // Add future commands here
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

function hasPermission(member) {
    return ALLOWED_ROLES.some(id => member.roles.cache.has(id));
}

function buildConsoleComponents() {
    const rows = [];
    for (let i = 0; i < CONSOLE_COMMANDS.length; i += 5) {
        const row = new ActionRowBuilder();
        const slice = CONSOLE_COMMANDS.slice(i, i + 5);
        row.addComponents(
            slice.map(cmd =>
                new ButtonBuilder()
                    .setCustomId(`console_btn_${cmd.id}`)
                    .setLabel(cmd.label)
                    .setEmoji(cmd.emoji)
                    .setStyle(cmd.style)
            )
        );
        rows.push(row);
    }
    return rows;
}

function buildModal(cmd) {
    const modal = new ModalBuilder()
        .setCustomId(`console_modal_${cmd.id}`)
        .setTitle(cmd.modalTitle);

    const rows = cmd.fields.map(field =>
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId(field.id)
                .setLabel(field.label)
                .setPlaceholder(field.placeholder)
                .setStyle(field.style)
                .setRequired(field.required)
        )
    );

    modal.addComponents(...rows);
    return modal;
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

    if (!hasPermission(message.member)) {
        return message.reply('You do not have permission to use this command.');
    }

    if (command === 'console') {
        if (!CONSOLE_ALLOWED_USERS.includes(message.author.id)) {
            return message.reply('You do not have permission to use this command.');
        }

        try { await message.delete(); } catch (_) {}

        const rows = buildConsoleComponents();

        await message.channel.send({
            content: `<@${message.author.id}>`,
            embeds: [
                new EmbedBuilder()
                    .setDescription('## ECR Console\nSelect a command below.')
                    .setColor(0x2b2d31)
                    .setFooter({ text: 'ECR Console • Auto-deletes in 30s' })
            ],
            components: rows,
        }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 30_000);
        });

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

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        if (!interaction.customId.startsWith('console_btn_')) return;
        if (!CONSOLE_ALLOWED_USERS.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission.', ephemeral: true });
        }

        const cmdId = interaction.customId.replace('console_btn_', '');
        const cmd = CONSOLE_COMMANDS.find(c => c.id === cmdId);
        if (!cmd) return;

        await interaction.showModal(buildModal(cmd));
        return;
    }

    if (interaction.isModalSubmit()) {
        if (!interaction.customId.startsWith('console_modal_')) return;
        if (!CONSOLE_ALLOWED_USERS.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const cmdId = interaction.customId.replace('console_modal_', '');

        if (cmdId === 'raidsetup') {
            await handleRaidSetup(interaction, {
                raidName:  interaction.fields.getTextInputValue('raidName'),
                startTime: interaction.fields.getTextInputValue('startTime'),
                endTime:   interaction.fields.getTextInputValue('endTime'),
                roleName:  interaction.fields.getTextInputValue('roleName'),
            });
            return;
        }

        if (cmdId === 'editst') {
            await handleEditStartTime(
                interaction,
                interaction.fields.getTextInputValue('raidId'),
                interaction.fields.getTextInputValue('newTimestamp')
            );
            return;
        }

        if (cmdId === 'editet') {
            await handleEditEndTime(
                interaction,
                interaction.fields.getTextInputValue('raidId'),
                interaction.fields.getTextInputValue('newTimestamp')
            );
            return;
        }

        // Add future modal handlers here
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
