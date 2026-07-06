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
const ALERT_FILE = './cooldownAlerts.json';
const ALLOWED_CHANNELS_FILE = './allowedTowerChannels.json';
const ALERT_ADMIN_USER = '477575548944777226';
const ALERT_NOTIFY_CHANNEL_ID = '1519829722962460873';
const DEFAULT_ALLOWED_TOWER_CHANNELS = ['1519829722962460873', '1490491292101251144', '1519431863003775108'];
const RAID_CHANNEL_ID = '1386132453017518272';
const SUCCESS_CHANNEL_ID = '1490125476671520939';
const CONSOLE_CHANNEL_ID = '1490491292101251144';
const RAIDBAN_LOG_CHANNEL_ID = '1490125476671520939';
const RAIDBAN_ROLE_ID = '1482487254814294170';
const TEMPRAIDBAN_MEMORY_CHANNEL_ID = '1519798660001435679';
const TOWER_MEMORY_CHANNEL_ID = '1519811705977442345';
const TOWER_ROLLS_CHANNEL_ID = '1519823488066650273';
const TOWER_COOLDOWN_MS = 45 * 60 * 1000; // 45 minutes
const TOWER_COOLDOWN_BYPASS = ['1154253852476973086'];
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

const KNOWN_COMMANDS = ['console', 'raidsetup', 'editst', 'editet', 'help', 'raidban', 'unraidban', 'view', 'tempraidban', 'remove', 'add', 'give', 'removelb', 'restorelb', 'update', 'speak', 'alert', 'addch'];
const TOWER_ADMIN_USERS = ['477575548944777226'];

const TOWER_DIFFICULTY = {
  "Tower of It Never Ends": 13.5,
  "S.T.O.N.E Facility: Reborn": 13.46,
  "Tower of Monochromatic Haze": 13.43,
  "Tower of Impending Doom": 13.4,
  "Tower of Wigglecore": 13.35,
  "Tower of My Inner Hatred": 13.3,
  "Tower of Spiralling Fates": 13.28,
  "Citadel of Cold Blooded Fatality": 13.26,
  "Obelisk of Unrealistic Sightings": 13.24,
  "Tower of Maybe In Mumbai": 13.22,
  "Tower of Blind Fate": 13.2,
  "Tower of Paradise": 13.18,
  "Tower of Celestial Bloom": 13.16,
  "Tower of Withered Consensus": 13.14,
  "Citadel of The Eternal Calamity": 13.12,
  "Citadel of Infinite Void": 13.1,
  "Tower of Qwerty Uiop": 13.08,
  "Target Tower": 13.06,
  "Pazoingus Of Of": 13.05,
  "3008-Tower": 13.04,
  "Tower of Zen Surplus": 13.03,
  "Tower of Twenty Two": 13.02,
  "Ikea Tower": 13.01,
  "Tower of Sudden Death": 13.0,
  "Great Citadel of Great Difficulty Chart": 12.98,
  "Citadel of The Final Destination": 12.96,
  "Tower of Yasamsal Kiyamet": 12.94,
  "Tower of Lucid Nightmares": 12.92,
  "Tower of Light Speed Buttons": 12.9,
  "Tower of Ruthless Retribution": 12.89,
  "Tower of Stardust Conflagration": 12.88,
  "Tower of Computer Crippling": 12.87,
  "Zalgo Annihilated Purgatory": 12.86,
  "Tower of Jaded Compromise": 12.85,
  "Tower of Head Quarters": 12.84,
  "Tower of Dissociative Force": 12.83,
  "Tower of Dense Beauty": 12.82,
  "Tower of Where Are You Going": 12.81,
  "Tower of Substantial Quietus": 12.8,
  "Tower of Splice Construct": 12.79,
  "Tower of The Curve's Desire": 12.78,
  "Tower of Fragmented Wallscape": 12.77,
  "Tower of Zither Harmony": 12.76,
  "Tower of Inferno Galore: Unnerfed": 12.75,
  "Tower of Vague Luminescence": 12.74,
  "Tower of Impressions of a Lunatic": 12.73,
  "Tower of Umrah Market": 12.71,
  "Tower of Compromised Fear": 12.7,
  "Tower of Sinful Calvary": 12.69,
  "Tower of Eternal Distress": 12.68,
  "Tower of The Horizontal Wall": 12.67,
  "Tower of Eternal Void": 12.65,
  "Tower of Spiritual Rise": 12.64,
  "Tower of Lavender Lustre": 12.61,
  "Tower of The Roof's Pique": 12.6,
  "Found You Tower": 12.59,
  "Tower of Diabolical Corner Multitude": 12.59,
  "Tower of Prismal Radiance": 12.58,
  "Tower of Thje Floor": 12.57,
  "Tower of Drifting Nights": 12.56,
  "Tower of Overwhelming Doom": 12.55,
  "Nvidia Tower": 12.55,
  "Steeple of Daze": 12.54,
  "Tower of Weird Core": 12.53,
  "Sans Steeple": 12.53,
  "Tower of Chromatic Inclination": 12.52,
  "Tower of Disjointed Alliance": 12.52,
  "Tower of Flowing Haze": 12.51,
  "Tower of Quite Devious": 12.51,
  "Tower of Reborn Vertigo": 12.5,
  "Steeple of Transcendence": 12.5,
  "Tower of Flagrant Aggravation": 12.49,
  "Tower of Descending Towards Oblivion": 12.48,
  "Tower of The Sky's The Limit": 12.47,
  "Tower of Overhanging Obstacles": 12.45,
  "Tower of Vital Valiance": 12.44,
  "Tower of Exhausting Journey": 12.43,
  "Steeple of Cha Cha Real Smooth": 12.43,
  "Corner Tower": 12.42,
  "Tower of Eternal Doom": 12.42,
  "Tower of Living Life to the Fullest": 12.41,
  "Tower of Lucas Penteado": 12.41,
  "Tower of Wigglecore: Classic": 12.4,
  "Citadel of Cruel Punishment": 12.39,
  "Steeple of Nilly Bob": 12.39,
  "Tower of Water Melon": 12.38,
  "Tower of Thinning Bacon": 12.37,
  "Tower of Disturbing Dread": 12.36,
  "Tower of Quiescent Spiralism": 12.35,
  "Tower of Greyscale": 12.34,
  "Tower of Virescent Cascade": 12.33,
  "Tower of My Eternal Destination": 12.33,
  "Tower of Vynn Crael": 12.32,
  "Tower of Luminous Reflections": 12.32,
  "Tower of Spatial Awareness": 12.32,
  "Tower of Corruption's Embrace": 12.31,
  "Byung Jin Rae": 12.3,
  "Tower of Existential Crisis: Super Nerf": 12.3,
  "Tower of Familiar Voids": 12.3,
  "Tower of Absolute Zero": 12.29,
  "Tower of Brief Enmity": 12.29,
  "Tower of pro pillars": 12.28,
  "Tower of Gridlock Madness": 12.28,
  "Tower of The Bussin": 12.26,
  "Great Citadel of Difficulty Chart: Classic": 12.25,
  "Tower of Who Moved My Camera": 12.25,
  "Tower of Psychological Torture": 12.24,
  "Tower of Truss Behemoth": 12.24,
  "Tower of Hollow Obstacles": 12.23,
  "Cone Tower": 12.23,
  "Tower of The Altruistic Serosity": 12.22,
  "Tower of Microsoft Service": 12.22,
  "Tower of Subsequent Comprises": 12.21,
  "Tower of Italianray Never Clear": 12.21,
  "Tower of Elongated Runs: Unnerfed": 12.2,
  "Tower of The Ice Wall": 12.19,
  "Tower of Futile Perusal": 12.18,
  "Tower of Gtg House On Fire": 12.17,
  "Doomsday Tower": 12.16,
  "Tower of Technical Requirements": 12.15,
  "Tower of Malefic Nuisances": 12.14,
  "Tower of Elysian Crossings": 12.13,
  "Tower of Corrupted Zenith": 12.12,
  "Tower of small pillars": 12.11,
  "Tower of Hollow Iridescences": 12.11,
  "Tower of Bizkit": 12.1,
  "Tower of Devious Purism": 12.1,
  "Citadel of Vacant Hindrances": 12.09,
  "Steeple of Pit of Misery Soul Crushing+": 12.08,
  "Steeple of Cheese Burger": 12.08,
  "Tower of Winner's Pad": 12.07,
  "Tower of The Quest For Perfection": 12.06,
  "Tower of Venerated Attrition": 12.06,
  "Tower of Rezz Oant": 12.05,
  "Tower of The Homefinder": 12.05,
  "Tower of Nebulaic Remnants": 12.04,
  "Tower of Fragile Balance": 12.04,
  "Tower of Nether Lands": 12.03,
  "Tower of Incessant Vexation": 12.03,
  "Bocchi The Rock Tower": 12.02,
  "Tower of Terrorific Jumps": 12.02,
  "Tower of Thje Wall": 12.02,
  "Edifice of Flicking and Clicking: Double Time": 12.01,
  "Tower of Timed Button Fury": 12.01,
  "Tower of Jabberwock Jagger": 12.0,
  "Tower of Cruel Punishment": 11.99,
  "Barely Even A Tower": 11.98,
  "Steeple of Dead Is You": 11.97,
  "Tower of Meaningfulness": 11.96,
  "Tower of Prolonged Condemnation": 11.94,
  "Homefinder Steeple": 11.93,
  "Tower of Zumbo Sauce Consumption": 11.93,
  "Yanny Laurel Edifice": 11.92,
  "Citadel of Descent Into Exile": 11.92,
  "Citadel of 25 Jumps: True Mode": 11.91,
  "Citadel of Terse Persecution": 11.9,
  "Tower of Vertigo": 11.9,
  "Tower of Righteous Indignation": 11.89,
  "Tower of Time to Say Goodbye": 11.89,
  "Tower of The Goodguygabed": 11.88,
  "Jumbo Tower": 11.88,
  "Steeple of Twisty Turning Horrific Difficulty": 11.87,
  "Tower of Missing Benefits": 11.87,
  "Tower of Various Masochistic Tortures": 11.85,
  "Tower of Corner Kerfuffle": 11.85,
  "Steeple of Kyodai na Paul": 11.85,
  "Tower of Elysian Crossings: Classic": 11.84,
  "Citadel of Uncanny": 11.83,
  "Obelisk of Dominance": 11.83,
  "Tower of Virulent Sojourn": 11.83,
  "Tower of Mental Torture": 11.82,
  "Thje Steeple": 11.81,
  "Steeple of Quill Canyon": 11.8,
  "The Diceman's Wrath": 11.79,
  "Tower of Daunting Experiences": 11.79,
  "Steeple of The Divined Sequence": 11.78,
  "Steeple of Suspiciously Large Right Arm": 11.78,
  "towero f gunga ginga": 11.78,
  "Mesmerizer Tower": 11.77,
  "Tower of Heaven's Gate": 11.77,
  "Tower of Offset Lacrimosa": 11.76,
  "Tower of Vacant Hindrances": 11.76,
  "Tower of Tarapop Two": 11.75,
  "Tower of Challenging Obstacle Anarchy": 11.74,
  "Tower of Elongated Runs": 11.73,
  "Steeple of Eco-Friendly Wood Veneers": 11.72,
  "Edifice of Wooting 80HE Zinc": 11.72,
  "Edifice of Wallhop Against Time": 11.72,
  "Tower of O'er The Skies": 11.72,
  "Tower of Lethal Countdown": 11.72,
  "Tower of Pyrrhic Ascent": 11.71,
  "Tower of Play to Win": 11.71,
  "Tower of Shunning Excursion": 11.71,
  "Citadel of Perfect Cherry Blossom": 11.7,
  "Steeple of Pole Pole Pole": 11.7,
  "Tower of The Wedge's Vengeance": 11.7,
  "Tower of Your Short-term Session": 11.69,
  "Tower of Cosmix Resonance": 11.68,
  "Tower of Ruthless Punishment": 11.67,
  "Tower of Reproachful Eyewall": 11.66,
  "Tower of Tempestous Twilight": 11.65,
  "Tower of Factorial Difficulty": 11.65,
  "Tower of Thje Toilet": 11.65,
  "Tower of Pulsating Ambition": 11.65,
  "Tower of Champion's Road": 11.64,
  "Tower of Insane Discomfort": 11.63,
  "Citadel of Infinite Void: Nerf": 11.63,
  "Tower of Alien Radiance: Unnerfed": 11.63,
  "Tower of Exodus Obscurity": 11.63,
  "steeple of support-tickets": 11.62,
  "Tower of Unpremeditated Paraphernalia": 11.62,
  "Tower of Raging Tempest": 11.62,
  "Tower of The Jankening": 11.61,
  "Tower of Monty Mole Mayhem": 11.61,
  "Lighthouse": 11.6,
  "Steeple of Leaden Heights": 11.6,
  "Tower of Punishing Runs": 11.6,
  "Tower of Explore My World: Classic": 11.59,
  "Tower of Hydraulic Rummage": 11.58,
  "Tower of Atmospheric Launch": 11.58,
  "Tower of Terse Persecution": 11.58,
  "Tower of Thin Mints": 11.58,
  "Steeple of Endless Assembly": 11.57,
  "Tower of Centchade": 11.57,
  "Turbulent Tower: Super Hard Mode": 11.56,
  "Tower of Fujiwara no Mokou": 11.56,
  "Tower of Monumental Abyss": 11.56,
  "Tower of Annoyingly Complex Trials": 11.55,
  "Tower of The Turkey Sandwich Trials": 11.55,
  "Tower of Relentless Fate": 11.55,
  "Steeple of Jeopardized Romance": 11.54,
  "Tower of Kidney Stones": 11.54,
  "Tower of Organamix Twistalivious": 11.54,
  "Citadel of Generation Failure": 11.54,
  "Tower of The Flowering Cyclone": 11.53,
  "teehee colon three tower": 11.53,
  "＜": 11.53,
  "Tower of Endless Marathon": 11.53,
  "Tower of The Final Moment": 11.53,
  "Tower of Difficulty Spike": 11.52,
  "Schizophrenic Steeple": 11.52,
  "Tower of Unter dem Schwarzschildradius": 11.52,
  "Tower of Jim and Tim's Ultimate Birthday Blowout!": 11.52,
  "Tower of The Drive Towards Human Limits: Super Nerf": 11.52,
  "Tower of Raging Tempest: Everstorm": 11.51,
  "Tower of Oblivious Twist": 11.51,
  "Citadel of Augmented Misery": 11.51,
  "Tower of Live The Dream": 11.51,
  "Steeple of Denouementer": 11.5,
  "Citadel of Colorless Despair": 11.5,
  "S.T.O.N.E Facility": 11.5,
  "Obelisk of I Have No Idea What I'm Even Doing Anymore Please Help": 11.49,
  "Tower of Pure Ability": 11.49,
  "Radio Tower": 11.49,
  "Tower of Necrotic Incantation": 11.49,
  "Great Citadel of Great Joobly Chart": 11.48,
  "Tower of Asteroid Corrode Mismanagement": 11.48,
  "Tower of Lost In Eden": 11.48,
  "Steeple of Cognizant Freedom": 11.48,
  "Steeple of Lex": 11.47,
  "Advancement of Taboo Tower": 11.47,
  "Tower of Jocundigluey": 11.47,
  "Citadel of Wacky Strategy: Buffed": 11.46,
  "Not Even a Not Even a Great Citadel": 11.46,
  "Tower of Lika 98": 11.46,
  "Tower of Screaming and Creaming": 11.46,
  "Steeple of Coconut": 11.46,
  "Obelisk of Long": 11.45,
  "Tower of Yeah, It's Pretty Empty Entirely": 11.45,
  "Tower of Doubly Deadly Descent": 11.45,
  "Unnerfed Tower of Melancholic Misery": 11.44,
  "Unnerfed Tower of Perlin Dreams of Greatness": 11.44,
  "Steeple of 50 Wraps of Hell": 11.44,
  "Tower of Un Ca": 11.44,
  "Tower of Otherworldly Expertise": 11.44,
  "Sprite Cranberry Steeple": 11.43,
  "Ultimate Obby Tower": 11.43,
  "Tower of Ring Rang Rung Rong": 11.43,
  "Tower of Explore My World": 11.43,
  "Tower of Upbeat Dejectional Rascality": 11.43,
  "Tower of Inner Repose": 11.42,
  "Tower of Elongated Torments": 11.42,
  "Tower of Unorthodoxy": 11.42,
  "Sorry Richo Steeple": 11.41,
  "Tower of Thje Ecotism": 11.41,
  "Tower of Jumping": 11.41,
  "Tower of Sacrilegious Jumps: Super Nerf": 11.41,
  "Tower of Endless Spreading Bane": 11.41,
  "Tower of Do Not Play": 11.4,
  "Tower of Disengaging Lunacy": 11.4,
  "Tower of Parody: Super Nerf": 11.39,
  "Tower of Vibrant Overcomings": 11.39,
  "Treacherous Extremist Ascension Neat": 11.39,
  "Tower of Pierogi": 11.38,
  "Steeple of Wallhop Destiny": 11.38,
  "Tower of Quadrilaterals": 11.38,
  "S.C.O.N.E Facility": 11.38,
  "Tower of Beast Weaver": 11.37,
  "Tower of Withering Dirges": 11.37,
  "Tower of Lung Chugging": 11.37,
  "Tower of Empty Meaningless Patterns": 11.37,
  "Tower of Spicy Headcream": 11.36,
  "Steeple of Xei Pei Disagreement": 11.36,
  "Tower of Descent Into Exile": 11.36,
  "Tower of Wooden Planks": 11.35,
  "Tower of Wiggly Worm": 11.35,
  "Tower of My End": 11.35,
  "Was a Citadel": 11.34,
  "Steeple of Mori Calliope": 11.34,
  "Jeronimo's Nest, Chapter 1: The Rice & Beans Coalition": 11.33,
  "Steeple of Sweet Tendency": 11.33,
  "Tower of Hard Chart": 11.33,
  "Tower of Conceptual Phase": 11.32,
  "Obelisk of Latest Difficulty Chart": 11.32,
  "Tower of Thje Tower": 11.32,
  "Tower of Melodramatic Esoteric Nebulosity": 11.32,
  "Tower of Being Extremely Rude": 11.31,
  "Steeple of Anything Can Happen": 11.31,
  "The Really Ugly Sad Steeple": 11.31,
  "Tower of FL Studio F": 11.3,
  "Edifice of Adrift in Utopia": 11.3,
  "Steeple of Cybersecurity": 11.3,
  "Tower of Infernal Turpitude": 11.3,
  "Tower of Death Corridor: Super Nerf": 11.3,
  "Tower of Wacky Truss Destruction": 11.3,
  "Tower of Infuriating Misfortune": 11.29,
  "Steeple of Benevolence": 11.29,
  "Citadel of Inception": 11.29,
  "Steeple of Ranka Lee": 11.28,
  "Citadel of Linear Jank": 11.28,
  "Tower of Angled Passageways": 11.28,
  "Tower of AbyssalChaos Never Clear": 11.27,
  "SLAUGHTERHOUSE STEEPLE": 11.27,
  "Steeple of Extreme Awkwardness": 11.27,
  "Tower of Arduous Architecture": 11.27,
  "Tower of Button Peril": 11.26,
  "Tower of Math.Random": 11.26,
  "Tower of Kemochao Wonderland": 11.26,
  "Tower of Tortuous Oblivion": 11.26,
  "Tower of Cata4": 11.26,
  "Tower of Vibrant Visuals": 11.25,
  "Hecing Egg Facility: A-Sides": 11.25,
  "Tower of Spiralling Fates: Nerf": 11.25,
  "Steeple of KittyEmi's Birthday": 11.24,
  "Tower of Challenging Obstacle Anarchy: EToH Edition": 11.24,
  "Citadel of Infinite Void: Super Nerf": 11.24,
  "Tower of Rove Culmination": 11.24,
  "Steeple of Abrasive Whitening": 11.23,
  "Steeple of Wallwalk Difficulty Chart": 11.23,
  "Tower of Divine Purity": 11.23,
  "Edifice of Bluehopping": 11.23,
  "Tower of Hellfire and Brimstone": 11.23,
  "Tower of Light To Dark": 11.23,
  "Tower of Tiny Dome Men": 11.22,
  "GUGGLE OF HUNGO MA YUNGLE": 11.22,
  "Tower of Hectic Corridor": 11.22,
  "mongubopgomogmgommoommomoomoomongumanguguggogogogo": 11.21,
  "Tower of Hard Jumps": 11.21,
  "Tower of Persevering Through the Storm": 11.2,
  "Tower of Obnoxious Times": 11.2,
  "Steeple of Was Really Bored": 11.2,
  "Tower of Tuff": 11.19,
  "Tower of Cold and False Sonder": 11.19,
  "Tower of Outerspatial Fatalities": 11.19,
  "Tower of The Volcano": 11.18,
  "Steeple of Upsetting": 11.18,
  "Tower of Unexplainable Hatred": 11.17,
  "Tower of Truss Mania": 11.17,
  "Tower of I Beat Tidal Wave": 11.17,
  "Tower of Scareyy Night Mares S Oooooo": 11.16,
  "Tower of Difficulty Chart: Buff": 11.16,
  "Edifice of 2号": 11.16,
  "Steeple of Repetitive Tries": 11.16,
  "Tower of Peace and Chaos": 11.16,
  "Tower of Bonbonsteve Never Clear": 11.15,
  "Tower of File Corruption": 11.15,
  "Tower of Utter Wack": 11.15,
  "Tower of Submissive Furry": 11.15,
  "Was A Tower": 11.14,
  "Tower of Fiend Massacre": 11.14,
  "Tower of Ruthless Royal Architecture": 11.14,
  "tour de stylo": 11.13,
  "Bargain Bin Steeples": 11.13,
  "Tower of Absolutely Brutal Failures": 11.13,
  "Tower of Interdimensional Gateway": 11.13,
  "Tower of Final Resolve": 11.12,
  "Steeple of Lyme Disease": 11.12,
  "Tower of Transcendental Mastery: Unnerfed": 11.1,
  "Tower of Devilish Judgements": 11.1,
  "Citadel of Glory": 11.1,
  "Tower of Speedy Cat Deluxe": 11.1,
  "Tower of Blue Devotion": 11.09,
  "Tower of Gelidity": 11.09,
  "Citadel of Focused Flames": 11.08,
  "Tower of Generation Failure": 11.08,
  "very tall neat": 11.07,
  "Tower of Unconventional Structuring": 11.07,
  "Steeple of Sophisticated Challenges": 11.07,
  "Tower of Skyscraper Scaling": 11.06,
  "Steeple of Severed Light": 11.06,
  "Mercadona Tower": 11.06,
  "Tower of Decaying Serenity": 11.06,
  "Edifice of Denmark Hopping": 11.05,
  "Expensive sc": 11.05,
  "Tower of Monochrome": 11.05,
  "Unnerfed Thanos Citadel": 11.05,
  "Tower of Mushroom: Super Nerf": 11.05,
  "Tower of Wigglecore: Catastrophic": 11.05,
  "Tower of Contrasting Boundaries": 11.05,
  "Tower of Fervent Imperfection": 11.05,
  "Tower of Long Lasting Leukophobia": 11.05,
  "Tower of High Vigilance": 11.04,
  "Tower of It's Just a Game": 11.04,
  "Free cata": 11.04,
  "Torre De Difficulty Chart Para Pasarmela": 11.04,
  "Tower of Linear Jank": 11.04,
  "Tower of Movin' Right Along: Unnerfed": 11.04,
  "Tower of I Am So Done With Everything The World Has Layed Upon Me / Tower of Simple Obstacles": 11.04,
  "Tower of Perplexed Ascent": 11.04,
  "Obelisk of Endless Obby": 11.03,
  "Tower of The Seventh Chromosome": 11.03,
  "Tower of Inferno Galore": 11.03,
  "Tower of Damask Accretion": 11.02,
  "Ikea Tower: Catastrophic": 11.02,
  "3008-Tower: Super Nerf": 11.02,
  "Tower of Blind Fate: Nerf": 11.02,
  "Tower of Vindictive Maneuvers": 11.02,
  "Tower of Glory": 11.01,
  "Tower of Burning Hopes": 11.01,
  "Tower of Cataclysmic Layers": 11.0,
  "Edifice of Don't Stop All": 10.99,
  "Tower of Retracing Footsteps": 10.99,
  "Tower of Dead Arctic": 10.99,
  "Tower of Chromatic Inclination: Unnerfed": 10.99,
  "Kaizo Steeple": 10.99,
  "steeple of zvoidrr": 10.98,
  "Steeple of Gilded Rust": 10.98,
  "Tower of Kill or Be Killed": 10.98,
  "Steeple of Lifelessness": 10.98,
  "Steeple of Pine Apple": 10.98,
  "Steeple of Larp": 10.97,
  "Tower of Everlasting Endeavour": 10.97,
  "Citadel of Latest Difficulty Chart": 10.97,
  "Tower of Wayward Venture": 10.97,
  "Glory of Sigmund": 10.96,
  "Steeple of The Troublemaker": 10.96,
  "Tower of Champion's Gaming: Revamp": 10.96,
  "Tower of Always Losing": 10.96,
  "Tower of Hitbox and Health Abuse": 10.96,
  "Tower of Micro Management: Unnerfed": 10.95,
  "Tower of Yummy Hotdog": 10.95,
  "Steeple of Final Fantasy": 10.94,
  "Tower of Sprite Manipulation": 10.94,
  "Tower of Narrow Intensification": 10.94,
  "Steeple of Miku Miku Miku": 10.93,
  "Tower of Impending Doom: Super Nerf": 10.93,
  "Tower of Interstellar Division": 10.93,
  "Tower of Augmented Misery": 10.93,
  "Tower of Final Inferno": 10.92,
  "Tower of Transcendental Mastery": 10.92,
  "Tower of Crying and Dying": 10.92,
  "Tower of S Pi Ra Ls": 10.92,
  "Tower of Eternal Void: Nerf": 10.92,
  "Steeple of Serek": 10.91,
  "Tower of Champion's Gaming": 10.91,
  "Tower of Precise Turns": 10.91,
  "Tower of Perfect Love": 10.9,
  "Steeple of Cheese Burger: Nerf": 10.9,
  "S.T.O.N.E Facility: VIP": 10.9,
  "Tower of Flummin' Time": 10.9,
  "Tower of Vindication": 10.89,
  "Steeple of Au Revoir": 10.89,
  "Tower of Elongated Runs: Difficulty Chart": 10.89,
  "Hecing Egg Facility: B-Sides": 10.89,
  "Tower of Colossal Crossroad Climbing": 10.89,
  "Liadus Absolute Chomikness": 10.88,
  "Tower of Truss Fuss": 10.88,
  "Tower of Absolute Zero: AHoSCT": 10.88,
  "Steeple of Anathematized Maltreatment": 10.88,
  "Tower of Goofy Trusses": 10.87,
  "Tower of Edgy Name": 10.87,
  "Definitely Not a There Is No God": 10.86,
  "Tower of Zenith": 10.86,
  "Tower of Relentless Altitude": 10.86,
  "Tower of Cyanide": 10.85,
  "Tower of Classical Difficult Spike": 10.85,
  "Tower of Heinous Interference": 10.85,
  "Tower of Mauve Attestations": 10.85,
  "Steeple of Mewing NEAT": 10.84,
  "Tower of Sandy Meat": 10.84,
  "Tower of Eternal Agony": 10.83,
  "Tower of Destructive Peril": 10.83,
  "Tower of Overthinking Life Choices": 10.83,
  "Tower of Spiraling The Frame": 10.82,
  "Maybe I Know U": 10.82,
  "Tower of Mc Donald": 10.82,
  "Höhentranszendenteätherflammenprojektionmanufaktur": 10.82,
  "N.O.O.B. Facility": 10.81,
  "Citadel of The Finale Bro!": 10.81,
  "Tower of Wigglecore: Super Nerf": 10.81,
  "Tower of Hellish Nightmares": 10.81,
  "Tower of I Trosuve": 10.8,
  "Tower of Big Big Footies": 10.8,
  "Denouement Clicker": 10.8,
  "Citadel of Xerically Infuriating Calamity": 10.8,
  "Tower of Layering Torment": 10.8,
  "Tower of Atrocious Truss Catastrophe": 10.8,
  "Tower of Mushy Peas": 10.79,
  "Tower of Despondency": 10.79,
  "Tower of Seclusion": 10.79,
  "You vs Homer Steeple": 10.78,
  "Steeple of Indoor Ordeals": 10.78,
  "Tower of Cliffside Madness: Unnerfed": 10.78,
  "Tower of Hell and Despair": 10.78,
  "Tower of Circuitous Spiral": 10.78,
  "Tower of Isoprophl-X": 10.77,
  "Tower of Light and Dark": 10.77,
  "Tower of Zimble Zamble": 10.77,
  "Tower of Cataclysmic Layers: Classic": 10.77,
  "Steeple of Linear Speedrunning": 10.76,
  "Steeple of Precise Perfection": 10.76,
  "Tower of Oscillating Punishment": 10.76,
  "Tower of Enhanced Persistence": 10.76,
  "Tower of Inception": 10.76,
  "Tower of The Mythic Project": 10.75,
  "Tower of Knead That Fried Chicken, Shake That Fried Chicken": 10.75,
  "Tower of Oblique Agony": 10.75,
  "Tower of Chromatic Inclination: Classic": 10.75,
  "Tower of Wildly Wacky Wonders": 10.75,
  "Tower of Handful Wrap": 10.74,
  "Tower of Hindrancing Vacants": 10.74,
  "Tower of muumitalo": 10.74,
  "Steeple of Prolonged Suffering: Classic": 10.74,
  "Tower of Spiced Up Sand": 10.74,
  "Tower of Bad Design": 10.74,
  "Tower of Perlin Dreams of Greatness": 10.73,
  "Tower of Cringe Rage Madness": 10.73,
  "Tower of Vivid Distress": 10.73,
  "Tower of Sudden Death: Super Nerf": 10.73,
  "Tower of Reflecting Impediments": 10.73,
  "Tower of Frameless Linear Mobility": 10.72,
  "A BARBERSHOP HAIRCUT THAT COSTS A QUARTER": 10.72,
  "Tower of Brazen Brusque": 10.72,
  "Mr Beast": 10.72,
  "Tower of The Roof's Pique: Nerf": 10.72,
  "Obelisk of Frightening Nightmares": 10.71,
  "Steeple of Tight Jumps": 10.71,
  "Tower of Melodramatic Esoteric Nebulosity: Classic": 10.71,
  "Tower of Brisk Movement": 10.71,
  "Tower about Wall hopping against Transistor": 10.7,
  "Tower of Critical Corruption": 10.7,
  "Citadel of Walkies": 10.7,
  "Tower of Precariously Positioned Platforms": 10.7,
  "Tower of Uncanny Agony": 10.7,
  "Pillar of Schnobbleclob": 10.69,
  "Tower of Jamba": 10.69,
  "Steeple of Hopouement": 10.69,
  "Tower of Zen Surplus: Super Nerf": 10.69,
  "Tower of Cruel Underestimated Parkour": 10.69,
  "Obelisk of Really Long": 10.68,
  "Citadel of 25 Jumps": 10.68,
  "Tower of The Sky, The Success": 10.68,
  "Tower of Tee Hee Time: The Perfect Run": 10.68,
  "Tower of Miserable Journeys": 10.68,
  "Tower of Estrogen": 10.67,
  "Steeple of Griddy": 10.67,
  "Edifice of Loopfail Hell": 10.67,
  "The Salty Spitoon": 10.67,
  "Tower of Polychromatic Zero: Super Buff": 10.67,
  "Tower of Chacina Repentina": 10.67,
  "Tower of Lime Skittle": 10.66,
  "Tower of Falling and Failing: Super Buff": 10.66,
  "Tower of Unrelenting Precipice": 10.66,
  "Wallhop Steeple": 10.65,
  "Steeple of Greek Alphabet Hop": 10.65,
  "Steeple of An Unjust War": 10.65,
  "Tower of Ethereal Punishment": 10.65,
  "Tower of Double Up": 10.64,
  "Tower of Nervous Sweating": 10.64,
  "Tower of Vibrant Purism": 10.63,
  "Tower of Illuminated Vitality": 10.63,
  "Tower of Expected Outcomes": 10.63,
  "Tower of Penultimate Nostalgia": 10.63,
  "Tower of Five Nights at Awsome": 10.62,
  "Pissgang Tower": 10.62,
  "Steeple of Thje Roof": 10.61,
  "Tower of Frightening and Confusing Trials: Difficulty Chart": 10.61,
  "Tower of My Terrible Ribosome": 10.61,
  "Tower of Ubiquitous Zany": 10.6,
  "Certainly A Tower": 10.6,
  "Tower of Water Melon: Nerf": 10.6,
  "Tower of 1lus Centrifuge": 10.59,
  "Wora Tower": 10.59,
  "Steeple of Basic Jumps": 10.59,
  "Tower of Rather Empty Spaces": 10.59,
  "Great Citadel of Wacky Strategy": 10.59,
  "Tower of Quirky Wraps": 10.58,
  "Tower of Hazardous Catastrophe": 10.58,
  "Tower of Slipping Through Reality: Unnerfed": 10.58,
  "Tower of Niflheimr Hvergelmir": 10.58,
  "Tower of Varying Punishment": 10.58,
  "Tower of True Skill: Buff: Unnerfed": 10.57,
  "Tower of Hopeless Hell: Reimagined": 10.57,
  "Tower of Big Momma's Twisted Fate": 10.57,
  "Tower of Roughly Rotated Ruin: Classic": 10.57,
  "Tower of Perishing": 10.57,
  "Tower of Exasperantial Tranquility": 10.56,
  "Steeple of Huge Cliff": 10.56,
  "Tower of Melancholic Misery": 10.56,
  "Tower of Duality": 10.56,
  "Tower of Neophobe Adagio": 10.55,
  "Tower of Crawl a Ladder": 10.55,
  "Tower of Lifting Foundations": 10.55,
  "Tower of Journey's End": 10.55,
  "Tower of Monochromatic Journey": 10.54,
  "Steeple of Divine": 10.54,
  "Tower of Extravagant Borders": 10.54,
  "Tower of DA BABY": 10.54,
  "Tower of Disintegrating Into Latex": 10.53,
  "Tower of Sleek Keels": 10.53,
  "Steeple of Lika 99": 10.53,
  "Tower of Thinning Layers: Reignited": 10.53,
  "Tower of Obese Charts": 10.53,
  "Tower of Flipping Everything": 10.53,
  "steeple of laser emoji": 10.52,
  "Tower of Ring One": 10.52,
  "Tower of Expanding Layers: Alternate 2 2": 10.52,
  "Tower of Impractical Chances": 10.52,
  "Tower of Hopeless Hell: Difficulty Chart": 10.52,
  "Tower of Lavish Thrones": 10.52,
  "European Wallhop Edifice": 10.51,
  "Tower of Lucas Penteado: Nerf": 10.51,
  "Tower of Internalizing Insanity": 10.51,
  "Tower of Undying Light": 10.51,
  "Tower of Kiwi Fruit": 10.51,
  "Great Citadel of Laptop Splitting: Secret Ending": 10.5,
  "Steeple of Undarlegur Turn": 10.5,
  "Steeple of Sweet As Honey": 10.5,
  "Nokia Tower: Super Nerf": 10.5,
  "Tower of Fragile Salvation": 10.5,
  "Steeple of Wacky Obstructions": 10.5,
  "Tower of Pure Skill: Unnerfed": 10.49,
  "Tower of Vital Vector Venture": 10.49,
  "Tower of Tilted Serenity": 10.49,
  "Citadel of New Difficulty Chart": 10.49,
  "Tower of Yelling A Whole Lot: Old": 10.48,
  "Tower of Soul Crushing Difficulty Chart": 10.48,
  "Tower of Long Stressful Expeditions": 10.48,
  "Tower of This Might Be Linonophobia": 10.48,
  "Tower of Chromatic Density": 10.48,
  "Steeple of Prolonged Suffering": 10.47,
  "Steeple of Hard Wraps": 10.47,
  "Tower of Strategic Techniques": 10.47,
  "Tower of Punishing Paroxysm": 10.47,
  "Tower of Umrah Retail": 10.47,
  "BRAT TOWER": 10.46,
  "Tower of Skibidi Toilet Sigma Gaming": 10.46,
  "Tower of The Mewing Sigma": 10.46,
  "Tower of Short and Fatal Trouble": 10.46,
  "Tower of Atomical Geometry": 10.45,
  "Citadel of Quicktek Clients": 10.44,
  "Obelisk of Jump King": 10.44,
  "Steeple of Wrap God": 10.44,
  "Tower of Spiralling Fates: Super Nerf": 10.44,
  "Painful Obby Tower": 10.43,
  "Tower of Shrinking Layers": 10.43,
  "Tower of Glorious Crown": 10.43,
  "Tower of Screen Punching: Super Buff": 10.43,
  "Steeple of Truss Trauma": 10.43,
  "Tower of Punishing Descent": 10.43,
  "Steeple of Thje Thinning Voidcore Hindrances Chart": 10.42,
  "Steeple of Stop, Wait And Go": 10.42,
  "Never A Tower": 10.42,
  "Steeple of A Purist's Nightmare": 10.42,
  "Tower 2": 10.42,
  "Tower of Possible Movement": 10.42,
  "Tower of Bodacious Maneuvering": 10.42,
  "Tower of Googly Jar": 10.41,
  "나랏〮말〯ᄊᆞ미〮 듀ᇰ귁〮에〮달아〮": 10.41,
  "Steeple of Death Difficulty": 10.41,
  "Tower of Adventure to Wyoming": 10.41,
  "Tower of Against All Odds": 10.41,
  "Tower of The Opp Block": 10.41,
  "Tower of Dynamic Pulse": 10.41,
  "Tower of Xerotic Inescapable Nervebreak": 10.4,
  "Steeple of Excruciating Strategies": 10.4,
  "Steeple of Unorganized Chaos": 10.4,
  "Tower of Quadratic Infinity": 10.4,
  "Tower of Two Sided Misery": 10.4,
  "Tower of Reoriented Vintage": 10.39,
  "Unnerfed Thanos Tower": 10.39,
  "Tower of Total Liabilities": 10.39,
  "Citadel of Frightening Nightmares": 10.39,
  "Tower of Vacant Hindrances: Nerf": 10.39,
  "Citadel of Impossible Movement": 10.38,
  "Tower of LA 'ROTTE IN CHRISTMASTOWN DE LA SANTA": 10.38,
  "Tower of The Everlasting Vexation": 10.38,
  "Tower of Enigmatic Cliffs": 10.38,
  "Tower of Swift Chacine": 10.38,
  "fever dream 5": 10.37,
  "Что? Почему? Три.": 10.37,
  "Calamity Steeple": 10.37,
  "π846": 10.37,
  "Giant Tower of Frightening Nightmares": 10.37,
  "Creo": 10.37,
  "Tower of Agonizing Demise": 10.37,
  "World's Hardest Tower: The Perfect Run": 10.36,
  "Tower of Unstable Ruins": 10.36,
  "Tower of Thje Corner": 10.36,
  "Tower of Micro Management": 10.36,
  "Tower of Ten Is Enough": 10.35,
  "Pillar of Clipping Into Damage": 10.35,
  "Buffed Tower of Very Fast Building": 10.35,
  "Tower of Opposition": 10.35,
  "Tower of Radiant Terror": 10.35,
  "Tower of Plated Thoughts": 10.35,
  "SISTER FINGER SISTER FINGER WHERE ARE YOU": 10.34,
  "Tower of Infinity Trials": 10.34,
  "Tower of Spiralling Fates: Zee's Nerf": 10.34,
  "Tower of Roughly Rotated Ruin": 10.34,
  "Tower of Prolific Gardens": 10.34,
  "Tower of Hotel Exploration": 10.34,
  "Tower of Cautious Crossings": 10.33,
  "Tower of Deprivation Purgatory": 10.33,
  "Samuel's Platoon": 10.33,
  "I AM TOWER": 10.33,
  "Tower of Frightening Nightmares: Unnerfed": 10.33,
  "Steeple of Hyllesakel": 10.32,
  "Tower of Running Outta Time": 10.32,
  "Tower of Misconception": 10.32,
  "Tower of Quantum Mentality": 10.32,
  "Tower of Alien Radiance": 10.32,
  "Steeple of Fading Astray": 10.31,
  "Steeple of Luke Licorice": 10.31,
  "Tower of Whimsical Flummification": 10.31,
  "Tower of Used To Shop At Aldis": 10.31,
  "Tower of Quantum Quadrivium": 10.31,
  "Steeple of True Exponential Difficulty": 10.3,
  "Steeple of Noob": 10.3,
  "Steeple of Getting Lazier": 10.3,
  "Tower of Was Bored": 10.3,
  "Tower of Insensible Distress": 10.3,
  "Steeple of Spite": 10.29,
  "Tower of True Terrible Misalignments": 10.29,
  "Tower of Convolution Meticulousness": 10.29,
  "Tower of Tranquil Resonance": 10.29,
  "Tower of Architectural Agony": 10.29,
  "Tower of Adversity Tabulation: Unnerfed": 10.28,
  "Tower of Fatal Agitation: Unnerfed": 10.28,
  "Tower of Snaky Ascended Obstacles": 10.28,
  "Tower of Jonah Complex": 10.27,
  "Steeple of TUNG TUNG SAHUR": 10.27,
  "Tower of Ultimate Terrifying Chaos": 10.27,
  "Tower of Weakening Anamneses": 10.27,
  "Tower of Dismaying Gesticulation": 10.27,
  "Tower of Yelling A Whole Lot": 10.27,
  "Steeple of Wallhop, Wallhop and Wallhop": 10.26,
  "Tower of Crying and Dying: Alternate": 10.26,
  "Tower of Divine Wrath": 10.26,
  "SUPREME DAKOTA": 10.26,
  "Tower of Excruciating Anguish: Unnerfed": 10.26,
  "Pillar of Indomitable Encumbrances": 10.25,
  "Patrick Pillar": 10.25,
  "D.I.G.I Facility": 10.25,
  "Tower of Dripping Obstacles": 10.25,
  "THE HULTIMATE ULTIMATE GRIDDYVERSE": 10.24,
  "Tower of Classiception": 10.24,
  "Spire of Confined Spaces": 10.24,
  "Tower of Phat Clouds": 10.24,
  "Column of Outer Layers": 10.24,
  "Tower of Conraderien JToH": 10.24,
  "Steeple of Precarious and Antiquated Spelunking": 10.24,
  "Tower of The Spiciest Memes 2077": 10.24,
  "Tower of Death, Death, Even More Death.": 10.23,
  "Tower of Pillar Panic": 10.23,
  "Tower of Chaos Mountain": 10.23,
  "Tower of Metropolis Downpour": 10.23,
  "Tower of Slop Chart": 10.22,
  "Tower of Abrasive Playground": 10.22,
  "Not Even a Monolith": 10.22,
  "Tower of Jukecalla's Fury": 10.21,
  "Tower of Exquisite Death": 10.21,
  "Tower of Thickening": 10.21,
  "Citadel of Goku": 10.21,
  "Tower of Anarchist Fantasies": 10.21,
  "Steeple of Rainy Day": 10.2,
  "Edifice of Dark Depths": 10.2,
  "Tower of Slope Into Destiny": 10.2,
  "Tower of Leaning Interferences": 10.2,
  "Edifice of Spherical Demise": 10.2,
  "Tower of Silly Wiggle Issues": 10.19,
  "Steeple of Central Tribulation": 10.19,
  "Steeple of Raw Salmon": 10.19,
  "Tower of Fractured Complex": 10.19,
  "Tower of A E ER T Y H F R R": 10.19,
  "Tower of Scattered Challenges": 10.19,
  "Steeple of Xenocritic Parallel": 10.18,
  "Steeple of Ljuset": 10.18,
  "Tower of Extreme Yelling": 10.18,
  "Tower of Creamer Based Coffee": 10.18,
  "Tower of Complexity and Volatility": 10.18,
  "Steeple of 15 Minutes": 10.17,
  "Tower of True Skill: Buff": 10.17,
  "Tower of Not Many Days": 10.17,
  "Steeple of A Ton of Tears": 10.17,
  "Tower of Destructive Phantom": 10.16,
  "Tower of THE GRANDE BRAINROT": 10.16,
  "Steeple of Electromegentiyot Mehira": 10.16,
  "Tower of Two Layered Terror": 10.16,
  "Tower of Sempiternal Disquietude": 10.16,
  "Tower of Hell and Heaven: Classic": 10.15,
  "Tower of Questionable and Gimmicky Gameplay": 10.15,
  "Tower of Zip It": 10.15,
  "Tower of Killbrick Calamity": 10.15,
  "Tower of No Time": 10.15,
  "Tower of Specific and Precise Positioning": 10.15,
  "Tower of I Am Iceman": 10.14,
  "Tower of Troubling Purism": 10.14,
  "Tower of Curator's Demise": 10.14,
  "France Edifice": 10.14,
  "Tower of Losing": 10.14,
  "Tower of Claustrophobic Anomalies": 10.14,
  "Tower of Abandoned Pillars": 10.13,
  "Tower of Wierd Sections": 10.13,
  "Tower of Hello Tower": 10.13,
  "Tower of Horizontal Traction": 10.13,
  "Tower of Greenlit Scenery": 10.13,
  "Steeple of Seraphic Energy": 10.13,
  "Tower of Skill Immersion": 10.13,
  "Tower of Painful Poling": 10.13,
  "Truss Tower": 10.12,
  "Polska Wieża": 10.12,
  "Steeple of Purist Anarchy": 10.12,
  "Tower of Purification": 10.12,
  "Tower of Itetsuku Hoshi": 10.12,
  "₯ƒʩɲʠʨʦʯ৻ʯʐɠxƴơ": 10.11,
  "touch grass": 10.11,
  "Tower of Think Is Interesting": 10.11,
  "Cylinder of Evil Retribution": 10.11,
  "Tower of Forever Broken Tears": 10.11,
  "Tower of Rising Foundations": 10.11,
  "Tower of Sorrowful Purgatory": 10.11,
  "Tower of Cat Meow Soup Car Parking Zone But I Wanna Go Play a Soccer": 10.1,
  "Edifice of Nets": 10.1,
  "Tower of Ouroboros": 10.1,
  "Tower of The Avalanche": 10.1,
  "Tower of Prestigious Void": 10.1,
  "Tower of Idiotic Ideas": 10.09,
  "Tower of Big Disappointment": 10.09,
  "Tower of Never Ending Hysteria": 10.09,
  "Tower of Kino": 10.09,
  "Tower of Raw Hotdog": 10.09,
  "Tower of Starblaze": 10.08,
  "Tower of Greyscale: Alternate": 10.08,
  "Tower of Intergalactic Facilities": 10.08,
  "Tower of Kidney Krunching": 10.08,
  "Tower of Kaleidoclash": 10.08,
  "Tower of Neural Duality": 10.08,
  "Tower of Frightening Nightmares": 10.08,
  "Tower of Oobat": 10.07,
  "SWEDEN TOWER": 10.07,
  "Found You Tower: Super Nerf": 10.07,
  "Tower of Devious Purism: Nerf": 10.07,
  "Steeple of Colorless Precision": 10.07,
  "Citadel of Terrifying Beauty": 10.07,
  "World's Hardest Tower: Classic": 10.07,
  "Steeple of Denouement: Alternate": 10.06,
  "Escalator To Heaven": 10.06,
  "Tower of Blast Power: Classic": 10.06,
  "Tower of Painful Remembrance": 10.06,
  "Tower of Intricate Precision": 10.06,
  "Tower of High Velocity": 10.05,
  "Great Citadel of The Drive Towards Boredom's Limit": 10.05,
  "Unnerfed Huvin ja Hauskanpidon Torni": 10.05,
  "Tower of Everlasting Darkness": 10.05,
  "Tower of Impossible Movement": 10.05,
  "two pints of ice cream": 10.04,
  "Tower of Non Flex Wrap": 10.04,
  "Tower of Peace Breaker": 10.04,
  "Tower of Kreeamy Ohio": 10.04,
  "Tower of Mark Tower": 10.04,
  "Tower of Lus Abutendi": 10.04,
  "Tower of Lunar Expansion": 10.04,
  "MOMMY FINGER MOMMY FINGER WHERE ARE YOU": 10.03,
  "Citadel of Corrupted Madness": 10.03,
  "Tower of Encountering The J": 10.03,
  "Citadel of The Eternal Calamity: Super Nerf": 10.03,
  "Tower of Xerically Infuriating Calamity": 10.03,
  "Tower of Modern Ascension": 10.02,
  "Unnerfed Steeple of Toxic of Failure Acid": 10.02,
  "Edifice of Thje Mango": 10.02,
  "Tower of Mangos In Time": 10.02,
  "Tower of THE Pillar": 10.02,
  "Tower of Stingy Tartu": 10.02,
  "Tower of thej10n Should Beat a Cata": 10.02,
  "Steeple of Irrelevant Movement": 10.02,
  "Tower of Jittering Hands": 10.02,
  "Steeple of Twisted Space Time": 10.01,
  "THE ULTIMATE DESTROYER OF LIMITS": 10.01,
  "Tower of The Upper Limit": 10.01,
  "STEEPLE OF MAYBE A DIFFICULTY CHART WITH WALLHOPS": 10.01,
  "Brazil Tower": 10.01,
  "Steeple of The Legendary Rock": 10.01,
  "Steeple of My Permanent Indecision": 10.01,
  "Tower of Thickening Demise": 10.01,
  "Tower of Screaming and Yeeling": 10.01,
  "Steeple of Consistent Ledge Grabbing": 10.01,
  "Steeple of Polynomial-C": 10.0,
  "Tower of Fractured Memories": 10.0,
  "Citadel of a Direct Approach: B-Side": 9.99,
  "Tower of Adversity Tabulation": 9.99,
  "Steeple of Vanishing Vengeance": 9.99,
  "Tower of Ill Humor": 9.99,
  "Tower of Mean Tasks: GBJ Edition": 9.99,
  "Citadel of Scream Like AAAAAA": 9.99,
  "Tower of STONE Hard Very": 9.98,
  "Tower of Stupiduement": 9.98,
  "Tower of Wiggly Layers": 9.98,
  "Tower of Unfathomable Pain": 9.98,
  "Tower of Elongated Runs: Nerf": 9.98,
  "Steeple of Vivid Violet Rot": 9.98,
  "Citadel of Hopeless Hell": 9.98,
  "Tower of Precise and Accurate Jumps": 9.98,
  "Obby 8": 9.97,
  "Tower of Unraveled Code": 9.97,
  "Tower of Going Against Reality": 9.97,
  "Tower of Panelling Barricades: Classic": 9.97,
  "Tower of Extreme Anxiety": 9.96,
  "Tower of Hateful Reflections": 9.96,
  "Tower of A Lonely Travel": 9.96,
  "Dr Frank Hanchoisses Honarnary PHDs Lair": 9.96,
  "Tower of Weird Core: Super Nerf": 9.96,
  "Steeple of The World's Tightest Timer": 9.96,
  "Tower of Austere Designs: Unnerfed": 9.95,
  "Giant Tower of Inception": 9.95,
  "Fortnite Facility": 9.95,
  "Tower of Super Hard": 9.95,
  "Tower of Painful Depression": 9.94,
  "Tower of Simple Jumps: No Jump": 9.94,
  "Tower of Minimal Punishment": 9.94,
  "STEEPLE OF GO GOG OG": 9.94,
  "Tower of Great Perturbation": 9.94,
  "Tower of Externalizing Insanity": 9.94,
  "Steeple of Long Pillars": 9.93,
  "Tower of Lob Expizz": 9.93,
  "Tower of Very Chaotic": 9.93,
  "Tower of Infuriating Progression": 9.93,
  "Tower of Ruined Feeling": 9.93,
  "Tower of Shunning Excursion: Nerf": 9.93,
  "Tower of Some Interesting Gameplay": 9.92,
  "Tower of Colgate": 9.92,
  "Poland Edifice": 9.92,
  "Tower of Hollow Reformations: Absolution": 9.92,
  "Tower of Perebas CumpleAnos": 9.92,
  "Tower of Low Expectations": 9.91,
  "Tower of Hollow Victories": 9.91,
  "Steeple of Lemon Summer": 9.91,
  "Aoharu Tower": 9.9,
  "Tower of Palette Annihilation": 9.9,
  "Tower of Creature Feature": 9.9,
  "Step of Aeterno Dolor": 9.89,
  "Tower of Shattered Resolve": 9.89,
  "Steeple of Zen Kata": 9.88,
  "Tower of Shattered Distress": 9.88,
  "Tower of Corrupting Consequences": 9.88,
  "Tower of Neon Lights Party": 9.87,
  "Sprite Steeple": 9.87,
  "Rooms of Difficulty Chart": 9.87,
  "Tower of Escaping Lava": 9.87,
  "Tower of Excruciating, Demanding Hurdles": 9.86,
  "Tower of Pro": 9.86,
  "Tower of Strong And Incredible Poop": 9.86,
  "Tower of Ruthless Hidden Quintessence": 9.86,
  "Stupid Crown Tower": 9.86,
  "ZAP\\:XL (Classic) infinity redux II": 9.85,
  "Hollow Citadel of Vivid Sections": 9.85,
  "Tower of q Möller": 9.85,
  "Disco Steeple": 9.85,
  "Watering Hose 0.3 - Romanian Struggles": 9.85,
  "Big Outside Annihilation Tower": 9.85,
  "Tower of Neverending Agony": 9.85,
  "Tower of Shatter Heart and Dreams": 9.84,
  "DADDY FINGER DADDY FINGER WHERE ARE YOU": 9.84,
  "Tower of Champion's Road: Nerf": 9.84,
  "Tower of Hasty Hurdles": 9.84,
  "Hysterical Hexad": 9.84,
  "Tower of Carbonell Birthday": 9.83,
  "Tower of soon-ending happiness": 9.83,
  "Tower of Bacon Lettuce Tomato": 9.83,
  "Citadel of Lustrum Mechanica": 9.83,
  "Steeple of Terrifying Chaos": 9.82,
  "Tower 5": 9.82,
  "Tower of Hella Gimmicks": 9.82,
  "Tower of Cliffside Madness": 9.82,
  "butter tower": 9.81,
  "Steeple of Aquamarine": 9.81,
  "Tower of Stress: Super Buff": 9.81,
  "Tower of Industrial Torment": 9.81,
  "Tower of Blind Fate: Super Nerf": 9.81,
  "Vanuatu Edifice": 9.8,
  "Tower of The Avalanche: RT": 9.8,
  "Steeple of Vivid Disturbances": 9.8,
  "Tower of @#1Ω∞": 9.8,
  "Tower of Food Poisoning": 9.8,
  "Tower of Constructed As New": 9.8,
  "Steeple of Obscure Stability": 9.79,
  "Tower of Catastrophic Cataclysm": 9.79,
  "Steeple of I Hate You": 9.79,
  "Tower of Negative Reinforcement": 9.79,
  "Ultra Scary Wallhop Edifice": 9.78,
  "tour de crayon": 9.78,
  "Tower of Furry Jumps": 9.78,
  "Tower of The Night Terror": 9.78,
  "Tower of Unvaried Endurance": 9.78,
  "Tower of Multiple Different Fates": 9.78,
  "Tower of Thinning Layers: Unnerfed": 9.78,
  "Tower of The Third Apple": 9.77,
  "Tower of Inside nor Outside Repeat": 9.77,
  "Tower of Truly Terrible Gameplay and Spikes": 9.77,
  "Tower of Hectic Division": 9.77,
  "Citadel of Vivid Sections": 9.77,
  "Tower²": 9.76,
  "Unnerfed Sakupen Circles": 9.76,
  "Tower of Golden Skies": 9.76,
  "Citadel of Quadruple The Pain": 9.76,
  "Tower of Computer Demolishing": 9.76,
  "World's Hardest Tower": 9.76,
  "Tower of Overwhelming Dread": 9.76,
  "Tower of Vermillion Convolutions": 9.76,
  "Tower of Vibrant Solitude": 9.76,
  "Tower of Mayor Humdinger": 9.75,
  "Tower of Frame Destruction": 9.75,
  "Tower of Prolific Gardens: KToN": 9.75,
  "Steeple of Free Real Estate, Egads!": 9.75,
  "Tower of Flagrant Aggravation: Super Nerf": 9.75,
  "Tower of Difficulty Chart: It\\_Near's Revamp": 9.75,
  "Tower of Upended Vapor": 9.75,
  "skish5": 9.74,
  "Tower of Forty Five Degrees": 9.74,
  "tower of cold hands: terrifying edition": 9.74,
  "Tower of Astronomically Aimless Annoyances: Unnerfed": 9.74,
  "Tower of Deus Ex Machina": 9.74,
  "Tower of Qwerty Uiop: Super Nerf": 9.74,
  "Tower of Confusion Theory": 9.73,
  "Tower of Bob Never Clear": 9.73,
  "Tower of Rugged Endurance": 9.73,
  "Tower of Factual Expertise": 9.73,
  "1 0 0 M Revenge": 9.73,
  "Tower of Untitled Tower": 9.73,
  "Tower of Franchun's Lullaby: Classic": 9.73,
  "Steeple of Ultra Rage": 9.72,
  "Tower of Luminescent Tint": 9.72,
  "Tower of Vicious Obstructions": 9.72,
  "Tower of Seeking Extra Enchantments": 9.72,
  "Tower of Increasing Pressure": 9.72,
  "Tower of Ascent to Glory": 9.72,
  "Steeple of Simple Horizons": 9.71,
  "Tower of Hands Flicking": 9.71,
  "Tower of Watering Spiders Challenging You": 9.71,
  "Tower of Prismatic Haze": 9.71,
  "Tower of Augmented Corruption": 9.71,
  "Tower of Eternal Nightmares": 9.71,
  "Tower of Silver": 9.71,
  "Tower of Killbrick Hell": 9.7,
  "Tower of Een Plus Een Gratis Matras Tuberculose": 9.7,
  "Tower of Lament": 9.7,
  "Tower of Fearing The Heights": 9.7,
  "Tower of Unfortunate Conscious Deliberation": 9.7,
  "Tower of Elongated Runs: Zee's Nerf": 9.7,
  "Tower of The Flag of Rebellion": 9.7,
  "Tower of David Bazooka": 9.69,
  "SQTETEPELT OF FSIPOLUF§QCVBT5GF9/OQUB /Y9TFUQP V": 9.69,
  "Tower of Crippling Debt": 9.69,
  "Tower of Extra Hard Part": 9.69,
  "Tower of Mass Severe Punishment": 9.69,
  "Steeple of Joon Yorigami": 9.69,
  "Tower of THE FOREBODING WALL": 9.69,
  "Tower of Ridiculously Relentless Rage": 9.68,
  "Luminosity": 9.68,
  "Illusionary Night Tower": 9.68,
  "Tower of Maniacal Obstructions": 9.68,
  "Tower of Ease to Abyss": 9.68,
  "Citadel of Ferocious Heights": 9.67,
  "Citadel of Featherine Augustus Aurora": 9.67,
  "Bernard": 9.67,
  "Tower of Appalling Ramification": 9.67,
  "Marlboro Tower": 9.66,
  "Tower of True Skill: Extreme Difficulty Edition": 9.66,
  "Tower of Mijn Toren": 9.66,
  "Tower of Externalizing Insanity: Difficulty Chart": 9.66,
  "Tower of Pure Skill": 9.66,
  "Tower of Blast Power": 9.66,
  "Tower of Wandering Nostalgia": 9.65,
  "Lietuvos Bokštas": 9.65,
  "Tower of Cardiac Arrest": 9.65,
  "Tower of Difficulty Chart: Accurate Edition": 9.65,
  "Tower of Crying In Your Sleep": 9.65,
  "Tower of Severe Trauma": 9.65,
  "Tower of Parallel Heights": 9.65,
  "Tower of Fee Fi Fo Fum": 9.64,
  "Tower of Cruel Memories": 9.64,
  "Tower of Compromised Fear: Super Nerf": 9.64,
  "Tower of Transcendence": 9.64,
  "Tower of Glitching and Breaking": 9.64,
  "Tower of Amazing Skill": 9.64,
  "Tower of Understanding the Medium": 9.63,
  "Citadel of This Man Buff Man": 9.63,
  "Tower of TOILET Ladder Flicks": 9.63,
  "Tower of Shifting Laminations": 9.63,
  "Tower of Hellish Void": 9.63,
  "Tower of Neon Nightmares": 9.63,
  "Red Green Blue Edifice": 9.62,
  "Leaning Tower of Lire": 9.62,
  "Tower of Akougomai Crossings": 9.62,
  "Citadel of Void": 9.62,
  "Cylinder of Pure Pain": 9.62,
  "Tower of Pure Malarkey: The Perfect Run": 9.62,
  "Tower of Game Mn": 9.62,
  "Steeple of Legalizing Nuclear Bombs": 9.61,
  "Steeple of Shrimp and Shell Shindig": 9.61,
  "Tower of Obdurate Conception": 9.61,
  "Obelisk of Thinning Layers": 9.61,
  "Tower of Raspy Cascades": 9.61,
  "Abstract Collab Steeple": 9.6,
  "Tower of Having a Heart Attack": 9.6,
  "steeple of holybrilliant emoji": 9.6,
  "Tower of Sol Luna": 9.6,
  "Giant Tower of Mind Breaking": 9.6,
  "Tower of Bland Gimmicks": 9.6,
  "Slobelisk of Silver Slopes": 9.6,
  "Tower of Goofy Stickers": 9.6,
  "Tower of Polymer Greg Egg": 9.59,
  "Tower of Painful Memories": 9.59,
  "Tower of Glazing On Purism": 9.59,
  "Tower of Table Flipping: Buff": 9.59,
  "Tower of Excruciating Anguish": 9.59,
  "Tower of Underlying Grief": 9.59,
  "Tower of Wane Wrath": 9.58,
  "Steeple of My Strange Little Existence": 9.58,
  "Denouement Tower": 9.58,
  "Tower of Infuriating Agoraphobia Adventures": 9.58,
  "Tower of Callous Desolation": 9.58,
  "Tower of Manifestation": 9.58,
  "Tower of Uttermost Antagonism": 9.58,
  "Tower of The Dripping Amalgam": 9.58,
  "Target Tower: TC Edition": 9.57,
  "Tower of Variation Into Turmoil": 9.57,
  "Tower of Gaming Expression": 9.57,
  "π265": 9.57,
  "Tower of No Confidence Left": 9.57,
  "Tower of Exuberant Encumbrances": 9.57,
  "Tower of Heavy Remorse": 9.56,
  "Tower of Hope": 9.56,
  "Tower of Cold Hands: Super Buff": 9.56,
  "Tower of Cyan Craze": 9.56,
  "Tower of Technological Procedure": 9.56,
  "Tower of Cricket Cricket 🦗🦗🦗": 9.55,
  "Steeple of Secret Box": 9.55,
  "Tower of Trusst Issues": 9.55,
  "Tower of Looksmaxxing": 9.55,
  "Tower of Tears of Joy": 9.55,
  "Meta Tower": 9.55,
  "Tower of Doltish Ninny Dunce": 9.55,
  "Tower of Deep End Displeasure": 9.55,
  "Edifice of Akidasher Fun": 9.54,
  "Tower of Nocturnal Paradise": 9.54,
  "Tower of Mean Obstacles": 9.54,
  "Tower of The Black Goop": 9.54,
  "Tower of Centigrade": 9.54,
  "Tower of Ascent Into Exile": 9.54,
  "Tower of Skit Vs Oliver": 9.53,
  "Steeple of Humble Time": 9.53,
  "Citadel of Difficulty Chart: Revamp": 9.53,
  "Steeple of Unyielding Obsession": 9.53,
  "Tower of Prolonged Runs": 9.53,
  "Tower of Perpetual Speed Required": 9.52,
  "Tower of Wood Fortress": 9.52,
  "Tower of Cascading Uncertainty": 9.52,
  "Tower of Jolly Layers": 9.52,
  "Tower of Inverted Hope": 9.52,
  "Citadel of Muy Scary": 9.51,
  "Steeple of Trusting Techniques": 9.51,
  "ярик кент стипл": 9.51,
  "Tower of Fine Line": 9.51,
  "Steeple of Nyn☆": 9.51,
  "Tower of Frightening Nightmares: Difficulty Chart": 9.51,
  "Not Even In Ruins": 9.51,
  "Steeple of Green Apple": 9.51,
  "Tower of Nyctophobia Confrontation": 9.51,
  "Tower of Virulent Basilisk": 9.5,
  "Great Citadel of Ring 3: The Perfect Run": 9.5,
  "Tower of U N": 9.5,
  "Tower of Pervasive Torment": 9.5,
  "Tower of Dry Hands": 9.5,
  "Tower of Divine Mastery": 9.5,
  "Tower of Lowest Act": 9.49,
  "Citadel of The All-Seeing": 9.49,
  "Tower of Stupidio Namio": 9.49,
  "Citadel of Utter Confusion: Alternate": 9.49,
  "Tower of Familiar Encounters": 9.49,
  "Tower of Horridly Atrocious Architecture": 9.49,
  "Tower of Room Destruction": 9.49,
  "Tower of Wet Socks": 9.49,
  "Tower of Infuriating Supplement": 9.49,
  "Tower of Demented Oddities": 9.48,
  "Tower of Quarrelsome Quarters": 9.48,
  "Tower of Googoo Gaagaa": 9.48,
  "Tower of Pure Dopamine": 9.48,
  "Tower of Strategic Mechanics": 9.48,
  "Tower of Inverse Difficulty Chart": 9.47,
  "Tower of Minimalist's Delight": 9.47,
  "Tower of Runes": 9.47,
  "Tower of Quickly Increasing Anger": 9.47,
  "Tower of Keyboard Yeeting: Super Buff": 9.47,
  "Tower of Intense Increasing Pressure": 9.47,
  "Tower of Spatial Awareness: Super Nerf": 9.47,
  "Tower of Skill and Patience": 9.47,
  "Tower of Taking The Complete Micky": 9.46,
  "100 Thousand Trials": 9.46,
  "Steeple of Rampant Hourly Fabrication": 9.46,
  "Tower of Grand Demise": 9.46,
  "Citadel of Condescendingly Convulsive Climbing": 9.46,
  "Tower of Wicked Fortress": 9.46,
  "Tower of Shattered Penality": 9.45,
  "Tower of Quaint Quadricity": 9.45,
  "Tower of Last Destination": 9.45,
  "Tower of The Wall Gameplay": 9.45,
  "Tower of Fast Paced Descent": 9.45,
  "Steeple of Heart Failure": 9.45,
  "Citadel of Icy Blizzards": 9.45,
  "Tower of Ceaseless Shizzling": 9.45,
  "Tower of Converged Agitation": 9.45,
  "Edifice of This Edifice Has Nothing To Do With Undead Corporation": 9.44,
  "Steeple of Growing Despair": 9.44,
  "Tower of Short Purist Lover": 9.44,
  "Citadel of Frightening and Confusing Trials": 9.44,
  "Tower of Long Lasting Leukophobia: Revamp": 9.44,
  "Tower of Hop on Pop": 9.44,
  "Even A Tower": 9.44,
  "Tower of Terrifying Beauty": 9.44,
  "SEPOL OF GAAA ZELPLUS VS BO VS X Y Z": 9.43,
  "Steeple of Quick Kebab": 9.43,
  "Tower of Extreme Devious Eternity": 9.43,
  "Tower of Quemeful Quoin": 9.43,
  "Tower of Smiley's Hotel": 9.43,
  "Tower of Subspatial Convergence": 9.43,
  "Tower of The Detrimental Dexterity": 9.43,
  "Tower of Abysmal Wrath": 9.43,
  "Steeple of Glitched Memories": 9.42,
  "Tower of Expanding Layers: Alternate 2": 9.42,
  "Tower of Dividing and Confusing Frames": 9.42,
  "Steeple of Sculk": 9.42,
  "Tower of The Jump Junkyard": 9.42,
  "Untitled Tower": 9.41,
  "Tower of Kindest Pineapple": 9.41,
  "Tower of Uncanny Unpleasantness": 9.41,
  "Tower of Frantic Voyages": 9.41,
  "Tower of Tech n Wraps": 9.41,
  "Tower of Torturous Suffering": 9.4,
  "Steeple of Decaying Depths": 9.4,
  "Tower of The Giant Peas": 9.4,
  "Tower of Agonizing Spinners": 9.4,
  "Tower of Suffering Outside": 9.4,
  "Tower of Hopeless Hell": 9.4,
  "tower of w roblox parts": 9.39,
  "Tower of Unknown Shadows": 9.39,
  "Steeple of Screams From The Void": 9.39,
  "Tower of Difficulty Chud": 9.39,
  "Tower of Spoiled Milk": 9.39,
  "Tower of Kakorraphiaphobia": 9.39,
  "Tower of Bon Voyage": 9.39,
  "Tower of Instant Regret": 9.39,
  "Giant Steeple of Obrulaqualis": 9.39,
  "Tower of Unfair Punishment": 9.39,
  "Citadel of Difficulty Chart": 9.39,
  "Citadel of Mouse Bamming Oblivion": 9.38,
  "Tower of Empty Obstruction": 9.38,
  "Steeple of Snowstorm": 9.38,
  "Steeple of Gilly Basilly": 9.38,
  "Tower of Difficulty Chart 2.63": 9.38,
  "Tower of Blueish Monolith": 9.38,
  "Tower of Pestiferous Line": 9.38,
  "Tower of Billy Bob": 9.37,
  "Jumbo Tower: Super Nerf": 9.37,
  "Tower of Inerihl Katahv Qainrey": 9.37,
  "Tower of Dangerous Pillar Adventuring": 9.37,
  "tower of true skill: btool buff": 9.36,
  "Tower of Dreamstate": 9.36,
  "Tower of Horrific Tribulation": 9.36,
  "Tower of Cramping on The Couch": 9.36,
  "Thanos Obelisk": 9.36,
  "Tower of Recurring Agony": 9.35,
  "Steeple of Hope and Delight": 9.35,
  "Edifice of Disky Nitrite": 9.35,
  "Tower of Cold Tears": 9.35,
  "Uber Hard Tower / Tower of The Dawg": 9.35,
  "Tower of Pink Neon Bricks": 9.35,
  "Tower of Quadruple The Pain": 9.35,
  "Tower of Achromatic Nihility": 9.35,
  "Tower of Trouble Sleeping": 9.35,
  "Tower of Truss Hell": 9.34,
  "Tower of Legia Warszawa": 9.34,
  "Tower of Forget Me Not": 9.34,
  "Tower of Popus Gl6bus": 9.34,
  "Tower of Cluttered Cash Catastrophe": 9.34,
  "Tower of g Möller": 9.34,
  "Steeple of The Wall's Wrath": 9.33,
  "Tower of Stereo Madness": 9.33,
  "Tower of Big Risks": 9.33,
  "Tower of Merciless Treatment": 9.33,
  "Tower of Unusual Cacophony": 9.33,
  "Tower of Going Crazy": 9.33,
  "Edifice of Super Cool and Epic Gameplay": 9.32,
  "Steeple of Kocmoc But I Got Tired And Added Filler W PRC": 9.32,
  "Tower of Feel The Electric": 9.32,
  "Tower of Fatal Endeavours": 9.32,
  "Steeple of Thinning Mucus": 9.32,
  "Tower of 2 AM": 9.32,
  "Tower of Constant Color Fusion": 9.32,
  "Tower of An Iron Will": 9.32,
  "Tower of Pure Torment": 9.32,
  "Tower of Radio Vibe": 9.31,
  "Original Tower of Dark and Creepy": 9.31,
  "Dimension Steeple": 9.31,
  "Alalal Steeple": 9.31,
  "Tower of Falling Doom": 9.31,
  "Tower of Ultima Exitium": 9.31,
  "Tower of Devious Emptiness": 9.31,
  "Tower of Cruel Punishment: NToH Nerf": 9.31,
  "Tower of Occurring Ramifications": 9.31,
  "Steeple of Faces in Variation": 9.3,
  "Edifice of One Jam One Jar": 9.3,
  "Edifice of Dirty Doctor Pepper": 9.3,
  "Great Citadel of Walking Across The Sahara": 9.3,
  "Steeple of Sparks Will Fly": 9.3,
  "Tower of Blue Zenith": 9.3,
  "Tower of Wolf's Roarness": 9.3,
  "Tower of Exponential Difficulty": 9.3,
  "Tower of D D D D D D D D Drop The Bass": 9.3,
  "Citadel of Goku V4": 9.29,
  "Tower Exists, Tower Obsolete": 9.29,
  "of Joca Monday 4 Void": 9.29,
  "Tower of Haery Hanchovies": 9.29,
  "Steeple of Tombs & Torture": 9.29,
  "Tower of Deceiving Failure": 9.29,
  "Steeple of Fractured Memorabiljia": 9.28,
  "Steeple of Expecting Something Better: Buff": 9.28,
  "Cylinder of Irregular Movement": 9.28,
  "Citadel of Curved Ascent": 9.28,
  "Thor Tower": 9.28,
  "Tower of Festive Affairs": 9.28,
  "Tower of Incepted Difficulty Chart": 9.27,
  "Tower of Killbrick Hell: Classic": 9.27,
  "Tower of Difficulty Chart: Purist": 9.27,
  "Tower of Blissful Unconsciousness": 9.27,
  "Tower of Raw, Unfiltered Skill": 9.27,
  "Tower of Jolly Situations": 9.27,
  "fifteen": 9.26,
  "Tower of Zany Zigzags": 9.26,
  "Tower of Pure Torment: Classic": 9.26,
  "Steeple of Cube Tower": 9.26,
  "Tower of Zooming By": 9.26,
  "Tower of Stigmatism": 9.26,
  "Tower of Paradise: Super Nerf": 9.26,
  "Tower of Astronomically Aimless Annoyances": 9.26,
  "Tower of The Doom Wall": 9.25,
  "Tower of Mutilation": 9.25,
  "Tower of Claustrophobic Fates": 9.25,
  "Tower of Creamzicle Chart": 9.25,
  "Tower of Kesulitan Mendaki": 9.25,
  "Tower of Ten Floors Challenge: True Mode": 9.25,
  "Tower of Difficulty Chart: Difficulty Chart": 9.25,
  "Steeple of Corruption": 9.25,
  "Tower of Mental Breakdown": 9.25,
  "Tower of Extreme Anguish": 9.25,
  "Citadel of Broken Tables": 9.24,
  "Tower of Brimstone Flames": 9.24,
  "Room of Ghoulish Necromancy": 9.24,
  "Tower of Volition": 9.24,
  "Tower of Nightmarish Dreams": 9.24,
  "Tower of Super Ultimate": 9.24,
  "Steeple of Death and Despair": 9.24,
  "Citadel of Glitching and Healing: The Perfect Run": 9.24,
  "Tower of Under The Limit": 9.24,
  "Edifice of Flicking and Clicking": 9.23,
  "π323": 9.23,
  "Tower of Wacky, Symmetrical Confinements": 9.23,
  "Tower of Rain on My World: Ascension": 9.23,
  "Tower of Wackiness": 9.23,
  "Tower of Circuits and Lasers": 9.23,
  "Citadel of Deterioration": 9.22,
  "Fort of Baffling Anomalies": 9.22,
  "Tower of Corrupted Nightmares Nightmares Scary": 9.22,
  "Tower of Artificial Joy": 9.22,
  "Tower of Fumbling Frenzy": 9.22,
  "Tower of Malnourished Vindication": 9.22,
  "Tower of Umbratic Complexity: Secret Ending": 9.21,
  "Tower of Pig Rabbit Crab Thinning Layers": 9.21,
  "π314": 9.21,
  "Tower Infinity": 9.21,
  "Tower of No More Teleporters": 9.21,
  "Steeple of Exponential Difficulty": 9.21,
  "Tower of Classical Torment": 9.21,
  "Citadel of Skyward Ascension": 9.2,
  "Citadel of Trauma Stickout": 9.2,
  "Tower of Tabasco Sauce": 9.2,
  "Tower of The Lumen Sage": 9.2,
  "Windows Tower": 9.2,
  "Tower of Paint Thinner": 9.2,
  "Tower of Increasing Heart Rates": 9.2,
  "Tower of Senseless Internal Pain": 9.2,
  "Steeple of While Discussing Pneumonoultramicroscopicsilicovolcanoconiosis, The Hippopotomonstrosesquipedaliophobic Scholar Accidentally Mispronounced Supercalifragilisticexpialidocious During An Electroencephalographically Monitored Honorificabilitudinitatibus Symposium On Thyroparathyroidectomized Microorganisms.": 9.19,
  "Tower of Vigorous Xany": 9.19,
  "Tower of Ceiling Quiz": 9.19,
  "Pumpkin Steeple": 9.19,
  "Tower of Virulent Quiescence": 9.19,
  "Tower of Austere Designs": 9.19,
  "Tower of Panelling Barricades": 9.19,
  "DEVIOUS TOWER 1": 9.18,
  "Tower of Shunning Excursion: Super Nerf": 9.18,
  "Tower of Doing The": 9.18,
  "Tower of Hollow Augmentations": 9.18,
  "Steeple of Untitled Griddy": 9.18,
  "Tower of Gameplay Test": 9.17,
  "Kuwait Edifice": 9.17,
  "Steeple of Miss Pink Elf": 9.17,
  "Citadel of Quirky Inconveniences": 9.17,
  "Tower of Impossible Movement: Difficulty Chart": 9.17,
  "Tower of Octophobia": 9.17,
  "Tower of Bitter Melancholy": 9.17,
  "Steeple of Surging Trove": 9.16,
  "Steeple of Agra: Extreme": 9.16,
  "Tower of josh": 9.16,
  "Impossible Obby Tower": 9.16,
  "Tower of The Average TC Empty Tower": 9.16,
  "a mini tower that is slightly bigger, and has 54+61 floors of nibbling on purple apples": 9.16,
  "Tower of Vindictive Maneuvers: Nerf": 9.16,
  "Tower of Real Lies": 9.15,
  "Tower of Perpendicular Layers": 9.15,
  "Tower of Raw Skill Required": 9.15,
  "Tower of Softlock Heaven": 9.15,
  "Tower of Kratic": 9.15,
  "Citadel of Utter Confusion": 9.15,
  "Tower of TSCR Exclusive": 9.14,
  "Tower of Noobs Road": 9.14,
  "Tower of Darkest Nebulae": 9.14,
  "Tower of Space Resizing": 9.14,
  "Tower of Hecc and Back": 9.14,
  "Citadel of Infinity Gauntlet": 9.13,
  "Mali Edifice": 9.13,
  "Steeple of Zero Reinforced Frameworks": 9.13,
  "Great Citadel of Laptop Splitting": 9.13,
  "Tower of Complex and Idiotic Gameplay": 9.13,
  "Tower 1": 9.13,
  "Tower of Perpendicular Angle": 9.12,
  "Tower of My Uncanny World": 9.12,
  "Tower of Dwindling Veneer": 9.12,
  "Salt Pillar of Increasification Demotivizationizer": 9.12,
  "Dakotan Steeple": 9.12,
  "Tower of Revolving Peril": 9.12,
  "Maybe a Soul Crushing": 9.11,
  "Not Thanos Tower": 9.11,
  "Steeple of Languorousness": 9.11,
  "Tower of Irritating Structures": 9.11,
  "Tower of Clean Glass": 9.11,
  "Tower of Baleful Impedes": 9.11,
  "Edifice of Wigglecore Without Wiggles and Zeronium": 9.1,
  "Tower of Repeated Frame Action": 9.1,
  "Tower of Yuxian Kongjian": 9.1,
  "Steeple of Bridging The Gap": 9.1,
  "Tower of Chromatic Chaos": 9.1,
  "Tower of Super Sweet Scaling": 9.1,
  "Steeple of Celestial Serenity": 9.1,
  "Tower of the Planets": 9.1,
  "Baldi Citadel": 9.09,
  "Buffed Tower of Analysis Explorer": 9.09,
  "Tower of Laying Thinners": 9.09,
  "Tower of Yap Yap Yap": 9.09,
  "Tower of The Perfect Run": 9.09,
  "Tower of Impossible Expectations: Buff": 9.09,
  "Tower of Void Storm": 9.09,
  "Tower of Bloodthirsty Kenos": 9.09,
  "America Ediface": 9.08,
  "Tower of Orang Hamsterball": 9.08,
  "Tower of Little Shlant": 9.08,
  "Steeple of Insanity: ZHT": 9.08,
  "Steeple of Regular Shmegular": 9.08,
  "Tower of Extreme Demon Escalation": 9.08,
  "Steeple of Blood Clot: Deathless": 9.08,
  "Tower of Just Do It": 9.08,
  "Tower of Bodacious Blinding Blue Purism": 9.07,
  "Steeple of Muscle Atrophy": 9.07,
  "Tower of Obscene Outside Chaos": 9.07,
  "Tower of Elite Mechanics": 9.07,
  "Tower of Frameless Works": 9.07,
  "Tower of Luminescent Windows": 9.07,
  "tower of supercalifragilistic expialidocious": 9.06,
  "Steeple of Expecting Something Better: Least Parts": 9.06,
  "Steeple of No Safety Available": 9.06,
  "Tower of GBJ": 9.06,
  "Fort of Twisted Torsion": 9.06,
  "Tower of Glu Glu Glu": 9.06,
  "Steeple of Obeliscolychny": 9.06,
  "Tower of Sideways Strides": 9.06,
  "Tower of The DiCaprio Story": 9.06,
  "Tower of Zilly Xany": 9.05,
  "Tower of Geometrical Purgation": 9.05,
  "Chinese House Expansion Tips": 9.05,
  "Tower of A Simple Time: Least Parts": 9.05,
  "Tower of Mass Severe Punishment: Revamp": 9.05,
  "Tower of Menacing Jank": 9.05,
  "Steeple of Against All Authority": 9.05,
  "Tower of Elongated Runs: NToH Nerf": 9.05,
  "Giant Steeple of Towering Pillars": 9.05,
  "Tower of Gateway Protocol": 9.05,
  "Tower of Ruptured Division": 9.05,
  "Tower of Scoliosis": 9.04,
  "Citadel of Triangle Difficulty Chart": 9.04,
  "Raybe A Tower": 9.04,
  "Tower of Goofy Antics": 9.04,
  "Tower of Was Bored: Place Version": 9.04,
  "Tower of Systematically Malfunctioned": 9.04,
  "⅏⅏⅏⅏⅏⅏⅏⅏⅏ edifice": 9.04,
  "Tower of Rushing and Dashing": 9.04,
  "Tower of Questionable Structural Integrity": 9.03,
  "Citadel of Extreme Confusion": 9.03,
  "Tower of Extremely Troublesome Obstacle Hell": 9.03,
  "Enlightened Pathways": 9.03,
  "Steeple of Denouement": 9.03,
  "The Challenge Tower": 9.03,
  "Tower of Yonder Wisterias": 9.03,
  "B̉illy": 9.03,
  "Steeple of Mentally Dying": 9.03,
  "Tower of Breaking the Core": 9.03,
  "Tower of Contraposition": 9.03,
  "Steeple of Resourceful Itinerary": 9.02,
  "Tower of Ascending Luminosity": 9.02,
  "Steeple of Jank Smoothie": 9.02,
  "Steeple of True Insanity": 9.02,
  "Tower of Hijacked Voltage: Hard Mode": 9.02,
  "Tower of Quiescent Excruciations": 9.02,
  "Tower of Leap Impairment": 9.02,
  "Tower of Jayingeration Ultimates 12": 9.02,
  "Tower of Painful Purism": 9.02,
  "Tower of Spatial Ruins": 9.02,
  "Tower of Both Sides": 9.02,
  "Tower of Arduous Agility": 9.01,
  "Tower of Linear Slop": 9.01,
  "Pillar of Button Abundance": 9.01,
  "Tower of 40 Obstacles To Victory": 9.01,
  "Denouement Tower: Classic": 9.01,
  "THE Tower of Hell": 9.01,
  "Mini Obelisk of Mini Obelisk": 9.01,
  "Tower of Short French Fries": 9.01,
  "Steeple of A Down": 9.01,
  "Tower of Chocolate Milk": 9.0,
  "Tower of Kyoi Tekina": 9.0,
  "Tower of Astral Eclipse": 9.0,
  "Tower of Reckless Noble Construction": 8.99,
  "Conservative Steeple": 8.99,
  "Tower of Crawling Literally Apples Unreally Stressing The Really Obbyful Phobias Hitting Our Best Intense Apples": 8.99,
  "Tower of Obskurer Einfallsreichtum": 8.99,
  "Tower of Thinning Slop": 8.99,
  "Citadel of Varying Difficulties: Classic": 8.99,
  "Citadel of Accepting Defeat": 8.99,
  "Tower of Confronting The Z": 8.99,
  "Tower of Rage: Buff": 8.99,
  "Tower of Frightening and Confusing Trials": 8.99,
  "Tower of Phonk Is Incredible": 8.98,
  "Tower of Ultra Forgiveness": 8.98,
  "Steeple of Runes": 8.98,
  "Edifice of Frightening Obligations": 8.98,
  "Tower of Joobly Chart: Classic": 8.98,
  "Tower of Confusingly Curved Pole": 8.98,
  "Tower of Contemporary Simplicity": 8.98,
  "Tower of Northern Winds": 8.98,
  "Tower of Race To The Crown": 8.97,
  "Steeple of Vicious Obstructions": 8.97,
  "Tower of One Line": 8.97,
  "Tower of Reverse Difficulty Chart": 8.97,
  "Steeple of Extremity": 8.97,
  "Citadel of The Hippopotamus Wikipedia": 8.97,
  "Tower of The Walls Have Eyes": 8.97,
  "Tower of Sitting Down": 8.97,
  "Tower of Greedy Spare": 8.96,
  "Tower of lildly lacky londers": 8.96,
  "Tower of George Washington Never Clear: Freedom Mode": 8.96,
  "Tower of Btools Difficulty Chart Obby": 8.96,
  "Tower of Crazy Agony Real Treacherous Insanity": 8.96,
  "Tower of The Homefinder: Super Nerf": 8.96,
  "Tower of Heaven": 8.96,
  "Citadel of Whimsical Ways": 8.96,
  "Citadel of Mind Breaking": 8.96,
  "Tower of Tee Hee Time": 8.96,
  "Tower of Potbelly Pop": 8.95,
  "Steeple of '); DROP TABLE Towers;--": 8.95,
  "Tower of Agonizing Structures": 8.95,
  "Tower of Horrendous Nuisances": 8.95,
  "Tower of Challenging Obstacle Anarchy: Zee's Nerf": 8.95,
  "Tower of Shattered Dreams: Buff": 8.95,
  "Citadel of Impending Risk": 8.95,
  "Tower of Spinning Nightmare": 8.95,
  "Tower of Spiral Obligations": 8.95,
  "Citadel of Infinity Gauntlet: Alternate": 8.94,
  "Tower of Difficulty Tower X": 8.94,
  "Tower of Pain, Agitation and Frustration": 8.94,
  "Tower of Elongated Runs: Insane": 8.94,
  "Tower of BIG IGB GIB FAIL AILF ILFA LFAI: Unnerfed": 8.94,
  "Steeple of Painful Fails": 8.94,
  "Tower of Cruel Punishment: Super Nerf": 8.94,
  "Tower of Conveyor Alignment Visible": 8.93,
  "Tower of Round N' Round": 8.93,
  "Citadel of Difficulty Chart: Classic RToA": 8.93,
  "Tower of Selling Your Soul": 8.93,
  "Tower of Elaborate Solutions": 8.93,
  "Steeple of Hazardous Xesturgy": 8.92,
  "Tower of Curved Ascent: Requiem": 8.92,
  "Hello, My Name is Steeple": 8.92,
  "Edifice of Toothpaste": 8.92,
  "Steeple of Insanity": 8.92,
  "Great Citadel of Ring 2": 8.92,
  "Tower of Linked Insanity": 8.92,
  "Thanos Citadel": 8.92,
  "Tower of Humpty Dummy": 8.91,
  "Great Citadel of Lesbian": 8.91,
  "Tower of Velleity Skills": 8.91,
  "Tower of Sunflower Seeds": 8.91,
  "Tower of Descent Into Depths": 8.91,
  "Citadel of Forever Resetting": 8.91,
  "Steeple of Irritating Unbalance": 8.91,
  "Tower of Arctic Hollows": 8.91,
  "Oops! All Floors!": 8.9,
  "Tower of Glitching and Healing: Difficulty Chart": 8.9,
  "Tower of Cerulean Jeopardy": 8.9,
  "Tower Tower Tower Tower": 8.9,
  "Tower of Claustrophobia": 8.9,
  "Tower of Spiritual Rise: Super Nerf": 8.9,
  "Tower of Thinning Layers: Modern Revamp: Unnerfed": 8.89,
  "Tower of The Tutorial": 8.89,
  "Tower of Distorted Nightmares": 8.89,
  "Tower of Soul Crushing Escalation": 8.89,
  "Tower of Korean Style": 8.89,
  "Tower of Pure Evil": 8.89,
  "Ikea Tower: Super Nerf": 8.89,
  "Tower Point Five": 8.88,
  "Tower of Augmenting Purism": 8.88,
  "Mesmerizer Tower: Super Nerf": 8.88,
  "Tower of Quirky Structuring": 8.88,
  "Citadel of Unsettling Heights": 8.88,
  "Not Even Fun": 8.88,
  "Tower of Really Very Artificial Inspiration": 8.88,
  "Tower of Spin to Win": 8.88,
  "Tower of Saliva³": 8.87,
  "Steeple of Broken Hearts": 8.87,
  "Tower of Practice Skill": 8.87,
  "Tower of Eles Tar Jus": 8.87,
  "Citadel of Insanity": 8.87,
  "Tower of Nonsense": 8.87,
  "Tower of Malefic Nuisances: Super Nerf": 8.87,
  "Tower of Rough Endoplasmic Reticulum": 8.87,
  "Tower of Big Wave Beach": 8.86,
  "Steeple of 16 Minutes": 8.86,
  "purism": 8.86,
  "The Lesser Centurial: nerfde": 8.86,
  "Steeple of Oblivious Obligations": 8.86,
  "Tower of Annoyingly Simple Trials: Difficulty Chart": 8.86,
  "Tower of Mirrored Hecc: Super Buff": 8.86,
  "Tower of Seal The Deal": 8.86,
  "Tower of Wildly Spreaded Dangers": 8.86,
  "Citadel of High Sky Rise": 8.86,
  "Unnerfed Steeple of Final One": 8.85,
  "Tower of Acu Nuance": 8.85,
  "Obelisk of Impossible Expectations: The Perfect Run": 8.85,
  "Tower of Code Red": 8.85,
  "Tower of Tedious and Stodgy": 8.85,
  "Tower of Descent Into Exile: Super Nerf": 8.85,
  "Cylinder of Irritating Frontiers": 8.84,
  "Steeple of Heavenly Dreams": 8.84,
  "Tower of Deep Darkness: Buff": 8.84,
  "Tower of Elysium: Super Buff": 8.84,
  "Tower of Industrial Revolution": 8.84,
  "t": 8.83,
  "Tower of Sour Grapes": 8.83,
  "Tower of Empty Inside": 8.83,
  "Radio Tower: Super Nerf": 8.83,
  "crusty sock": 8.83,
  "Tower of Futile Retribution": 8.83,
  "Steeple of Fervent Festivities": 8.83,
  "Tower of Questions: Buffed": 8.82,
  "Tower of Swift Annihilation": 8.82,
  "Tower of Purist Obscurity": 8.82,
  "Tower of Combustion": 8.82,
  "Tower of Climbing Wall": 8.82,
  "Tower of Blissful Ignorance": 8.82,
  "Edifice of The Journey To Find The One Piece": 8.81,
  "Tower of Aligned Deliration": 8.81,
  "Tower and Peanuts Tower and Prunes": 8.81,
  "Steeple of Herniated Disks": 8.81,
  "Tower of Neon Orange": 8.81,
  "Earl Sweatshirt's Forest": 8.81,
  "Tower of Abstract Galaxies": 8.81,
  "Thanos Tower: Classic": 8.81,
  "Tower of Otherworldly Expertise: Super Nerf": 8.81,
  "Spire of Water Bottle": 8.8,
  "Tower of Reverse Layers": 8.8,
  "Tower of Mom": 8.8,
  "Tower of Shifting Sizes": 8.8,
  "Tower of Matcha Labubu": 8.8,
  "Tower of Terrifying Sorcery": 8.8,
  "Tower of Cancer": 8.8,
  "Tower of Scaling Simple Intensity": 8.8,
  "Tower of Deadly Pitfalls": 8.8,
  "Tower of Pure Skill: Classic": 8.8,
  "Tower of Claustrophobic Nightmares": 8.79,
  "Tower of Scattered Rooms": 8.79,
  "Crossfire Steeple": 8.79,
  "Tower of Warranted Obstructions": 8.79,
  "Power Tower": 8.79,
  "Tower of Seeking Unused Techniques": 8.79,
  "Tower of Rain on My World": 8.79,
  "Tower of Virulent Sojourn: Super Nerf": 8.79,
  "c": 8.78,
  "Steeple of Trusscapes": 8.78,
  "Tower of Why So Serious?": 8.78,
  "Tower of Oceanic Views": 8.78,
  "Steeple of Idiosyncratic Ruins": 8.78,
  "Steeple of Lodge": 8.78,
  "Tower of Delicate Quiescence": 8.78,
  "Tower of Two To One": 8.78,
  "Tower of Polychromatic Zero": 8.78,
  "Tower of Jump Incapacity": 8.77,
  "Steeple of Suspension": 8.77,
  "Steeple of Super Cutesy Climb": 8.77,
  "Tower of Pure Skill: solsrngguy97": 8.77,
  "Tower of Elongated Runs: Myth's Nerf": 8.77,
  "Tower of Minimal Part Usage": 8.77,
  "Tower of Prompt Purism": 8.77,
  "Tower of Thje": 8.77,
  "Tower of Ultimate Painful: Classic": 8.77,
  "Tower of Rushed Collaborative Efforts": 8.77,
  "Tower of Never Winning": 8.76,
  "Tower of One Hour Difficulty Chart": 8.76,
  "Tower of #####": 8.76,
  "Tower of Pure Unfun": 8.76,
  "Tower of Bitter Sweet Suffering": 8.76,
  "Sushi Steeple": 8.76,
  "Tower of Chandler Softwood": 8.76,
  "Tower of Pure Suffering": 8.76,
  "Tower of The Fog Is Coming": 8.76,
  "Steeple of Gears Locked Up Because It's Cold": 8.76,
  "Steeple of The Fracture": 8.75,
  "Tower of Purist Hell": 8.75,
  "Steeple of An Ascension": 8.75,
  "Tower of Awesome Stuff": 8.75,
  "Tower of \\:SteamHappy:": 8.75,
  "Tower of Quality": 8.75,
  "Tower of Vicious Punishment": 8.75,
  "Tower of Luscious Greenery": 8.75,
  "Citadel of Papaya Journey": 8.75,
  "Tower of Accepting Defeat": 8.75,
  "Tower of Kančia Išorėje": 8.75,
  "Tower of Un Ca: Super Nerf": 8.75,
  "vved\\_12": 8.74,
  "Steeple of Suspiciously Large Right Arm: Super Nerf": 8.74,
  "Steeple of Zehn Kekse": 8.74,
  "Tower of Thinning Sanity": 8.74,
  "Edifice of Technological Retrospective": 8.74,
  "Tower of Inevitable Failure: Difficulty Chart": 8.74,
  "Tower of Underlying Grief: Nerfdate": 8.74,
  "Tower of Onerous Purification": 8.74,
  "Tower of Vicious Interludes": 8.74,
  "Tower of Skill Test": 8.74,
  "Tower of Intense Situations": 8.74,
  "America Tower": 8.73,
  "Tower of Greatening Compaction: The Perfect Run": 8.73,
  "Tower of Bursting Veins": 8.73,
  "Tower of The Greenish Ascent": 8.73,
  "Steeple of Truss Difficulty Chart": 8.73,
  "Tower of Neverending Madness": 8.73,
  "Tower of Scarred, Infernal Calamity": 8.73,
  "Tower of The Corner Ascension": 8.73,
  "Tower of Pits and Death": 8.73,
  "Tower of Unending Bamboozles": 8.73,
  "Tower of Back and Forth Maneuvers": 8.72,
  "Tower of Thje Baseline": 8.72,
  "Steeple of Aspiration": 8.72,
  "Citadel of Difficulty Chart: Classic": 8.72,
  "Steeple of Broccoli": 8.72,
  "Tower of Sat On The Toe": 8.72,
  "Tower of Nice Tasks": 8.72,
  "collabidel": 8.71,
  "Nacre of Plum Chewing": 8.71,
  "Tower of Die Kurve": 8.71,
  "Column of Anemic Pandemonium": 8.71,
  "Tower of Plaque Etiquette": 8.71,
  "Tower of Performing Hideous Exercises": 8.71,
  "Tower of Killjoys: Super Buff": 8.71,
  "Tower of Abandonment": 8.71,
  "Tower of Au Revoir, Sunset": 8.71,
  "Tower of Narrowing Levels": 8.7,
  "popsicle": 8.7,
  "Tower of Abstract Duality": 8.7,
  "Tower of Impossibility": 8.7,
  "Tower of Awfulnis": 8.7,
  "Tower of Treacherous Parkour": 8.7,
  "Tower of annoyingox Never Clear": 8.7,
  "Tower of Eye of Tranquil Tempest": 8.7,
  "Tower of Rheumatoid Arthritis": 8.7,
  "Tower of Destructive Uprise": 8.7,
  "Tower of Twenty Nineteen": 8.7,
  "Tower of Perplexity Tabulation": 8.7,
  "Tower of Eternal Purple": 8.69,
  "Tower of Extremely Empty Entire": 8.69,
  "tomo pi palisa suli": 8.69,
  "Tower of Modern Art": 8.69,
  "Tower of XMas Ascension": 8.69,
  "Tower of Established Grievances": 8.69,
  "Tower of Rotten Burger": 8.69,
  "Obelisk of Peril": 8.69,
  "Steeple of Wandering Willow": 8.69,
  "Edifice of Frame Switch": 8.68,
  "Miguel O' Towa": 8.68,
  "Patch Edifice": 8.68,
  "Tower of Decayed Silo": 8.68,
  "Tower of Death Conglomerate": 8.68,
  "Tower of Linonophobia: Super Buff": 8.68,
  "Tower of Witnessing The Q": 8.68,
  "Tower of Vast Scarcity": 8.68,
  "Tower of Aesthetic Urbanization": 8.68,
  "Tower of Movin' Right Along": 8.68,
  "Tower of Carpal Tunnels": 8.68,
  "Steeple of Greatful Memories": 8.67,
  "Tower of I Like Infernos": 8.67,
  "Steeple of Celestial Fade": 8.67,
  "Tower of Needed Dexterity": 8.67,
  "Tower of Elegant Purism": 8.67,
  "Tower of Colon 3": 8.67,
  "Tower of Minimum Wage": 8.67,
  "Tower of Hollow Reformations": 8.67,
  "Tower of Icy Blizzards": 8.67,
  "Tower of Slowly Giving Up": 8.66,
  "Mastery of Tanuki Half Stud": 8.66,
  "Tower of Astral Fusion: Unnerfed": 8.66,
  "Steeple of Dying Inside": 8.66,
  "Tower of Mild Destruction": 8.66,
  "Tower of Big Wave Beach: Old": 8.66,
  "Tower of Scintillating Microscale": 8.66,
  "nineteen characters": 8.65,
  "Tower of Desperation": 8.65,
  "Tower of Brain Damage": 8.65,
  "Tower of Unforgiving Obstacles": 8.65,
  "Tower of Outlined Outsides": 8.65,
  "Tower of Nonsensical Slope Trekking": 8.65,
  "Tower of Undeify": 8.65,
  "Tower of Cataclysmic Layers: Super Nerf": 8.65,
  "Citadel of Thinning Layers": 8.65,
  "Steeple of Truss Issues": 8.64,
  "Tower of Small Window of Opportunity": 8.64,
  "Steeple of Pillaring Fusion": 8.64,
  "Tower of Deviating Levels": 8.64,
  "Tower of Tower One": 8.64,
  "Tower of Help Me, Please": 8.64,
  "Tower of Bad Purism": 8.64,
  "Steeple of Head Hitter Hell": 8.64,
  "Tower of Curved Madness": 8.64,
  "Tower of Increasing Paroxysm": 8.64,
  "S.T.O.N.E Facility: Super Nerf": 8.64,
  "Tower of Ultimate Painful": 8.63,
  "Steeple of Kirill and Arseniu are Twins": 8.63,
  "Dark Steeple": 8.63,
  "Stunning Tower of Fantasy: Hard Mode": 8.63,
  "Tower of Pillaring Heights": 8.63,
  "Tower of Pushin o' Plenty": 8.63,
  "Tower of Extremely Secluding Emptiness": 8.63,
  "Tower of Jpeg Jaffa Caked Carti": 8.63,
  "Tower of Enraging Advancement": 8.63,
  "Tower of Slipping Through Reality": 8.63,
  "Citadel of Greenery": 8.62,
  "Tower of Ruined Rotated Platforms": 8.62,
  "Steeple of Mat Recycling": 8.62,
  "Tower of Random Thoughts": 8.62,
  "Tower of 20 Obstacles To Victory": 8.62,
  "Steeple of Aurora Skies": 8.62,
  "Tower of Lonesome Sorrow": 8.62,
  "Paul's Mayhem": 8.62,
  "Tower of Unfortunate Outcomes": 8.62,
  "Tower of Silly String": 8.62,
  "Tower of Bruh Moments": 8.62,
  "Tower of Hellish Rouge": 8.62,
  "Tower of Thinning Trauma": 8.61,
  "Citadel of Safety Equals False": 8.61,
  "Doubtably a Wonderful Greatness": 8.61,
  "Tower of System Solarize": 8.61,
  "Edifice of You're Ou're U're Re E Good Ood Od D": 8.61,
  "Tower of Crimson Synthesize": 8.61,
  "Tower of Viridescent Severity": 8.61,
  "Tower of Hopeless Defeat": 8.61,
  "Tower of I Don't Know": 8.61,
  "Tower of Just Hard Gameplay": 8.61,
  "Tower of Confusion": 8.61,
  "Tower of Abrasive Ascent": 8.6,
  "Tower of Pig Rabbit Crab True Skill": 8.6,
  "Citadel of Double Trouble: Alternate": 8.6,
  "Gengetsu Tower": 8.6,
  "Tower of Calvary Venturing": 8.6,
  "Tower of Ascent From Hellfire": 8.6,
  "Steeple of Surmounting": 8.6,
  "Tower of Thinning Layers: Difficulty Chart MToDC": 8.6,
  "Problematic Steeple": 8.6,
  "Steeple of Fateful Gloominess": 8.6,
  "Steeple of Cortical Granules": 8.6,
  "Tower of Thin Mints: Super Nerf": 8.6,
  "Obelisk of Wacky Strategy": 8.6,
  "Tower of Contrasting Themes": 8.6,
  "Steeple of Fearing Down": 8.59,
  "Tower of Going Crazy: Original": 8.59,
  "Tower of Thinning Confusion": 8.59,
  "Tower of Mustard Bag": 8.59,
  "Daniel's Tower of Hecc": 8.59,
  "Tower of Voidless Maelstrom": 8.59,
  "Tower of Vivid Sections": 8.59,
  "Tower of Funny Dog": 8.59,
  "Tower of Minimal Obstacles": 8.59,
  "Tower of Raging Ronalds Red Revenge": 8.58,
  "tower of idk what name": 8.58,
  "Tower of Cosmic Radiance": 8.58,
  "Fort of Negligence": 8.58,
  "Tower of Short N' Bitter": 8.58,
  "Citadel of Wacky Strategy: Unnerfed": 8.58,
  "Tower of Flipping Over and Over": 8.58,
  "Tower of Air Pollution": 8.58,
  "Citadel of Linear Death": 8.58,
  "Steeple of Cheese Burger: Super Nerf": 8.58,
  "Tower of Speed Buildin' It": 8.57,
  "Steeple of Blind Ate": 8.57,
  "Column of Arduous Ascension": 8.57,
  "Spire of Extreme Deadliness": 8.57,
  "Tower of Purified Illusions": 8.57,
  "Citadel of Satan's Wrath": 8.57,
  "Tower of Massive Regret": 8.57,
  "Tower of Abysmal Inferno": 8.57,
  "Citadel of Indeterminate Turf": 8.57,
  "Citadel of Varying Difficulties": 8.57,
  "Steeple of Lika 97": 8.56,
  "Edifice of Rocket": 8.56,
  "Tower of Killjoys: Least Parts": 8.56,
  "Edifice of Epressiond": 8.56,
  "Tower of Being Outdoors: Classic": 8.56,
  "Giant Steeple of Huge Pain": 8.56,
  "Tower of Thinning Ascent": 8.56,
  "Tower of True Confusion": 8.56,
  "Tower of Spiralling Fates: Insane": 8.56,
  "Tower of Great Gimmicky Gizmos": 8.56,
  "Tower of Cognition": 8.56,
  "Tower of Vague Perceptions": 8.56,
  "Tower of Recurring Obstacles": 8.55,
  "tower of FRIGHTENING": 8.55,
  "Cylinder of Pure Insanity": 8.55,
  "Tower of The Mighty Corner": 8.55,
  "Tower of Ridicoulous Jumps": 8.55,
  "Tower of Partying Partying Partying": 8.55,
  "Tower of Quick Purism": 8.55,
  "Tower of Umbratic Complexity": 8.55,
  "Tower of Toilet Clogging": 8.54,
  "Steeple of Big Justice": 8.54,
  "WAwesome of Wrappies": 8.54,
  "Tower of Insane Jumps": 8.54,
  "Tower of Unreliable Jumps": 8.54,
  "Tower of Scaling The Depths": 8.54,
  "Tower of Quick Overcoming": 8.54,
  "Tower of Hecc: Super Buff": 8.54,
  "Tower of Never Xenial Traveling": 8.54,
  "Tower of Vice Versa": 8.54,
  "Tower of Increasing Intensity": 8.54,
  "Tower of Traps and Techniques": 8.53,
  "pen pineapple apple pen": 8.53,
  "Citadel of Sovereignty": 8.53,
  "Steeple of Zero Chance": 8.53,
  "Great Citadel of Familiarity": 8.53,
  "Steeple of The Milennial Pause": 8.53,
  "Tower of True Torment": 8.53,
  "Pillar of Difficulty Chart": 8.53,
  "Tower of Virtuous Ascendance": 8.53,
  "Tower of Low Fever": 8.53,
  "Tower of Stat Boosts": 8.53,
  "Tower of Escaping Lava: Classic": 8.53,
  "Edifice of Kawaii Corners": 8.52,
  "Tower of Quadrilaterals: Insane": 8.52,
  "Steeple of HUgE HUngEr": 8.52,
  "Tower of Work It": 8.52,
  "Tower of Overcoming Hatred: Super Buff": 8.52,
  "Baldi Tower": 8.52,
  "Tower of Boreal Disarray": 8.52,
  "Tower of Functions Inverse": 8.51,
  "Edifice of Awaiting Morning": 8.51,
  "Buffed Tinkercad Obbies": 8.51,
  "Tower of Total Organ Failure": 8.51,
  "Tower of 282979": 8.51,
  "Tower of Forsaken Fragments": 8.51,
  "Tower of What The Flip": 8.51,
  "Tower of Celestial Infrastructure": 8.51,
  "Steeple of I Forgot Where To Go": 8.5,
  "Steeple For Multitaskers": 8.5,
  "Tower of Erebus": 8.5,
  "Tower of Nothing Nothing": 8.5,
  "Tower of Oblique Annoyances": 8.5,
  "Tower of Thje Ecotism: Super Nerf": 8.5,
  "Steeple of Side Eye Scaling": 8.5,
  "Steeple of Unwrapping Rituals": 8.5,
  "Thanos Tower: Fan Revamp": 8.49,
  "Tower of The Didgeridoo": 8.49,
  "Steeple of Plif Taskje": 8.49,
  "Tax Evasion Tower": 8.49,
  "Tower of Paying Them Bills": 8.49,
  "Tower of Thinning Layers: Difficulty Chart": 8.49,
  "Steeple of Winds Away": 8.49,
  "Tower of Quaint Activations": 8.49,
  "Tower of Familiar Deaths": 8.48,
  "Tower of Big Toe": 8.48,
  "Meeple of Muppet Making": 8.48,
  "Tower of Increasing Claustrophobia": 8.48,
  "Tower of Realities Peak": 8.48,
  "Tower of Overmind Nexus": 8.48,
  "Wacky Wendigo Facility": 8.48,
  "Tower of Climbing Up": 8.48,
  "Tower of Disruptive Obstacles": 8.48,
  "Steeple of Underlining Bleakness": 8.48,
  "Tower of A Rainbow Colored Septentrion": 8.48,
  "Tower of Fairly Thin but Tall Pole": 8.48,
  "Tower of Dave Dash": 8.47,
  "Wait It's A Tower?": 8.47,
  "Slate Tower": 8.47,
  "Tower of Turkey Sandwich": 8.47,
  "Tower of True Traps": 8.47,
  "Citadel of Extreme Pain": 8.47,
  "Tower of Laptop Smashing": 8.47,
  "He Will Always Be A Tower": 8.47,
  "Steeple of Stressful Suffering": 8.47,
  "small but difficult tower or basalt": 8.46,
  "Tower of The Funny Event": 8.46,
  "Steeple of Let It All Out": 8.46,
  "Fort of Inconsolable Instability": 8.46,
  "Double Jump Tower: Hard Mode": 8.46,
  "Tower of Chaos and Corruption": 8.46,
  "Tower of Absolute Nonsense": 8.46,
  "Tower of Kutsen Rouge": 8.46,
  "Tower of Curved Ascent": 8.46,
  "NIGHTHAWK 22 STEEPLE": 8.45,
  "Tower of I Beat The Living Crap Out Of Computer Mice Just To Feel Something On A Day To Day Basis: Lap 2": 8.45,
  "Tower of Whiteness": 8.45,
  "Tower of Hecc: Difficulty Chart": 8.45,
  "Tower of Inferno Galore: Zee's Nerf": 8.45,
  "Tower of Outlasting The Storm": 8.45,
  "Tower of Inevitable Failure": 8.45,
  "Tower of Nitting Some Wits": 8.44,
  "Steeple of Potato Chips": 8.44,
  "Tower of Wigglecore: Insane": 8.44,
  "Steeple of Agra": 8.44,
  "Tower of Ill Temperance": 8.44,
  "Tower of Back and Forth": 8.44,
  "Tower of Stress: Least Parts": 8.44,
  "Tower of Ethereal Fantasies": 8.44,
  "Tower of Cruel Punishments": 8.44,
  "Steeple of X-Sport": 8.43,
  "Steeple of Bupple Gubble": 8.43,
  "Citadel of Double Trouble": 8.43,
  "Steeple of Greater Than": 8.43,
  "Tower of Hellish Existence": 8.43,
  "Steeple of Luminescent Determination": 8.43,
  "Tower of Generation Failure: NToH Nerf": 8.43,
  "Tower of Vigorous Terror": 8.43,
  "Steeple of Absolute Hysteria": 8.43,
  "Steeple of Deep Wounds": 8.43,
  "Citadel of Hilariously Annoying Circumstances": 8.42,
  "Tower of Nothing Ever Happens": 8.42,
  "Tower of The Frameless Shock": 8.42,
  "Tower of The Ultra Super Amazing Jump": 8.42,
  "Tower of THE MEDIOCRE BRAINROT": 8.42,
  "Tower of Nutella Bread": 8.42,
  "Citadel of Inconceivable Deception": 8.42,
  "Tower of Forever Resetting": 8.42,
  "Tower of Luxuriant Interference": 8.42,
  "Tower of Harsh Endeavour": 8.42,
  "The Challenge 5": 8.42,
  "Steeple of Frozen Pee": 8.41,
  "Tower of Archivable On NextSelection": 8.41,
  "Tower of Disconnection": 8.41,
  "Citadel of Laptop Cracking": 8.41,
  "Citadel of Bits and Pieces": 8.41,
  "Cylinder of Scattered Obstacles": 8.41,
  "citadel of two hundred": 8.41,
  "Tower of Unprecedented Realities": 8.41,
  "Tower of Keepin' It Together": 8.41,
  "Tower of Outer Ego": 8.41,
  "Tower of Being Outdoors": 8.41,
  "Citadel of Malicious Intent": 8.4,
  "Tower of Relentless Tension": 8.4,
  "Tower of Heccerson But Something Is Off": 8.4,
  "Cylinder of Vanaheim": 8.4,
  "Steeple of Awkward Gameplay": 8.4,
  "Tower of Infinity Gauntlet": 8.4,
  "Tower of Confined Scrutiny": 8.4,
  "Tower of Slightly Queasy: Super Nerf": 8.4,
  "Tower of Plafondic Traversing": 8.4,
  "Tower of Insanely Tall Heights": 8.4,
  "Dead Chat": 8.39,
  "Tower of Huge Frustration": 8.39,
  "Tower of The Wandering Truss": 8.39,
  "Pillar of Ascending The Barrier": 8.39,
  "Tower of Risky Expeditions": 8.39,
  "Steeple of Swift Rise": 8.39,
  "Tower of Lucas Penteado: Zee's Nerf": 8.39,
  "Tower of Fifteen Degrees": 8.39,
  "Tower of Hijacked Voltage": 8.39,
  "Tower of Thinning Vengeance": 8.39,
  "Tower of Two Side Catastrophie": 8.39,
  "Tower of Sliding Into Normality: Classic": 8.38,
  "Tower of Slanted Cruelty": 8.38,
  "Tower of It\\_Near Strikes Back": 8.38,
  "Baldi Tower Classic Remastered": 8.38,
  "Tower of Hazardous and Lengthy Obstacles": 8.38,
  "Steeple of WaxySs": 8.38,
  "Tower of Calm Tranquility": 8.38,
  "Tower of Water Cup": 8.38,
  "Tower of Elongated Runs: Super Nerf": 8.38,
  "Super Awesome Towers": 8.38,
  "Steeple of Anointed Violence": 8.38,
  "Tower of Vindictive Maneuvers: Super Nerf": 8.38,
  "Tower of Screen Punching: Buff": 8.38,
  "Tower of Chair Throwing": 8.38,
  "Tower of Mind Breaking": 8.38,
  "why the fangame archive is cool": 8.37,
  "Steeple of Apple Sauce": 8.37,
  "Tower of Cataclysmic Calamity": 8.37,
  "Steeple of Truss RTruss UTruss STruss STruss": 8.37,
  "Tower of Treacherous Death": 8.37,
  "Tower of Vindictive Maneuvers: Zee's Nerf": 8.37,
  "Tower of Jumping Around": 8.37,
  "Tower of Unknown Geometrical Calculations": 8.37,
  "Tower of Water Melon: Super Nerf": 8.37,
  "a": 8.36,
  "Tower of Thej Studs": 8.36,
  "Tower of Fast Timed Buttons": 8.36,
  "Cylinder of Excursion": 8.36,
  "Tower of One Equals Zero: Super Buff": 8.36,
  "Tower of Pure Malarkey": 8.36,
  "Tower of No Chance": 8.36,
  "Tower of Tortuous Oblivion: Super Nerf": 8.36,
  "Tower of Lemon Lime Sublime": 8.36,
  "Tower of Hellish Rouge: Classic": 8.36,
  "Tower of Tilt Controls": 8.36,
  "twenty-three characters": 8.35,
  "Unnerfed Steeple of Low Woe: Buffed": 8.35,
  "Tower of Quality and Quantity": 8.35,
  "Tower of Elongated Farts": 8.35,
  "Steeple of One Hour": 8.35,
  "Steeple of Hs Could Never": 8.35,
  "Tower of Saving Citizen Girl": 8.35,
  "Tower of Lunatic Corruption": 8.35,
  "One Over a Million": 8.35,
  "Great Citadel of 7All7": 8.35,
  "Tower of Risky Expeditions: Classic": 8.35,
  "Tower of Flattened Uprising": 8.35,
  "citadel of laptop splitting: upside down": 8.34,
  "Tower of Confection": 8.34,
  "Steeple of Beautiful Memories": 8.34,
  "Tower of Thinning Trouble": 8.34,
  "Steeple of Meow Mrp Prr": 8.34,
  "Tower of Insignificant Resourcefulness": 8.34,
  "Tower of Eternal Void: Super Nerf": 8.34,
  "Citadel of Double Trouble: BoltZRun900": 8.33,
  "Tower of Hyper Fantasy Overdrive": 8.33,
  "Tower of Slowly Darkening Descent": 8.33,
  "Steeple of Lika 98": 8.33,
  "Tower of Somnium, Aeternum": 8.33,
  "Tower of Pinky To Darkness": 8.33,
  "Tower of Cataclysmic Galore": 8.33,
  "Tower of Space Management": 8.33,
  "Tower of Eternal Freezing": 8.33,
  "Tower of Aquatic Rivers": 8.32,
  "Tower of Rising Pressure": 8.32,
  "Steeple of Epicness at 3AM": 8.32,
  "Tower of True Skill: Difficulty Chart": 8.32,
  "Tower of Number Nightmare": 8.32,
  "Tower of Wanting to Cry": 8.32,
  "Giant Tower of Corrupted Nightmares": 8.32,
  "Tower of Otady and Vli": 8.32,
  "Citadel of Upended Chromatism": 8.32,
  "Tower of Catapedaphobia": 8.31,
  "Huvin ja Hauskanpidon Torni": 8.31,
  "Tower of Violet Mania": 8.31,
  "Tower of Tricky Jumps": 8.31,
  "Tower of Brimstone Facility": 8.31,
  "Tower of Going Insane": 8.31,
  "Tower of Dexterity": 8.31,
  "Tower of Desktop Annihilation": 8.31,
  "Steeple of Jack o' Lament": 8.31,
  "Mini Citadel of Epic Potatoes": 8.3,
  "Tower of Button Deactivating": 8.3,
  "Tower of Silly Long Line": 8.3,
  "Tower of Blissful Arcadia": 8.3,
  "This deployment is currently paused": 8.3,
  "ToFaF Buff": 8.3,
  "Tower of Centripetal Deterrence": 8.3,
  "Obelisk of Wacky Strategy: Joke Edition": 8.3,
  "Tower of BIG IGB GIB FAIL AILF ILFA LFAI": 8.3,
  "Tower of Hot Cheerios": 8.3,
  "Tower of Expanding Layers: Alternate": 8.3,
  "Tower of Thinning Layers": 8.3,
  "Tower of Hydrogen 1": 8.29,
  "Tower of Horrible Darkness": 8.29,
  "Tower of How Do I Name A Tower": 8.29,
  "Edifice of Denouement": 8.29,
  "Tower of Wretchedness": 8.29,
  "Tower of Trust The Process": 8.29,
  "Cylinder of External Madness": 8.29,
  "Tower of Criminal Intent": 8.29,
  "Tower of Dying Inside Eternally": 8.29,
  "Tower of Zigzagging": 8.29,
  "Tower of Server Sided R15 Adventures: Solo": 8.28,
  "Facility of Increasing Difficulty": 8.28,
  "Tower of Nightly Horrors": 8.28,
  "Tower of Arrangement": 8.28,
  "Tower of No Return: The Perfect Run": 8.28,
  "Ter": 8.28,
  "Tower of Past Forward": 8.28,
  "Steeple of Homer's Rampage": 8.28,
  "Tower of Structural Instability": 8.28,
  "Tower of Futuristic Annoyance": 8.28,
  "Tower of Loud Nine": 8.28,
  "Eualaa Tower: The Ultimate Omega Booster Legandary Awesome Evolution Master King Null Void Wonderful Absolute Cinema Sigma True Form Infinite": 8.27,
  "Steeple of Side To Side": 8.27,
  "Hey, Vsauce. Tower Here: Super Nerf": 8.27,
  "Tower of Drinc Water": 8.27,
  "Tower of Disappointment Into Sadness": 8.27,
  "Tower of A Long Decline": 8.27,
  "Tower of Emancipated Elephants": 8.27,
  "Tower of Speeding Right Through": 8.27,
  "Tower of Fatal Heights": 8.27,
  "Tower of Big Pain": 8.27,
  "Tower of The Treacherous Climb": 8.26,
  "Towering Heights": 8.26,
  "Steeple of Reverie": 8.26,
  "Steeple of Build Time Crisis": 8.26,
  "Tower of A Fading Memory": 8.26,
  "Tower of Frameless Unlikely Natural": 8.26,
  "Steeple of Fever Dreams": 8.26,
  "Tower of Aslanted Scrimmage": 8.26,
  "Tower of Scaling Large Heights": 8.26,
  "Tower of Pure Intimidation": 8.26,
  "Tower of Hands Sweating: Super Buff": 8.26,
  "Tower of Blast From The Past": 8.26,
  "Tower of Expanding Layers": 8.26,
  "Steeple of Abandonment": 8.25,
  "Tower of Louis V Sandals": 8.25,
  "ARTHRAIX STEEPLE": 8.25,
  "Tower of Great Skill": 8.25,
  "Tower of Agglomeration": 8.25,
  "Citadel of Let Him Cook": 8.25,
  "Citadel of Corrupted Nightmares: Netless": 8.25,
  "Tower of Extensive Extensions": 8.25,
  "Tower of Franchun's Lullaby": 8.25,
  "Tower of Eroding Layers": 8.25,
  "Citadel of Subway": 8.25,
  "Tower of Fear of Heights": 8.25,
  "Tower of Possible Movement: HTF": 8.24,
  "Steeple of Jumps": 8.24,
  "Tower of Vibrant Overhang": 8.24,
  "Citadel of Ultra Tasty Stew": 8.24,
  "Tower of Terror": 8.24,
  "Tower of Really Ideal Gameplay": 8.24,
  "Tower of The Chaos Levels": 8.24,
  "Tower of Questionable Hell": 8.24,
  "Tower of Whatever This Is": 8.24,
  "Tower of Absolute Broken Reality": 8.24,
  "Tower of My Ribosomes": 8.24,
  "Tower of Mr. Pibb": 8.24,
  "Mini Citadel of Somewhere Around Fifteen Chairs": 8.24,
  "Tower of Dashing Upwards": 8.24,
  "Citadel of Rampancy": 8.24,
  "Tower of Difficulty Chart: Wacky": 8.23,
  "Steeple of The Flossified Floppalith": 8.23,
  "Tower of Skill Issue": 8.23,
  "Tower of Being On The Clock": 8.23,
  "Cylinder of Psychotic Wraparounds": 8.23,
  "Tower of The Letter T": 8.23,
  "Tower of Indigo Rivers": 8.23,
  "Tower of Bacterial Meningitis": 8.23,
  "Tower of Plastic Wonders": 8.23,
  "Steeple of God's Plan": 8.23,
  "Tower of Incoherent Insanity": 8.23,
  "Tower of Cerebrum Munching": 8.23,
  "Steeple of Twisted Eternal Panic": 8.22,
  "Tower of Name Placeholder": 8.22,
  "Tower of Bluespace": 8.22,
  "Tower of Sleepy Flower": 8.22,
  "Tower of Never Coming Back": 8.22,
  "Tower of Downpour Vortex": 8.22,
  "Tower of Jolly Deterrent": 8.22,
  "Tower of A Weird Combination": 8.22,
  "Tower of Unsettling Heights": 8.22,
  "Tower of Enduring Insanity": 8.21,
  "Tower of Ultimate Rockefeller Street": 8.21,
  "steeple of 20 minutes": 8.21,
  "Mini Obelisk of Mini Obelisk: Alternate": 8.21,
  "Tower of Great Victories": 8.21,
  "Tower of Substantial Quietus: Zee's Nerf": 8.21,
  "Tower of Ascension to Heaven": 8.21,
  "Obelisk of Falling and Failing": 8.21,
  "Steeple of Absolute Insanity": 8.2,
  "Edifice of Let It Go": 8.2,
  "Citadel of Goku V3": 8.2,
  "Tower of Air Conditioning": 8.2,
  "Tower of Confusing Mirrors": 8.2,
  "Tower of Layers and Purism": 8.2,
  "Tower of Clustered Amalgamations": 8.2,
  "Edifice of Fun": 8.2,
  "Tower of Triangle Difficulty Chart": 8.2,
  "Hard Citadel of Void": 8.2,
  "Tower of Difficulty Chart: Revamp": 8.2,
  "Tower of Jupiter My Favourite": 8.2,
  "Tower of Fatal Agitation": 8.2,
  "Tower of Obbyist's League": 8.2,
  "Tower of Dumb Stuff": 8.19,
  "Tower of Reverse Difficulty Chart: st": 8.19,
  "Steeple of Rising Intensity": 8.19,
  "Tower of Ballooooons and Whimsy": 8.19,
  "Tower of Keyboard Yeeting: Insane": 8.19,
  "Giant Tower of Confusion": 8.19,
  "Tower of Incomprehension and Imperfection": 8.19,
  "Tower of Harsh Progression": 8.19,
  "Steeple of Blood Clot": 8.19,
  "Tower of Cartoony Architecture": 8.19,
  "Tower of Libyan Interdimensional Airlines": 8.19,
  "Tower of A Bad Time": 8.19,
  "Wallhop Steeple for Eualaa\\_01": 8.18,
  "Steeple of Israel-GPT": 8.18,
  "Steeple of Extreme Paranoia and Screaming": 8.18,
  "Tower of Great Fear": 8.18,
  "Would Never Be A Good Tower": 8.18,
  "Tower of Crooked Symmetry": 8.18,
  "Tower of Wrapped Up Rage": 8.18,
  "Steeple of Fragile": 8.18,
  "Tower of Going To Brazil": 8.18,
  "Tower of Bent Trauma": 8.18,
  "Mini Citadel of The Journey": 8.17,
  "Steeple of The Triple T": 8.17,
  "Steeple of Crimson Castle: Inferno Mode": 8.17,
  "100 Thousand Thank Yous": 8.17,
  "Tower of Incoherent Blabbering": 8.17,
  "Citadel of Love Death": 8.17,
  "Tower of Medial Mayhem": 8.17,
  "Tower of Difficulty Breezing": 8.17,
  "Tower of Extreme Hell": 8.17,
  "Free sc": 8.16,
  "Tower of In It To Win It": 8.16,
  "Tower of Double Trouble: Classic": 8.16,
  "Tower of Wrath": 8.16,
  "Medium Tower": 8.16,
  "Tower of Thinning Flanimal": 8.16,
  "Tower of Outright Excursion": 8.16,
  "Tower of Suffering In The Night": 8.16,
  "Tower of Reactive Action": 8.16,
  "Tower of High Adrenaline": 8.16,
  "Tower of Z Fighting": 8.15,
  "Tower of Pie In The Sky": 8.15,
  "Edifice of Is It Too Easy": 8.15,
  "Steeple of Emptiness": 8.15,
  "Tower of Difficulty Chart II": 8.15,
  "Steeple of Miscolorful Agony": 8.15,
  "Tower of Relentless Objectives": 8.15,
  "Steeple of Insecure Tranquility": 8.15,
  "Tower of The Roof's Pique: Super Nerf": 8.15,
  "Tower of Peacebringer 7 7 7": 8.15,
  "Tower of Dimension Frenetic": 8.15,
  "Edifice of Quarry Excavations": 8.15,
  "Tower of The Wedge's Vengeance: Super Nerf": 8.15,
  "Bastion of Lobotomy": 8.14,
  "Tower of Distant Void Comprehension": 8.14,
  "Tower of Feeling So Unhappy": 8.14,
  "Tower of Don't Look Down": 8.14,
  "Tower of Dreaming Wedge": 8.14,
  "Tower of Zetsudai": 8.14,
  "Tower of Mad": 8.14,
  "Tower of Nefarious Confrontation: Classic": 8.14,
  "Tower of Dizzyjumps Delight": 8.14,
  "Tower of Futile Perusal: Super Nerf": 8.14,
  "tower of big anger": 8.13,
  "Tower of Quitting": 8.13,
  "Difficulty Street": 8.13,
  "Tower of Polar Tones": 8.13,
  "Tower of Vacant Hindrances: OG Nerf": 8.13,
  "The Darkness Steeple": 8.13,
  "Tower of Rhythm Heaven: Unnerfed": 8.13,
  "Tower of Five Below": 8.13,
  "Thanos Tower": 8.13,
  "Edifice of Emart": 8.12,
  "Steeple of Enjoyable Wraparounds": 8.12,
  "1 Hour Tower of Difficulty Chart": 8.12,
  "Tower of Odd Color Combos": 8.12,
  "ψaybe a Tower": 8.12,
  "Tower of Critical Endurance": 8.12,
  "Tower of Hectic Excel": 8.12,
  "Tower of Satan's Wrath": 8.12,
  "Great Citadel of The Five Elements": 8.12,
  "Tower of The Single Spiral": 8.12,
  "Tower of SC Frenzy 4": 8.11,
  "Tower of Align Negate": 8.11,
  "Steeple of Endless Danger Encounters": 8.11,
  "Steeple of Low Woe: Super Buff": 8.11,
  "tower of epic thinning layers": 8.11,
  "Tower of Pulsing Damage": 8.11,
  "Citadel of Pure Pwnage": 8.11,
  "Tower of Ozempic": 8.11,
  "Steeple of Difficulty Chart": 8.11,
  "Tower of Throttling Up": 8.11,
  "Tower of Pessimistic Platforms": 8.1,
  "Tower of Anything Goes": 8.1,
  "Tower of Lethal Ruins": 8.1,
  "Steeple of Very Evil Things": 8.1,
  "Tower of Joobly Chart": 8.1,
  "Mini Obelisk of Blazing Mirage": 8.1,
  "Tower of Reddish Monolith": 8.1,
  "Tower of Fabled Passage": 8.1,
  "Burj Khalifa": 8.1,
  "Mesmerizer Tower: Timerless": 8.1,
  "Steeple of Suffering From Severe Inconsistencies": 8.1,
  "Tower of Minimalistic Construction": 8.1,
  "Tower of Vacant Hindrances: Super Nerf": 8.1,
  "Tower of Narrowing Space": 8.1,
  "Tower of Persistence": 8.1,
  "Steeple of Devious Yield": 8.09,
  "Steeple of Sprite Berry Blast": 8.09,
  "Steeple of Destined Despair": 8.09,
  "Tower of Science-Like Relic": 8.09,
  "Liberal Steeple": 8.09,
  "Eg: Buffed": 8.09,
  "Tower of Dystopia": 8.09,
  "Tower of You're A Star": 8.09,
  "Citadel of Glitching and Healing": 8.09,
  "Tower of Irritating Results": 8.09,
  "Tower of Difficulty Chart: Classic": 8.09,
  "Garfield Tower": 8.08,
  "UnBuffed Tower of Analysis Explorer": 8.08,
  "Tower of A Thinning Layers Copy": 8.08,
  "Tower of Portals": 8.08,
  "Tower of Pepper Roni": 8.08,
  "Tower of Butka Havoc": 8.08,
  "Tower of Safety Equals False": 8.08,
  "Tower of Climbing a Pillar": 8.08,
  "Tower of Nefarious Confrontation": 8.08,
  "Tower of Mirrored Mountainous Mechanics": 8.08,
  "Tower of Super Probably Tower": 8.08,
  "Tower of Thje Wall: Super Nerf": 8.08,
  "Steeple of Oreo Hell": 8.07,
  "Tower of jeffy toilet paper dragon poop ken carson": 8.07,
  "Tower of Unrelenting Insanity": 8.07,
  "Lemon Tree": 8.07,
  "Tower of Pumice": 8.07,
  "Steeple of Difficulty Spikes": 8.07,
  "Steeple of 35 Lodges of Hell": 8.07,
  "Tower of Fortnite Boogie Bomb": 8.07,
  "Tower of Terse Persecution: Super Nerf": 8.07,
  "Tower of Silent Panic": 8.07,
  "Steeple of Present Stairs": 8.07,
  "Tower of Achromatopsia": 8.06,
  "Steeple of Wallhop Difficulty Chart": 8.06,
  "Tower of Submissive Furry: Super Nerf": 8.06,
  "Steeple of Supreme Signature Sorting Simulator": 8.06,
  "Tower of Familiar Layers": 8.06,
  "Steeple of Purist Anarchy: Classic": 8.06,
  "Tower of Immanent Control": 8.06,
  "Tower of Barbarous Structures": 8.06,
  "Tower of Lucas Penteado: Super Nerf": 8.06,
  "Tower of Sukhavati Eternal Paradise": 8.06,
  "Tower of Flimsy Architecture": 8.06,
  "Tower of Warped Reality": 8.06,
  "Edifice of C T G": 8.05,
  "Tower of Truss Frenzy": 8.05,
  "Edifice of Bulgaria's Tasty Air": 8.05,
  "Unnerfed Steeple of Great Humicolous": 8.05,
  "Steeple of Rainbow Flag": 8.05,
  "Tower of Anxiety": 8.05,
  "Tower of Transmitting Frequency": 8.05,
  "Tower of Hating This Tower": 8.05,
  "Steeple of Below Zero: Unnerfed": 8.05,
  "Tower of Funny Thoughts: Difficulty Chart": 8.05,
  "Tower of Skibidi Very Skibidi Truss": 8.05,
  "π159": 8.05,
  "Steeple of Forsaken Nexus": 8.05,
  "Tower of Pain and Agony": 8.05,
  "Tower of Xerically Infuriating Calamity: Nerf": 8.05,
  "Tower of Perfect Timing": 8.05,
  "Tower of Blazing Industrial Furnaces": 8.05,
  "Tower of Empty Impediments": 8.04,
  "Tower of que dice megan cuando pierde": 8.04,
  "Tower of Monochromatic Anguish": 8.04,
  "Steeple of Charger Ripping": 8.04,
  "Citadel of Grand Ultimate": 8.04,
  "Tower of Infuriating Ascension": 8.04,
  "Cylinder of Frameless Terror": 8.04,
  "Giant Tower of Thinning Layers": 8.04,
  "Tower of Expanding Layers: AToBM": 8.04,
  "Tower of Conjoined Chaos": 8.04,
  "Steeple of Teapot's Hyperdoom": 8.04,
  "Tower of Kendrick's Final Lamar": 8.04,
  "Tower of Perpetual Eccentricity": 8.04,
  "Costco Wholesale Tower": 8.04,
  "Tower of Poor Instakill Usage": 8.03,
  "Tower of Goku": 8.03,
  "i build what i want okay": 8.03,
  "Steeple of Trying to get Radioimmunoelectrophoresis While Discovering Methionylthreonylthreonylglutaminyl, I Got a Floccinaucinihilipilificationous Pseudopseudohypoparathyroidism Around the Area Of Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenu-akitanatahu": 8.03,
  "Edifice of No Creativity: Buffed": 8.03,
  "Edifice of Sticking To The Wall": 8.03,
  "Tower of Vacant Hindrances: Myth's Nerf": 8.03,
  "Steeple of Expecting Something Better: Difficulty Chart": 8.03,
  "M.U.N.C.H Facility": 8.03,
  "Steeple of What I See": 8.03,
  "Tower of Sweet Revenge": 8.03,
  "Tower of Super Silver Insanity": 8.03,
  "Edifice of GBJ Hell": 8.03,
  "Tower of Ripping Reality's Fabric": 8.03,
  "Tower of Warping Wraps": 8.03,
  "Tower of Wraparound Catastrophe": 8.03,
  "Steeple of Rig": 8.03,
  "Citadel of Ultimate Symmetry": 8.03,
  "Tower of Terrain Climbing Adventures": 8.03,
  "Tower of Blimp In The Sky": 8.03,
  "Three Counts of Home Invasion": 8.02,
  "Steeple of Petri Disk Barbell": 8.02,
  "happy tower": 8.02,
  "Tower of Atrocious Vacancy": 8.02,
  "Obelisk of True Skill: Classic": 8.02,
  "Kaizo Tower of Madness": 8.02,
  "Steeple of Integrate By Parts": 8.02,
  "Tower of Inside Chill Man": 8.02,
  "Steeple of Random Killbrick Torment": 8.02,
  "Steeple of Rage Quitting": 8.02,
  "Steeple of Trauma Stickout": 8.02,
  "Ace's Tower": 8.02,
  "Tower of Harsh Aesthetical Obstacles": 8.02,
  "Obelisk of True Skill": 8.02,
  "Tower of Difficulty Chart": 8.02,
  "Tower of Bends and Curves": 8.01,
  "Steeple of Vibrant Vistas": 8.01,
  "Steeple of Empty Scaling": 8.01,
  "Tower of Sky's Rupture": 8.01,
  "Mini Great Citadel of The Filler Factory": 8.01,
  "Tower of Fallen Overgrowth": 8.01,
  "Steeple of Fleeting Mistakes": 8.01,
  "Tower of Questions": 8.01,
  "Tower of 40 Jumps of Hell": 8.01,
  "Tower of Where When What": 8.01,
  "Steeple of Crohn's": 8.01,
  "Steeple of Esoteric Arcane": 8.0,
  "Steeple of Treacherous Gnomery": 8.0,
  "Tower of Reddish Monolith: Classic": 8.0,
  "Tower of Double Trouble": 8.0
};

const TOWERS = [
  { rank: 1, name: 'Tower of It Never Ends', pts: 1000.0 },
  { rank: 2, name: 'S.T.O.N.E Facility: Reborn', pts: 995.0 },
  { rank: 3, name: 'Tower of Monochromatic Haze', pts: 990.02 },
  { rank: 4, name: 'Tower of Impending Doom', pts: 985.08 },
  { rank: 5, name: 'Tower of Wigglecore', pts: 980.16 },
  { rank: 6, name: 'Tower of My Inner Hatred', pts: 975.28 },
  { rank: 7, name: 'Tower of Spiralling Fates', pts: 970.42 },
  { rank: 8, name: 'Citadel of Cold Blooded Fatality', pts: 965.6 },
  { rank: 9, name: 'Obelisk of Unrealistic Sightings', pts: 960.8 },
  { rank: 10, name: 'Tower of Maybe In Mumbai', pts: 956.04 },
  { rank: 11, name: 'Tower of Blind Fate', pts: 951.3 },
  { rank: 12, name: 'Tower of Paradise', pts: 946.6 },
  { rank: 13, name: 'Tower of Celestial Bloom', pts: 941.92 },
  { rank: 14, name: 'Tower of Withered Consensus', pts: 937.27 },
  { rank: 15, name: 'Citadel of The Eternal Calamity', pts: 932.65 },
  { rank: 16, name: 'Citadel of Infinite Void', pts: 928.07 },
  { rank: 17, name: 'Tower of Qwerty Uiop', pts: 923.51 },
  { rank: 18, name: 'Target Tower', pts: 918.98 },
  { rank: 19, name: 'Pazoingus Of Of', pts: 914.48 },
  { rank: 20, name: '3008-Tower', pts: 910.01 },
  { rank: 21, name: 'Tower of Zen Surplus', pts: 905.56 },
  { rank: 22, name: 'Tower of Twenty Two', pts: 901.15 },
  { rank: 23, name: 'Ikea Tower', pts: 896.77 },
  { rank: 24, name: 'Tower of Sudden Death', pts: 892.41 },
  { rank: 25, name: 'Great Citadel of Great Difficulty Chart', pts: 888.09 },
  { rank: 26, name: 'Citadel of The Final Destination', pts: 883.79 },
  { rank: 27, name: 'Tower of Yasamsal Kiyamet', pts: 879.52 },
  { rank: 28, name: 'Tower of Lucid Nightmares', pts: 875.28 },
  { rank: 29, name: 'Tower of Light Speed Buttons', pts: 871.07 },
  { rank: 30, name: 'Tower of Ruthless Retribution', pts: 866.88 },
  { rank: 31, name: 'Tower of Stardust Conflagration', pts: 862.73 },
  { rank: 32, name: 'Tower of Computer Crippling', pts: 858.6 },
  { rank: 33, name: 'Zalgo Annihilated Purgatory', pts: 854.5 },
  { rank: 34, name: 'Tower of Jaded Compromise', pts: 850.43 },
  { rank: 35, name: 'Tower of Head Quarters', pts: 846.39 },
  { rank: 36, name: 'Tower of Dissociative Force', pts: 842.38 },
  { rank: 37, name: 'Tower of Dense Beauty', pts: 838.39 },
  { rank: 38, name: 'Tower of Where Are You Going', pts: 834.43 },
  { rank: 39, name: 'Tower of Substantial Quietus', pts: 830.5 },
  { rank: 40, name: 'Tower of Splice Construct', pts: 826.6 },
  { rank: 41, name: 'Tower of The Curve\'s Desire', pts: 822.73 },
  { rank: 42, name: 'Tower of Fragmented Wallscape', pts: 818.88 },
  { rank: 43, name: 'Tower of Zither Harmony', pts: 815.06 },
  { rank: 44, name: 'Tower of Inferno Galore: Unnerfed', pts: 811.27 },
  { rank: 45, name: 'Tower of Vague Luminescence', pts: 807.51 },
  { rank: 46, name: 'Tower of Impressions of a Lunatic', pts: 803.77 },
  { rank: 47, name: 'Tower of Umrah Market', pts: 800.06 },
  { rank: 48, name: 'Tower of Compromised Fear', pts: 796.38 },
  { rank: 49, name: 'Tower of Sinful Calvary', pts: 792.73 },
  { rank: 50, name: 'Tower of Eternal Distress', pts: 789.1 },
  { rank: 51, name: 'Tower of The Horizontal Wall', pts: 785.5 },
  { rank: 52, name: 'Tower of Eternal Void', pts: 781.93 },
  { rank: 53, name: 'Tower of Spiritual Rise', pts: 778.38 },
  { rank: 54, name: 'Tower of Lavender Lustre', pts: 774.86 },
  { rank: 55, name: 'Tower of The Roof\'s Pique', pts: 771.37 },
  { rank: 56, name: 'Found You Tower', pts: 767.9 },
  { rank: 57, name: 'Tower of Diabolical Corner Multitude', pts: 764.46 },
  { rank: 58, name: 'Tower of Prismal Radiance', pts: 761.05 },
  { rank: 59, name: 'Tower of Thje Floor', pts: 757.66 },
  { rank: 60, name: 'Tower of Drifting Nights', pts: 754.31 },
  { rank: 61, name: 'Tower of Overwhelming Doom', pts: 750.97 },
  { rank: 62, name: 'Nvidia Tower', pts: 747.67 },
  { rank: 63, name: 'Steeple of Daze', pts: 744.39 },
  { rank: 64, name: 'Tower of Weird Core', pts: 741.13 },
  { rank: 65, name: 'Sans Steeple', pts: 737.9 },
  { rank: 66, name: 'Tower of Chromatic Inclination', pts: 734.7 },
  { rank: 67, name: 'Tower of Disjointed Alliance', pts: 731.53 },
  { rank: 68, name: 'Tower of Flowing Haze', pts: 728.38 },
  { rank: 69, name: 'Tower of Quite Devious', pts: 725.25 },
  { rank: 70, name: 'Tower of Reborn Vertigo', pts: 722.15 },
  { rank: 71, name: 'Steeple of Transcendence', pts: 719.08 },
  { rank: 72, name: 'Tower of Flagrant Aggravation', pts: 716.03 },
  { rank: 73, name: 'Tower of Descending Towards Oblivion', pts: 713.01 },
  { rank: 74, name: 'Tower of The Sky\'s The Limit', pts: 710.02 },
  { rank: 75, name: 'Tower of Overhanging Obstacles', pts: 707.05 },
  { rank: 76, name: 'Tower of Vital Valiance', pts: 704.1 },
  { rank: 77, name: 'Tower of Exhausting Journey', pts: 701.18 },
  { rank: 78, name: 'Steeple of Cha Cha Real Smooth', pts: 698.29 },
  { rank: 79, name: 'Corner Tower', pts: 695.42 },
  { rank: 80, name: 'Tower of Eternal Doom', pts: 692.57 },
  { rank: 81, name: 'Tower of Living Life to the Fullest', pts: 689.75 },
  { rank: 82, name: 'Tower of Lucas Penteado', pts: 686.96 },
  { rank: 83, name: 'Tower of Wigglecore: Classic', pts: 684.19 },
  { rank: 84, name: 'Citadel of Cruel Punishment', pts: 681.44 },
  { rank: 85, name: 'Steeple of Nilly Bob', pts: 678.72 },
  { rank: 86, name: 'Tower of Water Melon', pts: 676.03 },
  { rank: 87, name: 'Tower of Thinning Bacon', pts: 673.36 },
  { rank: 88, name: 'Tower of Disturbing Dread', pts: 670.71 },
  { rank: 89, name: 'Tower of Quiescent Spiralism', pts: 668.09 },
  { rank: 90, name: 'Tower of Greyscale', pts: 665.49 },
  { rank: 91, name: 'Tower of Virescent Cascade', pts: 662.92 },
  { rank: 92, name: 'Tower of My Eternal Destination', pts: 660.37 },
  { rank: 93, name: 'Tower of Vynn Crael', pts: 657.84 },
  { rank: 94, name: 'Tower of Luminous Reflections', pts: 655.34 },
  { rank: 95, name: 'Tower of Spatial Awareness', pts: 652.86 },
  { rank: 96, name: 'Tower of Corruption\'s Embrace', pts: 650.41 },
  { rank: 97, name: 'Byung Jin Rae', pts: 647.98 },
  { rank: 98, name: 'Tower of Existential Crisis: Super Nerf', pts: 645.57 },
  { rank: 99, name: 'Tower of Familiar Voids', pts: 643.19 },
  { rank: 100, name: 'Tower of Absolute Zero', pts: 640.83 },
  { rank: 101, name: 'Tower of Brief Enmity', pts: 638.5 },
  { rank: 102, name: 'Tower of pro pillars', pts: 636.18 },
  { rank: 103, name: 'Tower of Gridlock Madness', pts: 633.9 },
  { rank: 104, name: 'Tower of The Bussin', pts: 631.63 },
  { rank: 105, name: 'Great Citadel of Difficulty Chart: Classic', pts: 629.39 },
  { rank: 106, name: 'Tower of Who Moved My Camera', pts: 627.17 },
  { rank: 107, name: 'Tower of Psychological Torture', pts: 624.97 },
  { rank: 108, name: 'Tower of Truss Behemoth', pts: 622.8 },
  { rank: 109, name: 'Tower of Hollow Obstacles', pts: 620.65 },
  { rank: 110, name: 'Cone Tower', pts: 618.52 },
  { rank: 111, name: 'Tower of The Altruistic Serosity', pts: 616.41 },
  { rank: 112, name: 'Tower of Microsoft Service', pts: 614.33 },
  { rank: 113, name: 'Tower of Subsequent Comprises', pts: 612.27 },
  { rank: 114, name: 'Tower of Italianray Never Clear', pts: 610.23 },
  { rank: 115, name: 'Tower of Elongated Runs: Unnerfed', pts: 608.22 },
  { rank: 116, name: 'Tower of The Ice Wall', pts: 606.23 },
  { rank: 117, name: 'Tower of Futile Perusal', pts: 604.26 },
  { rank: 118, name: 'Tower of Gtg House On Fire', pts: 602.31 },
  { rank: 119, name: 'Doomsday Tower', pts: 600.38 },
  { rank: 120, name: 'Tower of Technical Requirements', pts: 598.48 },
  { rank: 121, name: 'Tower of Malefic Nuisances', pts: 596.59 },
  { rank: 122, name: 'Tower of Elysian Crossings', pts: 594.73 },
  { rank: 123, name: 'Tower of Corrupted Zenith', pts: 592.89 },
  { rank: 124, name: 'Tower of small pillars', pts: 591.07 },
  { rank: 125, name: 'Tower of Hollow Iridescences', pts: 589.28 },
  { rank: 126, name: 'Tower of Bizkit', pts: 587.5 },
  { rank: 127, name: 'Tower of Devious Purism', pts: 585.75 },
  { rank: 128, name: 'Citadel of Vacant Hindrances', pts: 584.02 },
  { rank: 129, name: 'Steeple of Pit of Misery Soul Crushing+', pts: 582.31 },
  { rank: 130, name: 'Steeple of Cheese Burger', pts: 580.62 },
  { rank: 131, name: 'Tower of Winner\'s Pad', pts: 578.95 },
  { rank: 132, name: 'Tower of The Quest For Perfection', pts: 577.3 },
  { rank: 133, name: 'Tower of Venerated Attrition', pts: 575.67 },
  { rank: 134, name: 'Tower of Rezz Oant', pts: 574.07 },
  { rank: 135, name: 'Tower of The Homefinder', pts: 572.48 },
  { rank: 136, name: 'Tower of Nebulaic Remnants', pts: 570.91 },
  { rank: 137, name: 'Tower of Fragile Balance', pts: 569.37 },
  { rank: 138, name: 'Tower of Nether Lands', pts: 567.84 },
  { rank: 139, name: 'Tower of Incessant Vexation', pts: 566.34 },
  { rank: 140, name: 'Bocchi The Rock Tower', pts: 564.86 },
  { rank: 141, name: 'Tower of Terrorific Jumps', pts: 563.39 },
  { rank: 142, name: 'Tower of Thje Wall', pts: 561.95 },
  { rank: 143, name: 'Edifice of Flicking and Clicking: Double Time', pts: 560.52 },
  { rank: 144, name: 'Tower of Timed Button Fury', pts: 559.12 },
  { rank: 145, name: 'Tower of Jabberwock Jagger', pts: 557.74 },
  { rank: 146, name: 'Tower of Cruel Punishment', pts: 556.37 },
  { rank: 147, name: 'Barely Even A Tower', pts: 555.03 },
  { rank: 148, name: 'Steeple of Dead Is You', pts: 553.7 },
  { rank: 149, name: 'Tower of Meaningfulness', pts: 552.39 },
  { rank: 150, name: 'Tower of Prolonged Condemnation', pts: 551.11 },
  { rank: 151, name: 'Homefinder Steeple', pts: 549.84 },
  { rank: 152, name: 'Tower of Zumbo Sauce Consumption', pts: 548.59 },
  { rank: 153, name: 'Yanny Laurel Edifice', pts: 547.36 },
  { rank: 154, name: 'Citadel of Descent Into Exile', pts: 546.15 },
  { rank: 155, name: 'Citadel of 25 Jumps: True Mode', pts: 544.96 },
  { rank: 156, name: 'Citadel of Terse Persecution', pts: 543.78 },
  { rank: 157, name: 'Tower of Vertigo', pts: 542.63 },
  { rank: 158, name: 'Tower of Righteous Indignation', pts: 541.49 },
  { rank: 159, name: 'Tower of Time to Say Goodbye', pts: 540.37 },
  { rank: 160, name: 'Tower of The Goodguygabed', pts: 539.27 },
  { rank: 161, name: 'Jumbo Tower', pts: 538.19 },
  { rank: 162, name: 'Steeple of Twisty Turning Horrific Difficulty', pts: 537.13 },
  { rank: 163, name: 'Tower of Missing Benefits', pts: 536.08 },
  { rank: 164, name: 'Tower of Various Masochistic Tortures', pts: 535.05 },
  { rank: 165, name: 'Tower of Corner Kerfuffle', pts: 534.04 },
  { rank: 166, name: 'Steeple of Kyodai na Paul', pts: 533.05 },
  { rank: 167, name: 'Tower of Elysian Crossings: Classic', pts: 532.08 },
  { rank: 168, name: 'Citadel of Uncanny', pts: 531.12 },
  { rank: 169, name: 'Obelisk of Dominance', pts: 530.18 },
  { rank: 170, name: 'Tower of Virulent Sojourn', pts: 529.25 },
  { rank: 171, name: 'Tower of Mental Torture', pts: 528.35 },
  { rank: 172, name: 'Thje Steeple', pts: 527.46 },
  { rank: 173, name: 'Steeple of Quill Canyon', pts: 526.59 },
  { rank: 174, name: 'The Diceman\'s Wrath', pts: 525.73 },
  { rank: 175, name: 'Tower of Daunting Experiences', pts: 524.9 },
  { rank: 176, name: 'Steeple of The Divined Sequence', pts: 524.07 },
  { rank: 177, name: 'Steeple of Suspiciously Large Right Arm', pts: 523.27 },
  { rank: 178, name: 'towero f gunga ginga', pts: 522.48 },
  { rank: 179, name: 'Mesmerizer Tower', pts: 521.71 },
  { rank: 180, name: 'Tower of Heaven\'s Gate', pts: 520.95 },
  { rank: 181, name: 'Tower of Offset Lacrimosa', pts: 520.21 },
  { rank: 182, name: 'Tower of Vacant Hindrances', pts: 519.49 },
  { rank: 183, name: 'Tower of Tarapop Two', pts: 518.78 },
  { rank: 184, name: 'Tower of Challenging Obstacle Anarchy', pts: 518.09 },
  { rank: 185, name: 'Tower of Elongated Runs', pts: 517.41 },
  { rank: 186, name: 'Steeple of Eco-Friendly Wood Veneers', pts: 516.75 },
  { rank: 187, name: 'Edifice of Wooting 80HE Zinc', pts: 516.1 },
  { rank: 188, name: 'Edifice of Wallhop Against Time', pts: 515.47 },
  { rank: 189, name: 'Tower of O\'er The Skies', pts: 514.85 },
  { rank: 190, name: 'Tower of Lethal Countdown', pts: 514.25 },
  { rank: 191, name: 'Tower of Pyrrhic Ascent', pts: 513.66 },
  { rank: 192, name: 'Tower of Play to Win', pts: 513.09 },
  { rank: 193, name: 'Tower of Shunning Excursion', pts: 512.54 },
  { rank: 194, name: 'Citadel of Perfect Cherry Blossom', pts: 511.99 },
  { rank: 195, name: 'Steeple of Pole Pole Pole', pts: 511.47 },
  { rank: 196, name: 'Tower of The Wedge\'s Vengeance', pts: 510.95 },
  { rank: 197, name: 'Tower of Your Short-term Session', pts: 510.45 },
  { rank: 198, name: 'Tower of Cosmix Resonance', pts: 509.97 },
  { rank: 199, name: 'Tower of Ruthless Punishment', pts: 509.49 },
  { rank: 200, name: 'Tower of Reproachful Eyewall', pts: 509.03 },
  { rank: 201, name: 'Tower of Tempestous Twilight', pts: 508.59 },
  { rank: 202, name: 'Tower of Factorial Difficulty', pts: 508.16 },
  { rank: 203, name: 'Tower of Thje Toilet', pts: 507.74 },
  { rank: 204, name: 'Tower of Pulsating Ambition', pts: 507.33 },
  { rank: 205, name: 'Tower of Champion\'s Road', pts: 506.94 },
  { rank: 206, name: 'Tower of Insane Discomfort', pts: 506.56 },
  { rank: 207, name: 'Citadel of Infinite Void: Nerf', pts: 506.2 },
  { rank: 208, name: 'Tower of Alien Radiance: Unnerfed', pts: 505.84 },
  { rank: 209, name: 'Tower of Exodus Obscurity', pts: 505.5 },
  { rank: 210, name: 'steeple of support-tickets', pts: 505.17 },
  { rank: 211, name: 'Tower of Unpremeditated Paraphernalia', pts: 504.85 },
  { rank: 212, name: 'Tower of Raging Tempest', pts: 504.55 },
  { rank: 213, name: 'Tower of The Jankening', pts: 504.26 },
  { rank: 214, name: 'Tower of Monty Mole Mayhem', pts: 503.97 },
  { rank: 215, name: 'Lighthouse', pts: 503.7 },
  { rank: 216, name: 'Steeple of Leaden Heights', pts: 503.44 },
  { rank: 217, name: 'Tower of Punishing Runs', pts: 503.2 },
  { rank: 218, name: 'Tower of Explore My World: Classic', pts: 502.96 },
  { rank: 219, name: 'Tower of Hydraulic Rummage', pts: 502.73 },
  { rank: 220, name: 'Tower of Atmospheric Launch', pts: 502.52 },
  { rank: 221, name: 'Tower of Terse Persecution', pts: 502.31 },
  { rank: 222, name: 'Tower of Thin Mints', pts: 502.12 },
  { rank: 223, name: 'Steeple of Endless Assembly', pts: 501.94 },
  { rank: 224, name: 'Tower of Centchade', pts: 501.76 },
  { rank: 225, name: 'Turbulent Tower: Super Hard Mode', pts: 501.6 },
  { rank: 226, name: 'Tower of Fujiwara no Mokou', pts: 501.44 },
  { rank: 227, name: 'Tower of Monumental Abyss', pts: 501.3 },
  { rank: 228, name: 'Tower of Annoyingly Complex Trials', pts: 501.16 },
  { rank: 229, name: 'Tower of The Turkey Sandwich Trials', pts: 501.03 },
  { rank: 230, name: 'Tower of Relentless Fate', pts: 500.91 },
  { rank: 231, name: 'Steeple of Jeopardized Romance', pts: 500.8 },
  { rank: 232, name: 'Tower of Kidney Stones', pts: 500.7 },
  { rank: 233, name: 'Tower of Organamix Twistalivious', pts: 500.61 },
  { rank: 234, name: 'Citadel of Generation Failure', pts: 500.52 },
  { rank: 235, name: 'Tower of The Flowering Cyclone', pts: 500.45 },
  { rank: 236, name: 'teehee colon three tower', pts: 500.37 },
  { rank: 237, name: '＜', pts: 500.31 },
  { rank: 238, name: 'Tower of Endless Marathon', pts: 500.25 },
  { rank: 239, name: 'Tower of The Final Moment', pts: 500.21 },
  { rank: 240, name: 'Tower of Difficulty Spike', pts: 500.16 },
  { rank: 241, name: 'Schizophrenic Steeple', pts: 500.12 },
  { rank: 242, name: 'Tower of Unter dem Schwarzschildradius', pts: 500.09 },
  { rank: 243, name: 'Tower of Jim and Tim\'s Ultimate Birthday Blowout!', pts: 500.07 },
  { rank: 244, name: 'Tower of The Drive Towards Human Limits: Super Nerf', pts: 500.05 },
  { rank: 245, name: 'Tower of Raging Tempest: Everstorm', pts: 500.03 },
  { rank: 246, name: 'Tower of Oblivious Twist', pts: 500.02 },
  { rank: 247, name: 'Citadel of Augmented Misery', pts: 500.01 },
  { rank: 248, name: 'Tower of Live The Dream', pts: 500.0 },
  { rank: 249, name: 'Steeple of Denouementer', pts: 500.0 },
  { rank: 250, name: 'Citadel of Colorless Despair', pts: 500.0 },
  { rank: 251, name: 'S.T.O.N.E Facility', pts: 499.75 },
  { rank: 252, name: 'Obelisk of I Have No Idea What I\'m Even Doing Anymore Please Help', pts: 499.5 },
  { rank: 253, name: 'Tower of Pure Ability', pts: 499.25 },
  { rank: 254, name: 'Radio Tower', pts: 499.01 },
  { rank: 255, name: 'Tower of Necrotic Incantation', pts: 498.76 },
  { rank: 256, name: 'Great Citadel of Great Joobly Chart', pts: 498.51 },
  { rank: 257, name: 'Tower of Asteroid Corrode Mismanagement', pts: 498.26 },
  { rank: 258, name: 'Tower of Lost In Eden', pts: 498.01 },
  { rank: 259, name: 'Steeple of Cognizant Freedom', pts: 497.76 },
  { rank: 260, name: 'Steeple of Lex', pts: 497.51 },
  { rank: 261, name: 'Advancement of Taboo Tower', pts: 497.27 },
  { rank: 262, name: 'Tower of Jocundigluey', pts: 497.02 },
  { rank: 263, name: 'Citadel of Wacky Strategy: Buffed', pts: 496.77 },
  { rank: 264, name: 'Not Even a Not Even a Great Citadel', pts: 496.52 },
  { rank: 265, name: 'Tower of Lika 98', pts: 496.27 },
  { rank: 266, name: 'Tower of Screaming and Creaming', pts: 496.02 },
  { rank: 267, name: 'Steeple of Coconut', pts: 495.78 },
  { rank: 268, name: 'Obelisk of Long', pts: 495.53 },
  { rank: 269, name: 'Tower of Yeah, It\'s Pretty Empty Entirely', pts: 495.28 },
  { rank: 270, name: 'Tower of Doubly Deadly Descent', pts: 495.03 },
  { rank: 271, name: 'Unnerfed Tower of Melancholic Misery', pts: 494.78 },
  { rank: 272, name: 'Unnerfed Tower of Perlin Dreams of Greatness', pts: 494.53 },
  { rank: 273, name: 'Steeple of 50 Wraps of Hell', pts: 494.29 },
  { rank: 274, name: 'Tower of Un Ca', pts: 494.04 },
  { rank: 275, name: 'Tower of Otherworldly Expertise', pts: 493.79 },
  { rank: 276, name: 'Sprite Cranberry Steeple', pts: 493.54 },
  { rank: 277, name: 'Ultimate Obby Tower', pts: 493.29 },
  { rank: 278, name: 'Tower of Ring Rang Rung Rong', pts: 493.04 },
  { rank: 279, name: 'Tower of Explore My World', pts: 492.8 },
  { rank: 280, name: 'Tower of Upbeat Dejectional Rascality', pts: 492.55 },
  { rank: 281, name: 'Tower of Inner Repose', pts: 492.3 },
  { rank: 282, name: 'Tower of Elongated Torments', pts: 492.05 },
  { rank: 283, name: 'Tower of Unorthodoxy', pts: 491.8 },
  { rank: 284, name: 'Sorry Richo Steeple', pts: 491.56 },
  { rank: 285, name: 'Tower of Thje Ecotism', pts: 491.31 },
  { rank: 286, name: 'Tower of Jumping', pts: 491.06 },
  { rank: 287, name: 'Tower of Sacrilegious Jumps: Super Nerf', pts: 490.81 },
  { rank: 288, name: 'Tower of Endless Spreading Bane', pts: 490.56 },
  { rank: 289, name: 'Tower of Do Not Play', pts: 490.32 },
  { rank: 290, name: 'Tower of Disengaging Lunacy', pts: 490.07 },
  { rank: 291, name: 'Tower of Parody: Super Nerf', pts: 489.82 },
  { rank: 292, name: 'Tower of Vibrant Overcomings', pts: 489.57 },
  { rank: 293, name: 'Treacherous Extremist Ascension Neat', pts: 489.32 },
  { rank: 294, name: 'Tower of Pierogi', pts: 489.08 },
  { rank: 295, name: 'Steeple of Wallhop Destiny', pts: 488.83 },
  { rank: 296, name: 'Tower of Quadrilaterals', pts: 488.58 },
  { rank: 297, name: 'S.C.O.N.E Facility', pts: 488.33 },
  { rank: 298, name: 'Tower of Beast Weaver', pts: 488.08 },
  { rank: 299, name: 'Tower of Withering Dirges', pts: 487.84 },
  { rank: 300, name: 'Tower of Lung Chugging', pts: 487.59 },
  { rank: 301, name: 'Tower of Empty Meaningless Patterns', pts: 487.34 },
  { rank: 302, name: 'Tower of Spicy Headcream', pts: 487.09 },
  { rank: 303, name: 'Steeple of Xei Pei Disagreement', pts: 486.85 },
  { rank: 304, name: 'Tower of Descent Into Exile', pts: 486.6 },
  { rank: 305, name: 'Tower of Wooden Planks', pts: 486.35 },
  { rank: 306, name: 'Tower of Wiggly Worm', pts: 486.1 },
  { rank: 307, name: 'Tower of My End', pts: 485.85 },
  { rank: 308, name: 'Was a Citadel', pts: 485.61 },
  { rank: 309, name: 'Steeple of Mori Calliope', pts: 485.36 },
  { rank: 310, name: 'Jeronimo\'s Nest, Chapter 1: The Rice & Beans Coalition', pts: 485.11 },
  { rank: 311, name: 'Steeple of Sweet Tendency', pts: 484.86 },
  { rank: 312, name: 'Tower of Hard Chart', pts: 484.62 },
  { rank: 313, name: 'Tower of Conceptual Phase', pts: 484.37 },
  { rank: 314, name: 'Obelisk of Latest Difficulty Chart', pts: 484.12 },
  { rank: 315, name: 'Tower of Thje Tower', pts: 483.87 },
  { rank: 316, name: 'Tower of Melodramatic Esoteric Nebulosity', pts: 483.63 },
  { rank: 317, name: 'Tower of Being Extremely Rude', pts: 483.38 },
  { rank: 318, name: 'Steeple of Anything Can Happen', pts: 483.13 },
  { rank: 319, name: 'The Really Ugly Sad Steeple', pts: 482.88 },
  { rank: 320, name: 'Tower of FL Studio F', pts: 482.64 },
  { rank: 321, name: 'Edifice of Adrift in Utopia', pts: 482.39 },
  { rank: 322, name: 'Steeple of Cybersecurity', pts: 482.14 },
  { rank: 323, name: 'Tower of Infernal Turpitude', pts: 481.89 },
  { rank: 324, name: 'Tower of Death Corridor: Super Nerf', pts: 481.65 },
  { rank: 325, name: 'Tower of Wacky Truss Destruction', pts: 481.4 },
  { rank: 326, name: 'Tower of Infuriating Misfortune', pts: 481.15 },
  { rank: 327, name: 'Steeple of Benevolence', pts: 480.9 },
  { rank: 328, name: 'Citadel of Inception', pts: 480.66 },
  { rank: 329, name: 'Steeple of Ranka Lee', pts: 480.41 },
  { rank: 330, name: 'Citadel of Linear Jank', pts: 480.16 },
  { rank: 331, name: 'Tower of Angled Passageways', pts: 479.91 },
  { rank: 332, name: 'Tower of AbyssalChaos Never Clear', pts: 479.67 },
  { rank: 333, name: 'SLAUGHTERHOUSE STEEPLE', pts: 479.42 },
  { rank: 334, name: 'Steeple of Extreme Awkwardness', pts: 479.17 },
  { rank: 335, name: 'Tower of Arduous Architecture', pts: 478.93 },
  { rank: 336, name: 'Tower of Button Peril', pts: 478.68 },
  { rank: 337, name: 'Tower of Math.Random', pts: 478.43 },
  { rank: 338, name: 'Tower of Kemochao Wonderland', pts: 478.18 },
  { rank: 339, name: 'Tower of Tortuous Oblivion', pts: 477.94 },
  { rank: 340, name: 'Tower of Cata4', pts: 477.69 },
  { rank: 341, name: 'Tower of Vibrant Visuals', pts: 477.44 },
  { rank: 342, name: 'Hecing Egg Facility: A-Sides', pts: 477.19 },
  { rank: 343, name: 'Tower of Spiralling Fates: Nerf', pts: 476.95 },
  { rank: 344, name: 'Steeple of KittyEmi\'s Birthday', pts: 476.7 },
  { rank: 345, name: 'Tower of Challenging Obstacle Anarchy: EToH Edition', pts: 476.45 },
  { rank: 346, name: 'Citadel of Infinite Void: Super Nerf', pts: 476.21 },
  { rank: 347, name: 'Tower of Rove Culmination', pts: 475.96 },
  { rank: 348, name: 'Steeple of Abrasive Whitening', pts: 475.71 },
  { rank: 349, name: 'Steeple of Wallwalk Difficulty Chart', pts: 475.47 },
  { rank: 350, name: 'Tower of Divine Purity', pts: 475.22 },
  { rank: 351, name: 'Edifice of Bluehopping', pts: 474.97 },
  { rank: 352, name: 'Tower of Hellfire and Brimstone', pts: 474.72 },
  { rank: 353, name: 'Tower of Light To Dark', pts: 474.48 },
  { rank: 354, name: 'Tower of Tiny Dome Men', pts: 474.23 },
  { rank: 355, name: 'GUGGLE OF HUNGO MA YUNGLE', pts: 473.98 },
  { rank: 356, name: 'Tower of Hectic Corridor', pts: 473.74 },
  { rank: 357, name: 'mongubopgomogmgommoommomoomoomongumanguguggogogogo', pts: 473.49 },
  { rank: 358, name: 'Tower of Hard Jumps', pts: 473.24 },
  { rank: 359, name: 'Tower of Persevering Through the Storm', pts: 473.0 },
  { rank: 360, name: 'Tower of Obnoxious Times', pts: 472.75 },
  { rank: 361, name: 'Steeple of Was Really Bored', pts: 472.5 },
  { rank: 362, name: 'Tower of Tuff', pts: 472.26 },
  { rank: 363, name: 'Tower of Cold and False Sonder', pts: 472.01 },
  { rank: 364, name: 'Tower of Outerspatial Fatalities', pts: 471.76 },
  { rank: 365, name: 'Tower of The Volcano', pts: 471.52 },
  { rank: 366, name: 'Steeple of Upsetting', pts: 471.27 },
  { rank: 367, name: 'Tower of Unexplainable Hatred', pts: 471.02 },
  { rank: 368, name: 'Tower of Truss Mania', pts: 470.78 },
  { rank: 369, name: 'Tower of I Beat Tidal Wave', pts: 470.53 },
  { rank: 370, name: 'Tower of Scareyy Night Mares S Oooooo', pts: 470.28 },
  { rank: 371, name: 'Tower of Difficulty Chart: Buff', pts: 470.04 },
  { rank: 372, name: 'Edifice of 2号', pts: 469.79 },
  { rank: 373, name: 'Steeple of Repetitive Tries', pts: 469.54 },
  { rank: 374, name: 'Tower of Peace and Chaos', pts: 469.3 },
  { rank: 375, name: 'Tower of Bonbonsteve Never Clear', pts: 469.05 },
  { rank: 376, name: 'Tower of File Corruption', pts: 468.8 },
  { rank: 377, name: 'Tower of Utter Wack', pts: 468.56 },
  { rank: 378, name: 'Tower of Submissive Furry', pts: 468.31 },
  { rank: 379, name: 'Was A Tower', pts: 468.06 },
  { rank: 380, name: 'Tower of Fiend Massacre', pts: 467.82 },
  { rank: 381, name: 'Tower of Ruthless Royal Architecture', pts: 467.57 },
  { rank: 382, name: 'tour de stylo', pts: 467.32 },
  { rank: 383, name: 'Bargain Bin Steeples', pts: 467.08 },
  { rank: 384, name: 'Tower of Absolutely Brutal Failures', pts: 466.83 },
  { rank: 385, name: 'Tower of Interdimensional Gateway', pts: 466.58 },
  { rank: 386, name: 'Tower of Final Resolve', pts: 466.34 },
  { rank: 387, name: 'Steeple of Lyme Disease', pts: 466.09 },
  { rank: 388, name: 'Tower of Transcendental Mastery: Unnerfed', pts: 465.84 },
  { rank: 389, name: 'Tower of Devilish Judgements', pts: 465.6 },
  { rank: 390, name: 'Citadel of Glory', pts: 465.35 },
  { rank: 391, name: 'Tower of Speedy Cat Deluxe', pts: 465.11 },
  { rank: 392, name: 'Tower of Blue Devotion', pts: 464.86 },
  { rank: 393, name: 'Tower of Gelidity', pts: 464.61 },
  { rank: 394, name: 'Citadel of Focused Flames', pts: 464.37 },
  { rank: 395, name: 'Tower of Generation Failure', pts: 464.12 },
  { rank: 396, name: 'very tall neat', pts: 463.87 },
  { rank: 397, name: 'Tower of Unconventional Structuring', pts: 463.63 },
  { rank: 398, name: 'Steeple of Sophisticated Challenges', pts: 463.38 },
  { rank: 399, name: 'Tower of Skyscraper Scaling', pts: 463.14 },
  { rank: 400, name: 'Steeple of Severed Light', pts: 462.89 },
  { rank: 401, name: 'Mercadona Tower', pts: 462.64 },
  { rank: 402, name: 'Tower of Decaying Serenity', pts: 462.4 },
  { rank: 403, name: 'Edifice of Denmark Hopping', pts: 462.15 },
  { rank: 404, name: 'Expensive sc', pts: 461.91 },
  { rank: 405, name: 'Tower of Monochrome', pts: 461.66 },
  { rank: 406, name: 'Unnerfed Thanos Citadel', pts: 461.41 },
  { rank: 407, name: 'Tower of Mushroom: Super Nerf', pts: 461.17 },
  { rank: 408, name: 'Tower of Wigglecore: Catastrophic', pts: 460.92 },
  { rank: 409, name: 'Tower of Contrasting Boundaries', pts: 460.68 },
  { rank: 410, name: 'Tower of Fervent Imperfection', pts: 460.43 },
  { rank: 411, name: 'Tower of Long Lasting Leukophobia', pts: 460.18 },
  { rank: 412, name: 'Tower of High Vigilance', pts: 459.94 },
  { rank: 413, name: 'Tower of It\'s Just a Game', pts: 459.69 },
  { rank: 414, name: 'Free cata', pts: 459.45 },
  { rank: 415, name: 'Torre De Difficulty Chart Para Pasarmela', pts: 459.2 },
  { rank: 416, name: 'Tower of Linear Jank', pts: 458.95 },
  { rank: 417, name: 'Tower of Movin\' Right Along: Unnerfed', pts: 458.71 },
  { rank: 418, name: 'Tower of I Am So Done With Everything The World Has Layed Upon Me / Tower of Simple Obstacles', pts: 458.46 },
  { rank: 419, name: 'Tower of Perplexed Ascent', pts: 458.22 },
  { rank: 420, name: 'Obelisk of Endless Obby', pts: 457.97 },
  { rank: 421, name: 'Tower of The Seventh Chromosome', pts: 457.72 },
  { rank: 422, name: 'Tower of Inferno Galore', pts: 457.48 },
  { rank: 423, name: 'Tower of Damask Accretion', pts: 457.23 },
  { rank: 424, name: 'Ikea Tower: Catastrophic', pts: 456.99 },
  { rank: 425, name: '3008-Tower: Super Nerf', pts: 456.74 },
  { rank: 426, name: 'Tower of Blind Fate: Nerf', pts: 456.5 },
  { rank: 427, name: 'Tower of Vindictive Maneuvers', pts: 456.25 },
  { rank: 428, name: 'Tower of Glory', pts: 456.0 },
  { rank: 429, name: 'Tower of Burning Hopes', pts: 455.76 },
  { rank: 430, name: 'Tower of Cataclysmic Layers', pts: 455.51 },
  { rank: 431, name: 'Edifice of Don\'t Stop All', pts: 455.27 },
  { rank: 432, name: 'Tower of Retracing Footsteps', pts: 455.02 },
  { rank: 433, name: 'Tower of Dead Arctic', pts: 454.78 },
  { rank: 434, name: 'Tower of Chromatic Inclination: Unnerfed', pts: 454.53 },
  { rank: 435, name: 'Kaizo Steeple', pts: 454.29 },
  { rank: 436, name: 'steeple of zvoidrr', pts: 454.04 },
  { rank: 437, name: 'Steeple of Gilded Rust', pts: 453.79 },
  { rank: 438, name: 'Tower of Kill or Be Killed', pts: 453.55 },
  { rank: 439, name: 'Steeple of Lifelessness', pts: 453.3 },
  { rank: 440, name: 'Steeple of Pine Apple', pts: 453.06 },
  { rank: 441, name: 'Steeple of Larp', pts: 452.81 },
  { rank: 442, name: 'Tower of Everlasting Endeavour', pts: 452.57 },
  { rank: 443, name: 'Citadel of Latest Difficulty Chart', pts: 452.32 },
  { rank: 444, name: 'Tower of Wayward Venture', pts: 452.08 },
  { rank: 445, name: 'Glory of Sigmund', pts: 451.83 },
  { rank: 446, name: 'Steeple of The Troublemaker', pts: 451.59 },
  { rank: 447, name: 'Tower of Champion\'s Gaming: Revamp', pts: 451.34 },
  { rank: 448, name: 'Tower of Always Losing', pts: 451.1 },
  { rank: 449, name: 'Tower of Hitbox and Health Abuse', pts: 450.85 },
  { rank: 450, name: 'Tower of Micro Management: Unnerfed', pts: 450.6 },
  { rank: 451, name: 'Tower of Yummy Hotdog', pts: 450.36 },
  { rank: 452, name: 'Steeple of Final Fantasy', pts: 450.11 },
  { rank: 453, name: 'Tower of Sprite Manipulation', pts: 449.87 },
  { rank: 454, name: 'Tower of Narrow Intensification', pts: 449.62 },
  { rank: 455, name: 'Steeple of Miku Miku Miku', pts: 449.38 },
  { rank: 456, name: 'Tower of Impending Doom: Super Nerf', pts: 449.13 },
  { rank: 457, name: 'Tower of Interstellar Division', pts: 448.89 },
  { rank: 458, name: 'Tower of Augmented Misery', pts: 448.64 },
  { rank: 459, name: 'Tower of Final Inferno', pts: 448.4 },
  { rank: 460, name: 'Tower of Transcendental Mastery', pts: 448.15 },
  { rank: 461, name: 'Tower of Crying and Dying', pts: 447.91 },
  { rank: 462, name: 'Tower of S Pi Ra Ls', pts: 447.66 },
  { rank: 463, name: 'Tower of Eternal Void: Nerf', pts: 447.42 },
  { rank: 464, name: 'Steeple of Serek', pts: 447.17 },
  { rank: 465, name: 'Tower of Champion\'s Gaming', pts: 446.93 },
  { rank: 466, name: 'Tower of Precise Turns', pts: 446.68 },
  { rank: 467, name: 'Tower of Perfect Love', pts: 446.44 },
  { rank: 468, name: 'Steeple of Cheese Burger: Nerf', pts: 446.19 },
  { rank: 469, name: 'S.T.O.N.E Facility: VIP', pts: 445.95 },
  { rank: 470, name: 'Tower of Flummin\' Time', pts: 445.7 },
  { rank: 471, name: 'Tower of Vindication', pts: 445.46 },
  { rank: 472, name: 'Steeple of Au Revoir', pts: 445.21 },
  { rank: 473, name: 'Tower of Elongated Runs: Difficulty Chart', pts: 444.97 },
  { rank: 474, name: 'Hecing Egg Facility: B-Sides', pts: 444.72 },
  { rank: 475, name: 'Tower of Colossal Crossroad Climbing', pts: 444.48 },
  { rank: 476, name: 'Liadus Absolute Chomikness', pts: 444.23 },
  { rank: 477, name: 'Tower of Truss Fuss', pts: 443.99 },
  { rank: 478, name: 'Tower of Absolute Zero: AHoSCT', pts: 443.74 },
  { rank: 479, name: 'Steeple of Anathematized Maltreatment', pts: 443.5 },
  { rank: 480, name: 'Tower of Goofy Trusses', pts: 443.25 },
  { rank: 481, name: 'Tower of Edgy Name', pts: 443.01 },
  { rank: 482, name: 'Definitely Not a There Is No God', pts: 442.76 },
  { rank: 483, name: 'Tower of Zenith', pts: 442.52 },
  { rank: 484, name: 'Tower of Relentless Altitude', pts: 442.28 },
  { rank: 485, name: 'Tower of Cyanide', pts: 442.03 },
  { rank: 486, name: 'Tower of Classical Difficult Spike', pts: 441.79 },
  { rank: 487, name: 'Tower of Heinous Interference', pts: 441.54 },
  { rank: 488, name: 'Tower of Mauve Attestations', pts: 441.3 },
  { rank: 489, name: 'Steeple of Mewing NEAT', pts: 441.05 },
  { rank: 490, name: 'Tower of Sandy Meat', pts: 440.81 },
  { rank: 491, name: 'Tower of Eternal Agony', pts: 440.56 },
  { rank: 492, name: 'Tower of Destructive Peril', pts: 440.32 },
  { rank: 493, name: 'Tower of Overthinking Life Choices', pts: 440.07 },
  { rank: 494, name: 'Tower of Spiraling The Frame', pts: 439.83 },
  { rank: 495, name: 'Maybe I Know U', pts: 439.58 },
  { rank: 496, name: 'Tower of Mc Donald', pts: 439.34 },
  { rank: 497, name: 'Höhentranszendenteätherflammenprojektionmanufaktur', pts: 439.1 },
  { rank: 498, name: 'N.O.O.B. Facility', pts: 438.85 },
  { rank: 499, name: 'Citadel of The Finale Bro!', pts: 438.61 },
  { rank: 500, name: 'Tower of Wigglecore: Super Nerf', pts: 438.36 },
  { rank: 501, name: 'Tower of Hellish Nightmares', pts: 438.12 },
  { rank: 502, name: 'Tower of I Trosuve', pts: 437.87 },
  { rank: 503, name: 'Tower of Big Big Footies', pts: 437.63 },
  { rank: 504, name: 'Denouement Clicker', pts: 437.39 },
  { rank: 505, name: 'Citadel of Xerically Infuriating Calamity', pts: 437.14 },
  { rank: 506, name: 'Tower of Layering Torment', pts: 436.9 },
  { rank: 507, name: 'Tower of Atrocious Truss Catastrophe', pts: 436.65 },
  { rank: 508, name: 'Tower of Mushy Peas', pts: 436.41 },
  { rank: 509, name: 'Tower of Despondency', pts: 436.16 },
  { rank: 510, name: 'Tower of Seclusion', pts: 435.92 },
  { rank: 511, name: 'You vs Homer Steeple', pts: 435.68 },
  { rank: 512, name: 'Steeple of Indoor Ordeals', pts: 435.43 },
  { rank: 513, name: 'Tower of Cliffside Madness: Unnerfed', pts: 435.19 },
  { rank: 514, name: 'Tower of Hell and Despair', pts: 434.94 },
  { rank: 515, name: 'Tower of Circuitous Spiral', pts: 434.7 },
  { rank: 516, name: 'Tower of Isoprophl-X', pts: 434.45 },
  { rank: 517, name: 'Tower of Light and Dark', pts: 434.21 },
  { rank: 518, name: 'Tower of Zimble Zamble', pts: 433.97 },
  { rank: 519, name: 'Tower of Cataclysmic Layers: Classic', pts: 433.72 },
  { rank: 520, name: 'Steeple of Linear Speedrunning', pts: 433.48 },
  { rank: 521, name: 'Steeple of Precise Perfection', pts: 433.23 },
  { rank: 522, name: 'Tower of Oscillating Punishment', pts: 432.99 },
  { rank: 523, name: 'Tower of Enhanced Persistence', pts: 432.75 },
  { rank: 524, name: 'Tower of Inception', pts: 432.5 },
  { rank: 525, name: 'Tower of The Mythic Project', pts: 432.26 },
  { rank: 526, name: 'Tower of Knead That Fried Chicken, Shake That Fried Chicken', pts: 432.01 },
  { rank: 527, name: 'Tower of Oblique Agony', pts: 431.77 },
  { rank: 528, name: 'Tower of Chromatic Inclination: Classic', pts: 431.53 },
  { rank: 529, name: 'Tower of Wildly Wacky Wonders', pts: 431.28 },
  { rank: 530, name: 'Tower of Handful Wrap', pts: 431.04 },
  { rank: 531, name: 'Tower of Hindrancing Vacants', pts: 430.79 },
  { rank: 532, name: 'Tower of muumitalo', pts: 430.55 },
  { rank: 533, name: 'Steeple of Prolonged Suffering: Classic', pts: 430.31 },
  { rank: 534, name: 'Tower of Spiced Up Sand', pts: 430.06 },
  { rank: 535, name: 'Tower of Bad Design', pts: 429.82 },
  { rank: 536, name: 'Tower of Perlin Dreams of Greatness', pts: 429.58 },
  { rank: 537, name: 'Tower of Cringe Rage Madness', pts: 429.33 },
  { rank: 538, name: 'Tower of Vivid Distress', pts: 429.09 },
  { rank: 539, name: 'Tower of Sudden Death: Super Nerf', pts: 428.84 },
  { rank: 540, name: 'Tower of Reflecting Impediments', pts: 428.6 },
  { rank: 541, name: 'Tower of Frameless Linear Mobility', pts: 428.36 },
  { rank: 542, name: 'A BARBERSHOP HAIRCUT THAT COSTS A QUARTER', pts: 428.11 },
  { rank: 543, name: 'Tower of Brazen Brusque', pts: 427.87 },
  { rank: 544, name: 'Mr Beast', pts: 427.63 },
  { rank: 545, name: 'Tower of The Roof\'s Pique: Nerf', pts: 427.38 },
  { rank: 546, name: 'Obelisk of Frightening Nightmares', pts: 427.14 },
  { rank: 547, name: 'Steeple of Tight Jumps', pts: 426.9 },
  { rank: 548, name: 'Tower of Melodramatic Esoteric Nebulosity: Classic', pts: 426.65 },
  { rank: 549, name: 'Tower of Brisk Movement', pts: 426.41 },
  { rank: 550, name: 'Tower about Wall hopping against Transistor', pts: 426.17 },
  { rank: 551, name: 'Tower of Critical Corruption', pts: 425.92 },
  { rank: 552, name: 'Citadel of Walkies', pts: 425.68 },
  { rank: 553, name: 'Tower of Precariously Positioned Platforms', pts: 425.43 },
  { rank: 554, name: 'Tower of Uncanny Agony', pts: 425.19 },
  { rank: 555, name: 'Pillar of Schnobbleclob', pts: 424.95 },
  { rank: 556, name: 'Tower of Jamba', pts: 424.7 },
  { rank: 557, name: 'Steeple of Hopouement', pts: 424.46 },
  { rank: 558, name: 'Tower of Zen Surplus: Super Nerf', pts: 424.22 },
  { rank: 559, name: 'Tower of Cruel Underestimated Parkour', pts: 423.97 },
  { rank: 560, name: 'Obelisk of Really Long', pts: 423.73 },
  { rank: 561, name: 'Citadel of 25 Jumps', pts: 423.49 },
  { rank: 562, name: 'Tower of The Sky, The Success', pts: 423.24 },
  { rank: 563, name: 'Tower of Tee Hee Time: The Perfect Run', pts: 423.0 },
  { rank: 564, name: 'Tower of Miserable Journeys', pts: 422.76 },
  { rank: 565, name: 'Tower of Estrogen', pts: 422.51 },
  { rank: 566, name: 'Steeple of Griddy', pts: 422.27 },
  { rank: 567, name: 'Edifice of Loopfail Hell', pts: 422.03 },
  { rank: 568, name: 'The Salty Spitoon', pts: 421.79 },
  { rank: 569, name: 'Tower of Polychromatic Zero: Super Buff', pts: 421.54 },
  { rank: 570, name: 'Tower of Chacina Repentina', pts: 421.3 },
  { rank: 571, name: 'Tower of Lime Skittle', pts: 421.06 },
  { rank: 572, name: 'Tower of Falling and Failing: Super Buff', pts: 420.81 },
  { rank: 573, name: 'Tower of Unrelenting Precipice', pts: 420.57 },
  { rank: 574, name: 'Wallhop Steeple', pts: 420.33 },
  { rank: 575, name: 'Steeple of Greek Alphabet Hop', pts: 420.08 },
  { rank: 576, name: 'Steeple of An Unjust War', pts: 419.84 },
  { rank: 577, name: 'Tower of Ethereal Punishment', pts: 419.6 },
  { rank: 578, name: 'Tower of Double Up', pts: 419.35 },
  { rank: 579, name: 'Tower of Nervous Sweating', pts: 419.11 },
  { rank: 580, name: 'Tower of Vibrant Purism', pts: 418.87 },
  { rank: 581, name: 'Tower of Illuminated Vitality', pts: 418.63 },
  { rank: 582, name: 'Tower of Expected Outcomes', pts: 418.38 },
  { rank: 583, name: 'Tower of Penultimate Nostalgia', pts: 418.14 },
  { rank: 584, name: 'Tower of Five Nights at Awsome', pts: 417.9 },
  { rank: 585, name: 'Pissgang Tower', pts: 417.65 },
  { rank: 586, name: 'Steeple of Thje Roof', pts: 417.41 },
  { rank: 587, name: 'Tower of Frightening and Confusing Trials: Difficulty Chart', pts: 417.17 },
  { rank: 588, name: 'Tower of My Terrible Ribosome', pts: 416.93 },
  { rank: 589, name: 'Tower of Ubiquitous Zany', pts: 416.68 },
  { rank: 590, name: 'Certainly A Tower', pts: 416.44 },
  { rank: 591, name: 'Tower of Water Melon: Nerf', pts: 416.2 },
  { rank: 592, name: 'Tower of 1lus Centrifuge', pts: 415.95 },
  { rank: 593, name: 'Wora Tower', pts: 415.71 },
  { rank: 594, name: 'Steeple of Basic Jumps', pts: 415.47 },
  { rank: 595, name: 'Tower of Rather Empty Spaces', pts: 415.23 },
  { rank: 596, name: 'Great Citadel of Wacky Strategy', pts: 414.98 },
  { rank: 597, name: 'Tower of Quirky Wraps', pts: 414.74 },
  { rank: 598, name: 'Tower of Hazardous Catastrophe', pts: 414.5 },
  { rank: 599, name: 'Tower of Slipping Through Reality: Unnerfed', pts: 414.26 },
  { rank: 600, name: 'Tower of Niflheimr Hvergelmir', pts: 414.01 },
  { rank: 601, name: 'Tower of Varying Punishment', pts: 413.77 },
  { rank: 602, name: 'Tower of True Skill: Buff: Unnerfed', pts: 413.53 },
  { rank: 603, name: 'Tower of Hopeless Hell: Reimagined', pts: 413.29 },
  { rank: 604, name: 'Tower of Big Momma\'s Twisted Fate', pts: 413.04 },
  { rank: 605, name: 'Tower of Roughly Rotated Ruin: Classic', pts: 412.8 },
  { rank: 606, name: 'Tower of Perishing', pts: 412.56 },
  { rank: 607, name: 'Tower of Exasperantial Tranquility', pts: 412.32 },
  { rank: 608, name: 'Steeple of Huge Cliff', pts: 412.07 },
  { rank: 609, name: 'Tower of Melancholic Misery', pts: 411.83 },
  { rank: 610, name: 'Tower of Duality', pts: 411.59 },
  { rank: 611, name: 'Tower of Neophobe Adagio', pts: 411.35 },
  { rank: 612, name: 'Tower of Crawl a Ladder', pts: 411.1 },
  { rank: 613, name: 'Tower of Lifting Foundations', pts: 410.86 },
  { rank: 614, name: 'Tower of Journey\'s End', pts: 410.62 },
  { rank: 615, name: 'Tower of Monochromatic Journey', pts: 410.38 },
  { rank: 616, name: 'Steeple of Divine', pts: 410.13 },
  { rank: 617, name: 'Tower of Extravagant Borders', pts: 409.89 },
  { rank: 618, name: 'Tower of DA BABY', pts: 409.65 },
  { rank: 619, name: 'Tower of Disintegrating Into Latex', pts: 409.41 },
  { rank: 620, name: 'Tower of Sleek Keels', pts: 409.17 },
  { rank: 621, name: 'Steeple of Lika 99', pts: 408.92 },
  { rank: 622, name: 'Tower of Thinning Layers: Reignited', pts: 408.68 },
  { rank: 623, name: 'Tower of Obese Charts', pts: 408.44 },
  { rank: 624, name: 'Tower of Flipping Everything', pts: 408.2 },
  { rank: 625, name: 'steeple of laser emoji', pts: 407.95 },
  { rank: 626, name: 'Tower of Ring One', pts: 407.71 },
  { rank: 627, name: 'Tower of Expanding Layers: Alternate 2 2', pts: 407.47 },
  { rank: 628, name: 'Tower of Impractical Chances', pts: 407.23 },
  { rank: 629, name: 'Tower of Hopeless Hell: Difficulty Chart', pts: 406.99 },
  { rank: 630, name: 'Tower of Lavish Thrones', pts: 406.74 },
  { rank: 631, name: 'European Wallhop Edifice', pts: 406.5 },
  { rank: 632, name: 'Tower of Lucas Penteado: Nerf', pts: 406.26 },
  { rank: 633, name: 'Tower of Internalizing Insanity', pts: 406.02 },
  { rank: 634, name: 'Tower of Undying Light', pts: 405.78 },
  { rank: 635, name: 'Tower of Kiwi Fruit', pts: 405.53 },
  { rank: 636, name: 'Great Citadel of Laptop Splitting: Secret Ending', pts: 405.29 },
  { rank: 637, name: 'Steeple of Undarlegur Turn', pts: 405.05 },
  { rank: 638, name: 'Steeple of Sweet As Honey', pts: 404.81 },
  { rank: 639, name: 'Nokia Tower: Super Nerf', pts: 404.57 },
  { rank: 640, name: 'Tower of Fragile Salvation', pts: 404.33 },
  { rank: 641, name: 'Steeple of Wacky Obstructions', pts: 404.08 },
  { rank: 642, name: 'Tower of Pure Skill: Unnerfed', pts: 403.84 },
  { rank: 643, name: 'Tower of Vital Vector Venture', pts: 403.6 },
  { rank: 644, name: 'Tower of Tilted Serenity', pts: 403.36 },
  { rank: 645, name: 'Citadel of New Difficulty Chart', pts: 403.12 },
  { rank: 646, name: 'Tower of Yelling A Whole Lot: Old', pts: 402.87 },
  { rank: 647, name: 'Tower of Soul Crushing Difficulty Chart', pts: 402.63 },
  { rank: 648, name: 'Tower of Long Stressful Expeditions', pts: 402.39 },
  { rank: 649, name: 'Tower of This Might Be Linonophobia', pts: 402.15 },
  { rank: 650, name: 'Tower of Chromatic Density', pts: 401.91 },
  { rank: 651, name: 'Steeple of Prolonged Suffering', pts: 401.67 },
  { rank: 652, name: 'Steeple of Hard Wraps', pts: 401.42 },
  { rank: 653, name: 'Tower of Strategic Techniques', pts: 401.18 },
  { rank: 654, name: 'Tower of Punishing Paroxysm', pts: 400.94 },
  { rank: 655, name: 'Tower of Umrah Retail', pts: 400.7 },
  { rank: 656, name: 'BRAT TOWER', pts: 400.46 },
  { rank: 657, name: 'Tower of Skibidi Toilet Sigma Gaming', pts: 400.22 },
  { rank: 658, name: 'Tower of The Mewing Sigma', pts: 399.98 },
  { rank: 659, name: 'Tower of Short and Fatal Trouble', pts: 399.73 },
  { rank: 660, name: 'Tower of Atomical Geometry', pts: 399.49 },
  { rank: 661, name: 'Citadel of Quicktek Clients', pts: 399.25 },
  { rank: 662, name: 'Obelisk of Jump King', pts: 399.01 },
  { rank: 663, name: 'Steeple of Wrap God', pts: 398.77 },
  { rank: 664, name: 'Tower of Spiralling Fates: Super Nerf', pts: 398.53 },
  { rank: 665, name: 'Painful Obby Tower', pts: 398.29 },
  { rank: 666, name: 'Tower of Shrinking Layers', pts: 398.04 },
  { rank: 667, name: 'Tower of Glorious Crown', pts: 397.8 },
  { rank: 668, name: 'Tower of Screen Punching: Super Buff', pts: 397.56 },
  { rank: 669, name: 'Steeple of Truss Trauma', pts: 397.32 },
  { rank: 670, name: 'Tower of Punishing Descent', pts: 397.08 },
  { rank: 671, name: 'Steeple of Thje Thinning Voidcore Hindrances Chart', pts: 396.84 },
  { rank: 672, name: 'Steeple of Stop, Wait And Go', pts: 396.6 },
  { rank: 673, name: 'Never A Tower', pts: 396.36 },
  { rank: 674, name: 'Steeple of A Purist\'s Nightmare', pts: 396.11 },
  { rank: 675, name: 'Tower 2', pts: 395.87 },
  { rank: 676, name: 'Tower of Possible Movement', pts: 395.63 },
  { rank: 677, name: 'Tower of Bodacious Maneuvering', pts: 395.39 },
  { rank: 678, name: 'Tower of Googly Jar', pts: 395.15 },
  { rank: 679, name: '나랏〮말〯ᄊᆞ미〮 듀ᇰ귁〮에〮달아〮', pts: 394.91 },
  { rank: 680, name: 'Steeple of Death Difficulty', pts: 394.67 },
  { rank: 681, name: 'Tower of Adventure to Wyoming', pts: 394.43 },
  { rank: 682, name: 'Tower of Against All Odds', pts: 394.19 },
  { rank: 683, name: 'Tower of The Opp Block', pts: 393.94 },
  { rank: 684, name: 'Tower of Dynamic Pulse', pts: 393.7 },
  { rank: 685, name: 'Tower of Xerotic Inescapable Nervebreak', pts: 393.46 },
  { rank: 686, name: 'Steeple of Excruciating Strategies', pts: 393.22 },
  { rank: 687, name: 'Steeple of Unorganized Chaos', pts: 392.98 },
  { rank: 688, name: 'Tower of Quadratic Infinity', pts: 392.74 },
  { rank: 689, name: 'Tower of Two Sided Misery', pts: 392.5 },
  { rank: 690, name: 'Tower of Reoriented Vintage', pts: 392.26 },
  { rank: 691, name: 'Unnerfed Thanos Tower', pts: 392.02 },
  { rank: 692, name: 'Tower of Total Liabilities', pts: 391.78 },
  { rank: 693, name: 'Citadel of Frightening Nightmares', pts: 391.54 },
  { rank: 694, name: 'Tower of Vacant Hindrances: Nerf', pts: 391.29 },
  { rank: 695, name: 'Citadel of Impossible Movement', pts: 391.05 },
  { rank: 696, name: 'Tower of LA \'ROTTE IN CHRISTMASTOWN DE LA SANTA', pts: 390.81 },
  { rank: 697, name: 'Tower of The Everlasting Vexation', pts: 390.57 },
  { rank: 698, name: 'Tower of Enigmatic Cliffs', pts: 390.33 },
  { rank: 699, name: 'Tower of Swift Chacine', pts: 390.09 },
  { rank: 700, name: 'fever dream 5', pts: 389.85 },
  { rank: 701, name: 'Что? Почему? Три.', pts: 389.61 },
  { rank: 702, name: 'Calamity Steeple', pts: 389.37 },
  { rank: 703, name: 'π846', pts: 389.13 },
  { rank: 704, name: 'Giant Tower of Frightening Nightmares', pts: 388.89 },
  { rank: 705, name: 'Creo', pts: 388.65 },
  { rank: 706, name: 'Tower of Agonizing Demise', pts: 388.41 },
  { rank: 707, name: 'World\'s Hardest Tower: The Perfect Run', pts: 388.17 },
  { rank: 708, name: 'Tower of Unstable Ruins', pts: 387.93 },
  { rank: 709, name: 'Tower of Thje Corner', pts: 387.68 },
  { rank: 710, name: 'Tower of Micro Management', pts: 387.44 },
  { rank: 711, name: 'Tower of Ten Is Enough', pts: 387.2 },
  { rank: 712, name: 'Pillar of Clipping Into Damage', pts: 386.96 },
  { rank: 713, name: 'Buffed Tower of Very Fast Building', pts: 386.72 },
  { rank: 714, name: 'Tower of Opposition', pts: 386.48 },
  { rank: 715, name: 'Tower of Radiant Terror', pts: 386.24 },
  { rank: 716, name: 'Tower of Plated Thoughts', pts: 386.0 },
  { rank: 717, name: 'SISTER FINGER SISTER FINGER WHERE ARE YOU', pts: 385.76 },
  { rank: 718, name: 'Tower of Infinity Trials', pts: 385.52 },
  { rank: 719, name: 'Tower of Spiralling Fates: Zee\'s Nerf', pts: 385.28 },
  { rank: 720, name: 'Tower of Roughly Rotated Ruin', pts: 385.04 },
  { rank: 721, name: 'Tower of Prolific Gardens', pts: 384.8 },
  { rank: 722, name: 'Tower of Hotel Exploration', pts: 384.56 },
  { rank: 723, name: 'Tower of Cautious Crossings', pts: 384.32 },
  { rank: 724, name: 'Tower of Deprivation Purgatory', pts: 384.08 },
  { rank: 725, name: 'Samuel\'s Platoon', pts: 383.84 },
  { rank: 726, name: 'I AM TOWER', pts: 383.6 },
  { rank: 727, name: 'Tower of Frightening Nightmares: Unnerfed', pts: 383.36 },
  { rank: 728, name: 'Steeple of Hyllesakel', pts: 383.12 },
  { rank: 729, name: 'Tower of Running Outta Time', pts: 382.88 },
  { rank: 730, name: 'Tower of Misconception', pts: 382.64 },
  { rank: 731, name: 'Tower of Quantum Mentality', pts: 382.4 },
  { rank: 732, name: 'Tower of Alien Radiance', pts: 382.16 },
  { rank: 733, name: 'Steeple of Fading Astray', pts: 381.92 },
  { rank: 734, name: 'Steeple of Luke Licorice', pts: 381.68 },
  { rank: 735, name: 'Tower of Whimsical Flummification', pts: 381.44 },
  { rank: 736, name: 'Tower of Used To Shop At Aldis', pts: 381.2 },
  { rank: 737, name: 'Tower of Quantum Quadrivium', pts: 380.96 },
  { rank: 738, name: 'Steeple of True Exponential Difficulty', pts: 380.72 },
  { rank: 739, name: 'Steeple of Noob', pts: 380.48 },
  { rank: 740, name: 'Steeple of Getting Lazier', pts: 380.24 },
  { rank: 741, name: 'Tower of Was Bored', pts: 380.0 },
  { rank: 742, name: 'Tower of Insensible Distress', pts: 379.76 },
  { rank: 743, name: 'Steeple of Spite', pts: 379.52 },
  { rank: 744, name: 'Tower of True Terrible Misalignments', pts: 379.28 },
  { rank: 745, name: 'Tower of Convolution Meticulousness', pts: 379.04 },
  { rank: 746, name: 'Tower of Tranquil Resonance', pts: 378.8 },
  { rank: 747, name: 'Tower of Architectural Agony', pts: 378.56 },
  { rank: 748, name: 'Tower of Adversity Tabulation: Unnerfed', pts: 378.32 },
  { rank: 749, name: 'Tower of Fatal Agitation: Unnerfed', pts: 378.08 },
  { rank: 750, name: 'Tower of Snaky Ascended Obstacles', pts: 377.84 },
  { rank: 751, name: 'Tower of Jonah Complex', pts: 377.6 },
  { rank: 752, name: 'Steeple of TUNG TUNG SAHUR', pts: 377.36 },
  { rank: 753, name: 'Tower of Ultimate Terrifying Chaos', pts: 377.12 },
  { rank: 754, name: 'Tower of Weakening Anamneses', pts: 376.88 },
  { rank: 755, name: 'Tower of Dismaying Gesticulation', pts: 376.64 },
  { rank: 756, name: 'Tower of Yelling A Whole Lot', pts: 376.4 },
  { rank: 757, name: 'Steeple of Wallhop, Wallhop and Wallhop', pts: 376.16 },
  { rank: 758, name: 'Tower of Crying and Dying: Alternate', pts: 375.92 },
  { rank: 759, name: 'Tower of Divine Wrath', pts: 375.68 },
  { rank: 760, name: 'SUPREME DAKOTA', pts: 375.44 },
  { rank: 761, name: 'Tower of Excruciating Anguish: Unnerfed', pts: 375.21 },
  { rank: 762, name: 'Pillar of Indomitable Encumbrances', pts: 374.97 },
  { rank: 763, name: 'Patrick Pillar', pts: 374.73 },
  { rank: 764, name: 'D.I.G.I Facility', pts: 374.49 },
  { rank: 765, name: 'Tower of Dripping Obstacles', pts: 374.25 },
  { rank: 766, name: 'THE HULTIMATE ULTIMATE GRIDDYVERSE', pts: 374.01 },
  { rank: 767, name: 'Tower of Classiception', pts: 373.77 },
  { rank: 768, name: 'Spire of Confined Spaces', pts: 373.53 },
  { rank: 769, name: 'Tower of Phat Clouds', pts: 373.29 },
  { rank: 770, name: 'Column of Outer Layers', pts: 373.05 },
  { rank: 771, name: 'Tower of Conraderien JToH', pts: 372.81 },
  { rank: 772, name: 'Steeple of Precarious and Antiquated Spelunking', pts: 372.57 },
  { rank: 773, name: 'Tower of The Spiciest Memes 2077', pts: 372.33 },
  { rank: 774, name: 'Tower of Death, Death, Even More Death.', pts: 372.09 },
  { rank: 775, name: 'Tower of Pillar Panic', pts: 371.85 },
  { rank: 776, name: 'Tower of Chaos Mountain', pts: 371.62 },
  { rank: 777, name: 'Tower of Metropolis Downpour', pts: 371.38 },
  { rank: 778, name: 'Tower of Slop Chart', pts: 371.14 },
  { rank: 779, name: 'Tower of Abrasive Playground', pts: 370.9 },
  { rank: 780, name: 'Not Even a Monolith', pts: 370.66 },
  { rank: 781, name: 'Tower of Jukecalla\'s Fury', pts: 370.42 },
  { rank: 782, name: 'Tower of Exquisite Death', pts: 370.18 },
  { rank: 783, name: 'Tower of Thickening', pts: 369.94 },
  { rank: 784, name: 'Citadel of Goku', pts: 369.7 },
  { rank: 785, name: 'Tower of Anarchist Fantasies', pts: 369.46 },
  { rank: 786, name: 'Steeple of Rainy Day', pts: 369.22 },
  { rank: 787, name: 'Edifice of Dark Depths', pts: 368.99 },
  { rank: 788, name: 'Tower of Slope Into Destiny', pts: 368.75 },
  { rank: 789, name: 'Tower of Leaning Interferences', pts: 368.51 },
  { rank: 790, name: 'Edifice of Spherical Demise', pts: 368.27 },
  { rank: 791, name: 'Tower of Silly Wiggle Issues', pts: 368.03 },
  { rank: 792, name: 'Steeple of Central Tribulation', pts: 367.79 },
  { rank: 793, name: 'Steeple of Raw Salmon', pts: 367.55 },
  { rank: 794, name: 'Tower of Fractured Complex', pts: 367.31 },
  { rank: 795, name: 'Tower of A E ER T Y H F R R', pts: 367.07 },
  { rank: 796, name: 'Tower of Scattered Challenges', pts: 366.84 },
  { rank: 797, name: 'Steeple of Xenocritic Parallel', pts: 366.6 },
  { rank: 798, name: 'Steeple of Ljuset', pts: 366.36 },
  { rank: 799, name: 'Tower of Extreme Yelling', pts: 366.12 },
  { rank: 800, name: 'Tower of Creamer Based Coffee', pts: 365.88 },
  { rank: 801, name: 'Tower of Complexity and Volatility', pts: 365.64 },
  { rank: 802, name: 'Steeple of 15 Minutes', pts: 365.4 },
  { rank: 803, name: 'Tower of True Skill: Buff', pts: 365.16 },
  { rank: 804, name: 'Tower of Not Many Days', pts: 364.93 },
  { rank: 805, name: 'Steeple of A Ton of Tears', pts: 364.69 },
  { rank: 806, name: 'Tower of Destructive Phantom', pts: 364.45 },
  { rank: 807, name: 'Tower of THE GRANDE BRAINROT', pts: 364.21 },
  { rank: 808, name: 'Steeple of Electromegentiyot Mehira', pts: 363.97 },
  { rank: 809, name: 'Tower of Two Layered Terror', pts: 363.73 },
  { rank: 810, name: 'Tower of Sempiternal Disquietude', pts: 363.49 },
  { rank: 811, name: 'Tower of Hell and Heaven: Classic', pts: 363.26 },
  { rank: 812, name: 'Tower of Questionable and Gimmicky Gameplay', pts: 363.02 },
  { rank: 813, name: 'Tower of Zip It', pts: 362.78 },
  { rank: 814, name: 'Tower of Killbrick Calamity', pts: 362.54 },
  { rank: 815, name: 'Tower of No Time', pts: 362.3 },
  { rank: 816, name: 'Tower of Specific and Precise Positioning', pts: 362.06 },
  { rank: 817, name: 'Tower of I Am Iceman', pts: 361.83 },
  { rank: 818, name: 'Tower of Troubling Purism', pts: 361.59 },
  { rank: 819, name: 'Tower of Curator\'s Demise', pts: 361.35 },
  { rank: 820, name: 'France Edifice', pts: 361.11 },
  { rank: 821, name: 'Tower of Losing', pts: 360.87 },
  { rank: 822, name: 'Tower of Claustrophobic Anomalies', pts: 360.63 },
  { rank: 823, name: 'Tower of Abandoned Pillars', pts: 360.4 },
  { rank: 824, name: 'Tower of Wierd Sections', pts: 360.16 },
  { rank: 825, name: 'Tower of Hello Tower', pts: 359.92 },
  { rank: 826, name: 'Tower of Horizontal Traction', pts: 359.68 },
  { rank: 827, name: 'Tower of Greenlit Scenery', pts: 359.44 },
  { rank: 828, name: 'Steeple of Seraphic Energy', pts: 359.21 },
  { rank: 829, name: 'Tower of Skill Immersion', pts: 358.97 },
  { rank: 830, name: 'Tower of Painful Poling', pts: 358.73 },
  { rank: 831, name: 'Truss Tower', pts: 358.49 },
  { rank: 832, name: 'Polska Wieża', pts: 358.25 },
  { rank: 833, name: 'Steeple of Purist Anarchy', pts: 358.02 },
  { rank: 834, name: 'Tower of Purification', pts: 357.78 },
  { rank: 835, name: 'Tower of Itetsuku Hoshi', pts: 357.54 },
  { rank: 836, name: '₯ƒʩɲʠʨʦʯ৻ʯʐɠxƴơ', pts: 357.3 },
  { rank: 837, name: 'touch grass', pts: 357.06 },
  { rank: 838, name: 'Tower of Think Is Interesting', pts: 356.83 },
  { rank: 839, name: 'Cylinder of Evil Retribution', pts: 356.59 },
  { rank: 840, name: 'Tower of Forever Broken Tears', pts: 356.35 },
  { rank: 841, name: 'Tower of Rising Foundations', pts: 356.11 },
  { rank: 842, name: 'Tower of Sorrowful Purgatory', pts: 355.87 },
  { rank: 843, name: 'Tower of Cat Meow Soup Car Parking Zone But I Wanna Go Play a Soccer', pts: 355.64 },
  { rank: 844, name: 'Edifice of Nets', pts: 355.4 },
  { rank: 845, name: 'Tower of Ouroboros', pts: 355.16 },
  { rank: 846, name: 'Tower of The Avalanche', pts: 354.92 },
  { rank: 847, name: 'Tower of Prestigious Void', pts: 354.69 },
  { rank: 848, name: 'Tower of Idiotic Ideas', pts: 354.45 },
  { rank: 849, name: 'Tower of Big Disappointment', pts: 354.21 },
  { rank: 850, name: 'Tower of Never Ending Hysteria', pts: 353.97 },
  { rank: 851, name: 'Tower of Kino', pts: 353.73 },
  { rank: 852, name: 'Tower of Raw Hotdog', pts: 353.5 },
  { rank: 853, name: 'Tower of Starblaze', pts: 353.26 },
  { rank: 854, name: 'Tower of Greyscale: Alternate', pts: 353.02 },
  { rank: 855, name: 'Tower of Intergalactic Facilities', pts: 352.78 },
  { rank: 856, name: 'Tower of Kidney Krunching', pts: 352.55 },
  { rank: 857, name: 'Tower of Kaleidoclash', pts: 352.31 },
  { rank: 858, name: 'Tower of Neural Duality', pts: 352.07 },
  { rank: 859, name: 'Tower of Frightening Nightmares', pts: 351.83 },
  { rank: 860, name: 'Tower of Oobat', pts: 351.6 },
  { rank: 861, name: 'SWEDEN TOWER', pts: 351.36 },
  { rank: 862, name: 'Found You Tower: Super Nerf', pts: 351.12 },
  { rank: 863, name: 'Tower of Devious Purism: Nerf', pts: 350.88 },
  { rank: 864, name: 'Steeple of Colorless Precision', pts: 350.65 },
  { rank: 865, name: 'Citadel of Terrifying Beauty', pts: 350.41 },
  { rank: 866, name: 'World\'s Hardest Tower: Classic', pts: 350.17 },
  { rank: 867, name: 'Steeple of Denouement: Alternate', pts: 349.93 },
  { rank: 868, name: 'Escalator To Heaven', pts: 349.7 },
  { rank: 869, name: 'Tower of Blast Power: Classic', pts: 349.46 },
  { rank: 870, name: 'Tower of Painful Remembrance', pts: 349.22 },
  { rank: 871, name: 'Tower of Intricate Precision', pts: 348.99 },
  { rank: 872, name: 'Tower of High Velocity', pts: 348.75 },
  { rank: 873, name: 'Great Citadel of The Drive Towards Boredom\'s Limit', pts: 348.51 },
  { rank: 874, name: 'Unnerfed Huvin ja Hauskanpidon Torni', pts: 348.27 },
  { rank: 875, name: 'Tower of Everlasting Darkness', pts: 348.04 },
  { rank: 876, name: 'Tower of Impossible Movement', pts: 347.8 },
  { rank: 877, name: 'two pints of ice cream', pts: 347.56 },
  { rank: 878, name: 'Tower of Non Flex Wrap', pts: 347.33 },
  { rank: 879, name: 'Tower of Peace Breaker', pts: 347.09 },
  { rank: 880, name: 'Tower of Kreeamy Ohio', pts: 346.85 },
  { rank: 881, name: 'Tower of Mark Tower', pts: 346.61 },
  { rank: 882, name: 'Tower of Lus Abutendi', pts: 346.38 },
  { rank: 883, name: 'Tower of Lunar Expansion', pts: 346.14 },
  { rank: 884, name: 'MOMMY FINGER MOMMY FINGER WHERE ARE YOU', pts: 345.9 },
  { rank: 885, name: 'Citadel of Corrupted Madness', pts: 345.67 },
  { rank: 886, name: 'Tower of Encountering The J', pts: 345.43 },
  { rank: 887, name: 'Citadel of The Eternal Calamity: Super Nerf', pts: 345.19 },
  { rank: 888, name: 'Tower of Xerically Infuriating Calamity', pts: 344.96 },
  { rank: 889, name: 'Tower of Modern Ascension', pts: 344.72 },
  { rank: 890, name: 'Unnerfed Steeple of Toxic of Failure Acid', pts: 344.48 },
  { rank: 891, name: 'Edifice of Thje Mango', pts: 344.25 },
  { rank: 892, name: 'Tower of Mangos In Time', pts: 344.01 },
  { rank: 893, name: 'Tower of THE Pillar', pts: 343.77 },
  { rank: 894, name: 'Tower of Stingy Tartu', pts: 343.54 },
  { rank: 895, name: 'Tower of thej10n Should Beat a Cata', pts: 343.3 },
  { rank: 896, name: 'Steeple of Irrelevant Movement', pts: 343.06 },
  { rank: 897, name: 'Tower of Jittering Hands', pts: 342.83 },
  { rank: 898, name: 'Steeple of Twisted Space Time', pts: 342.59 },
  { rank: 899, name: 'THE ULTIMATE DESTROYER OF LIMITS', pts: 342.35 },
  { rank: 900, name: 'Tower of The Upper Limit', pts: 342.12 },
  { rank: 901, name: 'STEEPLE OF MAYBE A DIFFICULTY CHART WITH WALLHOPS', pts: 341.88 },
  { rank: 902, name: 'Brazil Tower', pts: 341.64 },
  { rank: 903, name: 'Steeple of The Legendary Rock', pts: 341.41 },
  { rank: 904, name: 'Steeple of My Permanent Indecision', pts: 341.17 },
  { rank: 905, name: 'Tower of Thickening Demise', pts: 340.93 },
  { rank: 906, name: 'Tower of Screaming and Yeeling', pts: 340.7 },
  { rank: 907, name: 'Steeple of Consistent Ledge Grabbing', pts: 340.46 },
  { rank: 908, name: 'Steeple of Polynomial-C', pts: 340.22 },
  { rank: 909, name: 'Tower of Fractured Memories', pts: 339.99 },
  { rank: 910, name: 'Citadel of a Direct Approach: B-Side', pts: 339.75 },
  { rank: 911, name: 'Tower of Adversity Tabulation', pts: 339.51 },
  { rank: 912, name: 'Steeple of Vanishing Vengeance', pts: 339.28 },
  { rank: 913, name: 'Tower of Ill Humor', pts: 339.04 },
  { rank: 914, name: 'Tower of Mean Tasks: GBJ Edition', pts: 338.81 },
  { rank: 915, name: 'Citadel of Scream Like AAAAAA', pts: 338.57 },
  { rank: 916, name: 'Tower of STONE Hard Very', pts: 338.33 },
  { rank: 917, name: 'Tower of Stupiduement', pts: 338.1 },
  { rank: 918, name: 'Tower of Wiggly Layers', pts: 337.86 },
  { rank: 919, name: 'Tower of Unfathomable Pain', pts: 337.62 },
  { rank: 920, name: 'Tower of Elongated Runs: Nerf', pts: 337.39 },
  { rank: 921, name: 'Steeple of Vivid Violet Rot', pts: 337.15 },
  { rank: 922, name: 'Citadel of Hopeless Hell', pts: 336.92 },
  { rank: 923, name: 'Tower of Precise and Accurate Jumps', pts: 336.68 },
  { rank: 924, name: 'Obby 8', pts: 336.44 },
  { rank: 925, name: 'Tower of Unraveled Code', pts: 336.21 },
  { rank: 926, name: 'Tower of Going Against Reality', pts: 335.97 },
  { rank: 927, name: 'Tower of Panelling Barricades: Classic', pts: 335.74 },
  { rank: 928, name: 'Tower of Extreme Anxiety', pts: 335.5 },
  { rank: 929, name: 'Tower of Hateful Reflections', pts: 335.26 },
  { rank: 930, name: 'Tower of A Lonely Travel', pts: 335.03 },
  { rank: 931, name: 'Dr Frank Hanchoisses Honarnary PHDs Lair', pts: 334.79 },
  { rank: 932, name: 'Tower of Weird Core: Super Nerf', pts: 334.56 },
  { rank: 933, name: 'Steeple of The World\'s Tightest Timer', pts: 334.32 },
  { rank: 934, name: 'Tower of Austere Designs: Unnerfed', pts: 334.08 },
  { rank: 935, name: 'Giant Tower of Inception', pts: 333.85 },
  { rank: 936, name: 'Fortnite Facility', pts: 333.61 },
  { rank: 937, name: 'Tower of Super Hard', pts: 333.38 },
  { rank: 938, name: 'Tower of Painful Depression', pts: 333.14 },
  { rank: 939, name: 'Tower of Simple Jumps: No Jump', pts: 332.9 },
  { rank: 940, name: 'Tower of Minimal Punishment', pts: 332.67 },
  { rank: 941, name: 'STEEPLE OF GO GOG OG', pts: 332.43 },
  { rank: 942, name: 'Tower of Great Perturbation', pts: 332.2 },
  { rank: 943, name: 'Tower of Externalizing Insanity', pts: 331.96 },
  { rank: 944, name: 'Steeple of Long Pillars', pts: 331.73 },
  { rank: 945, name: 'Tower of Lob Expizz', pts: 331.49 },
  { rank: 946, name: 'Tower of Very Chaotic', pts: 331.25 },
  { rank: 947, name: 'Tower of Infuriating Progression', pts: 331.02 },
  { rank: 948, name: 'Tower of Ruined Feeling', pts: 330.78 },
  { rank: 949, name: 'Tower of Shunning Excursion: Nerf', pts: 330.55 },
  { rank: 950, name: 'Tower of Some Interesting Gameplay', pts: 330.31 },
  { rank: 951, name: 'Tower of Colgate', pts: 330.08 },
  { rank: 952, name: 'Poland Edifice', pts: 329.84 },
  { rank: 953, name: 'Tower of Hollow Reformations: Absolution', pts: 329.61 },
  { rank: 954, name: 'Tower of Perebas CumpleAnos', pts: 329.37 },
  { rank: 955, name: 'Tower of Low Expectations', pts: 329.14 },
  { rank: 956, name: 'Tower of Hollow Victories', pts: 328.9 },
  { rank: 957, name: 'Steeple of Lemon Summer', pts: 328.66 },
  { rank: 958, name: 'Aoharu Tower', pts: 328.43 },
  { rank: 959, name: 'Tower of Palette Annihilation', pts: 328.19 },
  { rank: 960, name: 'Tower of Creature Feature', pts: 327.96 },
  { rank: 961, name: 'Step of Aeterno Dolor', pts: 327.72 },
  { rank: 962, name: 'Tower of Shattered Resolve', pts: 327.49 },
  { rank: 963, name: 'Steeple of Zen Kata', pts: 327.25 },
  { rank: 964, name: 'Tower of Shattered Distress', pts: 327.02 },
  { rank: 965, name: 'Tower of Corrupting Consequences', pts: 326.78 },
  { rank: 966, name: 'Tower of Neon Lights Party', pts: 326.55 },
  { rank: 967, name: 'Sprite Steeple', pts: 326.31 },
  { rank: 968, name: 'Rooms of Difficulty Chart', pts: 326.08 },
  { rank: 969, name: 'Tower of Escaping Lava', pts: 325.84 },
  { rank: 970, name: 'Tower of Excruciating, Demanding Hurdles', pts: 325.61 },
  { rank: 971, name: 'Tower of Pro', pts: 325.37 },
  { rank: 972, name: 'Tower of Strong And Incredible Poop', pts: 325.14 },
  { rank: 973, name: 'Tower of Ruthless Hidden Quintessence', pts: 324.9 },
  { rank: 974, name: 'Stupid Crown Tower', pts: 324.67 },
  { rank: 975, name: 'ZAP\\:XL (Classic) infinity redux II', pts: 324.43 },
  { rank: 976, name: 'Hollow Citadel of Vivid Sections', pts: 324.2 },
  { rank: 977, name: 'Tower of q Möller', pts: 323.96 },
  { rank: 978, name: 'Disco Steeple', pts: 323.73 },
  { rank: 979, name: 'Watering Hose 0.3 - Romanian Struggles', pts: 323.49 },
  { rank: 980, name: 'Big Outside Annihilation Tower', pts: 323.26 },
  { rank: 981, name: 'Tower of Neverending Agony', pts: 323.02 },
  { rank: 982, name: 'Tower of Shatter Heart and Dreams', pts: 322.79 },
  { rank: 983, name: 'DADDY FINGER DADDY FINGER WHERE ARE YOU', pts: 322.55 },
  { rank: 984, name: 'Tower of Champion\'s Road: Nerf', pts: 322.32 },
  { rank: 985, name: 'Tower of Hasty Hurdles', pts: 322.08 },
  { rank: 986, name: 'Hysterical Hexad', pts: 321.85 },
  { rank: 987, name: 'Tower of Carbonell Birthday', pts: 321.61 },
  { rank: 988, name: 'Tower of soon-ending happiness', pts: 321.38 },
  { rank: 989, name: 'Tower of Bacon Lettuce Tomato', pts: 321.14 },
  { rank: 990, name: 'Citadel of Lustrum Mechanica', pts: 320.91 },
  { rank: 991, name: 'Steeple of Terrifying Chaos', pts: 320.68 },
  { rank: 992, name: 'Tower 5', pts: 320.44 },
  { rank: 993, name: 'Tower of Hella Gimmicks', pts: 320.21 },
  { rank: 994, name: 'Tower of Cliffside Madness', pts: 319.97 },
  { rank: 995, name: 'butter tower', pts: 319.74 },
  { rank: 996, name: 'Steeple of Aquamarine', pts: 319.5 },
  { rank: 997, name: 'Tower of Stress: Super Buff', pts: 319.27 },
  { rank: 998, name: 'Tower of Industrial Torment', pts: 319.03 },
  { rank: 999, name: 'Tower of Blind Fate: Super Nerf', pts: 318.8 },
  { rank: 1000, name: 'Vanuatu Edifice', pts: 318.56 },
  { rank: 1001, name: 'Tower of The Avalanche: RT', pts: 318.33 },
  { rank: 1002, name: 'Steeple of Vivid Disturbances', pts: 318.1 },
  { rank: 1003, name: 'Tower of @#1Ω∞', pts: 317.86 },
  { rank: 1004, name: 'Tower of Food Poisoning', pts: 317.63 },
  { rank: 1005, name: 'Tower of Constructed As New', pts: 317.39 },
  { rank: 1006, name: 'Steeple of Obscure Stability', pts: 317.16 },
  { rank: 1007, name: 'Tower of Catastrophic Cataclysm', pts: 316.92 },
  { rank: 1008, name: 'Steeple of I Hate You', pts: 316.69 },
  { rank: 1009, name: 'Tower of Negative Reinforcement', pts: 316.46 },
  { rank: 1010, name: 'Ultra Scary Wallhop Edifice', pts: 316.22 },
  { rank: 1011, name: 'tour de crayon', pts: 315.99 },
  { rank: 1012, name: 'Tower of Furry Jumps', pts: 315.75 },
  { rank: 1013, name: 'Tower of The Night Terror', pts: 315.52 },
  { rank: 1014, name: 'Tower of Unvaried Endurance', pts: 315.29 },
  { rank: 1015, name: 'Tower of Multiple Different Fates', pts: 315.05 },
  { rank: 1016, name: 'Tower of Thinning Layers: Unnerfed', pts: 314.82 },
  { rank: 1017, name: 'Tower of The Third Apple', pts: 314.58 },
  { rank: 1018, name: 'Tower of Inside nor Outside Repeat', pts: 314.35 },
  { rank: 1019, name: 'Tower of Truly Terrible Gameplay and Spikes', pts: 314.11 },
  { rank: 1020, name: 'Tower of Hectic Division', pts: 313.88 },
  { rank: 1021, name: 'Citadel of Vivid Sections', pts: 313.65 },
  { rank: 1022, name: 'Tower²', pts: 313.41 },
  { rank: 1023, name: 'Unnerfed Sakupen Circles', pts: 313.18 },
  { rank: 1024, name: 'Tower of Golden Skies', pts: 312.95 },
  { rank: 1025, name: 'Citadel of Quadruple The Pain', pts: 312.71 },
  { rank: 1026, name: 'Tower of Computer Demolishing', pts: 312.48 },
  { rank: 1027, name: 'World\'s Hardest Tower', pts: 312.24 },
  { rank: 1028, name: 'Tower of Overwhelming Dread', pts: 312.01 },
  { rank: 1029, name: 'Tower of Vermillion Convolutions', pts: 311.78 },
  { rank: 1030, name: 'Tower of Vibrant Solitude', pts: 311.54 },
  { rank: 1031, name: 'Tower of Mayor Humdinger', pts: 311.31 },
  { rank: 1032, name: 'Tower of Frame Destruction', pts: 311.08 },
  { rank: 1033, name: 'Tower of Prolific Gardens: KToN', pts: 310.84 },
  { rank: 1034, name: 'Steeple of Free Real Estate, Egads!', pts: 310.61 },
  { rank: 1035, name: 'Tower of Flagrant Aggravation: Super Nerf', pts: 310.37 },
  { rank: 1036, name: 'Tower of Difficulty Chart: It\\_Near\'s Revamp', pts: 310.14 },
  { rank: 1037, name: 'Tower of Upended Vapor', pts: 309.91 },
  { rank: 1038, name: 'skish5', pts: 309.67 },
  { rank: 1039, name: 'Tower of Forty Five Degrees', pts: 309.44 },
  { rank: 1040, name: 'tower of cold hands: terrifying edition', pts: 309.21 },
  { rank: 1041, name: 'Tower of Astronomically Aimless Annoyances: Unnerfed', pts: 308.97 },
  { rank: 1042, name: 'Tower of Deus Ex Machina', pts: 308.74 },
  { rank: 1043, name: 'Tower of Qwerty Uiop: Super Nerf', pts: 308.51 },
  { rank: 1044, name: 'Tower of Confusion Theory', pts: 308.27 },
  { rank: 1045, name: 'Tower of Bob Never Clear', pts: 308.04 },
  { rank: 1046, name: 'Tower of Rugged Endurance', pts: 307.81 },
  { rank: 1047, name: 'Tower of Factual Expertise', pts: 307.57 },
  { rank: 1048, name: '1 0 0 M Revenge', pts: 307.34 },
  { rank: 1049, name: 'Tower of Untitled Tower', pts: 307.11 },
  { rank: 1050, name: 'Tower of Franchun\'s Lullaby: Classic', pts: 306.87 },
  { rank: 1051, name: 'Steeple of Ultra Rage', pts: 306.64 },
  { rank: 1052, name: 'Tower of Luminescent Tint', pts: 306.41 },
  { rank: 1053, name: 'Tower of Vicious Obstructions', pts: 306.17 },
  { rank: 1054, name: 'Tower of Seeking Extra Enchantments', pts: 305.94 },
  { rank: 1055, name: 'Tower of Increasing Pressure', pts: 305.71 },
  { rank: 1056, name: 'Tower of Ascent to Glory', pts: 305.47 },
  { rank: 1057, name: 'Steeple of Simple Horizons', pts: 305.24 },
  { rank: 1058, name: 'Tower of Hands Flicking', pts: 305.01 },
  { rank: 1059, name: 'Tower of Watering Spiders Challenging You', pts: 304.77 },
  { rank: 1060, name: 'Tower of Prismatic Haze', pts: 304.54 },
  { rank: 1061, name: 'Tower of Augmented Corruption', pts: 304.31 },
  { rank: 1062, name: 'Tower of Eternal Nightmares', pts: 304.08 },
  { rank: 1063, name: 'Tower of Silver', pts: 303.84 },
  { rank: 1064, name: 'Tower of Killbrick Hell', pts: 303.61 },
  { rank: 1065, name: 'Tower of Een Plus Een Gratis Matras Tuberculose', pts: 303.38 },
  { rank: 1066, name: 'Tower of Lament', pts: 303.14 },
  { rank: 1067, name: 'Tower of Fearing The Heights', pts: 302.91 },
  { rank: 1068, name: 'Tower of Unfortunate Conscious Deliberation', pts: 302.68 },
  { rank: 1069, name: 'Tower of Elongated Runs: Zee\'s Nerf', pts: 302.45 },
  { rank: 1070, name: 'Tower of The Flag of Rebellion', pts: 302.21 },
  { rank: 1071, name: 'Tower of David Bazooka', pts: 301.98 },
  { rank: 1072, name: 'SQTETEPELT OF FSIPOLUF§QCVBT5GF9/OQUB /Y9TFUQP V', pts: 301.75 },
  { rank: 1073, name: 'Tower of Crippling Debt', pts: 301.51 },
  { rank: 1074, name: 'Tower of Extra Hard Part', pts: 301.28 },
  { rank: 1075, name: 'Tower of Mass Severe Punishment', pts: 301.05 },
  { rank: 1076, name: 'Steeple of Joon Yorigami', pts: 300.82 },
  { rank: 1077, name: 'Tower of THE FOREBODING WALL', pts: 300.58 },
  { rank: 1078, name: 'Tower of Ridiculously Relentless Rage', pts: 300.35 },
  { rank: 1079, name: 'Luminosity', pts: 300.12 },
  { rank: 1080, name: 'Illusionary Night Tower', pts: 299.89 },
  { rank: 1081, name: 'Tower of Maniacal Obstructions', pts: 299.65 },
  { rank: 1082, name: 'Tower of Ease to Abyss', pts: 299.42 },
  { rank: 1083, name: 'Citadel of Ferocious Heights', pts: 299.19 },
  { rank: 1084, name: 'Citadel of Featherine Augustus Aurora', pts: 298.96 },
  { rank: 1085, name: 'Bernard', pts: 298.72 },
  { rank: 1086, name: 'Tower of Appalling Ramification', pts: 298.49 },
  { rank: 1087, name: 'Marlboro Tower', pts: 298.26 },
  { rank: 1088, name: 'Tower of True Skill: Extreme Difficulty Edition', pts: 298.03 },
  { rank: 1089, name: 'Tower of Mijn Toren', pts: 297.79 },
  { rank: 1090, name: 'Tower of Externalizing Insanity: Difficulty Chart', pts: 297.56 },
  { rank: 1091, name: 'Tower of Pure Skill', pts: 297.33 },
  { rank: 1092, name: 'Tower of Blast Power', pts: 297.1 },
  { rank: 1093, name: 'Tower of Wandering Nostalgia', pts: 296.86 },
  { rank: 1094, name: 'Lietuvos Bokštas', pts: 296.63 },
  { rank: 1095, name: 'Tower of Cardiac Arrest', pts: 296.4 },
  { rank: 1096, name: 'Tower of Difficulty Chart: Accurate Edition', pts: 296.17 },
  { rank: 1097, name: 'Tower of Crying In Your Sleep', pts: 295.94 },
  { rank: 1098, name: 'Tower of Severe Trauma', pts: 295.7 },
  { rank: 1099, name: 'Tower of Parallel Heights', pts: 295.47 },
  { rank: 1100, name: 'Tower of Fee Fi Fo Fum', pts: 295.24 },
  { rank: 1101, name: 'Tower of Cruel Memories', pts: 295.01 },
  { rank: 1102, name: 'Tower of Compromised Fear: Super Nerf', pts: 294.78 },
  { rank: 1103, name: 'Tower of Transcendence', pts: 294.54 },
  { rank: 1104, name: 'Tower of Glitching and Breaking', pts: 294.31 },
  { rank: 1105, name: 'Tower of Amazing Skill', pts: 294.08 },
  { rank: 1106, name: 'Tower of Understanding the Medium', pts: 293.85 },
  { rank: 1107, name: 'Citadel of This Man Buff Man', pts: 293.62 },
  { rank: 1108, name: 'Tower of TOILET Ladder Flicks', pts: 293.38 },
  { rank: 1109, name: 'Tower of Shifting Laminations', pts: 293.15 },
  { rank: 1110, name: 'Tower of Hellish Void', pts: 292.92 },
  { rank: 1111, name: 'Tower of Neon Nightmares', pts: 292.69 },
  { rank: 1112, name: 'Red Green Blue Edifice', pts: 292.46 },
  { rank: 1113, name: 'Leaning Tower of Lire', pts: 292.22 },
  { rank: 1114, name: 'Tower of Akougomai Crossings', pts: 291.99 },
  { rank: 1115, name: 'Citadel of Void', pts: 291.76 },
  { rank: 1116, name: 'Cylinder of Pure Pain', pts: 291.53 },
  { rank: 1117, name: 'Tower of Pure Malarkey: The Perfect Run', pts: 291.3 },
  { rank: 1118, name: 'Tower of Game Mn', pts: 291.07 },
  { rank: 1119, name: 'Steeple of Legalizing Nuclear Bombs', pts: 290.83 },
  { rank: 1120, name: 'Steeple of Shrimp and Shell Shindig', pts: 290.6 },
  { rank: 1121, name: 'Tower of Obdurate Conception', pts: 290.37 },
  { rank: 1122, name: 'Obelisk of Thinning Layers', pts: 290.14 },
  { rank: 1123, name: 'Tower of Raspy Cascades', pts: 289.91 },
  { rank: 1124, name: 'Abstract Collab Steeple', pts: 289.68 },
  { rank: 1125, name: 'Tower of Having a Heart Attack', pts: 289.44 },
  { rank: 1126, name: 'steeple of holybrilliant emoji', pts: 289.21 },
  { rank: 1127, name: 'Tower of Sol Luna', pts: 288.98 },
  { rank: 1128, name: 'Giant Tower of Mind Breaking', pts: 288.75 },
  { rank: 1129, name: 'Tower of Bland Gimmicks', pts: 288.52 },
  { rank: 1130, name: 'Slobelisk of Silver Slopes', pts: 288.29 },
  { rank: 1131, name: 'Tower of Goofy Stickers', pts: 288.06 },
  { rank: 1132, name: 'Tower of Polymer Greg Egg', pts: 287.82 },
  { rank: 1133, name: 'Tower of Painful Memories', pts: 287.59 },
  { rank: 1134, name: 'Tower of Glazing On Purism', pts: 287.36 },
  { rank: 1135, name: 'Tower of Table Flipping: Buff', pts: 287.13 },
  { rank: 1136, name: 'Tower of Excruciating Anguish', pts: 286.9 },
  { rank: 1137, name: 'Tower of Underlying Grief', pts: 286.67 },
  { rank: 1138, name: 'Tower of Wane Wrath', pts: 286.44 },
  { rank: 1139, name: 'Steeple of My Strange Little Existence', pts: 286.21 },
  { rank: 1140, name: 'Denouement Tower', pts: 285.98 },
  { rank: 1141, name: 'Tower of Infuriating Agoraphobia Adventures', pts: 285.74 },
  { rank: 1142, name: 'Tower of Callous Desolation', pts: 285.51 },
  { rank: 1143, name: 'Tower of Manifestation', pts: 285.28 },
  { rank: 1144, name: 'Tower of Uttermost Antagonism', pts: 285.05 },
  { rank: 1145, name: 'Tower of The Dripping Amalgam', pts: 284.82 },
  { rank: 1146, name: 'Target Tower: TC Edition', pts: 284.59 },
  { rank: 1147, name: 'Tower of Variation Into Turmoil', pts: 284.36 },
  { rank: 1148, name: 'Tower of Gaming Expression', pts: 284.13 },
  { rank: 1149, name: 'π265', pts: 283.9 },
  { rank: 1150, name: 'Tower of No Confidence Left', pts: 283.67 },
  { rank: 1151, name: 'Tower of Exuberant Encumbrances', pts: 283.43 },
  { rank: 1152, name: 'Tower of Heavy Remorse', pts: 283.2 },
  { rank: 1153, name: 'Tower of Hope', pts: 282.97 },
  { rank: 1154, name: 'Tower of Cold Hands: Super Buff', pts: 282.74 },
  { rank: 1155, name: 'Tower of Cyan Craze', pts: 282.51 },
  { rank: 1156, name: 'Tower of Technological Procedure', pts: 282.28 },
  { rank: 1157, name: 'Tower of Cricket Cricket 🦗🦗🦗', pts: 282.05 },
  { rank: 1158, name: 'Steeple of Secret Box', pts: 281.82 },
  { rank: 1159, name: 'Tower of Trusst Issues', pts: 281.59 },
  { rank: 1160, name: 'Tower of Looksmaxxing', pts: 281.36 },
  { rank: 1161, name: 'Tower of Tears of Joy', pts: 281.13 },
  { rank: 1162, name: 'Meta Tower', pts: 280.9 },
  { rank: 1163, name: 'Tower of Doltish Ninny Dunce', pts: 280.67 },
  { rank: 1164, name: 'Tower of Deep End Displeasure', pts: 280.44 },
  { rank: 1165, name: 'Edifice of Akidasher Fun', pts: 280.2 },
  { rank: 1166, name: 'Tower of Nocturnal Paradise', pts: 279.97 },
  { rank: 1167, name: 'Tower of Mean Obstacles', pts: 279.74 },
  { rank: 1168, name: 'Tower of The Black Goop', pts: 279.51 },
  { rank: 1169, name: 'Tower of Centigrade', pts: 279.28 },
  { rank: 1170, name: 'Tower of Ascent Into Exile', pts: 279.05 },
  { rank: 1171, name: 'Tower of Skit Vs Oliver', pts: 278.82 },
  { rank: 1172, name: 'Steeple of Humble Time', pts: 278.59 },
  { rank: 1173, name: 'Citadel of Difficulty Chart: Revamp', pts: 278.36 },
  { rank: 1174, name: 'Steeple of Unyielding Obsession', pts: 278.13 },
  { rank: 1175, name: 'Tower of Prolonged Runs', pts: 277.9 },
  { rank: 1176, name: 'Tower of Perpetual Speed Required', pts: 277.67 },
  { rank: 1177, name: 'Tower of Wood Fortress', pts: 277.44 },
  { rank: 1178, name: 'Tower of Cascading Uncertainty', pts: 277.21 },
  { rank: 1179, name: 'Tower of Jolly Layers', pts: 276.98 },
  { rank: 1180, name: 'Tower of Inverted Hope', pts: 276.75 },
  { rank: 1181, name: 'Citadel of Muy Scary', pts: 276.52 },
  { rank: 1182, name: 'Steeple of Trusting Techniques', pts: 276.29 },
  { rank: 1183, name: 'ярик кент стипл', pts: 276.06 },
  { rank: 1184, name: 'Tower of Fine Line', pts: 275.83 },
  { rank: 1185, name: 'Steeple of Nyn☆', pts: 275.6 },
  { rank: 1186, name: 'Tower of Frightening Nightmares: Difficulty Chart', pts: 275.37 },
  { rank: 1187, name: 'Not Even In Ruins', pts: 275.14 },
  { rank: 1188, name: 'Steeple of Green Apple', pts: 274.91 },
  { rank: 1189, name: 'Tower of Nyctophobia Confrontation', pts: 274.68 },
  { rank: 1190, name: 'Tower of Virulent Basilisk', pts: 274.45 },
  { rank: 1191, name: 'Great Citadel of Ring 3: The Perfect Run', pts: 274.22 },
  { rank: 1192, name: 'Tower of U N', pts: 273.99 },
  { rank: 1193, name: 'Tower of Pervasive Torment', pts: 273.76 },
  { rank: 1194, name: 'Tower of Dry Hands', pts: 273.53 },
  { rank: 1195, name: 'Tower of Divine Mastery', pts: 273.3 },
  { rank: 1196, name: 'Tower of Lowest Act', pts: 273.07 },
  { rank: 1197, name: 'Citadel of The All-Seeing', pts: 272.84 },
  { rank: 1198, name: 'Tower of Stupidio Namio', pts: 272.61 },
  { rank: 1199, name: 'Citadel of Utter Confusion: Alternate', pts: 272.38 },
  { rank: 1200, name: 'Tower of Familiar Encounters', pts: 272.15 },
  { rank: 1201, name: 'Tower of Horridly Atrocious Architecture', pts: 271.92 },
  { rank: 1202, name: 'Tower of Room Destruction', pts: 271.69 },
  { rank: 1203, name: 'Tower of Wet Socks', pts: 271.46 },
  { rank: 1204, name: 'Tower of Infuriating Supplement', pts: 271.23 },
  { rank: 1205, name: 'Tower of Demented Oddities', pts: 271.01 },
  { rank: 1206, name: 'Tower of Quarrelsome Quarters', pts: 270.78 },
  { rank: 1207, name: 'Tower of Googoo Gaagaa', pts: 270.55 },
  { rank: 1208, name: 'Tower of Pure Dopamine', pts: 270.32 },
  { rank: 1209, name: 'Tower of Strategic Mechanics', pts: 270.09 },
  { rank: 1210, name: 'Tower of Inverse Difficulty Chart', pts: 269.86 },
  { rank: 1211, name: 'Tower of Minimalist\'s Delight', pts: 269.63 },
  { rank: 1212, name: 'Tower of Runes', pts: 269.4 },
  { rank: 1213, name: 'Tower of Quickly Increasing Anger', pts: 269.17 },
  { rank: 1214, name: 'Tower of Keyboard Yeeting: Super Buff', pts: 268.94 },
  { rank: 1215, name: 'Tower of Intense Increasing Pressure', pts: 268.71 },
  { rank: 1216, name: 'Tower of Spatial Awareness: Super Nerf', pts: 268.48 },
  { rank: 1217, name: 'Tower of Skill and Patience', pts: 268.25 },
  { rank: 1218, name: 'Tower of Taking The Complete Micky', pts: 268.02 },
  { rank: 1219, name: '100 Thousand Trials', pts: 267.79 },
  { rank: 1220, name: 'Steeple of Rampant Hourly Fabrication', pts: 267.57 },
  { rank: 1221, name: 'Tower of Grand Demise', pts: 267.34 },
  { rank: 1222, name: 'Citadel of Condescendingly Convulsive Climbing', pts: 267.11 },
  { rank: 1223, name: 'Tower of Wicked Fortress', pts: 266.88 },
  { rank: 1224, name: 'Tower of Shattered Penality', pts: 266.65 },
  { rank: 1225, name: 'Tower of Quaint Quadricity', pts: 266.42 },
  { rank: 1226, name: 'Tower of Last Destination', pts: 266.19 },
  { rank: 1227, name: 'Tower of The Wall Gameplay', pts: 265.96 },
  { rank: 1228, name: 'Tower of Fast Paced Descent', pts: 265.73 },
  { rank: 1229, name: 'Steeple of Heart Failure', pts: 265.5 },
  { rank: 1230, name: 'Citadel of Icy Blizzards', pts: 265.28 },
  { rank: 1231, name: 'Tower of Ceaseless Shizzling', pts: 265.05 },
  { rank: 1232, name: 'Tower of Converged Agitation', pts: 264.82 },
  { rank: 1233, name: 'Edifice of This Edifice Has Nothing To Do With Undead Corporation', pts: 264.59 },
  { rank: 1234, name: 'Steeple of Growing Despair', pts: 264.36 },
  { rank: 1235, name: 'Tower of Short Purist Lover', pts: 264.13 },
  { rank: 1236, name: 'Citadel of Frightening and Confusing Trials', pts: 263.9 },
  { rank: 1237, name: 'Tower of Long Lasting Leukophobia: Revamp', pts: 263.67 },
  { rank: 1238, name: 'Tower of Hop on Pop', pts: 263.45 },
  { rank: 1239, name: 'Even A Tower', pts: 263.22 },
  { rank: 1240, name: 'Tower of Terrifying Beauty', pts: 262.99 },
  { rank: 1241, name: 'SEPOL OF GAAA ZELPLUS VS BO VS X Y Z', pts: 262.76 },
  { rank: 1242, name: 'Steeple of Quick Kebab', pts: 262.53 },
  { rank: 1243, name: 'Tower of Extreme Devious Eternity', pts: 262.3 },
  { rank: 1244, name: 'Tower of Quemeful Quoin', pts: 262.07 },
  { rank: 1245, name: 'Tower of Smiley\'s Hotel', pts: 261.85 },
  { rank: 1246, name: 'Tower of Subspatial Convergence', pts: 261.62 },
  { rank: 1247, name: 'Tower of The Detrimental Dexterity', pts: 261.39 },
  { rank: 1248, name: 'Tower of Abysmal Wrath', pts: 261.16 },
  { rank: 1249, name: 'Steeple of Glitched Memories', pts: 260.93 },
  { rank: 1250, name: 'Tower of Expanding Layers: Alternate 2', pts: 260.7 },
  { rank: 1251, name: 'Tower of Dividing and Confusing Frames', pts: 260.48 },
  { rank: 1252, name: 'Steeple of Sculk', pts: 260.25 },
  { rank: 1253, name: 'Tower of The Jump Junkyard', pts: 260.02 },
  { rank: 1254, name: 'Untitled Tower', pts: 259.79 },
  { rank: 1255, name: 'Tower of Kindest Pineapple', pts: 259.56 },
  { rank: 1256, name: 'Tower of Uncanny Unpleasantness', pts: 259.33 },
  { rank: 1257, name: 'Tower of Frantic Voyages', pts: 259.11 },
  { rank: 1258, name: 'Tower of Tech n Wraps', pts: 258.88 },
  { rank: 1259, name: 'Tower of Torturous Suffering', pts: 258.65 },
  { rank: 1260, name: 'Steeple of Decaying Depths', pts: 258.42 },
  { rank: 1261, name: 'Tower of The Giant Peas', pts: 258.19 },
  { rank: 1262, name: 'Tower of Agonizing Spinners', pts: 257.97 },
  { rank: 1263, name: 'Tower of Suffering Outside', pts: 257.74 },
  { rank: 1264, name: 'Tower of Hopeless Hell', pts: 257.51 },
  { rank: 1265, name: 'tower of w roblox parts', pts: 257.28 },
  { rank: 1266, name: 'Tower of Unknown Shadows', pts: 257.05 },
  { rank: 1267, name: 'Steeple of Screams From The Void', pts: 256.83 },
  { rank: 1268, name: 'Tower of Difficulty Chud', pts: 256.6 },
  { rank: 1269, name: 'Tower of Spoiled Milk', pts: 256.37 },
  { rank: 1270, name: 'Tower of Kakorraphiaphobia', pts: 256.14 },
  { rank: 1271, name: 'Tower of Bon Voyage', pts: 255.91 },
  { rank: 1272, name: 'Tower of Instant Regret', pts: 255.69 },
  { rank: 1273, name: 'Giant Steeple of Obrulaqualis', pts: 255.46 },
  { rank: 1274, name: 'Tower of Unfair Punishment', pts: 255.23 },
  { rank: 1275, name: 'Citadel of Difficulty Chart', pts: 255.0 },
  { rank: 1276, name: 'Citadel of Mouse Bamming Oblivion', pts: 254.78 },
  { rank: 1277, name: 'Tower of Empty Obstruction', pts: 254.55 },
  { rank: 1278, name: 'Steeple of Snowstorm', pts: 254.32 },
  { rank: 1279, name: 'Steeple of Gilly Basilly', pts: 254.09 },
  { rank: 1280, name: 'Tower of Difficulty Chart 2.63', pts: 253.87 },
  { rank: 1281, name: 'Tower of Blueish Monolith', pts: 253.64 },
  { rank: 1282, name: 'Tower of Pestiferous Line', pts: 253.41 },
  { rank: 1283, name: 'Tower of Billy Bob', pts: 253.18 },
  { rank: 1284, name: 'Jumbo Tower: Super Nerf', pts: 252.96 },
  { rank: 1285, name: 'Tower of Inerihl Katahv Qainrey', pts: 252.73 },
  { rank: 1286, name: 'Tower of Dangerous Pillar Adventuring', pts: 252.5 },
  { rank: 1287, name: 'tower of true skill: btool buff', pts: 252.27 },
  { rank: 1288, name: 'Tower of Dreamstate', pts: 252.05 },
  { rank: 1289, name: 'Tower of Horrific Tribulation', pts: 251.82 },
  { rank: 1290, name: 'Tower of Cramping on The Couch', pts: 251.59 },
  { rank: 1291, name: 'Thanos Obelisk', pts: 251.36 },
  { rank: 1292, name: 'Tower of Recurring Agony', pts: 251.14 },
  { rank: 1293, name: 'Steeple of Hope and Delight', pts: 250.91 },
  { rank: 1294, name: 'Edifice of Disky Nitrite', pts: 250.68 },
  { rank: 1295, name: 'Tower of Cold Tears', pts: 250.46 },
  { rank: 1296, name: 'Uber Hard Tower / Tower of The Dawg', pts: 250.23 },
  { rank: 1297, name: 'Tower of Pink Neon Bricks', pts: 250.0 },
  { rank: 1298, name: 'Tower of Quadruple The Pain', pts: 249.77 },
  { rank: 1299, name: 'Tower of Achromatic Nihility', pts: 249.55 },
  { rank: 1300, name: 'Tower of Trouble Sleeping', pts: 249.32 },
  { rank: 1301, name: 'Tower of Truss Hell', pts: 249.09 },
  { rank: 1302, name: 'Tower of Legia Warszawa', pts: 248.87 },
  { rank: 1303, name: 'Tower of Forget Me Not', pts: 248.64 },
  { rank: 1304, name: 'Tower of Popus Gl6bus', pts: 248.41 },
  { rank: 1305, name: 'Tower of Cluttered Cash Catastrophe', pts: 248.19 },
  { rank: 1306, name: 'Tower of g Möller', pts: 247.96 },
  { rank: 1307, name: 'Steeple of The Wall\'s Wrath', pts: 247.73 },
  { rank: 1308, name: 'Tower of Stereo Madness', pts: 247.51 },
  { rank: 1309, name: 'Tower of Big Risks', pts: 247.28 },
  { rank: 1310, name: 'Tower of Merciless Treatment', pts: 247.05 },
  { rank: 1311, name: 'Tower of Unusual Cacophony', pts: 246.82 },
  { rank: 1312, name: 'Tower of Going Crazy', pts: 246.6 },
  { rank: 1313, name: 'Edifice of Super Cool and Epic Gameplay', pts: 246.37 },
  { rank: 1314, name: 'Steeple of Kocmoc But I Got Tired And Added Filler W PRC', pts: 246.14 },
  { rank: 1315, name: 'Tower of Feel The Electric', pts: 245.92 },
  { rank: 1316, name: 'Tower of Fatal Endeavours', pts: 245.69 },
  { rank: 1317, name: 'Steeple of Thinning Mucus', pts: 245.47 },
  { rank: 1318, name: 'Tower of 2 AM', pts: 245.24 },
  { rank: 1319, name: 'Tower of Constant Color Fusion', pts: 245.01 },
  { rank: 1320, name: 'Tower of An Iron Will', pts: 244.79 },
  { rank: 1321, name: 'Tower of Pure Torment', pts: 244.56 },
  { rank: 1322, name: 'Tower of Radio Vibe', pts: 244.33 },
  { rank: 1323, name: 'Original Tower of Dark and Creepy', pts: 244.11 },
  { rank: 1324, name: 'Dimension Steeple', pts: 243.88 },
  { rank: 1325, name: 'Alalal Steeple', pts: 243.65 },
  { rank: 1326, name: 'Tower of Falling Doom', pts: 243.43 },
  { rank: 1327, name: 'Tower of Ultima Exitium', pts: 243.2 },
  { rank: 1328, name: 'Tower of Devious Emptiness', pts: 242.97 },
  { rank: 1329, name: 'Tower of Cruel Punishment: NToH Nerf', pts: 242.75 },
  { rank: 1330, name: 'Tower of Occurring Ramifications', pts: 242.52 },
  { rank: 1331, name: 'Steeple of Faces in Variation', pts: 242.3 },
  { rank: 1332, name: 'Edifice of One Jam One Jar', pts: 242.07 },
  { rank: 1333, name: 'Edifice of Dirty Doctor Pepper', pts: 241.84 },
  { rank: 1334, name: 'Great Citadel of Walking Across The Sahara', pts: 241.62 },
  { rank: 1335, name: 'Steeple of Sparks Will Fly', pts: 241.39 },
  { rank: 1336, name: 'Tower of Blue Zenith', pts: 241.17 },
  { rank: 1337, name: 'Tower of Wolf\'s Roarness', pts: 240.94 },
  { rank: 1338, name: 'Tower of Exponential Difficulty', pts: 240.71 },
  { rank: 1339, name: 'Tower of D D D D D D D D Drop The Bass', pts: 240.49 },
  { rank: 1340, name: 'Citadel of Goku V4', pts: 240.26 },
  { rank: 1341, name: 'Tower Exists, Tower Obsolete', pts: 240.04 },
  { rank: 1342, name: 'of Joca Monday 4 Void', pts: 239.81 },
  { rank: 1343, name: 'Tower of Haery Hanchovies', pts: 239.58 },
  { rank: 1344, name: 'Steeple of Tombs & Torture', pts: 239.36 },
  { rank: 1345, name: 'Tower of Deceiving Failure', pts: 239.13 },
  { rank: 1346, name: 'Steeple of Fractured Memorabiljia', pts: 238.91 },
  { rank: 1347, name: 'Steeple of Expecting Something Better: Buff', pts: 238.68 },
  { rank: 1348, name: 'Cylinder of Irregular Movement', pts: 238.46 },
  { rank: 1349, name: 'Citadel of Curved Ascent', pts: 238.23 },
  { rank: 1350, name: 'Thor Tower', pts: 238.0 },
  { rank: 1351, name: 'Tower of Festive Affairs', pts: 237.78 },
  { rank: 1352, name: 'Tower of Incepted Difficulty Chart', pts: 237.55 },
  { rank: 1353, name: 'Tower of Killbrick Hell: Classic', pts: 237.33 },
  { rank: 1354, name: 'Tower of Difficulty Chart: Purist', pts: 237.1 },
  { rank: 1355, name: 'Tower of Blissful Unconsciousness', pts: 236.88 },
  { rank: 1356, name: 'Tower of Raw, Unfiltered Skill', pts: 236.65 },
  { rank: 1357, name: 'Tower of Jolly Situations', pts: 236.43 },
  { rank: 1358, name: 'fifteen', pts: 236.2 },
  { rank: 1359, name: 'Tower of Zany Zigzags', pts: 235.97 },
  { rank: 1360, name: 'Tower of Pure Torment: Classic', pts: 235.75 },
  { rank: 1361, name: 'Steeple of Cube Tower', pts: 235.52 },
  { rank: 1362, name: 'Tower of Zooming By', pts: 235.3 },
  { rank: 1363, name: 'Tower of Stigmatism', pts: 235.07 },
  { rank: 1364, name: 'Tower of Paradise: Super Nerf', pts: 234.85 },
  { rank: 1365, name: 'Tower of Astronomically Aimless Annoyances', pts: 234.62 },
  { rank: 1366, name: 'Tower of The Doom Wall', pts: 234.4 },
  { rank: 1367, name: 'Tower of Mutilation', pts: 234.17 },
  { rank: 1368, name: 'Tower of Claustrophobic Fates', pts: 233.95 },
  { rank: 1369, name: 'Tower of Creamzicle Chart', pts: 233.72 },
  { rank: 1370, name: 'Tower of Kesulitan Mendaki', pts: 233.5 },
  { rank: 1371, name: 'Tower of Ten Floors Challenge: True Mode', pts: 233.27 },
  { rank: 1372, name: 'Tower of Difficulty Chart: Difficulty Chart', pts: 233.05 },
  { rank: 1373, name: 'Steeple of Corruption', pts: 232.82 },
  { rank: 1374, name: 'Tower of Mental Breakdown', pts: 232.6 },
  { rank: 1375, name: 'Tower of Extreme Anguish', pts: 232.37 },
  { rank: 1376, name: 'Citadel of Broken Tables', pts: 232.15 },
  { rank: 1377, name: 'Tower of Brimstone Flames', pts: 231.92 },
  { rank: 1378, name: 'Room of Ghoulish Necromancy', pts: 231.7 },
  { rank: 1379, name: 'Tower of Volition', pts: 231.47 },
  { rank: 1380, name: 'Tower of Nightmarish Dreams', pts: 231.25 },
  { rank: 1381, name: 'Tower of Super Ultimate', pts: 231.02 },
  { rank: 1382, name: 'Steeple of Death and Despair', pts: 230.8 },
  { rank: 1383, name: 'Citadel of Glitching and Healing: The Perfect Run', pts: 230.57 },
  { rank: 1384, name: 'Tower of Under The Limit', pts: 230.35 },
  { rank: 1385, name: 'Edifice of Flicking and Clicking', pts: 230.12 },
  { rank: 1386, name: 'π323', pts: 229.9 },
  { rank: 1387, name: 'Tower of Wacky, Symmetrical Confinements', pts: 229.68 },
  { rank: 1388, name: 'Tower of Rain on My World: Ascension', pts: 229.45 },
  { rank: 1389, name: 'Tower of Wackiness', pts: 229.23 },
  { rank: 1390, name: 'Tower of Circuits and Lasers', pts: 229.0 },
  { rank: 1391, name: 'Citadel of Deterioration', pts: 228.78 },
  { rank: 1392, name: 'Fort of Baffling Anomalies', pts: 228.55 },
  { rank: 1393, name: 'Tower of Corrupted Nightmares Nightmares Scary', pts: 228.33 },
  { rank: 1394, name: 'Tower of Artificial Joy', pts: 228.1 },
  { rank: 1395, name: 'Tower of Fumbling Frenzy', pts: 227.88 },
  { rank: 1396, name: 'Tower of Malnourished Vindication', pts: 227.66 },
  { rank: 1397, name: 'Tower of Umbratic Complexity: Secret Ending', pts: 227.43 },
  { rank: 1398, name: 'Tower of Pig Rabbit Crab Thinning Layers', pts: 227.21 },
  { rank: 1399, name: 'π314', pts: 226.98 },
  { rank: 1400, name: 'Tower Infinity', pts: 226.76 },
  { rank: 1401, name: 'Tower of No More Teleporters', pts: 226.53 },
  { rank: 1402, name: 'Steeple of Exponential Difficulty', pts: 226.31 },
  { rank: 1403, name: 'Tower of Classical Torment', pts: 226.09 },
  { rank: 1404, name: 'Citadel of Skyward Ascension', pts: 225.86 },
  { rank: 1405, name: 'Citadel of Trauma Stickout', pts: 225.64 },
  { rank: 1406, name: 'Tower of Tabasco Sauce', pts: 225.41 },
  { rank: 1407, name: 'Tower of The Lumen Sage', pts: 225.19 },
  { rank: 1408, name: 'Windows Tower', pts: 224.97 },
  { rank: 1409, name: 'Tower of Paint Thinner', pts: 224.74 },
  { rank: 1410, name: 'Tower of Increasing Heart Rates', pts: 224.52 },
  { rank: 1411, name: 'Tower of Senseless Internal Pain', pts: 224.29 },
  { rank: 1412, name: 'Steeple of While Discussing Pneumonoultramicroscopicsilicovolcanoconiosis, The Hippopotomonstrosesquipedaliophobic Scholar Accidentally Mispronounced Supercalifragilisticexpialidocious During An Electroencephalographically Monitored Honorificabilitudinitatibus Symposium On Thyroparathyroidectomized Microorganisms.', pts: 224.07 },
  { rank: 1413, name: 'Tower of Vigorous Xany', pts: 223.85 },
  { rank: 1414, name: 'Tower of Ceiling Quiz', pts: 223.62 },
  { rank: 1415, name: 'Pumpkin Steeple', pts: 223.4 },
  { rank: 1416, name: 'Tower of Virulent Quiescence', pts: 223.18 },
  { rank: 1417, name: 'Tower of Austere Designs', pts: 222.95 },
  { rank: 1418, name: 'Tower of Panelling Barricades', pts: 222.73 },
  { rank: 1419, name: 'DEVIOUS TOWER 1', pts: 222.5 },
  { rank: 1420, name: 'Tower of Shunning Excursion: Super Nerf', pts: 222.28 },
  { rank: 1421, name: 'Tower of Doing The', pts: 222.06 },
  { rank: 1422, name: 'Tower of Hollow Augmentations', pts: 221.83 },
  { rank: 1423, name: 'Steeple of Untitled Griddy', pts: 221.61 },
  { rank: 1424, name: 'Tower of Gameplay Test', pts: 221.39 },
  { rank: 1425, name: 'Kuwait Edifice', pts: 221.16 },
  { rank: 1426, name: 'Steeple of Miss Pink Elf', pts: 220.94 },
  { rank: 1427, name: 'Citadel of Quirky Inconveniences', pts: 220.72 },
  { rank: 1428, name: 'Tower of Impossible Movement: Difficulty Chart', pts: 220.49 },
  { rank: 1429, name: 'Tower of Octophobia', pts: 220.27 },
  { rank: 1430, name: 'Tower of Bitter Melancholy', pts: 220.05 },
  { rank: 1431, name: 'Steeple of Surging Trove', pts: 219.82 },
  { rank: 1432, name: 'Steeple of Agra: Extreme', pts: 219.6 },
  { rank: 1433, name: 'Tower of josh', pts: 219.38 },
  { rank: 1434, name: 'Impossible Obby Tower', pts: 219.15 },
  { rank: 1435, name: 'Tower of The Average TC Empty Tower', pts: 218.93 },
  { rank: 1436, name: 'a mini tower that is slightly bigger, and has 54+61 floors of nibbling on purple apples', pts: 218.71 },
  { rank: 1437, name: 'Tower of Vindictive Maneuvers: Nerf', pts: 218.48 },
  { rank: 1438, name: 'Tower of Real Lies', pts: 218.26 },
  { rank: 1439, name: 'Tower of Perpendicular Layers', pts: 218.04 },
  { rank: 1440, name: 'Tower of Raw Skill Required', pts: 217.81 },
  { rank: 1441, name: 'Tower of Softlock Heaven', pts: 217.59 },
  { rank: 1442, name: 'Tower of Kratic', pts: 217.37 },
  { rank: 1443, name: 'Citadel of Utter Confusion', pts: 217.15 },
  { rank: 1444, name: 'Tower of TSCR Exclusive', pts: 216.92 },
  { rank: 1445, name: 'Tower of Noobs Road', pts: 216.7 },
  { rank: 1446, name: 'Tower of Darkest Nebulae', pts: 216.48 },
  { rank: 1447, name: 'Tower of Space Resizing', pts: 216.25 },
  { rank: 1448, name: 'Tower of Hecc and Back', pts: 216.03 },
  { rank: 1449, name: 'Citadel of Infinity Gauntlet', pts: 215.81 },
  { rank: 1450, name: 'Mali Edifice', pts: 215.59 },
  { rank: 1451, name: 'Steeple of Zero Reinforced Frameworks', pts: 215.36 },
  { rank: 1452, name: 'Great Citadel of Laptop Splitting', pts: 215.14 },
  { rank: 1453, name: 'Tower of Complex and Idiotic Gameplay', pts: 214.92 },
  { rank: 1454, name: 'Tower 1', pts: 214.69 },
  { rank: 1455, name: 'Tower of Perpendicular Angle', pts: 214.47 },
  { rank: 1456, name: 'Tower of My Uncanny World', pts: 214.25 },
  { rank: 1457, name: 'Tower of Dwindling Veneer', pts: 214.03 },
  { rank: 1458, name: 'Salt Pillar of Increasification Demotivizationizer', pts: 213.8 },
  { rank: 1459, name: 'Dakotan Steeple', pts: 213.58 },
  { rank: 1460, name: 'Tower of Revolving Peril', pts: 213.36 },
  { rank: 1461, name: 'Maybe a Soul Crushing', pts: 213.14 },
  { rank: 1462, name: 'Not Thanos Tower', pts: 212.91 },
  { rank: 1463, name: 'Steeple of Languorousness', pts: 212.69 },
  { rank: 1464, name: 'Tower of Irritating Structures', pts: 212.47 },
  { rank: 1465, name: 'Tower of Clean Glass', pts: 212.25 },
  { rank: 1466, name: 'Tower of Baleful Impedes', pts: 212.03 },
  { rank: 1467, name: 'Edifice of Wigglecore Without Wiggles and Zeronium', pts: 211.8 },
  { rank: 1468, name: 'Tower of Repeated Frame Action', pts: 211.58 },
  { rank: 1469, name: 'Tower of Yuxian Kongjian', pts: 211.36 },
  { rank: 1470, name: 'Steeple of Bridging The Gap', pts: 211.14 },
  { rank: 1471, name: 'Tower of Chromatic Chaos', pts: 210.91 },
  { rank: 1472, name: 'Tower of Super Sweet Scaling', pts: 210.69 },
  { rank: 1473, name: 'Steeple of Celestial Serenity', pts: 210.47 },
  { rank: 1474, name: 'Tower of the Planets', pts: 210.25 },
  { rank: 1475, name: 'Baldi Citadel', pts: 210.03 },
  { rank: 1476, name: 'Buffed Tower of Analysis Explorer', pts: 209.8 },
  { rank: 1477, name: 'Tower of Laying Thinners', pts: 209.58 },
  { rank: 1478, name: 'Tower of Yap Yap Yap', pts: 209.36 },
  { rank: 1479, name: 'Tower of The Perfect Run', pts: 209.14 },
  { rank: 1480, name: 'Tower of Impossible Expectations: Buff', pts: 208.92 },
  { rank: 1481, name: 'Tower of Void Storm', pts: 208.7 },
  { rank: 1482, name: 'Tower of Bloodthirsty Kenos', pts: 208.47 },
  { rank: 1483, name: 'America Ediface', pts: 208.25 },
  { rank: 1484, name: 'Tower of Orang Hamsterball', pts: 208.03 },
  { rank: 1485, name: 'Tower of Little Shlant', pts: 207.81 },
  { rank: 1486, name: 'Steeple of Insanity: ZHT', pts: 207.59 },
  { rank: 1487, name: 'Steeple of Regular Shmegular', pts: 207.37 },
  { rank: 1488, name: 'Tower of Extreme Demon Escalation', pts: 207.14 },
  { rank: 1489, name: 'Steeple of Blood Clot: Deathless', pts: 206.92 },
  { rank: 1490, name: 'Tower of Just Do It', pts: 206.7 },
  { rank: 1491, name: 'Tower of Bodacious Blinding Blue Purism', pts: 206.48 },
  { rank: 1492, name: 'Steeple of Muscle Atrophy', pts: 206.26 },
  { rank: 1493, name: 'Tower of Obscene Outside Chaos', pts: 206.04 },
  { rank: 1494, name: 'Tower of Elite Mechanics', pts: 205.82 },
  { rank: 1495, name: 'Tower of Frameless Works', pts: 205.59 },
  { rank: 1496, name: 'Tower of Luminescent Windows', pts: 205.37 },
  { rank: 1497, name: 'tower of supercalifragilistic expialidocious', pts: 205.15 },
  { rank: 1498, name: 'Steeple of Expecting Something Better: Least Parts', pts: 204.93 },
  { rank: 1499, name: 'Steeple of No Safety Available', pts: 204.71 },
  { rank: 1500, name: 'Tower of GBJ', pts: 204.49 },
  { rank: 1501, name: 'Fort of Twisted Torsion', pts: 204.27 },
  { rank: 1502, name: 'Tower of Glu Glu Glu', pts: 204.05 },
  { rank: 1503, name: 'Steeple of Obeliscolychny', pts: 203.82 },
  { rank: 1504, name: 'Tower of Sideways Strides', pts: 203.6 },
  { rank: 1505, name: 'Tower of The DiCaprio Story', pts: 203.38 },
  { rank: 1506, name: 'Tower of Zilly Xany', pts: 203.16 },
  { rank: 1507, name: 'Tower of Geometrical Purgation', pts: 202.94 },
  { rank: 1508, name: 'Chinese House Expansion Tips', pts: 202.72 },
  { rank: 1509, name: 'Tower of A Simple Time: Least Parts', pts: 202.5 },
  { rank: 1510, name: 'Tower of Mass Severe Punishment: Revamp', pts: 202.28 },
  { rank: 1511, name: 'Tower of Menacing Jank', pts: 202.06 },
  { rank: 1512, name: 'Steeple of Against All Authority', pts: 201.84 },
  { rank: 1513, name: 'Tower of Elongated Runs: NToH Nerf', pts: 201.61 },
  { rank: 1514, name: 'Giant Steeple of Towering Pillars', pts: 201.39 },
  { rank: 1515, name: 'Tower of Gateway Protocol', pts: 201.17 },
  { rank: 1516, name: 'Tower of Ruptured Division', pts: 200.95 },
  { rank: 1517, name: 'Tower of Scoliosis', pts: 200.73 },
  { rank: 1518, name: 'Citadel of Triangle Difficulty Chart', pts: 200.51 },
  { rank: 1519, name: 'Raybe A Tower', pts: 200.29 },
  { rank: 1520, name: 'Tower of Goofy Antics', pts: 200.07 },
  { rank: 1521, name: 'Tower of Was Bored: Place Version', pts: 199.85 },
  { rank: 1522, name: 'Tower of Systematically Malfunctioned', pts: 199.63 },
  { rank: 1523, name: '⅏⅏⅏⅏⅏⅏⅏⅏⅏ edifice', pts: 199.41 },
  { rank: 1524, name: 'Tower of Rushing and Dashing', pts: 199.19 },
  { rank: 1525, name: 'Tower of Questionable Structural Integrity', pts: 198.97 },
  { rank: 1526, name: 'Citadel of Extreme Confusion', pts: 198.75 },
  { rank: 1527, name: 'Tower of Extremely Troublesome Obstacle Hell', pts: 198.53 },
  { rank: 1528, name: 'Enlightened Pathways', pts: 198.31 },
  { rank: 1529, name: 'Steeple of Denouement', pts: 198.09 },
  { rank: 1530, name: 'The Challenge Tower', pts: 197.87 },
  { rank: 1531, name: 'Tower of Yonder Wisterias', pts: 197.65 },
  { rank: 1532, name: 'B̉illy', pts: 197.43 },
  { rank: 1533, name: 'Steeple of Mentally Dying', pts: 197.21 },
  { rank: 1534, name: 'Tower of Breaking the Core', pts: 196.99 },
  { rank: 1535, name: 'Tower of Contraposition', pts: 196.77 },
  { rank: 1536, name: 'Steeple of Resourceful Itinerary', pts: 196.55 },
  { rank: 1537, name: 'Tower of Ascending Luminosity', pts: 196.33 },
  { rank: 1538, name: 'Steeple of Jank Smoothie', pts: 196.11 },
  { rank: 1539, name: 'Steeple of True Insanity', pts: 195.89 },
  { rank: 1540, name: 'Tower of Hijacked Voltage: Hard Mode', pts: 195.67 },
  { rank: 1541, name: 'Tower of Quiescent Excruciations', pts: 195.45 },
  { rank: 1542, name: 'Tower of Leap Impairment', pts: 195.23 },
  { rank: 1543, name: 'Tower of Jayingeration Ultimates 12', pts: 195.01 },
  { rank: 1544, name: 'Tower of Painful Purism', pts: 194.79 },
  { rank: 1545, name: 'Tower of Spatial Ruins', pts: 194.57 },
  { rank: 1546, name: 'Tower of Both Sides', pts: 194.35 },
  { rank: 1547, name: 'Tower of Arduous Agility', pts: 194.13 },
  { rank: 1548, name: 'Tower of Linear Slop', pts: 193.91 },
  { rank: 1549, name: 'Pillar of Button Abundance', pts: 193.69 },
  { rank: 1550, name: 'Tower of 40 Obstacles To Victory', pts: 193.47 },
  { rank: 1551, name: 'Denouement Tower: Classic', pts: 193.25 },
  { rank: 1552, name: 'THE Tower of Hell', pts: 193.03 },
  { rank: 1553, name: 'Mini Obelisk of Mini Obelisk', pts: 192.81 },
  { rank: 1554, name: 'Tower of Short French Fries', pts: 192.59 },
  { rank: 1555, name: 'Steeple of A Down', pts: 192.37 },
  { rank: 1556, name: 'Tower of Chocolate Milk', pts: 192.15 },
  { rank: 1557, name: 'Tower of Kyoi Tekina', pts: 191.93 },
  { rank: 1558, name: 'Tower of Astral Eclipse', pts: 191.71 },
  { rank: 1559, name: 'Tower of Reckless Noble Construction', pts: 191.49 },
  { rank: 1560, name: 'Conservative Steeple', pts: 191.27 },
  { rank: 1561, name: 'Tower of Crawling Literally Apples Unreally Stressing The Really Obbyful Phobias Hitting Our Best Intense Apples', pts: 191.05 },
  { rank: 1562, name: 'Tower of Obskurer Einfallsreichtum', pts: 190.84 },
  { rank: 1563, name: 'Tower of Thinning Slop', pts: 190.62 },
  { rank: 1564, name: 'Citadel of Varying Difficulties: Classic', pts: 190.4 },
  { rank: 1565, name: 'Citadel of Accepting Defeat', pts: 190.18 },
  { rank: 1566, name: 'Tower of Confronting The Z', pts: 189.96 },
  { rank: 1567, name: 'Tower of Rage: Buff', pts: 189.74 },
  { rank: 1568, name: 'Tower of Frightening and Confusing Trials', pts: 189.52 },
  { rank: 1569, name: 'Tower of Phonk Is Incredible', pts: 189.3 },
  { rank: 1570, name: 'Tower of Ultra Forgiveness', pts: 189.08 },
  { rank: 1571, name: 'Steeple of Runes', pts: 188.86 },
  { rank: 1572, name: 'Edifice of Frightening Obligations', pts: 188.65 },
  { rank: 1573, name: 'Tower of Joobly Chart: Classic', pts: 188.43 },
  { rank: 1574, name: 'Tower of Confusingly Curved Pole', pts: 188.21 },
  { rank: 1575, name: 'Tower of Contemporary Simplicity', pts: 187.99 },
  { rank: 1576, name: 'Tower of Northern Winds', pts: 187.77 },
  { rank: 1577, name: 'Tower of Race To The Crown', pts: 187.55 },
  { rank: 1578, name: 'Steeple of Vicious Obstructions', pts: 187.33 },
  { rank: 1579, name: 'Tower of One Line', pts: 187.11 },
  { rank: 1580, name: 'Tower of Reverse Difficulty Chart', pts: 186.9 },
  { rank: 1581, name: 'Steeple of Extremity', pts: 186.68 },
  { rank: 1582, name: 'Citadel of The Hippopotamus Wikipedia', pts: 186.46 },
  { rank: 1583, name: 'Tower of The Walls Have Eyes', pts: 186.24 },
  { rank: 1584, name: 'Tower of Sitting Down', pts: 186.02 },
  { rank: 1585, name: 'Tower of Greedy Spare', pts: 185.8 },
  { rank: 1586, name: 'Tower of lildly lacky londers', pts: 185.58 },
  { rank: 1587, name: 'Tower of George Washington Never Clear: Freedom Mode', pts: 185.37 },
  { rank: 1588, name: 'Tower of Btools Difficulty Chart Obby', pts: 185.15 },
  { rank: 1589, name: 'Tower of Crazy Agony Real Treacherous Insanity', pts: 184.93 },
  { rank: 1590, name: 'Tower of The Homefinder: Super Nerf', pts: 184.71 },
  { rank: 1591, name: 'Tower of Heaven', pts: 184.49 },
  { rank: 1592, name: 'Citadel of Whimsical Ways', pts: 184.27 },
  { rank: 1593, name: 'Citadel of Mind Breaking', pts: 184.06 },
  { rank: 1594, name: 'Tower of Tee Hee Time', pts: 183.84 },
  { rank: 1595, name: 'Tower of Potbelly Pop', pts: 183.62 },
  { rank: 1596, name: 'Steeple of \'); DROP TABLE Towers;--', pts: 183.4 },
  { rank: 1597, name: 'Tower of Agonizing Structures', pts: 183.18 },
  { rank: 1598, name: 'Tower of Horrendous Nuisances', pts: 182.97 },
  { rank: 1599, name: 'Tower of Challenging Obstacle Anarchy: Zee\'s Nerf', pts: 182.75 },
  { rank: 1600, name: 'Tower of Shattered Dreams: Buff', pts: 182.53 },
  { rank: 1601, name: 'Citadel of Impending Risk', pts: 182.31 },
  { rank: 1602, name: 'Tower of Spinning Nightmare', pts: 182.09 },
  { rank: 1603, name: 'Tower of Spiral Obligations', pts: 181.88 },
  { rank: 1604, name: 'Citadel of Infinity Gauntlet: Alternate', pts: 181.66 },
  { rank: 1605, name: 'Tower of Difficulty Tower X', pts: 181.44 },
  { rank: 1606, name: 'Tower of Pain, Agitation and Frustration', pts: 181.22 },
  { rank: 1607, name: 'Tower of Elongated Runs: Insane', pts: 181.01 },
  { rank: 1608, name: 'Tower of BIG IGB GIB FAIL AILF ILFA LFAI: Unnerfed', pts: 180.79 },
  { rank: 1609, name: 'Steeple of Painful Fails', pts: 180.57 },
  { rank: 1610, name: 'Tower of Cruel Punishment: Super Nerf', pts: 180.35 },
  { rank: 1611, name: 'Tower of Conveyor Alignment Visible', pts: 180.14 },
  { rank: 1612, name: 'Tower of Round N\' Round', pts: 179.92 },
  { rank: 1613, name: 'Citadel of Difficulty Chart: Classic RToA', pts: 179.7 },
  { rank: 1614, name: 'Tower of Selling Your Soul', pts: 179.48 },
  { rank: 1615, name: 'Tower of Elaborate Solutions', pts: 179.27 },
  { rank: 1616, name: 'Steeple of Hazardous Xesturgy', pts: 179.05 },
  { rank: 1617, name: 'Tower of Curved Ascent: Requiem', pts: 178.83 },
  { rank: 1618, name: 'Hello, My Name is Steeple', pts: 178.61 },
  { rank: 1619, name: 'Edifice of Toothpaste', pts: 178.4 },
  { rank: 1620, name: 'Steeple of Insanity', pts: 178.18 },
  { rank: 1621, name: 'Great Citadel of Ring 2', pts: 177.96 },
  { rank: 1622, name: 'Tower of Linked Insanity', pts: 177.74 },
  { rank: 1623, name: 'Thanos Citadel', pts: 177.53 },
  { rank: 1624, name: 'Tower of Humpty Dummy', pts: 177.31 },
  { rank: 1625, name: 'Great Citadel of Lesbian', pts: 177.09 },
  { rank: 1626, name: 'Tower of Velleity Skills', pts: 176.88 },
  { rank: 1627, name: 'Tower of Sunflower Seeds', pts: 176.66 },
  { rank: 1628, name: 'Tower of Descent Into Depths', pts: 176.44 },
  { rank: 1629, name: 'Citadel of Forever Resetting', pts: 176.23 },
  { rank: 1630, name: 'Steeple of Irritating Unbalance', pts: 176.01 },
  { rank: 1631, name: 'Tower of Arctic Hollows', pts: 175.79 },
  { rank: 1632, name: 'Oops! All Floors!', pts: 175.57 },
  { rank: 1633, name: 'Tower of Glitching and Healing: Difficulty Chart', pts: 175.36 },
  { rank: 1634, name: 'Tower of Cerulean Jeopardy', pts: 175.14 },
  { rank: 1635, name: 'Tower Tower Tower Tower', pts: 174.92 },
  { rank: 1636, name: 'Tower of Claustrophobia', pts: 174.71 },
  { rank: 1637, name: 'Tower of Spiritual Rise: Super Nerf', pts: 174.49 },
  { rank: 1638, name: 'Tower of Thinning Layers: Modern Revamp: Unnerfed', pts: 174.27 },
  { rank: 1639, name: 'Tower of The Tutorial', pts: 174.06 },
  { rank: 1640, name: 'Tower of Distorted Nightmares', pts: 173.84 },
  { rank: 1641, name: 'Tower of Soul Crushing Escalation', pts: 173.63 },
  { rank: 1642, name: 'Tower of Korean Style', pts: 173.41 },
  { rank: 1643, name: 'Tower of Pure Evil', pts: 173.19 },
  { rank: 1644, name: 'Ikea Tower: Super Nerf', pts: 172.98 },
  { rank: 1645, name: 'Tower Point Five', pts: 172.76 },
  { rank: 1646, name: 'Tower of Augmenting Purism', pts: 172.54 },
  { rank: 1647, name: 'Mesmerizer Tower: Super Nerf', pts: 172.33 },
  { rank: 1648, name: 'Tower of Quirky Structuring', pts: 172.11 },
  { rank: 1649, name: 'Citadel of Unsettling Heights', pts: 171.89 },
  { rank: 1650, name: 'Not Even Fun', pts: 171.68 },
  { rank: 1651, name: 'Tower of Really Very Artificial Inspiration', pts: 171.46 },
  { rank: 1652, name: 'Tower of Spin to Win', pts: 171.25 },
  { rank: 1653, name: 'Tower of Saliva³', pts: 171.03 },
  { rank: 1654, name: 'Steeple of Broken Hearts', pts: 170.81 },
  { rank: 1655, name: 'Tower of Practice Skill', pts: 170.6 },
  { rank: 1656, name: 'Tower of Eles Tar Jus', pts: 170.38 },
  { rank: 1657, name: 'Citadel of Insanity', pts: 170.17 },
  { rank: 1658, name: 'Tower of Nonsense', pts: 169.95 },
  { rank: 1659, name: 'Tower of Malefic Nuisances: Super Nerf', pts: 169.73 },
  { rank: 1660, name: 'Tower of Rough Endoplasmic Reticulum', pts: 169.52 },
  { rank: 1661, name: 'Tower of Big Wave Beach', pts: 169.3 },
  { rank: 1662, name: 'Steeple of 16 Minutes', pts: 169.09 },
  { rank: 1663, name: 'purism', pts: 168.87 },
  { rank: 1664, name: 'The Lesser Centurial: nerfde', pts: 168.66 },
  { rank: 1665, name: 'Steeple of Oblivious Obligations', pts: 168.44 },
  { rank: 1666, name: 'Tower of Annoyingly Simple Trials: Difficulty Chart', pts: 168.22 },
  { rank: 1667, name: 'Tower of Mirrored Hecc: Super Buff', pts: 168.01 },
  { rank: 1668, name: 'Tower of Seal The Deal', pts: 167.79 },
  { rank: 1669, name: 'Tower of Wildly Spreaded Dangers', pts: 167.58 },
  { rank: 1670, name: 'Citadel of High Sky Rise', pts: 167.36 },
  { rank: 1671, name: 'Unnerfed Steeple of Final One', pts: 167.15 },
  { rank: 1672, name: 'Tower of Acu Nuance', pts: 166.93 },
  { rank: 1673, name: 'Obelisk of Impossible Expectations: The Perfect Run', pts: 166.72 },
  { rank: 1674, name: 'Tower of Code Red', pts: 166.5 },
  { rank: 1675, name: 'Tower of Tedious and Stodgy', pts: 166.29 },
  { rank: 1676, name: 'Tower of Descent Into Exile: Super Nerf', pts: 166.07 },
  { rank: 1677, name: 'Cylinder of Irritating Frontiers', pts: 165.85 },
  { rank: 1678, name: 'Steeple of Heavenly Dreams', pts: 165.64 },
  { rank: 1679, name: 'Tower of Deep Darkness: Buff', pts: 165.42 },
  { rank: 1680, name: 'Tower of Elysium: Super Buff', pts: 165.21 },
  { rank: 1681, name: 'Tower of Industrial Revolution', pts: 164.99 },
  { rank: 1682, name: 't', pts: 164.78 },
  { rank: 1683, name: 'Tower of Sour Grapes', pts: 164.56 },
  { rank: 1684, name: 'Tower of Empty Inside', pts: 164.35 },
  { rank: 1685, name: 'Radio Tower: Super Nerf', pts: 164.13 },
  { rank: 1686, name: 'crusty sock', pts: 163.92 },
  { rank: 1687, name: 'Tower of Futile Retribution', pts: 163.7 },
  { rank: 1688, name: 'Steeple of Fervent Festivities', pts: 163.49 },
  { rank: 1689, name: 'Tower of Questions: Buffed', pts: 163.28 },
  { rank: 1690, name: 'Tower of Swift Annihilation', pts: 163.06 },
  { rank: 1691, name: 'Tower of Purist Obscurity', pts: 162.85 },
  { rank: 1692, name: 'Tower of Combustion', pts: 162.63 },
  { rank: 1693, name: 'Tower of Climbing Wall', pts: 162.42 },
  { rank: 1694, name: 'Tower of Blissful Ignorance', pts: 162.2 },
  { rank: 1695, name: 'Edifice of The Journey To Find The One Piece', pts: 161.99 },
  { rank: 1696, name: 'Tower of Aligned Deliration', pts: 161.77 },
  { rank: 1697, name: 'Tower and Peanuts Tower and Prunes', pts: 161.56 },
  { rank: 1698, name: 'Steeple of Herniated Disks', pts: 161.34 },
  { rank: 1699, name: 'Tower of Neon Orange', pts: 161.13 },
  { rank: 1700, name: 'Earl Sweatshirt\'s Forest', pts: 160.92 },
  { rank: 1701, name: 'Tower of Abstract Galaxies', pts: 160.7 },
  { rank: 1702, name: 'Thanos Tower: Classic', pts: 160.49 },
  { rank: 1703, name: 'Tower of Otherworldly Expertise: Super Nerf', pts: 160.27 },
  { rank: 1704, name: 'Spire of Water Bottle', pts: 160.06 },
  { rank: 1705, name: 'Tower of Reverse Layers', pts: 159.84 },
  { rank: 1706, name: 'Tower of Mom', pts: 159.63 },
  { rank: 1707, name: 'Tower of Shifting Sizes', pts: 159.42 },
  { rank: 1708, name: 'Tower of Matcha Labubu', pts: 159.2 },
  { rank: 1709, name: 'Tower of Terrifying Sorcery', pts: 158.99 },
  { rank: 1710, name: 'Tower of Cancer', pts: 158.77 },
  { rank: 1711, name: 'Tower of Scaling Simple Intensity', pts: 158.56 },
  { rank: 1712, name: 'Tower of Deadly Pitfalls', pts: 158.35 },
  { rank: 1713, name: 'Tower of Pure Skill: Classic', pts: 158.13 },
  { rank: 1714, name: 'Tower of Claustrophobic Nightmares', pts: 157.92 },
  { rank: 1715, name: 'Tower of Scattered Rooms', pts: 157.7 },
  { rank: 1716, name: 'Crossfire Steeple', pts: 157.49 },
  { rank: 1717, name: 'Tower of Warranted Obstructions', pts: 157.28 },
  { rank: 1718, name: 'Power Tower', pts: 157.06 },
  { rank: 1719, name: 'Tower of Seeking Unused Techniques', pts: 156.85 },
  { rank: 1720, name: 'Tower of Rain on My World', pts: 156.64 },
  { rank: 1721, name: 'Tower of Virulent Sojourn: Super Nerf', pts: 156.42 },
  { rank: 1722, name: 'c', pts: 156.21 },
  { rank: 1723, name: 'Steeple of Trusscapes', pts: 156.0 },
  { rank: 1724, name: 'Tower of Why So Serious?', pts: 155.78 },
  { rank: 1725, name: 'Tower of Oceanic Views', pts: 155.57 },
  { rank: 1726, name: 'Steeple of Idiosyncratic Ruins', pts: 155.36 },
  { rank: 1727, name: 'Steeple of Lodge', pts: 155.14 },
  { rank: 1728, name: 'Tower of Delicate Quiescence', pts: 154.93 },
  { rank: 1729, name: 'Tower of Two To One', pts: 154.72 },
  { rank: 1730, name: 'Tower of Polychromatic Zero', pts: 154.5 },
  { rank: 1731, name: 'Tower of Jump Incapacity', pts: 154.29 },
  { rank: 1732, name: 'Steeple of Suspension', pts: 154.08 },
  { rank: 1733, name: 'Steeple of Super Cutesy Climb', pts: 153.86 },
  { rank: 1734, name: 'Tower of Pure Skill: solsrngguy97', pts: 153.65 },
  { rank: 1735, name: 'Tower of Elongated Runs: Myth\'s Nerf', pts: 153.44 },
  { rank: 1736, name: 'Tower of Minimal Part Usage', pts: 153.22 },
  { rank: 1737, name: 'Tower of Prompt Purism', pts: 153.01 },
  { rank: 1738, name: 'Tower of Thje', pts: 152.8 },
  { rank: 1739, name: 'Tower of Ultimate Painful: Classic', pts: 152.58 },
  { rank: 1740, name: 'Tower of Rushed Collaborative Efforts', pts: 152.37 },
  { rank: 1741, name: 'Tower of Never Winning', pts: 152.16 },
  { rank: 1742, name: 'Tower of One Hour Difficulty Chart', pts: 151.95 },
  { rank: 1743, name: 'Tower of #####', pts: 151.73 },
  { rank: 1744, name: 'Tower of Pure Unfun', pts: 151.52 },
  { rank: 1745, name: 'Tower of Bitter Sweet Suffering', pts: 151.31 },
  { rank: 1746, name: 'Sushi Steeple', pts: 151.1 },
  { rank: 1747, name: 'Tower of Chandler Softwood', pts: 150.88 },
  { rank: 1748, name: 'Tower of Pure Suffering', pts: 150.67 },
  { rank: 1749, name: 'Tower of The Fog Is Coming', pts: 150.46 },
  { rank: 1750, name: 'Steeple of Gears Locked Up Because It\'s Cold', pts: 150.25 },
  { rank: 1751, name: 'Steeple of The Fracture', pts: 150.03 },
  { rank: 1752, name: 'Tower of Purist Hell', pts: 149.82 },
  { rank: 1753, name: 'Steeple of An Ascension', pts: 149.61 },
  { rank: 1754, name: 'Tower of Awesome Stuff', pts: 149.4 },
  { rank: 1755, name: 'Tower of \\:SteamHappy:', pts: 149.18 },
  { rank: 1756, name: 'Tower of Quality', pts: 148.97 },
  { rank: 1757, name: 'Tower of Vicious Punishment', pts: 148.76 },
  { rank: 1758, name: 'Tower of Luscious Greenery', pts: 148.55 },
  { rank: 1759, name: 'Citadel of Papaya Journey', pts: 148.34 },
  { rank: 1760, name: 'Tower of Accepting Defeat', pts: 148.12 },
  { rank: 1761, name: 'Tower of Kančia Išorėje', pts: 147.91 },
  { rank: 1762, name: 'Tower of Un Ca: Super Nerf', pts: 147.7 },
  { rank: 1763, name: 'vved\\_12', pts: 147.49 },
  { rank: 1764, name: 'Steeple of Suspiciously Large Right Arm: Super Nerf', pts: 147.28 },
  { rank: 1765, name: 'Steeple of Zehn Kekse', pts: 147.06 },
  { rank: 1766, name: 'Tower of Thinning Sanity', pts: 146.85 },
  { rank: 1767, name: 'Edifice of Technological Retrospective', pts: 146.64 },
  { rank: 1768, name: 'Tower of Inevitable Failure: Difficulty Chart', pts: 146.43 },
  { rank: 1769, name: 'Tower of Underlying Grief: Nerfdate', pts: 146.22 },
  { rank: 1770, name: 'Tower of Onerous Purification', pts: 146.01 },
  { rank: 1771, name: 'Tower of Vicious Interludes', pts: 145.79 },
  { rank: 1772, name: 'Tower of Skill Test', pts: 145.58 },
  { rank: 1773, name: 'Tower of Intense Situations', pts: 145.37 },
  { rank: 1774, name: 'America Tower', pts: 145.16 },
  { rank: 1775, name: 'Tower of Greatening Compaction: The Perfect Run', pts: 144.95 },
  { rank: 1776, name: 'Tower of Bursting Veins', pts: 144.74 },
  { rank: 1777, name: 'Tower of The Greenish Ascent', pts: 144.53 },
  { rank: 1778, name: 'Steeple of Truss Difficulty Chart', pts: 144.31 },
  { rank: 1779, name: 'Tower of Neverending Madness', pts: 144.1 },
  { rank: 1780, name: 'Tower of Scarred, Infernal Calamity', pts: 143.89 },
  { rank: 1781, name: 'Tower of The Corner Ascension', pts: 143.68 },
  { rank: 1782, name: 'Tower of Pits and Death', pts: 143.47 },
  { rank: 1783, name: 'Tower of Unending Bamboozles', pts: 143.26 },
  { rank: 1784, name: 'Tower of Back and Forth Maneuvers', pts: 143.05 },
  { rank: 1785, name: 'Tower of Thje Baseline', pts: 142.84 },
  { rank: 1786, name: 'Steeple of Aspiration', pts: 142.62 },
  { rank: 1787, name: 'Citadel of Difficulty Chart: Classic', pts: 142.41 },
  { rank: 1788, name: 'Steeple of Broccoli', pts: 142.2 },
  { rank: 1789, name: 'Tower of Sat On The Toe', pts: 141.99 },
  { rank: 1790, name: 'Tower of Nice Tasks', pts: 141.78 },
  { rank: 1791, name: 'collabidel', pts: 141.57 },
  { rank: 1792, name: 'Nacre of Plum Chewing', pts: 141.36 },
  { rank: 1793, name: 'Tower of Die Kurve', pts: 141.15 },
  { rank: 1794, name: 'Column of Anemic Pandemonium', pts: 140.94 },
  { rank: 1795, name: 'Tower of Plaque Etiquette', pts: 140.73 },
  { rank: 1796, name: 'Tower of Performing Hideous Exercises', pts: 140.52 },
  { rank: 1797, name: 'Tower of Killjoys: Super Buff', pts: 140.31 },
  { rank: 1798, name: 'Tower of Abandonment', pts: 140.1 },
  { rank: 1799, name: 'Tower of Au Revoir, Sunset', pts: 139.89 },
  { rank: 1800, name: 'Tower of Narrowing Levels', pts: 139.68 },
  { rank: 1801, name: 'popsicle', pts: 139.46 },
  { rank: 1802, name: 'Tower of Abstract Duality', pts: 139.25 },
  { rank: 1803, name: 'Tower of Impossibility', pts: 139.04 },
  { rank: 1804, name: 'Tower of Awfulnis', pts: 138.83 },
  { rank: 1805, name: 'Tower of Treacherous Parkour', pts: 138.62 },
  { rank: 1806, name: 'Tower of annoyingox Never Clear', pts: 138.41 },
  { rank: 1807, name: 'Tower of Eye of Tranquil Tempest', pts: 138.2 },
  { rank: 1808, name: 'Tower of Rheumatoid Arthritis', pts: 137.99 },
  { rank: 1809, name: 'Tower of Destructive Uprise', pts: 137.78 },
  { rank: 1810, name: 'Tower of Twenty Nineteen', pts: 137.57 },
  { rank: 1811, name: 'Tower of Perplexity Tabulation', pts: 137.36 },
  { rank: 1812, name: 'Tower of Eternal Purple', pts: 137.15 },
  { rank: 1813, name: 'Tower of Extremely Empty Entire', pts: 136.94 },
  { rank: 1814, name: 'tomo pi palisa suli', pts: 136.73 },
  { rank: 1815, name: 'Tower of Modern Art', pts: 136.52 },
  { rank: 1816, name: 'Tower of XMas Ascension', pts: 136.31 },
  { rank: 1817, name: 'Tower of Established Grievances', pts: 136.1 },
  { rank: 1818, name: 'Tower of Rotten Burger', pts: 135.89 },
  { rank: 1819, name: 'Obelisk of Peril', pts: 135.69 },
  { rank: 1820, name: 'Steeple of Wandering Willow', pts: 135.48 },
  { rank: 1821, name: 'Edifice of Frame Switch', pts: 135.27 },
  { rank: 1822, name: 'Miguel O\' Towa', pts: 135.06 },
  { rank: 1823, name: 'Patch Edifice', pts: 134.85 },
  { rank: 1824, name: 'Tower of Decayed Silo', pts: 134.64 },
  { rank: 1825, name: 'Tower of Death Conglomerate', pts: 134.43 },
  { rank: 1826, name: 'Tower of Linonophobia: Super Buff', pts: 134.22 },
  { rank: 1827, name: 'Tower of Witnessing The Q', pts: 134.01 },
  { rank: 1828, name: 'Tower of Vast Scarcity', pts: 133.8 },
  { rank: 1829, name: 'Tower of Aesthetic Urbanization', pts: 133.59 },
  { rank: 1830, name: 'Tower of Movin\' Right Along', pts: 133.38 },
  { rank: 1831, name: 'Tower of Carpal Tunnels', pts: 133.17 },
  { rank: 1832, name: 'Steeple of Greatful Memories', pts: 132.96 },
  { rank: 1833, name: 'Tower of I Like Infernos', pts: 132.76 },
  { rank: 1834, name: 'Steeple of Celestial Fade', pts: 132.55 },
  { rank: 1835, name: 'Tower of Needed Dexterity', pts: 132.34 },
  { rank: 1836, name: 'Tower of Elegant Purism', pts: 132.13 },
  { rank: 1837, name: 'Tower of Colon 3', pts: 131.92 },
  { rank: 1838, name: 'Tower of Minimum Wage', pts: 131.71 },
  { rank: 1839, name: 'Tower of Hollow Reformations', pts: 131.5 },
  { rank: 1840, name: 'Tower of Icy Blizzards', pts: 131.29 },
  { rank: 1841, name: 'Tower of Slowly Giving Up', pts: 131.08 },
  { rank: 1842, name: 'Mastery of Tanuki Half Stud', pts: 130.88 },
  { rank: 1843, name: 'Tower of Astral Fusion: Unnerfed', pts: 130.67 },
  { rank: 1844, name: 'Steeple of Dying Inside', pts: 130.46 },
  { rank: 1845, name: 'Tower of Mild Destruction', pts: 130.25 },
  { rank: 1846, name: 'Tower of Big Wave Beach: Old', pts: 130.04 },
  { rank: 1847, name: 'Tower of Scintillating Microscale', pts: 129.83 },
  { rank: 1848, name: 'nineteen characters', pts: 129.63 },
  { rank: 1849, name: 'Tower of Desperation', pts: 129.42 },
  { rank: 1850, name: 'Tower of Brain Damage', pts: 129.21 },
  { rank: 1851, name: 'Tower of Unforgiving Obstacles', pts: 129.0 },
  { rank: 1852, name: 'Tower of Outlined Outsides', pts: 128.79 },
  { rank: 1853, name: 'Tower of Nonsensical Slope Trekking', pts: 128.58 },
  { rank: 1854, name: 'Tower of Undeify', pts: 128.38 },
  { rank: 1855, name: 'Tower of Cataclysmic Layers: Super Nerf', pts: 128.17 },
  { rank: 1856, name: 'Citadel of Thinning Layers', pts: 127.96 },
  { rank: 1857, name: 'Steeple of Truss Issues', pts: 127.75 },
  { rank: 1858, name: 'Tower of Small Window of Opportunity', pts: 127.54 },
  { rank: 1859, name: 'Steeple of Pillaring Fusion', pts: 127.34 },
  { rank: 1860, name: 'Tower of Deviating Levels', pts: 127.13 },
  { rank: 1861, name: 'Tower of Tower One', pts: 126.92 },
  { rank: 1862, name: 'Tower of Help Me, Please', pts: 126.71 },
  { rank: 1863, name: 'Tower of Bad Purism', pts: 126.51 },
  { rank: 1864, name: 'Steeple of Head Hitter Hell', pts: 126.3 },
  { rank: 1865, name: 'Tower of Curved Madness', pts: 126.09 },
  { rank: 1866, name: 'Tower of Increasing Paroxysm', pts: 125.88 },
  { rank: 1867, name: 'S.T.O.N.E Facility: Super Nerf', pts: 125.67 },
  { rank: 1868, name: 'Tower of Ultimate Painful', pts: 125.47 },
  { rank: 1869, name: 'Steeple of Kirill and Arseniu are Twins', pts: 125.26 },
  { rank: 1870, name: 'Dark Steeple', pts: 125.05 },
  { rank: 1871, name: 'Stunning Tower of Fantasy: Hard Mode', pts: 124.85 },
  { rank: 1872, name: 'Tower of Pillaring Heights', pts: 124.64 },
  { rank: 1873, name: 'Tower of Pushin o\' Plenty', pts: 124.43 },
  { rank: 1874, name: 'Tower of Extremely Secluding Emptiness', pts: 124.22 },
  { rank: 1875, name: 'Tower of Jpeg Jaffa Caked Carti', pts: 124.02 },
  { rank: 1876, name: 'Tower of Enraging Advancement', pts: 123.81 },
  { rank: 1877, name: 'Tower of Slipping Through Reality', pts: 123.6 },
  { rank: 1878, name: 'Citadel of Greenery', pts: 123.4 },
  { rank: 1879, name: 'Tower of Ruined Rotated Platforms', pts: 123.19 },
  { rank: 1880, name: 'Steeple of Mat Recycling', pts: 122.98 },
  { rank: 1881, name: 'Tower of Random Thoughts', pts: 122.77 },
  { rank: 1882, name: 'Tower of 20 Obstacles To Victory', pts: 122.57 },
  { rank: 1883, name: 'Steeple of Aurora Skies', pts: 122.36 },
  { rank: 1884, name: 'Tower of Lonesome Sorrow', pts: 122.15 },
  { rank: 1885, name: 'Paul\'s Mayhem', pts: 121.95 },
  { rank: 1886, name: 'Tower of Unfortunate Outcomes', pts: 121.74 },
  { rank: 1887, name: 'Tower of Silly String', pts: 121.53 },
  { rank: 1888, name: 'Tower of Bruh Moments', pts: 121.33 },
  { rank: 1889, name: 'Tower of Hellish Rouge', pts: 121.12 },
  { rank: 1890, name: 'Tower of Thinning Trauma', pts: 120.91 },
  { rank: 1891, name: 'Citadel of Safety Equals False', pts: 120.71 },
  { rank: 1892, name: 'Doubtably a Wonderful Greatness', pts: 120.5 },
  { rank: 1893, name: 'Tower of System Solarize', pts: 120.3 },
  { rank: 1894, name: 'Edifice of You\'re Ou\'re U\'re Re E Good Ood Od D', pts: 120.09 },
  { rank: 1895, name: 'Tower of Crimson Synthesize', pts: 119.88 },
  { rank: 1896, name: 'Tower of Viridescent Severity', pts: 119.68 },
  { rank: 1897, name: 'Tower of Hopeless Defeat', pts: 119.47 },
  { rank: 1898, name: 'Tower of I Don\'t Know', pts: 119.26 },
  { rank: 1899, name: 'Tower of Just Hard Gameplay', pts: 119.06 },
  { rank: 1900, name: 'Tower of Confusion', pts: 118.85 },
  { rank: 1901, name: 'Tower of Abrasive Ascent', pts: 118.65 },
  { rank: 1902, name: 'Tower of Pig Rabbit Crab True Skill', pts: 118.44 },
  { rank: 1903, name: 'Citadel of Double Trouble: Alternate', pts: 118.23 },
  { rank: 1904, name: 'Gengetsu Tower', pts: 118.03 },
  { rank: 1905, name: 'Tower of Calvary Venturing', pts: 117.82 },
  { rank: 1906, name: 'Tower of Ascent From Hellfire', pts: 117.62 },
  { rank: 1907, name: 'Steeple of Surmounting', pts: 117.41 },
  { rank: 1908, name: 'Tower of Thinning Layers: Difficulty Chart MToDC', pts: 117.21 },
  { rank: 1909, name: 'Problematic Steeple', pts: 117.0 },
  { rank: 1910, name: 'Steeple of Fateful Gloominess', pts: 116.8 },
  { rank: 1911, name: 'Steeple of Cortical Granules', pts: 116.59 },
  { rank: 1912, name: 'Tower of Thin Mints: Super Nerf', pts: 116.38 },
  { rank: 1913, name: 'Obelisk of Wacky Strategy', pts: 116.18 },
  { rank: 1914, name: 'Tower of Contrasting Themes', pts: 115.97 },
  { rank: 1915, name: 'Steeple of Fearing Down', pts: 115.77 },
  { rank: 1916, name: 'Tower of Going Crazy: Original', pts: 115.56 },
  { rank: 1917, name: 'Tower of Thinning Confusion', pts: 115.36 },
  { rank: 1918, name: 'Tower of Mustard Bag', pts: 115.15 },
  { rank: 1919, name: 'Daniel\'s Tower of Hecc', pts: 114.95 },
  { rank: 1920, name: 'Tower of Voidless Maelstrom', pts: 114.74 },
  { rank: 1921, name: 'Tower of Vivid Sections', pts: 114.54 },
  { rank: 1922, name: 'Tower of Funny Dog', pts: 114.33 },
  { rank: 1923, name: 'Tower of Minimal Obstacles', pts: 114.13 },
  { rank: 1924, name: 'Tower of Raging Ronalds Red Revenge', pts: 113.92 },
  { rank: 1925, name: 'tower of idk what name', pts: 113.72 },
  { rank: 1926, name: 'Tower of Cosmic Radiance', pts: 113.51 },
  { rank: 1927, name: 'Fort of Negligence', pts: 113.31 },
  { rank: 1928, name: 'Tower of Short N\' Bitter', pts: 113.1 },
  { rank: 1929, name: 'Citadel of Wacky Strategy: Unnerfed', pts: 112.9 },
  { rank: 1930, name: 'Tower of Flipping Over and Over', pts: 112.69 },
  { rank: 1931, name: 'Tower of Air Pollution', pts: 112.49 },
  { rank: 1932, name: 'Citadel of Linear Death', pts: 112.29 },
  { rank: 1933, name: 'Steeple of Cheese Burger: Super Nerf', pts: 112.08 },
  { rank: 1934, name: 'Tower of Speed Buildin\' It', pts: 111.88 },
  { rank: 1935, name: 'Steeple of Blind Ate', pts: 111.67 },
  { rank: 1936, name: 'Column of Arduous Ascension', pts: 111.47 },
  { rank: 1937, name: 'Spire of Extreme Deadliness', pts: 111.26 },
  { rank: 1938, name: 'Tower of Purified Illusions', pts: 111.06 },
  { rank: 1939, name: 'Citadel of Satan\'s Wrath', pts: 110.86 },
  { rank: 1940, name: 'Tower of Massive Regret', pts: 110.65 },
  { rank: 1941, name: 'Tower of Abysmal Inferno', pts: 110.45 },
  { rank: 1942, name: 'Citadel of Indeterminate Turf', pts: 110.24 },
  { rank: 1943, name: 'Citadel of Varying Difficulties', pts: 110.04 },
  { rank: 1944, name: 'Steeple of Lika 97', pts: 109.84 },
  { rank: 1945, name: 'Edifice of Rocket', pts: 109.63 },
  { rank: 1946, name: 'Tower of Killjoys: Least Parts', pts: 109.43 },
  { rank: 1947, name: 'Edifice of Epressiond', pts: 109.22 },
  { rank: 1948, name: 'Tower of Being Outdoors: Classic', pts: 109.02 },
  { rank: 1949, name: 'Giant Steeple of Huge Pain', pts: 108.82 },
  { rank: 1950, name: 'Tower of Thinning Ascent', pts: 108.61 },
  { rank: 1951, name: 'Tower of True Confusion', pts: 108.41 },
  { rank: 1952, name: 'Tower of Spiralling Fates: Insane', pts: 108.21 },
  { rank: 1953, name: 'Tower of Great Gimmicky Gizmos', pts: 108.0 },
  { rank: 1954, name: 'Tower of Cognition', pts: 107.8 },
  { rank: 1955, name: 'Tower of Vague Perceptions', pts: 107.6 },
  { rank: 1956, name: 'Tower of Recurring Obstacles', pts: 107.39 },
  { rank: 1957, name: 'tower of FRIGHTENING', pts: 107.19 },
  { rank: 1958, name: 'Cylinder of Pure Insanity', pts: 106.99 },
  { rank: 1959, name: 'Tower of The Mighty Corner', pts: 106.78 },
  { rank: 1960, name: 'Tower of Ridicoulous Jumps', pts: 106.58 },
  { rank: 1961, name: 'Tower of Partying Partying Partying', pts: 106.38 },
  { rank: 1962, name: 'Tower of Quick Purism', pts: 106.18 },
  { rank: 1963, name: 'Tower of Umbratic Complexity', pts: 105.97 },
  { rank: 1964, name: 'Tower of Toilet Clogging', pts: 105.77 },
  { rank: 1965, name: 'Steeple of Big Justice', pts: 105.57 },
  { rank: 1966, name: 'WAwesome of Wrappies', pts: 105.36 },
  { rank: 1967, name: 'Tower of Insane Jumps', pts: 105.16 },
  { rank: 1968, name: 'Tower of Unreliable Jumps', pts: 104.96 },
  { rank: 1969, name: 'Tower of Scaling The Depths', pts: 104.76 },
  { rank: 1970, name: 'Tower of Quick Overcoming', pts: 104.55 },
  { rank: 1971, name: 'Tower of Hecc: Super Buff', pts: 104.35 },
  { rank: 1972, name: 'Tower of Never Xenial Traveling', pts: 104.15 },
  { rank: 1973, name: 'Tower of Vice Versa', pts: 103.95 },
  { rank: 1974, name: 'Tower of Increasing Intensity', pts: 103.74 },
  { rank: 1975, name: 'Tower of Traps and Techniques', pts: 103.54 },
  { rank: 1976, name: 'pen pineapple apple pen', pts: 103.34 },
  { rank: 1977, name: 'Citadel of Sovereignty', pts: 103.14 },
  { rank: 1978, name: 'Steeple of Zero Chance', pts: 102.93 },
  { rank: 1979, name: 'Great Citadel of Familiarity', pts: 102.73 },
  { rank: 1980, name: 'Steeple of The Milennial Pause', pts: 102.53 },
  { rank: 1981, name: 'Tower of True Torment', pts: 102.33 },
  { rank: 1982, name: 'Pillar of Difficulty Chart', pts: 102.13 },
  { rank: 1983, name: 'Tower of Virtuous Ascendance', pts: 101.92 },
  { rank: 1984, name: 'Tower of Low Fever', pts: 101.72 },
  { rank: 1985, name: 'Tower of Stat Boosts', pts: 101.52 },
  { rank: 1986, name: 'Tower of Escaping Lava: Classic', pts: 101.32 },
  { rank: 1987, name: 'Edifice of Kawaii Corners', pts: 101.12 },
  { rank: 1988, name: 'Tower of Quadrilaterals: Insane', pts: 100.92 },
  { rank: 1989, name: 'Steeple of HUgE HUngEr', pts: 100.71 },
  { rank: 1990, name: 'Tower of Work It', pts: 100.51 },
  { rank: 1991, name: 'Tower of Overcoming Hatred: Super Buff', pts: 100.31 },
  { rank: 1992, name: 'Baldi Tower', pts: 100.11 },
  { rank: 1993, name: 'Tower of Boreal Disarray', pts: 99.91 },
  { rank: 1994, name: 'Tower of Functions Inverse', pts: 99.71 },
  { rank: 1995, name: 'Edifice of Awaiting Morning', pts: 99.51 },
  { rank: 1996, name: 'Buffed Tinkercad Obbies', pts: 99.31 },
  { rank: 1997, name: 'Tower of Total Organ Failure', pts: 99.1 },
  { rank: 1998, name: 'Tower of 282979', pts: 98.9 },
  { rank: 1999, name: 'Tower of Forsaken Fragments', pts: 98.7 },
  { rank: 2000, name: 'Tower of What The Flip', pts: 98.5 },
  { rank: 2001, name: 'Tower of Celestial Infrastructure', pts: 98.3 },
  { rank: 2002, name: 'Steeple of I Forgot Where To Go', pts: 98.1 },
  { rank: 2003, name: 'Steeple For Multitaskers', pts: 97.9 },
  { rank: 2004, name: 'Tower of Erebus', pts: 97.7 },
  { rank: 2005, name: 'Tower of Nothing Nothing', pts: 97.5 },
  { rank: 2006, name: 'Tower of Oblique Annoyances', pts: 97.3 },
  { rank: 2007, name: 'Tower of Thje Ecotism: Super Nerf', pts: 97.1 },
  { rank: 2008, name: 'Steeple of Side Eye Scaling', pts: 96.9 },
  { rank: 2009, name: 'Steeple of Unwrapping Rituals', pts: 96.69 },
  { rank: 2010, name: 'Thanos Tower: Fan Revamp', pts: 96.49 },
  { rank: 2011, name: 'Tower of The Didgeridoo', pts: 96.29 },
  { rank: 2012, name: 'Steeple of Plif Taskje', pts: 96.09 },
  { rank: 2013, name: 'Tax Evasion Tower', pts: 95.89 },
  { rank: 2014, name: 'Tower of Paying Them Bills', pts: 95.69 },
  { rank: 2015, name: 'Tower of Thinning Layers: Difficulty Chart', pts: 95.49 },
  { rank: 2016, name: 'Steeple of Winds Away', pts: 95.29 },
  { rank: 2017, name: 'Tower of Quaint Activations', pts: 95.09 },
  { rank: 2018, name: 'Tower of Familiar Deaths', pts: 94.89 },
  { rank: 2019, name: 'Tower of Big Toe', pts: 94.69 },
  { rank: 2020, name: 'Meeple of Muppet Making', pts: 94.49 },
  { rank: 2021, name: 'Tower of Increasing Claustrophobia', pts: 94.29 },
  { rank: 2022, name: 'Tower of Realities Peak', pts: 94.09 },
  { rank: 2023, name: 'Tower of Overmind Nexus', pts: 93.89 },
  { rank: 2024, name: 'Wacky Wendigo Facility', pts: 93.69 },
  { rank: 2025, name: 'Tower of Climbing Up', pts: 93.49 },
  { rank: 2026, name: 'Tower of Disruptive Obstacles', pts: 93.29 },
  { rank: 2027, name: 'Steeple of Underlining Bleakness', pts: 93.1 },
  { rank: 2028, name: 'Tower of A Rainbow Colored Septentrion', pts: 92.9 },
  { rank: 2029, name: 'Tower of Fairly Thin but Tall Pole', pts: 92.7 },
  { rank: 2030, name: 'Tower of Dave Dash', pts: 92.5 },
  { rank: 2031, name: 'Wait It\'s A Tower?', pts: 92.3 },
  { rank: 2032, name: 'Slate Tower', pts: 92.1 },
  { rank: 2033, name: 'Tower of Turkey Sandwich', pts: 91.9 },
  { rank: 2034, name: 'Tower of True Traps', pts: 91.7 },
  { rank: 2035, name: 'Citadel of Extreme Pain', pts: 91.5 },
  { rank: 2036, name: 'Tower of Laptop Smashing', pts: 91.3 },
  { rank: 2037, name: 'He Will Always Be A Tower', pts: 91.1 },
  { rank: 2038, name: 'Steeple of Stressful Suffering', pts: 90.9 },
  { rank: 2039, name: 'small but difficult tower or basalt', pts: 90.71 },
  { rank: 2040, name: 'Tower of The Funny Event', pts: 90.51 },
  { rank: 2041, name: 'Steeple of Let It All Out', pts: 90.31 },
  { rank: 2042, name: 'Fort of Inconsolable Instability', pts: 90.11 },
  { rank: 2043, name: 'Double Jump Tower: Hard Mode', pts: 89.91 },
  { rank: 2044, name: 'Tower of Chaos and Corruption', pts: 89.71 },
  { rank: 2045, name: 'Tower of Absolute Nonsense', pts: 89.51 },
  { rank: 2046, name: 'Tower of Kutsen Rouge', pts: 89.32 },
  { rank: 2047, name: 'Tower of Curved Ascent', pts: 89.12 },
  { rank: 2048, name: 'NIGHTHAWK 22 STEEPLE', pts: 88.92 },
  { rank: 2049, name: 'Tower of I Beat The Living Crap Out Of Computer Mice Just To Feel Something On A Day To Day Basis: Lap 2', pts: 88.72 },
  { rank: 2050, name: 'Tower of Whiteness', pts: 88.52 },
  { rank: 2051, name: 'Tower of Hecc: Difficulty Chart', pts: 88.32 },
  { rank: 2052, name: 'Tower of Inferno Galore: Zee\'s Nerf', pts: 88.13 },
  { rank: 2053, name: 'Tower of Outlasting The Storm', pts: 87.93 },
  { rank: 2054, name: 'Tower of Inevitable Failure', pts: 87.73 },
  { rank: 2055, name: 'Tower of Nitting Some Wits', pts: 87.53 },
  { rank: 2056, name: 'Steeple of Potato Chips', pts: 87.34 },
  { rank: 2057, name: 'Tower of Wigglecore: Insane', pts: 87.14 },
  { rank: 2058, name: 'Steeple of Agra', pts: 86.94 },
  { rank: 2059, name: 'Tower of Ill Temperance', pts: 86.74 },
  { rank: 2060, name: 'Tower of Back and Forth', pts: 86.54 },
  { rank: 2061, name: 'Tower of Stress: Least Parts', pts: 86.35 },
  { rank: 2062, name: 'Tower of Ethereal Fantasies', pts: 86.15 },
  { rank: 2063, name: 'Tower of Cruel Punishments', pts: 85.95 },
  { rank: 2064, name: 'Steeple of X-Sport', pts: 85.76 },
  { rank: 2065, name: 'Steeple of Bupple Gubble', pts: 85.56 },
  { rank: 2066, name: 'Citadel of Double Trouble', pts: 85.36 },
  { rank: 2067, name: 'Steeple of Greater Than', pts: 85.16 },
  { rank: 2068, name: 'Tower of Hellish Existence', pts: 84.97 },
  { rank: 2069, name: 'Steeple of Luminescent Determination', pts: 84.77 },
  { rank: 2070, name: 'Tower of Generation Failure: NToH Nerf', pts: 84.57 },
  { rank: 2071, name: 'Tower of Vigorous Terror', pts: 84.38 },
  { rank: 2072, name: 'Steeple of Absolute Hysteria', pts: 84.18 },
  { rank: 2073, name: 'Steeple of Deep Wounds', pts: 83.98 },
  { rank: 2074, name: 'Citadel of Hilariously Annoying Circumstances', pts: 83.78 },
  { rank: 2075, name: 'Tower of Nothing Ever Happens', pts: 83.59 },
  { rank: 2076, name: 'Tower of The Frameless Shock', pts: 83.39 },
  { rank: 2077, name: 'Tower of The Ultra Super Amazing Jump', pts: 83.2 },
  { rank: 2078, name: 'Tower of THE MEDIOCRE BRAINROT', pts: 83.0 },
  { rank: 2079, name: 'Tower of Nutella Bread', pts: 82.8 },
  { rank: 2080, name: 'Citadel of Inconceivable Deception', pts: 82.61 },
  { rank: 2081, name: 'Tower of Forever Resetting', pts: 82.41 },
  { rank: 2082, name: 'Tower of Luxuriant Interference', pts: 82.21 },
  { rank: 2083, name: 'Tower of Harsh Endeavour', pts: 82.02 },
  { rank: 2084, name: 'The Challenge 5', pts: 81.82 },
  { rank: 2085, name: 'Steeple of Frozen Pee', pts: 81.62 },
  { rank: 2086, name: 'Tower of Archivable On NextSelection', pts: 81.43 },
  { rank: 2087, name: 'Tower of Disconnection', pts: 81.23 },
  { rank: 2088, name: 'Citadel of Laptop Cracking', pts: 81.04 },
  { rank: 2089, name: 'Citadel of Bits and Pieces', pts: 80.84 },
  { rank: 2090, name: 'Cylinder of Scattered Obstacles', pts: 80.65 },
  { rank: 2091, name: 'citadel of two hundred', pts: 80.45 },
  { rank: 2092, name: 'Tower of Unprecedented Realities', pts: 80.25 },
  { rank: 2093, name: 'Tower of Keepin\' It Together', pts: 80.06 },
  { rank: 2094, name: 'Tower of Outer Ego', pts: 79.86 },
  { rank: 2095, name: 'Tower of Being Outdoors', pts: 79.67 },
  { rank: 2096, name: 'Citadel of Malicious Intent', pts: 79.47 },
  { rank: 2097, name: 'Tower of Relentless Tension', pts: 79.28 },
  { rank: 2098, name: 'Tower of Heccerson But Something Is Off', pts: 79.08 },
  { rank: 2099, name: 'Cylinder of Vanaheim', pts: 78.89 },
  { rank: 2100, name: 'Steeple of Awkward Gameplay', pts: 78.69 },
  { rank: 2101, name: 'Tower of Infinity Gauntlet', pts: 78.5 },
  { rank: 2102, name: 'Tower of Confined Scrutiny', pts: 78.3 },
  { rank: 2103, name: 'Tower of Slightly Queasy: Super Nerf', pts: 78.11 },
  { rank: 2104, name: 'Tower of Plafondic Traversing', pts: 77.91 },
  { rank: 2105, name: 'Tower of Insanely Tall Heights', pts: 77.72 },
  { rank: 2106, name: 'Dead Chat', pts: 77.52 },
  { rank: 2107, name: 'Tower of Huge Frustration', pts: 77.33 },
  { rank: 2108, name: 'Tower of The Wandering Truss', pts: 77.13 },
  { rank: 2109, name: 'Pillar of Ascending The Barrier', pts: 76.94 },
  { rank: 2110, name: 'Tower of Risky Expeditions', pts: 76.74 },
  { rank: 2111, name: 'Steeple of Swift Rise', pts: 76.55 },
  { rank: 2112, name: 'Tower of Lucas Penteado: Zee\'s Nerf', pts: 76.36 },
  { rank: 2113, name: 'Tower of Fifteen Degrees', pts: 76.16 },
  { rank: 2114, name: 'Tower of Hijacked Voltage', pts: 75.97 },
  { rank: 2115, name: 'Tower of Thinning Vengeance', pts: 75.77 },
  { rank: 2116, name: 'Tower of Two Side Catastrophie', pts: 75.58 },
  { rank: 2117, name: 'Tower of Sliding Into Normality: Classic', pts: 75.38 },
  { rank: 2118, name: 'Tower of Slanted Cruelty', pts: 75.19 },
  { rank: 2119, name: 'Tower of It\\_Near Strikes Back', pts: 75.0 },
  { rank: 2120, name: 'Baldi Tower Classic Remastered', pts: 74.8 },
  { rank: 2121, name: 'Tower of Hazardous and Lengthy Obstacles', pts: 74.61 },
  { rank: 2122, name: 'Steeple of WaxySs', pts: 74.42 },
  { rank: 2123, name: 'Tower of Calm Tranquility', pts: 74.22 },
  { rank: 2124, name: 'Tower of Water Cup', pts: 74.03 },
  { rank: 2125, name: 'Tower of Elongated Runs: Super Nerf', pts: 73.84 },
  { rank: 2126, name: 'Super Awesome Towers', pts: 73.64 },
  { rank: 2127, name: 'Steeple of Anointed Violence', pts: 73.45 },
  { rank: 2128, name: 'Tower of Vindictive Maneuvers: Super Nerf', pts: 73.26 },
  { rank: 2129, name: 'Tower of Screen Punching: Buff', pts: 73.06 },
  { rank: 2130, name: 'Tower of Chair Throwing', pts: 72.87 },
  { rank: 2131, name: 'Tower of Mind Breaking', pts: 72.68 },
  { rank: 2132, name: 'why the fangame archive is cool', pts: 72.48 },
  { rank: 2133, name: 'Steeple of Apple Sauce', pts: 72.29 },
  { rank: 2134, name: 'Tower of Cataclysmic Calamity', pts: 72.1 },
  { rank: 2135, name: 'Steeple of Truss RTruss UTruss STruss STruss', pts: 71.9 },
  { rank: 2136, name: 'Tower of Treacherous Death', pts: 71.71 },
  { rank: 2137, name: 'Tower of Vindictive Maneuvers: Zee\'s Nerf', pts: 71.52 },
  { rank: 2138, name: 'Tower of Jumping Around', pts: 71.33 },
  { rank: 2139, name: 'Tower of Unknown Geometrical Calculations', pts: 71.13 },
  { rank: 2140, name: 'Tower of Water Melon: Super Nerf', pts: 70.94 },
  { rank: 2141, name: 'a', pts: 70.75 },
  { rank: 2142, name: 'Tower of Thej Studs', pts: 70.56 },
  { rank: 2143, name: 'Tower of Fast Timed Buttons', pts: 70.36 },
  { rank: 2144, name: 'Cylinder of Excursion', pts: 70.17 },
  { rank: 2145, name: 'Tower of One Equals Zero: Super Buff', pts: 69.98 },
  { rank: 2146, name: 'Tower of Pure Malarkey', pts: 69.79 },
  { rank: 2147, name: 'Tower of No Chance', pts: 69.6 },
  { rank: 2148, name: 'Tower of Tortuous Oblivion: Super Nerf', pts: 69.4 },
  { rank: 2149, name: 'Tower of Lemon Lime Sublime', pts: 69.21 },
  { rank: 2150, name: 'Tower of Hellish Rouge: Classic', pts: 69.02 },
  { rank: 2151, name: 'Tower of Tilt Controls', pts: 68.83 },
  { rank: 2152, name: 'twenty-three characters', pts: 68.64 },
  { rank: 2153, name: 'Unnerfed Steeple of Low Woe: Buffed', pts: 68.45 },
  { rank: 2154, name: 'Tower of Quality and Quantity', pts: 68.25 },
  { rank: 2155, name: 'Tower of Elongated Farts', pts: 68.06 },
  { rank: 2156, name: 'Steeple of One Hour', pts: 67.87 },
  { rank: 2157, name: 'Steeple of Hs Could Never', pts: 67.68 },
  { rank: 2158, name: 'Tower of Saving Citizen Girl', pts: 67.49 },
  { rank: 2159, name: 'Tower of Lunatic Corruption', pts: 67.3 },
  { rank: 2160, name: 'One Over a Million', pts: 67.11 },
  { rank: 2161, name: 'Great Citadel of 7All7', pts: 66.92 },
  { rank: 2162, name: 'Tower of Risky Expeditions: Classic', pts: 66.72 },
  { rank: 2163, name: 'Tower of Flattened Uprising', pts: 66.53 },
  { rank: 2164, name: 'citadel of laptop splitting: upside down', pts: 66.34 },
  { rank: 2165, name: 'Tower of Confection', pts: 66.15 },
  { rank: 2166, name: 'Steeple of Beautiful Memories', pts: 65.96 },
  { rank: 2167, name: 'Tower of Thinning Trouble', pts: 65.77 },
  { rank: 2168, name: 'Steeple of Meow Mrp Prr', pts: 65.58 },
  { rank: 2169, name: 'Tower of Insignificant Resourcefulness', pts: 65.39 },
  { rank: 2170, name: 'Tower of Eternal Void: Super Nerf', pts: 65.2 },
  { rank: 2171, name: 'Citadel of Double Trouble: BoltZRun900', pts: 65.01 },
  { rank: 2172, name: 'Tower of Hyper Fantasy Overdrive', pts: 64.82 },
  { rank: 2173, name: 'Tower of Slowly Darkening Descent', pts: 64.63 },
  { rank: 2174, name: 'Steeple of Lika 98', pts: 64.44 },
  { rank: 2175, name: 'Tower of Somnium, Aeternum', pts: 64.25 },
  { rank: 2176, name: 'Tower of Pinky To Darkness', pts: 64.06 },
  { rank: 2177, name: 'Tower of Cataclysmic Galore', pts: 63.87 },
  { rank: 2178, name: 'Tower of Space Management', pts: 63.68 },
  { rank: 2179, name: 'Tower of Eternal Freezing', pts: 63.49 },
  { rank: 2180, name: 'Tower of Aquatic Rivers', pts: 63.3 },
  { rank: 2181, name: 'Tower of Rising Pressure', pts: 63.11 },
  { rank: 2182, name: 'Steeple of Epicness at 3AM', pts: 62.92 },
  { rank: 2183, name: 'Tower of True Skill: Difficulty Chart', pts: 62.73 },
  { rank: 2184, name: 'Tower of Number Nightmare', pts: 62.54 },
  { rank: 2185, name: 'Tower of Wanting to Cry', pts: 62.35 },
  { rank: 2186, name: 'Giant Tower of Corrupted Nightmares', pts: 62.17 },
  { rank: 2187, name: 'Tower of Otady and Vli', pts: 61.98 },
  { rank: 2188, name: 'Citadel of Upended Chromatism', pts: 61.79 },
  { rank: 2189, name: 'Tower of Catapedaphobia', pts: 61.6 },
  { rank: 2190, name: 'Huvin ja Hauskanpidon Torni', pts: 61.41 },
  { rank: 2191, name: 'Tower of Violet Mania', pts: 61.22 },
  { rank: 2192, name: 'Tower of Tricky Jumps', pts: 61.03 },
  { rank: 2193, name: 'Tower of Brimstone Facility', pts: 60.84 },
  { rank: 2194, name: 'Tower of Going Insane', pts: 60.65 },
  { rank: 2195, name: 'Tower of Dexterity', pts: 60.47 },
  { rank: 2196, name: 'Tower of Desktop Annihilation', pts: 60.28 },
  { rank: 2197, name: 'Steeple of Jack o\' Lament', pts: 60.09 },
  { rank: 2198, name: 'Mini Citadel of Epic Potatoes', pts: 59.9 },
  { rank: 2199, name: 'Tower of Button Deactivating', pts: 59.71 },
  { rank: 2200, name: 'Tower of Silly Long Line', pts: 59.53 },
  { rank: 2201, name: 'Tower of Blissful Arcadia', pts: 59.34 },
  { rank: 2202, name: 'This deployment is currently paused', pts: 59.15 },
  { rank: 2203, name: 'ToFaF Buff', pts: 58.96 },
  { rank: 2204, name: 'Tower of Centripetal Deterrence', pts: 58.77 },
  { rank: 2205, name: 'Obelisk of Wacky Strategy: Joke Edition', pts: 58.59 },
  { rank: 2206, name: 'Tower of BIG IGB GIB FAIL AILF ILFA LFAI', pts: 58.4 },
  { rank: 2207, name: 'Tower of Hot Cheerios', pts: 58.21 },
  { rank: 2208, name: 'Tower of Expanding Layers: Alternate', pts: 58.02 },
  { rank: 2209, name: 'Tower of Thinning Layers', pts: 57.84 },
  { rank: 2210, name: 'Tower of Hydrogen 1', pts: 57.65 },
  { rank: 2211, name: 'Tower of Horrible Darkness', pts: 57.46 },
  { rank: 2212, name: 'Tower of How Do I Name A Tower', pts: 57.28 },
  { rank: 2213, name: 'Edifice of Denouement', pts: 57.09 },
  { rank: 2214, name: 'Tower of Wretchedness', pts: 56.9 },
  { rank: 2215, name: 'Tower of Trust The Process', pts: 56.71 },
  { rank: 2216, name: 'Cylinder of External Madness', pts: 56.53 },
  { rank: 2217, name: 'Tower of Criminal Intent', pts: 56.34 },
  { rank: 2218, name: 'Tower of Dying Inside Eternally', pts: 56.15 },
  { rank: 2219, name: 'Tower of Zigzagging', pts: 55.97 },
  { rank: 2220, name: 'Tower of Server Sided R15 Adventures: Solo', pts: 55.78 },
  { rank: 2221, name: 'Facility of Increasing Difficulty', pts: 55.6 },
  { rank: 2222, name: 'Tower of Nightly Horrors', pts: 55.41 },
  { rank: 2223, name: 'Tower of Arrangement', pts: 55.22 },
  { rank: 2224, name: 'Tower of No Return: The Perfect Run', pts: 55.04 },
  { rank: 2225, name: 'Ter', pts: 54.85 },
  { rank: 2226, name: 'Tower of Past Forward', pts: 54.66 },
  { rank: 2227, name: 'Steeple of Homer\'s Rampage', pts: 54.48 },
  { rank: 2228, name: 'Tower of Structural Instability', pts: 54.29 },
  { rank: 2229, name: 'Tower of Futuristic Annoyance', pts: 54.11 },
  { rank: 2230, name: 'Tower of Loud Nine', pts: 53.92 },
  { rank: 2231, name: 'Eualaa Tower: The Ultimate Omega Booster Legandary Awesome Evolution Master King Null Void Wonderful Absolute Cinema Sigma True Form Infinite', pts: 53.74 },
  { rank: 2232, name: 'Steeple of Side To Side', pts: 53.55 },
  { rank: 2233, name: 'Hey, Vsauce. Tower Here: Super Nerf', pts: 53.37 },
  { rank: 2234, name: 'Tower of Drinc Water', pts: 53.18 },
  { rank: 2235, name: 'Tower of Disappointment Into Sadness', pts: 53.0 },
  { rank: 2236, name: 'Tower of A Long Decline', pts: 52.81 },
  { rank: 2237, name: 'Tower of Emancipated Elephants', pts: 52.63 },
  { rank: 2238, name: 'Tower of Speeding Right Through', pts: 52.44 },
  { rank: 2239, name: 'Tower of Fatal Heights', pts: 52.26 },
  { rank: 2240, name: 'Tower of Big Pain', pts: 52.07 },
  { rank: 2241, name: 'Tower of The Treacherous Climb', pts: 51.89 },
  { rank: 2242, name: 'Towering Heights', pts: 51.7 },
  { rank: 2243, name: 'Steeple of Reverie', pts: 51.52 },
  { rank: 2244, name: 'Steeple of Build Time Crisis', pts: 51.33 },
  { rank: 2245, name: 'Tower of A Fading Memory', pts: 51.15 },
  { rank: 2246, name: 'Tower of Frameless Unlikely Natural', pts: 50.96 },
  { rank: 2247, name: 'Steeple of Fever Dreams', pts: 50.78 },
  { rank: 2248, name: 'Tower of Aslanted Scrimmage', pts: 50.6 },
  { rank: 2249, name: 'Tower of Scaling Large Heights', pts: 50.41 },
  { rank: 2250, name: 'Tower of Pure Intimidation', pts: 50.23 },
  { rank: 2251, name: 'Tower of Hands Sweating: Super Buff', pts: 50.04 },
  { rank: 2252, name: 'Tower of Blast From The Past', pts: 49.86 },
  { rank: 2253, name: 'Tower of Expanding Layers', pts: 49.68 },
  { rank: 2254, name: 'Steeple of Abandonment', pts: 49.49 },
  { rank: 2255, name: 'Tower of Louis V Sandals', pts: 49.31 },
  { rank: 2256, name: 'ARTHRAIX STEEPLE', pts: 49.13 },
  { rank: 2257, name: 'Tower of Great Skill', pts: 48.94 },
  { rank: 2258, name: 'Tower of Agglomeration', pts: 48.76 },
  { rank: 2259, name: 'Citadel of Let Him Cook', pts: 48.58 },
  { rank: 2260, name: 'Citadel of Corrupted Nightmares: Netless', pts: 48.39 },
  { rank: 2261, name: 'Tower of Extensive Extensions', pts: 48.21 },
  { rank: 2262, name: 'Tower of Franchun\'s Lullaby', pts: 48.03 },
  { rank: 2263, name: 'Tower of Eroding Layers', pts: 47.85 },
  { rank: 2264, name: 'Citadel of Subway', pts: 47.66 },
  { rank: 2265, name: 'Tower of Fear of Heights', pts: 47.48 },
  { rank: 2266, name: 'Tower of Possible Movement: HTF', pts: 47.3 },
  { rank: 2267, name: 'Steeple of Jumps', pts: 47.12 },
  { rank: 2268, name: 'Tower of Vibrant Overhang', pts: 46.93 },
  { rank: 2269, name: 'Citadel of Ultra Tasty Stew', pts: 46.75 },
  { rank: 2270, name: 'Tower of Terror', pts: 46.57 },
  { rank: 2271, name: 'Tower of Really Ideal Gameplay', pts: 46.39 },
  { rank: 2272, name: 'Tower of The Chaos Levels', pts: 46.21 },
  { rank: 2273, name: 'Tower of Questionable Hell', pts: 46.02 },
  { rank: 2274, name: 'Tower of Whatever This Is', pts: 45.84 },
  { rank: 2275, name: 'Tower of Absolute Broken Reality', pts: 45.66 },
  { rank: 2276, name: 'Tower of My Ribosomes', pts: 45.48 },
  { rank: 2277, name: 'Tower of Mr. Pibb', pts: 45.3 },
  { rank: 2278, name: 'Mini Citadel of Somewhere Around Fifteen Chairs', pts: 45.12 },
  { rank: 2279, name: 'Tower of Dashing Upwards', pts: 44.94 },
  { rank: 2280, name: 'Citadel of Rampancy', pts: 44.76 },
  { rank: 2281, name: 'Tower of Difficulty Chart: Wacky', pts: 44.57 },
  { rank: 2282, name: 'Steeple of The Flossified Floppalith', pts: 44.39 },
  { rank: 2283, name: 'Tower of Skill Issue', pts: 44.21 },
  { rank: 2284, name: 'Tower of Being On The Clock', pts: 44.03 },
  { rank: 2285, name: 'Cylinder of Psychotic Wraparounds', pts: 43.85 },
  { rank: 2286, name: 'Tower of The Letter T', pts: 43.67 },
  { rank: 2287, name: 'Tower of Indigo Rivers', pts: 43.49 },
  { rank: 2288, name: 'Tower of Bacterial Meningitis', pts: 43.31 },
  { rank: 2289, name: 'Tower of Plastic Wonders', pts: 43.13 },
  { rank: 2290, name: 'Steeple of God\'s Plan', pts: 42.95 },
  { rank: 2291, name: 'Tower of Incoherent Insanity', pts: 42.77 },
  { rank: 2292, name: 'Tower of Cerebrum Munching', pts: 42.59 },
  { rank: 2293, name: 'Steeple of Twisted Eternal Panic', pts: 42.41 },
  { rank: 2294, name: 'Tower of Name Placeholder', pts: 42.23 },
  { rank: 2295, name: 'Tower of Bluespace', pts: 42.05 },
  { rank: 2296, name: 'Tower of Sleepy Flower', pts: 41.87 },
  { rank: 2297, name: 'Tower of Never Coming Back', pts: 41.69 },
  { rank: 2298, name: 'Tower of Downpour Vortex', pts: 41.51 },
  { rank: 2299, name: 'Tower of Jolly Deterrent', pts: 41.33 },
  { rank: 2300, name: 'Tower of A Weird Combination', pts: 41.16 },
  { rank: 2301, name: 'Tower of Unsettling Heights', pts: 40.98 },
  { rank: 2302, name: 'Tower of Enduring Insanity', pts: 40.8 },
  { rank: 2303, name: 'Tower of Ultimate Rockefeller Street', pts: 40.62 },
  { rank: 2304, name: 'steeple of 20 minutes', pts: 40.44 },
  { rank: 2305, name: 'Mini Obelisk of Mini Obelisk: Alternate', pts: 40.26 },
  { rank: 2306, name: 'Tower of Great Victories', pts: 40.08 },
  { rank: 2307, name: 'Tower of Substantial Quietus: Zee\'s Nerf', pts: 39.9 },
  { rank: 2308, name: 'Tower of Ascension to Heaven', pts: 39.73 },
  { rank: 2309, name: 'Obelisk of Falling and Failing', pts: 39.55 },
  { rank: 2310, name: 'Steeple of Absolute Insanity', pts: 39.37 },
  { rank: 2311, name: 'Edifice of Let It Go', pts: 39.19 },
  { rank: 2312, name: 'Citadel of Goku V3', pts: 39.01 },
  { rank: 2313, name: 'Tower of Air Conditioning', pts: 38.84 },
  { rank: 2314, name: 'Tower of Confusing Mirrors', pts: 38.66 },
  { rank: 2315, name: 'Tower of Layers and Purism', pts: 38.48 },
  { rank: 2316, name: 'Tower of Clustered Amalgamations', pts: 38.3 },
  { rank: 2317, name: 'Edifice of Fun', pts: 38.13 },
  { rank: 2318, name: 'Tower of Triangle Difficulty Chart', pts: 37.95 },
  { rank: 2319, name: 'Hard Citadel of Void', pts: 37.77 },
  { rank: 2320, name: 'Tower of Difficulty Chart: Revamp', pts: 37.6 },
  { rank: 2321, name: 'Tower of Jupiter My Favourite', pts: 37.42 },
  { rank: 2322, name: 'Tower of Fatal Agitation', pts: 37.24 },
  { rank: 2323, name: 'Tower of Obbyist\'s League', pts: 37.07 },
  { rank: 2324, name: 'Tower of Dumb Stuff', pts: 36.89 },
  { rank: 2325, name: 'Tower of Reverse Difficulty Chart: st', pts: 36.71 },
  { rank: 2326, name: 'Steeple of Rising Intensity', pts: 36.54 },
  { rank: 2327, name: 'Tower of Ballooooons and Whimsy', pts: 36.36 },
  { rank: 2328, name: 'Tower of Keyboard Yeeting: Insane', pts: 36.19 },
  { rank: 2329, name: 'Giant Tower of Confusion', pts: 36.01 },
  { rank: 2330, name: 'Tower of Incomprehension and Imperfection', pts: 35.83 },
  { rank: 2331, name: 'Tower of Harsh Progression', pts: 35.66 },
  { rank: 2332, name: 'Steeple of Blood Clot', pts: 35.48 },
  { rank: 2333, name: 'Tower of Cartoony Architecture', pts: 35.31 },
  { rank: 2334, name: 'Tower of Libyan Interdimensional Airlines', pts: 35.13 },
  { rank: 2335, name: 'Tower of A Bad Time', pts: 34.96 },
  { rank: 2336, name: 'Wallhop Steeple for Eualaa\\_01', pts: 34.78 },
  { rank: 2337, name: 'Steeple of Israel-GPT', pts: 34.61 },
  { rank: 2338, name: 'Steeple of Extreme Paranoia and Screaming', pts: 34.43 },
  { rank: 2339, name: 'Tower of Great Fear', pts: 34.26 },
  { rank: 2340, name: 'Would Never Be A Good Tower', pts: 34.08 },
  { rank: 2341, name: 'Tower of Crooked Symmetry', pts: 33.91 },
  { rank: 2342, name: 'Tower of Wrapped Up Rage', pts: 33.73 },
  { rank: 2343, name: 'Steeple of Fragile', pts: 33.56 },
  { rank: 2344, name: 'Tower of Going To Brazil', pts: 33.39 },
  { rank: 2345, name: 'Tower of Bent Trauma', pts: 33.21 },
  { rank: 2346, name: 'Mini Citadel of The Journey', pts: 33.04 },
  { rank: 2347, name: 'Steeple of The Triple T', pts: 32.86 },
  { rank: 2348, name: 'Steeple of Crimson Castle: Inferno Mode', pts: 32.69 },
  { rank: 2349, name: '100 Thousand Thank Yous', pts: 32.52 },
  { rank: 2350, name: 'Tower of Incoherent Blabbering', pts: 32.34 },
  { rank: 2351, name: 'Citadel of Love Death', pts: 32.17 },
  { rank: 2352, name: 'Tower of Medial Mayhem', pts: 32.0 },
  { rank: 2353, name: 'Tower of Difficulty Breezing', pts: 31.82 },
  { rank: 2354, name: 'Tower of Extreme Hell', pts: 31.65 },
  { rank: 2355, name: 'Free sc', pts: 31.48 },
  { rank: 2356, name: 'Tower of In It To Win It', pts: 31.31 },
  { rank: 2357, name: 'Tower of Double Trouble: Classic', pts: 31.13 },
  { rank: 2358, name: 'Tower of Wrath', pts: 30.96 },
  { rank: 2359, name: 'Medium Tower', pts: 30.79 },
  { rank: 2360, name: 'Tower of Thinning Flanimal', pts: 30.62 },
  { rank: 2361, name: 'Tower of Outright Excursion', pts: 30.45 },
  { rank: 2362, name: 'Tower of Suffering In The Night', pts: 30.27 },
  { rank: 2363, name: 'Tower of Reactive Action', pts: 30.1 },
  { rank: 2364, name: 'Tower of High Adrenaline', pts: 29.93 },
  { rank: 2365, name: 'Tower of Z Fighting', pts: 29.76 },
  { rank: 2366, name: 'Tower of Pie In The Sky', pts: 29.59 },
  { rank: 2367, name: 'Edifice of Is It Too Easy', pts: 29.42 },
  { rank: 2368, name: 'Steeple of Emptiness', pts: 29.25 },
  { rank: 2369, name: 'Tower of Difficulty Chart II', pts: 29.07 },
  { rank: 2370, name: 'Steeple of Miscolorful Agony', pts: 28.9 },
  { rank: 2371, name: 'Tower of Relentless Objectives', pts: 28.73 },
  { rank: 2372, name: 'Steeple of Insecure Tranquility', pts: 28.56 },
  { rank: 2373, name: 'Tower of The Roof\'s Pique: Super Nerf', pts: 28.39 },
  { rank: 2374, name: 'Tower of Peacebringer 7 7 7', pts: 28.22 },
  { rank: 2375, name: 'Tower of Dimension Frenetic', pts: 28.05 },
  { rank: 2376, name: 'Edifice of Quarry Excavations', pts: 27.88 },
  { rank: 2377, name: 'Tower of The Wedge\'s Vengeance: Super Nerf', pts: 27.71 },
  { rank: 2378, name: 'Bastion of Lobotomy', pts: 27.54 },
  { rank: 2379, name: 'Tower of Distant Void Comprehension', pts: 27.37 },
  { rank: 2380, name: 'Tower of Feeling So Unhappy', pts: 27.2 },
  { rank: 2381, name: 'Tower of Don\'t Look Down', pts: 27.03 },
  { rank: 2382, name: 'Tower of Dreaming Wedge', pts: 26.87 },
  { rank: 2383, name: 'Tower of Zetsudai', pts: 26.7 },
  { rank: 2384, name: 'Tower of Mad', pts: 26.53 },
  { rank: 2385, name: 'Tower of Nefarious Confrontation: Classic', pts: 26.36 },
  { rank: 2386, name: 'Tower of Dizzyjumps Delight', pts: 26.19 },
  { rank: 2387, name: 'Tower of Futile Perusal: Super Nerf', pts: 26.02 },
  { rank: 2388, name: 'tower of big anger', pts: 25.85 },
  { rank: 2389, name: 'Tower of Quitting', pts: 25.69 },
  { rank: 2390, name: 'Difficulty Street', pts: 25.52 },
  { rank: 2391, name: 'Tower of Polar Tones', pts: 25.35 },
  { rank: 2392, name: 'Tower of Vacant Hindrances: OG Nerf', pts: 25.18 },
  { rank: 2393, name: 'The Darkness Steeple', pts: 25.02 },
  { rank: 2394, name: 'Tower of Rhythm Heaven: Unnerfed', pts: 24.85 },
  { rank: 2395, name: 'Tower of Five Below', pts: 24.68 },
  { rank: 2396, name: 'Thanos Tower', pts: 24.51 },
  { rank: 2397, name: 'Edifice of Emart', pts: 24.35 },
  { rank: 2398, name: 'Steeple of Enjoyable Wraparounds', pts: 24.18 },
  { rank: 2399, name: '1 Hour Tower of Difficulty Chart', pts: 24.01 },
  { rank: 2400, name: 'Tower of Odd Color Combos', pts: 23.85 },
  { rank: 2401, name: 'ψaybe a Tower', pts: 23.68 },
  { rank: 2402, name: 'Tower of Critical Endurance', pts: 23.52 },
  { rank: 2403, name: 'Tower of Hectic Excel', pts: 23.35 },
  { rank: 2404, name: 'Tower of Satan\'s Wrath', pts: 23.18 },
  { rank: 2405, name: 'Great Citadel of The Five Elements', pts: 23.02 },
  { rank: 2406, name: 'Tower of The Single Spiral', pts: 22.85 },
  { rank: 2407, name: 'Tower of SC Frenzy 4', pts: 22.69 },
  { rank: 2408, name: 'Tower of Align Negate', pts: 22.52 },
  { rank: 2409, name: 'Steeple of Endless Danger Encounters', pts: 22.36 },
  { rank: 2410, name: 'Steeple of Low Woe: Super Buff', pts: 22.19 },
  { rank: 2411, name: 'tower of epic thinning layers', pts: 22.03 },
  { rank: 2412, name: 'Tower of Pulsing Damage', pts: 21.86 },
  { rank: 2413, name: 'Citadel of Pure Pwnage', pts: 21.7 },
  { rank: 2414, name: 'Tower of Ozempic', pts: 21.54 },
  { rank: 2415, name: 'Steeple of Difficulty Chart', pts: 21.37 },
  { rank: 2416, name: 'Tower of Throttling Up', pts: 21.21 },
  { rank: 2417, name: 'Tower of Pessimistic Platforms', pts: 21.04 },
  { rank: 2418, name: 'Tower of Anything Goes', pts: 20.88 },
  { rank: 2419, name: 'Tower of Lethal Ruins', pts: 20.72 },
  { rank: 2420, name: 'Steeple of Very Evil Things', pts: 20.55 },
  { rank: 2421, name: 'Tower of Joobly Chart', pts: 20.39 },
  { rank: 2422, name: 'Mini Obelisk of Blazing Mirage', pts: 20.23 },
  { rank: 2423, name: 'Tower of Reddish Monolith', pts: 20.07 },
  { rank: 2424, name: 'Tower of Fabled Passage', pts: 19.9 },
  { rank: 2425, name: 'Burj Khalifa', pts: 19.74 },
  { rank: 2426, name: 'Mesmerizer Tower: Timerless', pts: 19.58 },
  { rank: 2427, name: 'Steeple of Suffering From Severe Inconsistencies', pts: 19.42 },
  { rank: 2428, name: 'Tower of Minimalistic Construction', pts: 19.26 },
  { rank: 2429, name: 'Tower of Vacant Hindrances: Super Nerf', pts: 19.09 },
  { rank: 2430, name: 'Tower of Narrowing Space', pts: 18.93 },
  { rank: 2431, name: 'Tower of Persistence', pts: 18.77 },
  { rank: 2432, name: 'Steeple of Devious Yield', pts: 18.61 },
  { rank: 2433, name: 'Steeple of Sprite Berry Blast', pts: 18.45 },
  { rank: 2434, name: 'Steeple of Destined Despair', pts: 18.29 },
  { rank: 2435, name: 'Tower of Science-Like Relic', pts: 18.13 },
  { rank: 2436, name: 'Liberal Steeple', pts: 17.97 },
  { rank: 2437, name: 'Eg: Buffed', pts: 17.81 },
  { rank: 2438, name: 'Tower of Dystopia', pts: 17.65 },
  { rank: 2439, name: 'Tower of You\'re A Star', pts: 17.49 },
  { rank: 2440, name: 'Citadel of Glitching and Healing', pts: 17.33 },
  { rank: 2441, name: 'Tower of Irritating Results', pts: 17.17 },
  { rank: 2442, name: 'Tower of Difficulty Chart: Classic', pts: 17.01 },
  { rank: 2443, name: 'Garfield Tower', pts: 16.86 },
  { rank: 2444, name: 'UnBuffed Tower of Analysis Explorer', pts: 16.7 },
  { rank: 2445, name: 'Tower of A Thinning Layers Copy', pts: 16.54 },
  { rank: 2446, name: 'Tower of Portals', pts: 16.38 },
  { rank: 2447, name: 'Tower of Pepper Roni', pts: 16.22 },
  { rank: 2448, name: 'Tower of Butka Havoc', pts: 16.07 },
  { rank: 2449, name: 'Tower of Safety Equals False', pts: 15.91 },
  { rank: 2450, name: 'Tower of Climbing a Pillar', pts: 15.75 },
  { rank: 2451, name: 'Tower of Nefarious Confrontation', pts: 15.59 },
  { rank: 2452, name: 'Tower of Mirrored Mountainous Mechanics', pts: 15.44 },
  { rank: 2453, name: 'Tower of Super Probably Tower', pts: 15.28 },
  { rank: 2454, name: 'Tower of Thje Wall: Super Nerf', pts: 15.12 },
  { rank: 2455, name: 'Steeple of Oreo Hell', pts: 14.97 },
  { rank: 2456, name: 'Tower of jeffy toilet paper dragon poop ken carson', pts: 14.81 },
  { rank: 2457, name: 'Tower of Unrelenting Insanity', pts: 14.66 },
  { rank: 2458, name: 'Lemon Tree', pts: 14.5 },
  { rank: 2459, name: 'Tower of Pumice', pts: 14.35 },
  { rank: 2460, name: 'Steeple of Difficulty Spikes', pts: 14.19 },
  { rank: 2461, name: 'Steeple of 35 Lodges of Hell', pts: 14.04 },
  { rank: 2462, name: 'Tower of Fortnite Boogie Bomb', pts: 13.88 },
  { rank: 2463, name: 'Tower of Terse Persecution: Super Nerf', pts: 13.73 },
  { rank: 2464, name: 'Tower of Silent Panic', pts: 13.57 },
  { rank: 2465, name: 'Steeple of Present Stairs', pts: 13.42 },
  { rank: 2466, name: 'Tower of Achromatopsia', pts: 13.27 },
  { rank: 2467, name: 'Steeple of Wallhop Difficulty Chart', pts: 13.11 },
  { rank: 2468, name: 'Tower of Submissive Furry: Super Nerf', pts: 12.96 },
  { rank: 2469, name: 'Steeple of Supreme Signature Sorting Simulator', pts: 12.81 },
  { rank: 2470, name: 'Tower of Familiar Layers', pts: 12.66 },
  { rank: 2471, name: 'Steeple of Purist Anarchy: Classic', pts: 12.5 },
  { rank: 2472, name: 'Tower of Immanent Control', pts: 12.35 },
  { rank: 2473, name: 'Tower of Barbarous Structures', pts: 12.2 },
  { rank: 2474, name: 'Tower of Lucas Penteado: Super Nerf', pts: 12.05 },
  { rank: 2475, name: 'Tower of Sukhavati Eternal Paradise', pts: 11.9 },
  { rank: 2476, name: 'Tower of Flimsy Architecture', pts: 11.75 },
  { rank: 2477, name: 'Tower of Warped Reality', pts: 11.6 },
  { rank: 2478, name: 'Edifice of C T G', pts: 11.45 },
  { rank: 2479, name: 'Tower of Truss Frenzy', pts: 11.3 },
  { rank: 2480, name: 'Edifice of Bulgaria\'s Tasty Air', pts: 11.15 },
  { rank: 2481, name: 'Unnerfed Steeple of Great Humicolous', pts: 11.0 },
  { rank: 2482, name: 'Steeple of Rainbow Flag', pts: 10.85 },
  { rank: 2483, name: 'Tower of Anxiety', pts: 10.7 },
  { rank: 2484, name: 'Tower of Transmitting Frequency', pts: 10.55 },
  { rank: 2485, name: 'Tower of Hating This Tower', pts: 10.4 },
  { rank: 2486, name: 'Steeple of Below Zero: Unnerfed', pts: 10.25 },
  { rank: 2487, name: 'Tower of Funny Thoughts: Difficulty Chart', pts: 10.11 },
  { rank: 2488, name: 'Tower of Skibidi Very Skibidi Truss', pts: 9.96 },
  { rank: 2489, name: 'π159', pts: 9.81 },
  { rank: 2490, name: 'Steeple of Forsaken Nexus', pts: 9.66 },
  { rank: 2491, name: 'Tower of Pain and Agony', pts: 9.52 },
  { rank: 2492, name: 'Tower of Xerically Infuriating Calamity: Nerf', pts: 9.37 },
  { rank: 2493, name: 'Tower of Perfect Timing', pts: 9.23 },
  { rank: 2494, name: 'Tower of Blazing Industrial Furnaces', pts: 9.08 },
  { rank: 2495, name: 'Tower of Empty Impediments', pts: 8.94 },
  { rank: 2496, name: 'Tower of que dice megan cuando pierde', pts: 8.79 },
  { rank: 2497, name: 'Tower of Monochromatic Anguish', pts: 8.65 },
  { rank: 2498, name: 'Steeple of Charger Ripping', pts: 8.5 },
  { rank: 2499, name: 'Citadel of Grand Ultimate', pts: 8.36 },
  { rank: 2500, name: 'Tower of Infuriating Ascension', pts: 8.22 },
  { rank: 2501, name: 'Cylinder of Frameless Terror', pts: 8.07 },
  { rank: 2502, name: 'Giant Tower of Thinning Layers', pts: 7.93 },
  { rank: 2503, name: 'Tower of Expanding Layers: AToBM', pts: 7.79 },
  { rank: 2504, name: 'Tower of Conjoined Chaos', pts: 7.65 },
  { rank: 2505, name: 'Steeple of Teapot\'s Hyperdoom', pts: 7.51 },
  { rank: 2506, name: 'Tower of Kendrick\'s Final Lamar', pts: 7.36 },
  { rank: 2507, name: 'Tower of Perpetual Eccentricity', pts: 7.22 },
  { rank: 2508, name: 'Costco Wholesale Tower', pts: 7.08 },
  { rank: 2509, name: 'Tower of Poor Instakill Usage', pts: 6.94 },
  { rank: 2510, name: 'Tower of Goku', pts: 6.81 },
  { rank: 2511, name: 'i build what i want okay', pts: 6.67 },
  { rank: 2512, name: 'Steeple of Trying to get Radioimmunoelectrophoresis While Discovering Methionylthreonylthreonylglutaminyl, I Got a Floccinaucinihilipilificationous Pseudopseudohypoparathyroidism Around the Area Of Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenu-akitanatahu', pts: 6.53 },
  { rank: 2513, name: 'Edifice of No Creativity: Buffed', pts: 6.39 },
  { rank: 2514, name: 'Edifice of Sticking To The Wall', pts: 6.25 },
  { rank: 2515, name: 'Tower of Vacant Hindrances: Myth\'s Nerf', pts: 6.12 },
  { rank: 2516, name: 'Steeple of Expecting Something Better: Difficulty Chart', pts: 5.98 },
  { rank: 2517, name: 'M.U.N.C.H Facility', pts: 5.84 },
  { rank: 2518, name: 'Steeple of What I See', pts: 5.71 },
  { rank: 2519, name: 'Tower of Sweet Revenge', pts: 5.57 },
  { rank: 2520, name: 'Tower of Super Silver Insanity', pts: 5.44 },
  { rank: 2521, name: 'Edifice of GBJ Hell', pts: 5.3 },
  { rank: 2522, name: 'Tower of Ripping Reality\'s Fabric', pts: 5.17 },
  { rank: 2523, name: 'Tower of Warping Wraps', pts: 5.04 },
  { rank: 2524, name: 'Tower of Wraparound Catastrophe', pts: 4.9 },
  { rank: 2525, name: 'Steeple of Rig', pts: 4.77 },
  { rank: 2526, name: 'Citadel of Ultimate Symmetry', pts: 4.64 },
  { rank: 2527, name: 'Tower of Terrain Climbing Adventures', pts: 4.51 },
  { rank: 2528, name: 'Tower of Blimp In The Sky', pts: 4.38 },
  { rank: 2529, name: 'Three Counts of Home Invasion', pts: 4.25 },
  { rank: 2530, name: 'Steeple of Petri Disk Barbell', pts: 4.12 },
  { rank: 2531, name: 'happy tower', pts: 4.0 },
  { rank: 2532, name: 'Tower of Atrocious Vacancy', pts: 3.87 },
  { rank: 2533, name: 'Obelisk of True Skill: Classic', pts: 3.74 },
  { rank: 2534, name: 'Kaizo Tower of Madness', pts: 3.62 },
  { rank: 2535, name: 'Steeple of Integrate By Parts', pts: 3.49 },
  { rank: 2536, name: 'Tower of Inside Chill Man', pts: 3.37 },
  { rank: 2537, name: 'Steeple of Random Killbrick Torment', pts: 3.24 },
  { rank: 2538, name: 'Steeple of Rage Quitting', pts: 3.12 },
  { rank: 2539, name: 'Steeple of Trauma Stickout', pts: 3.0 },
  { rank: 2540, name: 'Ace\'s Tower', pts: 2.88 },
  { rank: 2541, name: 'Tower of Harsh Aesthetical Obstacles', pts: 2.76 },
  { rank: 2542, name: 'Obelisk of True Skill', pts: 2.64 },
  { rank: 2543, name: 'Tower of Difficulty Chart', pts: 2.52 },
  { rank: 2544, name: 'Tower of Bends and Curves', pts: 2.41 },
  { rank: 2545, name: 'Steeple of Vibrant Vistas', pts: 2.29 },
  { rank: 2546, name: 'Steeple of Empty Scaling', pts: 2.18 },
  { rank: 2547, name: 'Tower of Sky\'s Rupture', pts: 2.07 },
  { rank: 2548, name: 'Mini Great Citadel of The Filler Factory', pts: 1.96 },
  { rank: 2549, name: 'Tower of Fallen Overgrowth', pts: 1.85 },
  { rank: 2550, name: 'Steeple of Fleeting Mistakes', pts: 1.74 },
  { rank: 2551, name: 'Tower of Questions', pts: 1.63 },
  { rank: 2552, name: 'Tower of 40 Jumps of Hell', pts: 1.53 },
  { rank: 2553, name: 'Tower of Where When What', pts: 1.43 },
  { rank: 2554, name: 'Steeple of Crohn\'s', pts: 1.33 },
  { rank: 2555, name: 'Steeple of Esoteric Arcane', pts: 1.24 },
  { rank: 2556, name: 'Steeple of Treacherous Gnomery', pts: 1.15 },
  { rank: 2557, name: 'Tower of Reddish Monolith: Classic', pts: 1.07 },
  { rank: 2558, name: 'Tower of Double Trouble', pts: 1.0 },
];

// ─── Tower roll system ────────────────────────────────────────────────────────
// Each memory channel holds one or more bot messages.  Every message contains
// a complete, valid JSON object — never a fragment.  On load, ALL messages in
// the channel are read, parsed independently, and merged.  On save, the full
// dataset is repacked into as many messages as needed, old messages are edited
// in-place, surplus ones are deleted, and new ones are sent if the data grew.
//
// IMPORTANT: `ids` and `objects` are always kept in sync — only messages that
// parse successfully are included in either list.  Unparseable messages (e.g.
// leftovers from old storage formats) are deleted from the channel on first
// encounter so they never corrupt the index again.
//
// Main channel  — per message: { scores?: { uid: {username,pts} }, cooldowns?: { uid: ms } }
// Rolls channel — per message: { uid: { towerName: count }, … }

const MSG_CHAR_LIMIT = 1900; // conservative ceiling well below Discord's 2000-char hard limit

// ─── In-memory cache ──────────────────────────────────────────────────────────
// All tower data lives here in RAM after the initial load on startup.
// Commands read/write the cache instantly (synchronous), then a background
// flush writes the updated data to Discord without blocking the user.

const cache = {
    ready: false,
    memory: {
        scores:       {},   // uid -> { username, pts }
        cooldowns:    {},   // uid -> expiresAt (ms)
        hiddenFromLb: [],
    },
    rolls: {},              // uid -> { towerName: count }
};

let flushMemoryPending = false;
let flushRollsPending  = new Set();

function scheduleFlushMemory() {
    if (flushMemoryPending) return;
    flushMemoryPending = true;
    setImmediate(async () => {
        flushMemoryPending = false;
        try { await saveTowerMemory(cache.memory); }
        catch (e) { console.error('[flush] memory error:', e); }
    });
}

function scheduleFlushRolls(uid) {
    flushRollsPending.add(uid);
    setImmediate(async () => {
        const uids = [...flushRollsPending];
        flushRollsPending.clear();
        for (const u of uids) {
            try { await saveTowerRolls(cache.rolls, u); }
            catch (e) { console.error('[flush] rolls error:', e); }
        }
    });
}

// enqueueTowerTask is kept so call-sites don't need changing.
// The cache makes everything synchronous so we just run fn() directly.
function enqueueTowerTask(fn) {
    return fn();
}

/** Serialise a plain object into a Discord message string. */
function toMessage(obj) {
    return '```json\n' + JSON.stringify(obj, null, 2) + '\n```';
}

/**
 * Parse one Discord message content back to a plain object.
 * Returns null for anything that isn't valid JSON (old chunk fragments,
 * stray messages, etc.) so callers can skip/delete them gracefully.
 */
function fromMessage(content) {
    try {
        const m = content.match(/```json\s*([\s\S]*?)```/);
        if (!m) return null;
        return JSON.parse(m[1].trim());
    } catch {
        return null;
    }
}

/**
 * Fetch and parse ALL bot messages in a channel.
 *
 * - Paginates in batches of 100 (Discord's per-request max) so nothing is missed.
 * - Parses each message independently; unparseable ones are deleted from the
 *   channel and excluded from the result so they never pollute future loads.
 * - Returns { objects, ids } where objects[i] corresponds to ids[i] (always in sync).
 * - Results are sorted oldest-first so merge order is deterministic.
 *
 * `cachedIds` — if provided and every ID is still fetchable, skips the full scan.
 */
async function loadAllBins(channel, cachedIds) {
    // Fast path: we know exactly which messages to read
    if (cachedIds.length > 0) {
        console.log(`[loadAllBins] Fast path: fetching ${cachedIds.length} cached IDs in #${channel.name}`);
        const results = await Promise.allSettled(
            cachedIds.map(id => channel.messages.fetch(id, { force: true }))
        );
        // If every cached message is still there, use them directly
        if (results.every(r => r.status === 'fulfilled')) {
            const msgs = results.map(r => r.value);
            const objects = msgs.map(m => fromMessage(m.content));
            // If any cached message no longer parses, fall through to full rescan
            if (objects.every(o => o !== null)) {
                console.log(`[loadAllBins] Fast path success: ${objects.length} bins loaded`);
                return { objects, ids: cachedIds };
            }
            console.log(`[loadAllBins] Fast path: some messages failed to parse, falling back to slow path`);
        } else {
            console.log(`[loadAllBins] Fast path: some fetches failed, falling back to slow path`);
        }
        // Something is wrong with the cache — do a full rescan
    }

    // Slow path: paginate through the entire channel history
    const allMsgs = [];
    let before = undefined;

    while (true) {
        const opts = { limit: 100 };
        if (before) opts.before = before;
        const page = await channel.messages.fetch(opts);
        if (page.size === 0) break;

        allMsgs.push(...page.values());

        if (page.size < 100) break;
        before = [...page.values()]
            .reduce((oldest, m) => m.createdTimestamp < oldest.createdTimestamp ? m : oldest)
            .id;
    }

    // Sort oldest-first
    allMsgs.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    // Parse each message; delete and skip anything unparseable
    const ids = [];
    const objects = [];
    for (const msg of allMsgs) {
        if (msg.author.id !== client.user.id) continue;
        const obj = fromMessage(msg.content);
        if (obj === null) {
            // Old format or garbage — delete so it never interferes again
            console.log(`[loadAllBins] Deleting unparseable message ${msg.id} (len=${msg.content.length}): ${msg.content.slice(0, 80)}`);
            try { await msg.delete(); } catch { /* already gone */ }
            continue;
        }
        ids.push(msg.id);
        objects.push(obj);
    }

    console.log(`[loadAllBins] Slow path done: ${ids.length} valid bins found in #${channel.name}`);
    return { ids, objects };
}

/**
 * Write `bins` (array of plain objects) to `channel`, reusing existing messages
 * where possible, sending new ones when needed, and deleting any surplus.
 * Returns the updated ordered list of message IDs.
 */
async function saveBins(channel, bins, existingIds) {
    const newIds = [];
    console.log(`[saveBins] Writing ${bins.length} bins to #${channel.name}, have ${existingIds.length} existing IDs`);

    for (let i = 0; i < bins.length; i++) {
        const content = toMessage(bins[i]);
        console.log(`[saveBins] Bin ${i}: ${content.length} chars`);
        if (i < existingIds.length) {
            try {
                const msg = await channel.messages.fetch(existingIds[i], { force: true });
                await msg.edit(content);
                console.log(`[saveBins] Bin ${i}: edited message ${msg.id}`);
                newIds.push(msg.id);
            } catch (err) {
                // Message gone or edit failed (e.g. content too large) —
                // delete the old message if it still exists, then send fresh.
                console.log(`[saveBins] Bin ${i}: edit failed (${err?.message}), deleting old and sending new`);
                try {
                    const old = await channel.messages.fetch(existingIds[i], { force: true });
                    await old.delete();
                } catch { /* already gone */ }
                const sent = await channel.send(content);
                console.log(`[saveBins] Bin ${i}: sent new message ${sent.id}`);
                newIds.push(sent.id);
            }
        } else {
            const sent = await channel.send(content);
            console.log(`[saveBins] Bin ${i}: sent new message ${sent.id}`);
            newIds.push(sent.id);
        }
    }

    // Delete messages that are no longer needed
    for (let i = bins.length; i < existingIds.length; i++) {
        try {
            const msg = await channel.messages.fetch(existingIds[i], { force: true });
            await msg.delete();
            console.log(`[saveBins] Deleted surplus message ${existingIds[i]}`);
        } catch { /* already gone */ }
    }

    console.log(`[saveBins] Done. New IDs: ${newIds.join(', ')}`);
    return newIds;
}

/**
 * Pack a user-keyed dataset into bins that each fit within MSG_CHAR_LIMIT.
 * `makeEntry(uid)` returns the value to store for that user.
 * `makeBin(entries)` wraps a { uid -> value } map into the final bin object.
 */
function packIntoBins(userIds, makeEntry, makeBin) {
    const bins = [];
    let currentEntries = {};

    for (const uid of userIds) {
        const entry = makeEntry(uid);
        if (entry === null) continue; // skip users with nothing to store

        const test = { ...currentEntries, [uid]: entry };
        const testBin = makeBin(test);

        if (toMessage(testBin).length > MSG_CHAR_LIMIT) {
            // Flush whatever we have accumulated so far.
            if (Object.keys(currentEntries).length > 0) {
                bins.push(makeBin(currentEntries));
                currentEntries = {};
            }
            // Check if this single user's entry alone fits.
            const soloTest = { [uid]: entry };
            if (toMessage(makeBin(soloTest)).length > MSG_CHAR_LIMIT) {
                // Entry is too large even on its own — flush it alone so it
                // never blocks subsequent users from being stored correctly.
                bins.push(makeBin(soloTest));
                // currentEntries stays empty for the next iteration.
            } else {
                currentEntries = soloTest;
            }
        } else {
            currentEntries = test;
        }
    }

    if (Object.keys(currentEntries).length > 0) {
        bins.push(makeBin(currentEntries));
    }

    return bins;
}

// ─── Main tower memory (scores + cooldowns) ───────────────────────────────────
// These functions now operate on the in-memory cache and are only called by the
// background flush — they are never awaited directly by command handlers.

let towerMemoryIds = [];

async function fetchTowerMemoryChannel() {
    return await client.channels.fetch(TOWER_MEMORY_CHANNEL_ID);
}

// Called once on startup to populate cache.memory from Discord.
async function loadTowerMemoryIntoCache() {
    try {
        const channel = await fetchTowerMemoryChannel();
        const { objects, ids } = await loadAllBins(channel, towerMemoryIds);
        towerMemoryIds = ids;

        const data = { scores: {}, cooldowns: {}, hiddenFromLb: [] };
        for (const obj of objects) {
            if (obj.scores)       Object.assign(data.scores,    obj.scores);
            if (obj.cooldowns)    Object.assign(data.cooldowns, obj.cooldowns);
            if (obj.hiddenFromLb) data.hiddenFromLb = [...new Set([...data.hiddenFromLb, ...obj.hiddenFromLb])];
        }
        cache.memory = data;
        console.log('[cache] memory loaded:', Object.keys(data.scores).length, 'users');
    } catch (err) {
        console.error('Failed to load tower memory into cache:', err);
    }
}

// Background writer — serialises cache.memory back to Discord.
async function saveTowerMemory(data) {
    try {
        const channel = await fetchTowerMemoryChannel();

        const allUids = [...new Set([
            ...Object.keys(data.scores    || {}),
            ...Object.keys(data.cooldowns || {}),
        ])];

        const bins = packIntoBins(
            allUids,
            uid => {
                const score    = data.scores?.[uid]    ?? null;
                const cooldown = data.cooldowns?.[uid] ?? null;
                return (score || cooldown) ? { score, cooldown } : null;
            },
            entries => {
                const scores    = {};
                const cooldowns = {};
                for (const [uid, { score, cooldown }] of Object.entries(entries)) {
                    if (score)    scores[uid]    = score;
                    if (cooldown) cooldowns[uid] = cooldown;
                }
                const bin = {};
                if (Object.keys(scores).length)    bin.scores    = scores;
                if (Object.keys(cooldowns).length) bin.cooldowns = cooldowns;
                return bin;
            }
        );

        if (bins.length === 0) bins.push({ scores: {}, cooldowns: {} });
        bins[0].hiddenFromLb = data.hiddenFromLb || [];

        towerMemoryIds = await saveBins(channel, bins, towerMemoryIds);
    } catch (err) {
        console.error('Failed to save tower memory:', err);
    }
}

// Shim: older call-sites that do `const data = await loadTowerMemory()` now
// just read straight from cache — zero Discord API calls.
function loadTowerMemory() {
    return Promise.resolve(cache.memory);
}

// ─── Tower rolls memory (separate channel, one message-group per user) ───────
// Message format: { owner: uid, towers: { [towerName]: count, … } }
// A single user may span multiple messages if their data exceeds MSG_CHAR_LIMIT.
// userRollsIndex: Map<uid, string[]>  (uid → ordered list of message IDs)
let userRollsIndex = null; // null = not yet loaded

async function fetchTowerRollsChannel() {
    return await client.channels.fetch(TOWER_ROLLS_CHANNEL_ID);
}

/** Scan the entire rolls channel and build userRollsIndex from scratch. */
async function buildRollsIndex(channel) {
    const index = new Map();
    let before;
    const allMsgs = [];

    while (true) {
        const opts = { limit: 100 };
        if (before) opts.before = before;
        const page = await channel.messages.fetch(opts);
        if (page.size === 0) break;
        const arr = [...page.values()];
        allMsgs.push(...arr);
        if (page.size < 100) break;
        before = arr.reduce((oldest, m) =>
            m.createdTimestamp < oldest.createdTimestamp ? m : oldest).id;
    }

    // Sort oldest-first so message order within a user is preserved
    allMsgs.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    for (const msg of allMsgs) {
        if (msg.author.id !== client.user.id) continue;

        // ── New per-user format ──────────────────────────────────────────────
        let parsed = null;
        try {
            const raw = msg.content.replace(/```json\s*|\s*```/g, '').trim();
            parsed = JSON.parse(raw);
        } catch { continue; }

        if (parsed.owner) {
            // New format
            const uid = parsed.owner;
            if (!index.has(uid)) index.set(uid, []);
            index.get(uid).push(msg.id);
        } else {
            // ── Legacy multi-user bin format — migrate in place ───────────────
            // Rewrite each user's portion into their own new-format message,
            // then delete the old bin message.
            const usersInBin = Object.keys(parsed).filter(k => typeof parsed[k] === 'object');
            for (const uid of usersInBin) {
                const towers = parsed[uid];
                if (!towers || Object.keys(towers).length === 0) continue;

                // Merge into any messages we've already written for this user
                // (handles chunked legacy data across multiple old bins)
                if (!index.has(uid)) index.set(uid, []);
                const existingIds = index.get(uid);

                if (existingIds.length > 0) {
                    // Load last existing message for this user, merge, re-split
                    // We'll do a full re-save after the scan via migrateLegacyRolls
                } 
                // We'll accumulate into a temporary structure and rewrite after
            }
            // Mark this message for migration (handled below)
        }
    }

    return { index, allMsgs };
}

/**
 * One-time migration: reads all messages in the rolls channel, merges all data
 * into a per-user structure, rewrites as new-format messages, deletes old ones.
 */
async function migrateLegacyRolls(channel) {
    console.log('[migrateLegacyRolls] Scanning channel for legacy bins...');
    let before;
    const allMsgs = [];

    while (true) {
        const opts = { limit: 100 };
        if (before) opts.before = before;
        const page = await channel.messages.fetch(opts);
        if (page.size === 0) break;
        const arr = [...page.values()];
        allMsgs.push(...arr);
        if (page.size < 100) break;
        before = arr.reduce((oldest, m) =>
            m.createdTimestamp < oldest.createdTimestamp ? m : oldest).id;
    }

    allMsgs.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const legacyMsgIds = [];
    const merged = {}; // uid → { towerName: count }

    for (const msg of allMsgs) {
        if (msg.author.id !== client.user.id) continue;
        let parsed;
        try {
            const raw = msg.content.replace(/```json\s*|\s*```/g, '').trim();
            parsed = JSON.parse(raw);
        } catch { continue; }

        if (parsed.owner) continue; // already new format, skip

        // Legacy bin: all keys are user IDs mapping to tower maps
        legacyMsgIds.push(msg.id);
        for (const [uid, towers] of Object.entries(parsed)) {
            if (typeof towers !== 'object' || Array.isArray(towers)) continue;
            if (!merged[uid]) merged[uid] = {};
            Object.assign(merged[uid], towers);
        }
    }

    if (legacyMsgIds.length === 0) {
        console.log('[migrateLegacyRolls] No legacy messages found, nothing to migrate.');
        return;
    }

    console.log(`[migrateLegacyRolls] Migrating ${legacyMsgIds.length} legacy messages for ${Object.keys(merged).length} users...`);

    // Write new-format messages for each user
    const newIndex = new Map();
    for (const [uid, towers] of Object.entries(merged)) {
        const ids = await saveUserRollMessages(channel, uid, towers, []);
        newIndex.set(uid, ids);
    }

    // Delete all legacy messages
    for (const id of legacyMsgIds) {
        try {
            const msg = await channel.messages.fetch(id, { force: true });
            await msg.delete();
        } catch { /* already gone */ }
    }

    userRollsIndex = newIndex;
    console.log('[migrateLegacyRolls] Migration complete.');
}

/**
 * Save one user's tower data as one or more messages in the channel.
 * Returns the new ordered list of message IDs for that user.
 */
async function saveUserRollMessages(channel, uid, towers, existingIds) {
    // Split this user's tower map into chunks that fit within MSG_CHAR_LIMIT
    const chunks = [];
    let currentChunk = {};

    for (const [towerName, count] of Object.entries(towers)) {
        const test = { ...currentChunk, [towerName]: count };
        const testMsg = toMessage({ owner: uid, towers: test });
        if (testMsg.length > MSG_CHAR_LIMIT && Object.keys(currentChunk).length > 0) {
            chunks.push({ ...currentChunk });
            currentChunk = { [towerName]: count };
        } else {
            currentChunk = test;
        }
    }
    if (Object.keys(currentChunk).length > 0) chunks.push(currentChunk);
    if (chunks.length === 0) chunks.push({});

    const newIds = [];
    for (let i = 0; i < chunks.length; i++) {
        const content = toMessage({ owner: uid, towers: chunks[i] });
        if (i < existingIds.length) {
            try {
                const msg = await channel.messages.fetch(existingIds[i], { force: true });
                await msg.edit(content);
                newIds.push(msg.id);
            } catch (err) {
                console.log(`[saveUserRollMessages] Edit failed for ${uid} chunk ${i}: ${err?.message}`);
                try {
                    const old = await channel.messages.fetch(existingIds[i], { force: true });
                    await old.delete();
                } catch { }
                const sent = await channel.send(content);
                newIds.push(sent.id);
            }
        } else {
            const sent = await channel.send(content);
            newIds.push(sent.id);
        }
    }

    // Delete surplus messages for this user
    for (let i = chunks.length; i < existingIds.length; i++) {
        try {
            const msg = await channel.messages.fetch(existingIds[i], { force: true });
            await msg.delete();
        } catch { }
    }

    return newIds;
}

/** Ensure the index is built. Call before any read/write operation. */
async function ensureRollsIndex(channel) {
    if (userRollsIndex !== null) return;

    // Check for legacy messages first and migrate if needed
    await migrateLegacyRolls(channel);

    if (userRollsIndex !== null) return; // migration set it

    // Build fresh index from new-format messages
    const index = new Map();
    let before;
    const allMsgs = [];

    while (true) {
        const opts = { limit: 100 };
        if (before) opts.before = before;
        const page = await channel.messages.fetch(opts);
        if (page.size === 0) break;
        const arr = [...page.values()];
        allMsgs.push(...arr);
        if (page.size < 100) break;
        before = arr.reduce((oldest, m) =>
            m.createdTimestamp < oldest.createdTimestamp ? m : oldest).id;
    }

    allMsgs.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    for (const msg of allMsgs) {
        if (msg.author.id !== client.user.id) continue;
        try {
            const raw = msg.content.replace(/```json\s*|\s*```/g, '').trim();
            const parsed = JSON.parse(raw);
            if (!parsed.owner) continue;
            const uid = parsed.owner;
            if (!index.has(uid)) index.set(uid, []);
            index.get(uid).push(msg.id);
        } catch { continue; }
    }

    userRollsIndex = index;
    console.log(`[ensureRollsIndex] Index built: ${index.size} users`);
}

// Shim: reads directly from cache — zero Discord API calls.
function loadTowerRolls(targetUid = null) {
    if (targetUid) {
        return Promise.resolve({ [targetUid]: cache.rolls[targetUid] || {} });
    }
    return Promise.resolve(cache.rolls);
}

// Background writer — called only by scheduleFlushRolls.
async function saveTowerRolls(rolls, changedUid = null) {
    try {
        const channel = await fetchTowerRollsChannel();
        await ensureRollsIndex(channel);

        const uidsToSave = changedUid ? [changedUid] : Object.keys(rolls);

        for (const uid of uidsToSave) {
            const towers = rolls[uid] || {};
            const existingIds = userRollsIndex.get(uid) || [];
            const newIds = await saveUserRollMessages(channel, uid, towers, existingIds);
            if (newIds.length > 0) {
                userRollsIndex.set(uid, newIds);
            } else {
                userRollsIndex.delete(uid);
            }
            console.log(`[saveTowerRolls] Saved ${Object.keys(towers).length} towers for user ${uid} across ${newIds.length} message(s)`);
        }
    } catch (err) {
        console.error('Failed to save tower rolls memory:', err);
    }
}

// Called once on startup to populate cache.rolls from Discord.
async function loadTowerRollsIntoCache() {
    try {
        const channel = await fetchTowerRollsChannel();
        await ensureRollsIndex(channel);

        const rolls = {};
        for (const [uid, ids] of userRollsIndex.entries()) {
            rolls[uid] = {};
            for (const id of ids) {
                try {
                    const msg = await channel.messages.fetch(id, { force: true });
                    const raw = msg.content.replace(/```json\s*|\s*```/g, '').trim();
                    const parsed = JSON.parse(raw);
                    Object.assign(rolls[uid], parsed.towers || {});
                } catch { }
            }
        }
        cache.rolls = rolls;
        console.log('[cache] rolls loaded:', Object.keys(rolls).length, 'users');
    } catch (err) {
        console.error('Failed to load tower rolls into cache:', err);
    }
}

function formatTimeRemaining(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s && !h) parts.push(`${s}s`);
    return parts.join(' ') || '1s';
}

const TOWER_DIFF_EMOJI = {
    8:  '<:Insane2:1520576028114813069>',
    9:  '<:Extreme2:1520576006694375564>',
    10: '<:Terrifying2:1520575977594421369>',
    11: '<:Catastrophic2:1520575949215629313>',
    12: '<:Horrific2:1520575918815318186>',
    13: '<:Unreal2:1520575886544339084>',
};

function getTowerDiffEmojiPrefix(towerName) {
    const diff = TOWER_DIFFICULTY[towerName] ?? null;
    const tier = diff !== null ? Math.floor(diff) : null;
    const diffEmoji = tier !== null ? (TOWER_DIFF_EMOJI[tier] ?? '') : '';
    return diffEmoji ? `${diffEmoji} ` : '';
}

async function handleTowerRoll(message) {
    // Check if a user is mentioned — if so, roll for them instead
    const mention = message.mentions.users.first();
    const targetUser = mention ?? message.author;
    const userId = targetUser.id;
    const username = targetUser.username;
    const bypassCooldown = TOWER_COOLDOWN_BYPASS.includes(message.author.id);

    await enqueueTowerTask(async () => {
        const data = await loadTowerMemory();
        if (!data.scores) data.scores = {};
        if (!data.cooldowns) data.cooldowns = {};

        // Check cooldown (against the roller, not the target)
        if (!bypassCooldown) {
            const cooldownExpiry = data.cooldowns[message.author.id];
            if (cooldownExpiry && Date.now() < cooldownExpiry) {
                const remaining = cooldownExpiry - Date.now();
                await message.channel.send(
                    `You're rolling too fast! Please wait **${formatTimeRemaining(remaining)}**.`
                );
                return;
            }
        }

        // Roll a random tower
        const tower = TOWERS[Math.floor(Math.random() * TOWERS.length)];
        const ptsRounded = Math.round(tower.pts * 100) / 100;

        // Update score for the target user
        if (!data.scores[userId]) data.scores[userId] = { username, pts: 0 };
        data.scores[userId].pts = Math.round((data.scores[userId].pts + tower.pts) * 100) / 100;
        data.scores[userId].username = username;

        // Set cooldown on the roller
        if (!bypassCooldown) {
            data.cooldowns[message.author.id] = Date.now() + TOWER_COOLDOWN_MS;
            scheduleCooldownAlert(message.author.id, data.cooldowns[message.author.id]);
        }

        // Update cache synchronously, then schedule background Discord writes
        if (!cache.rolls[userId]) cache.rolls[userId] = {};
        cache.rolls[userId][tower.name] = (cache.rolls[userId][tower.name] || 0) + 1;

        scheduleFlushMemory();
        scheduleFlushRolls(userId);

        // Respond immediately — no waiting for Discord writes
        const emojiPrefix = getTowerDiffEmojiPrefix(tower.name);

        const forLine = mention ? ` for **${username}**` : '';
        await message.channel.send(
            `**${message.author.username}** rolled ${emojiPrefix}**${tower.name}**${forLine}!! *${ptsRounded} tower ${ptsRounded === 1 ? 'point' : 'points'}!*
-# Top #${tower.rank}`
        );
    });
}

async function handleLeaderboard(message) {
    // Parse optional page number from ;lb 2, ;lb 3, etc.
    const rawTrim = message.content.trim();
    const pageArg = parseInt(rawTrim.replace(/^;lb\s*/i, ''), 10);
    const requestedPage = isNaN(pageArg) || pageArg < 1 ? 1 : pageArg;

    await enqueueTowerTask(async () => {
        const data = await loadTowerMemory();
        const scores = data.scores || {};

        const hidden = new Set(data.hiddenFromLb || []);
        const sorted = Object.entries(scores)
            .filter(([uid]) => uid !== '1154253852476973086' && !hidden.has(uid))
            .sort(([, a], [, b]) => b.pts - a.pts);

        if (sorted.length === 0) {
            await message.channel.send('No tower points have been earned yet!');
            return;
        }

        const PAGE_SIZE = 15;
        const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
        const page = Math.min(requestedPage, totalPages);
        const pageEntries = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

        // Find the requesting user's rank across the full sorted list
        const authorRankIndex = sorted.findIndex(([uid]) => uid === message.author.id);
        const authorRank = authorRankIndex === -1 ? null : authorRankIndex + 1;
        const authorEntry = authorRank !== null ? sorted[authorRankIndex] : null;
        const authorPts = authorEntry ? Math.round(authorEntry[1].pts * 100) / 100 : 0;

        const medals = ['🥇', '\ud83e\udd48', '\ud83e\udd49'];
        const globalOffset = (page - 1) * PAGE_SIZE;
        const lines = pageEntries.map(([uid, entry], i) => {
            const globalRank = globalOffset + i + 1;
            const prefix = globalRank <= 3 ? medals[globalRank - 1] : `**#${globalRank}**`;
            return `${prefix} <@${uid}> — **${Math.round(entry.pts * 100) / 100}** pts`;
        });

        let footerText = `Page ${page}/${totalPages}`;
        if (totalPages > 1) footerText += ` • Use \`;lb <page>\` to see more`;
        footerText += ` • ECR Console`;

        let authorRankLine = '';
        if (authorRank !== null) {
            const authorPrefix = authorRank <= 3 ? medals[authorRank - 1] : `#${authorRank}`;
            authorRankLine = `\n\n-# Your placement: ${authorPrefix} — **${authorPts}** pts`;
        }

        const embed = new EmbedBuilder()
            .setTitle('Tower Points Leaderboard')
            .setDescription(lines.join('\n') + authorRankLine)
            .setColor(0xB9B4FF)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: footerText })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    });
}

async function handleStats(message) {
    // Parse: ;stats [page] [@user] or ;stats [@user] [page]
    const mention = message.mentions.users.first();
    const targetUser = mention ?? message.author;
    const userId = targetUser.id;

    // Extract page number from the message content (any standalone integer)
    const contentWithoutMention = message.content.replace(/<@!?\d+>/, '').replace(/^;stats\s*/i, '').trim();
    const pageArg = parseInt(contentWithoutMention.match(/\d+/)?.[0] ?? '1', 10);
    const requestedPage = isNaN(pageArg) || pageArg < 1 ? 1 : pageArg;

    await enqueueTowerTask(async () => {
        const data = await loadTowerMemory();
        const rolls = await loadTowerRolls(userId);

        const scores = data.scores || {};
        const userScore = scores[userId];
        const userRolls = rolls[userId] || {};
        const displayName = userScore?.username ?? targetUser.username;

        const totalRolls = Object.values(userRolls).reduce((a, b) => a + b, 0);
        const totalPts = userScore ? Math.round(userScore.pts * 100) / 100 : 0;

        if (totalRolls === 0) {
            await message.channel.send(`**${displayName}** hasn't rolled any towers yet!`);
            return;
        }

        // Build a rank lookup from the TOWERS array
        const rankOf = Object.fromEntries(TOWERS.map(t => [t.name, t.rank]));

        // Sort by rank ascending (rank 1 = hardest)
        const sorted = Object.entries(userRolls)
            .sort(([nameA], [nameB]) => (rankOf[nameA] ?? 9999) - (rankOf[nameB] ?? 9999));

        const TOWERS_PER_PAGE = 25;
        const totalPages = Math.ceil(sorted.length / TOWERS_PER_PAGE);
        const page = Math.min(requestedPage, totalPages);

        const DIFF_EMOJI = {
            8:  '<:Insane2:1520576028114813069>',
            9:  '<:Extreme2:1520576006694375564>',
            10: '<:Terrifying2:1520575977594421369>',
            11: '<:Catastrophic2:1520575949215629313>',
            12: '<:Horrific2:1520575918815318186>',
            13: '<:Unreal2:1520575886544339084>',
        };

        const pageEntries = sorted.slice((page - 1) * TOWERS_PER_PAGE, page * TOWERS_PER_PAGE);
        const lines = pageEntries.map(([name, count]) => {
            const rank = rankOf[name] ?? '?';
            const diff = TOWER_DIFFICULTY[name] ?? null;
            const tier = diff !== null ? Math.floor(diff) : null;
            const emoji = tier !== null ? (DIFF_EMOJI[tier] ?? '') : '';
            const prefix = emoji ? `${emoji} #${rank}` : `#${rank}`;
            return `${prefix} **${name}** — rolled **${count}**x`;
        });

        let description = lines.join('\n');
        if (totalPages > 1 && page === 1) {
            description += `\n\n-# Use \`;stats <page>\` to view other pages.`;
        }

        const embed = new EmbedBuilder()
            .setTitle(`Tower Stats — ${displayName}`)
            .setDescription(description)
            .setColor(0xB9B4FF)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Page ${page}/${totalPages} • Total rolls: ${totalRolls} • Total pts: ${totalPts}` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    });
}

async function handleRemoveLb(message, targetId) {
    const data = cache.memory;
    if (!data.hiddenFromLb) data.hiddenFromLb = [];

    if (data.hiddenFromLb.includes(targetId)) {
        await message.channel.send(`❌ <@${targetId}> is already hidden from the leaderboard.`);
        return;
    }

    data.hiddenFromLb.push(targetId);
    scheduleFlushMemory();
    await message.channel.send(`✅ <@${targetId}> will no longer appear on the leaderboard.`);
}

async function handleRestoreLb(message, targetId) {
    const data = cache.memory;
    if (!data.hiddenFromLb || !data.hiddenFromLb.includes(targetId)) {
        await message.channel.send(`❌ <@${targetId}> is not hidden from the leaderboard.`);
        return;
    }

    data.hiddenFromLb = data.hiddenFromLb.filter(id => id !== targetId);
    scheduleFlushMemory();
    await message.channel.send(`✅ <@${targetId}> will now appear on the leaderboard again.`);
}

async function handleRemoveRoll(message, targetUser, towerQuery) {
    const query = towerQuery.toLowerCase();
    const tower = TOWERS.find(t => t.name.toLowerCase() === query)
        ?? TOWERS.find(t => t.name.toLowerCase().includes(query));

    if (!tower) {
        await message.channel.send(`❌ No tower found matching \`${towerQuery}\`.`);
        return;
    }

    const userId = targetUser.id;
    const userRolls = cache.rolls[userId];
    if (!userRolls || !userRolls[tower.name]) {
        await message.channel.send(`❌ **${targetUser.username}** has no rolls of **${tower.name}**.`);
        return;
    }

    userRolls[tower.name]--;
    if (userRolls[tower.name] <= 0) delete userRolls[tower.name];

    if (cache.memory.scores?.[userId]) {
        cache.memory.scores[userId].pts = Math.round((cache.memory.scores[userId].pts - tower.pts) * 100) / 100;
    }

    scheduleFlushMemory();
    scheduleFlushRolls(userId);

    await message.channel.send(
        `✅ Removed one roll of **${tower.name}** from **${targetUser.username}**. *(-${tower.pts} pts)*`
    );
}

async function handleAddUser(message, targetUser) {
    const data = cache.memory;
    if (!data.scores) data.scores = {};

    if (data.scores[targetUser.id]) {
        await message.channel.send(`❌ <@${targetUser.id}> is already on the leaderboard with **${Math.round(data.scores[targetUser.id].pts * 100) / 100}** pts.`);
        return;
    }

    data.scores[targetUser.id] = { username: targetUser.username, pts: 0 };
    scheduleFlushMemory();
    await message.channel.send(`✅ Added **${targetUser.username}** to the leaderboard with 0 pts.`);
}

async function handleGiveRoll(message, targetUser, towerQuery) {
    const query = towerQuery.toLowerCase();
    const tower = TOWERS.find(t => t.name.toLowerCase() === query)
        ?? TOWERS.find(t => t.name.toLowerCase().includes(query));

    if (!tower) {
        await message.channel.send(`❌ No tower found matching \`${towerQuery}\`.`);
        return;
    }

    const userId = targetUser.id;
    const username = targetUser.username;

    const data = cache.memory;
    if (!data.scores) data.scores = {};
    if (!data.scores[userId]) data.scores[userId] = { username, pts: 0 };
    data.scores[userId].pts = Math.round((data.scores[userId].pts + tower.pts) * 100) / 100;
    data.scores[userId].username = username;

    if (!cache.rolls[userId]) cache.rolls[userId] = {};
    cache.rolls[userId][tower.name] = (cache.rolls[userId][tower.name] || 0) + 1;

    scheduleFlushMemory();
    scheduleFlushRolls(userId);

    await message.channel.send(
        `✅ Gave **${tower.name}** to **${username}**! *(+${tower.pts} pts, rank #${tower.rank})*`
    );
}

// Old roll message format looked like:
//   Rolled **Tower Name**!! *929.17 tower points!*
//   -# Top #13
// This converts a message in that old format to the current format:
//   **username** rolled <emoji> **Tower Name**!! *929.17 tower points!*
//   -# Top #13
async function handleUpdateRollMessage(message, oldMessageId, targetId) {
    let oldMessage;
    try {
        oldMessage = await message.channel.messages.fetch(oldMessageId);
    } catch {
        await message.channel.send('❌ Could not find that message in this channel. Make sure you run `;update` in the same channel as the old message.');
        return;
    }

    if (oldMessage.author.id !== client.user.id) {
        await message.channel.send('❌ That message was not sent by this bot, so I won\'t touch it.');
        return;
    }

    const match = oldMessage.content.match(/^Rolled\s*\*\*(.+?)\*\*!!/i);
    if (!match) {
        await message.channel.send('❌ That doesn\'t look like an old-format roll message (expected it to start with `Rolled **Tower Name**!!`).');
        return;
    }
    const towerName = match[1].trim();

    const tower = TOWERS.find(t => t.name === towerName);
    if (!tower) {
        await message.channel.send(`❌ Couldn't find a tower named "${towerName}" in the current tower list — can't safely rebuild the message.`);
        return;
    }

    let targetUser;
    try {
        targetUser = await client.users.fetch(targetId);
    } catch {
        await message.channel.send('❌ Could not find that user.');
        return;
    }

    const ptsRounded = Math.round(tower.pts * 100) / 100;
    const emojiPrefix = getTowerDiffEmojiPrefix(tower.name);

    const newContent =
        `**${targetUser.username}** rolled ${emojiPrefix}**${tower.name}**!! *${ptsRounded} tower ${ptsRounded === 1 ? 'point' : 'points'}!*\n` +
        `-# Top #${tower.rank}`;

    try {
        await oldMessage.edit(newContent);
    } catch (error) {
        console.error(error);
        await message.channel.send('❌ Failed to edit that message (maybe it\'s too old to edit, or I\'m missing permissions).');
        return;
    }

    await message.channel.send(`✅ Updated message to the new format for **${targetUser.username}** — **${tower.name}**.`);
}

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

        // Paginate through the entire channel history to find the oldest bot message
        const allMsgs = [];
        let before = undefined;
        while (true) {
            const opts = { limit: 100 };
            if (before) opts.before = before;
            const page = await channel.messages.fetch(opts);
            if (page.size === 0) break;
            allMsgs.push(...page.values());
            if (page.size < 100) break;
            before = [...page.values()]
                .reduce((oldest, m) => m.createdTimestamp < oldest.createdTimestamp ? m : oldest)
                .id;
        }

        const botMessages = allMsgs
            .filter(m => m.author.id === client.user.id)
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp); // oldest first

        if (botMessages.length === 0) return [];

        const msg = botMessages[0];
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

// ─── Cooldown alert toggle storage ────────────────────────────────────────────
function loadAlertUsers() {
    if (fs.existsSync(ALERT_FILE)) {
        return new Set(JSON.parse(fs.readFileSync(ALERT_FILE, 'utf8')));
    }
    return new Set();
}

function saveAlertUsers(set) {
    fs.writeFileSync(ALERT_FILE, JSON.stringify([...set], null, 2));
}

const alertUsers = loadAlertUsers();
const scheduledAlertTimers = new Map(); // uid -> Timeout

// Schedules (or reschedules) a DM alert for when a user's tower cooldown ends.
// Safe to call even if alerts are off for the user — it's a no-op in that case.
function scheduleCooldownAlert(userId, expiresAt) {
    const existing = scheduledAlertTimers.get(userId);
    if (existing) clearTimeout(existing);
    scheduledAlertTimers.delete(userId);

    if (!alertUsers.has(userId)) return;

    const delay = Math.max(0, expiresAt - Date.now());
    const timer = setTimeout(async () => {
        scheduledAlertTimers.delete(userId);
        // Re-check in case alerts were turned off, or a newer cooldown supersedes this one
        if (!alertUsers.has(userId)) return;
        if (cache.memory.cooldowns?.[userId] !== expiresAt) return;

        try {
            const user = await client.users.fetch(userId);
            await user.send(
                `**\`\`Your cooldown is up!\`\`** *Ended <t:${Math.floor(expiresAt / 1000)}:R> ago...*\n` +
                `-# <#${ALERT_NOTIFY_CHANNEL_ID}>`
            );
        } catch (err) {
            console.error(`Failed to send cooldown alert DM to ${userId}:`, err);
        }
    }, delay);

    scheduledAlertTimers.set(userId, timer);
}

function cancelCooldownAlert(userId) {
    const existing = scheduledAlertTimers.get(userId);
    if (existing) clearTimeout(existing);
    scheduledAlertTimers.delete(userId);
}

// ─── Allowed tower-command channels storage ───────────────────────────────────
function loadAllowedTowerChannels() {
    if (fs.existsSync(ALLOWED_CHANNELS_FILE)) {
        return JSON.parse(fs.readFileSync(ALLOWED_CHANNELS_FILE, 'utf8'));
    }
    return [...DEFAULT_ALLOWED_TOWER_CHANNELS];
}

function saveAllowedTowerChannels(list) {
    fs.writeFileSync(ALLOWED_CHANNELS_FILE, JSON.stringify(list, null, 2));
}

const allowedTowerChannels = loadAllowedTowerChannels();

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
                name: '📢  ;speak',
                value: [
                    '**Description:** Makes the bot send a message in a specified channel.',
                    '**Usage:** `;speak <message> <channel id>`',
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
                name: '🎲  ;tower / ;toer / []',
                value: [
                    '**Description:** Rolls a random tower and awards its points to you (or a mentioned user).',
                    '**Usage:** `;tower [@user]`',
                    '**Cooldown:** 45 minutes per roller',
                    '**Who can use:** Anyone',
                ].join('\n'),
            },
            {
                name: '🏆  ;lb',
                value: [
                    '**Description:** Displays the tower points leaderboard (15 per page). Shows your rank at the bottom.',
                    '**Usage:** `;lb` or `;lb <page>`',
                    '**Who can use:** Anyone',
                ].join('\n'),
            },
            {
                name: '📊  ;stats',
                value: [
                    '**Description:** Shows tower roll stats for yourself or a mentioned user, 25 towers per page.',
                    '**Usage:** `;stats [page] [@user]`',
                    '**Examples:** `;stats`, `;stats 2`, `;stats @user`, `;stats 3 @user`',
                    '**Who can use:** Anyone',
                ].join('\n'),
            },
            {
                name: '➕  ;add',
                value: [
                    '**Description:** Adds a user to the tower leaderboard with 0 points.',
                    '**Usage:** `;add <@user or user ID>`',
                    '**Who can use:** Tower admins only',
                ].join('\n'),
            },
            {
                name: '🎁  ;give',
                value: [
                    '**Description:** Gives a specific tower roll to a user and awards its points.',
                    '**Usage:** `;give <@user or user ID> <tower name>`',
                    '**Who can use:** Tower admins only',
                ].join('\n'),
            },
            {
                name: '🗑️  ;remove',
                value: [
                    '**Description:** Removes one roll of a specific tower from a user and deducts its points.',
                    '**Usage:** `;remove <@user or user ID> <tower name>`',
                    '**Who can use:** Tower admins only',
                ].join('\n'),
            },
            {
                name: '🙈  ;removelb',
                value: [
                    '**Description:** Hides a user from the tower leaderboard.',
                    '**Usage:** `;removelb <@user or user ID>`',
                    '**Who can use:** Tower admins only',
                ].join('\n'),
            },
            {
                name: '👁️  ;restorelb',
                value: [
                    '**Description:** Restores a hidden user back to the tower leaderboard.',
                    '**Usage:** `;restorelb <@user or user ID>`',
                    '**Who can use:** Tower admins only',
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
                name: '❓  ;help',
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

    // Load all tower data into RAM so commands never wait on Discord API reads
    console.log('[cache] Starting initial load...');
    await loadTowerMemoryIntoCache();
    await loadTowerRollsIntoCache();
    cache.ready = true;
    console.log('[cache] Ready — all tower data loaded into memory.');

    // Restore cooldown alert timers for any alert-enabled users with an active cooldown
    for (const [uid, expiresAt] of Object.entries(cache.memory.cooldowns || {})) {
        if (alertUsers.has(uid) && expiresAt > Date.now()) {
            scheduleCooldownAlert(uid, expiresAt);
        }
    }

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
    if (message.content.trim().toLowerCase() === 'hi' && Math.random() < 0.25) {
        await message.channel.send('hi');
        return;
    }

    // Tower roll commands (no prefix needed — exact match)
    const rawTrim = message.content.trim();

    // Guard: if the cache isn't ready yet (bot just started), hold off
    const isTowerCmd = rawTrim === ';tower' || rawTrim.startsWith(';tower ') ||
        rawTrim === ';toer' || rawTrim.startsWith(';toer ') ||
        rawTrim === '[]' || rawTrim.startsWith('[] ') ||
        rawTrim === ';lb' || rawTrim.startsWith(';lb ') || rawTrim === ';stats' || rawTrim.startsWith(';stats ');
    if (isTowerCmd && !cache.ready) {
        await message.channel.send('⏳ Bot is still loading, please try again in a moment!');
        return;
    }

    if (isTowerCmd && !allowedTowerChannels.includes(message.channel.id)) {
        return;
    }

    if (rawTrim === ';tower' || rawTrim.startsWith(';tower ') ||
        rawTrim === ';toer'  || rawTrim.startsWith(';toer ')  ||
        rawTrim === '[]'     || rawTrim.startsWith('[] ')) {
        await handleTowerRoll(message);
        return;
    }

    if (rawTrim === ';lb' || rawTrim.startsWith(';lb ')) {
        await handleLeaderboard(message);
        return;
    }

    if (rawTrim === ';stats' || rawTrim.startsWith(';stats ')) {
        await handleStats(message);
        return;
    }

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

    // ;speak <message> <channel id>
    if (command === 'speak') {
        if (message.author.id !== '477575548944777226') return;
        const args = fullContent.slice('speak'.length).trim();
        const channelMatch = args.match(/(\d{15,25})\s*$/);
        if (!channelMatch) {
            return message.reply('❌ Usage: `;speak <message> <channel id>`');
        }
        const targetChannelId = channelMatch[1];
        const speakMessage = args.slice(0, channelMatch.index).trim();
        if (!speakMessage) {
            return message.reply('❌ Usage: `;speak <message> <channel id>`');
        }
        try {
            const targetChannel = await client.channels.fetch(targetChannelId);
            if (!targetChannel || !targetChannel.isTextBased()) {
                return message.reply('❌ Could not find a text channel with that ID.');
            }
            await targetChannel.send(speakMessage);
            try { await message.delete(); } catch (_) {}
        } catch (error) {
            console.error(error);
            return message.reply('❌ Failed to send message to that channel.');
        }
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

    // ;update <messageId> <userId> — converts an old-format roll message to the new format
    if (command === 'update') {
        if (!TOWER_ADMIN_USERS.includes(message.author.id)) return;
        const args = fullContent.slice('update'.length).trim().split(/\s+/).filter(Boolean);
        const [oldMessageId, targetId] = args;
        if (!oldMessageId || !targetId) {
            return message.reply('Usage: `;update <messageId> <userId>`');
        }
        await handleUpdateRollMessage(message, oldMessageId, targetId);
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

    // ;remove, ;add, ;give — tower admin only
    if (['remove', 'add', 'give', 'removelb', 'restorelb'].includes(command)) {
        if (!TOWER_ADMIN_USERS.includes(message.author.id)) return;

        const args = fullContent.slice(command.length).trim();
        const mentionMatch = args.match(/^<@!?(\d+)>/);
        const idMatch = args.match(/^(\d+)/);

        if (command === 'removelb' || command === 'restorelb') {
            let targetId;
            if (mentionMatch) targetId = mentionMatch[1];
            else if (idMatch) targetId = idMatch[1];
            else return message.reply(`Usage: \`;${command} <@user or user ID>\``);
            if (command === 'removelb') await handleRemoveLb(message, targetId);
            else await handleRestoreLb(message, targetId);
            return;
        }

        if (command === 'remove') {
            let targetId, towerQuery;
            if (mentionMatch) {
                targetId = mentionMatch[1];
                towerQuery = args.slice(mentionMatch[0].length).trim();
            } else if (idMatch) {
                targetId = idMatch[1];
                towerQuery = args.slice(idMatch[0].length).trim();
            } else {
                return message.reply('Usage: `;remove <@user or user ID> <tower name>`');
            }
            if (!towerQuery) return message.reply('Usage: `;remove <@user or user ID> <tower name>`');
            let targetUser;
            try { targetUser = await client.users.fetch(targetId); }
            catch { return message.reply('❌ Could not find that user.'); }
            await handleRemoveRoll(message, targetUser, towerQuery);
            return;
        }

        if (command === 'add') {
            let targetId;
            if (mentionMatch) targetId = mentionMatch[1];
            else if (idMatch) targetId = idMatch[1];
            else return message.reply('Usage: `;add <@user or user ID>`');
            let targetUser;
            try { targetUser = await client.users.fetch(targetId); }
            catch { return message.reply('❌ Could not find that user.'); }
            await handleAddUser(message, targetUser);
            return;
        }

        if (command === 'give') {
            let targetId, towerQuery;
            if (mentionMatch) {
                targetId = mentionMatch[1];
                towerQuery = args.slice(mentionMatch[0].length).trim();
            } else if (idMatch) {
                targetId = idMatch[1];
                towerQuery = args.slice(idMatch[0].length).trim();
            } else {
                return message.reply('Usage: `;give <@user or user ID> <tower name>`');
            }
            if (!towerQuery) return message.reply('Usage: `;give <@user or user ID> <tower name>`');
            let targetUser;
            try { targetUser = await client.users.fetch(targetId); }
            catch { return message.reply('❌ Could not find that user.'); }
            await handleGiveRoll(message, targetUser, towerQuery);
            return;
        }
    }

    // ;alert <userid> — toggles DM cooldown-end alerts for that user
    if (command === 'alert') {
        if (message.author.id !== ALERT_ADMIN_USER) return;

        const args = fullContent.slice('alert'.length).trim();
        const mentionMatch = args.match(/^<@!?(\d+)>/);
        const idMatch = args.match(/^(\d+)/);
        let targetId;
        if (mentionMatch) targetId = mentionMatch[1];
        else if (idMatch) targetId = idMatch[1];
        else return message.reply('Usage: `;alert <userid>`');

        if (alertUsers.has(targetId)) {
            alertUsers.delete(targetId);
            saveAlertUsers(alertUsers);
            cancelCooldownAlert(targetId);
            await message.reply(`🔕 Cooldown alerts **disabled** for <@${targetId}>.`);
        } else {
            alertUsers.add(targetId);
            saveAlertUsers(alertUsers);
            const expiresAt = cache.memory.cooldowns?.[targetId];
            if (expiresAt && expiresAt > Date.now()) {
                scheduleCooldownAlert(targetId, expiresAt);
            }
            await message.reply(`🔔 Cooldown alerts **enabled** for <@${targetId}>.`);
        }
        return;
    }

    // ;addch <channelid> — adds a channel to the allowed tower/lb/stats channel list
    if (command === 'addch') {
        if (message.author.id !== ALERT_ADMIN_USER) return;

        const args = fullContent.slice('addch'.length).trim();
        const idMatch = args.match(/^(\d+)/);
        if (!idMatch) return message.reply('Usage: `;addch <channelid>`');
        const channelId = idMatch[1];

        if (allowedTowerChannels.includes(channelId)) {
            return message.reply(`❌ <#${channelId}> is already in the allowed channels list.`);
        }
        allowedTowerChannels.push(channelId);
        saveAllowedTowerChannels(allowedTowerChannels);
        await message.reply(`✅ Added <#${channelId}> to the allowed tower-command channels.`);
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
// shibo sucks at tower rolling
client.login(process.env.TOKEN);
