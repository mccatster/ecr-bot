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

function buildConsoleModal() {
    const modal = new ModalBuilder()
        .setCustomId('console_input_modal')
        .setTitle('owners');

    const input = new TextInputBuilder()
        .setCustomId('console_input')
        .setLabel('type a command')
        .setPlaceholder('e.g. raidsetup, Raid Name, <t:...>, <t:...>, Role Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    modal.addCom
