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
const TOWER_MEMORY_CHANNEL_ID = '1519811705977442345';
const TOWER_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
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

const KNOWN_COMMANDS = ['console', 'raidsetup', 'editst', 'editet', 'help', 'raidban', 'unraidban', 'view', 'tempraidban', 'tower', 'toer', 'lb'];

const TOWERS = [
  { name: 'S.T.O.N.E Facility: Reborn', pts: 1000 },
  { name: 'Tower of Monochromatic Haze', pts: 999 },
  { name: 'Tower of It Never Ends', pts: 998 },
  { name: 'Tower of Impending Doom', pts: 997 },
  { name: 'Tower of Wigglecore', pts: 996 },
  { name: 'Tower of My Inner Hatred', pts: 995 },
  { name: 'Tower of Spiralling Fates', pts: 994 },
  { name: 'Citadel of Cold Blooded Fatality', pts: 993 },
  { name: 'Obelisk of Unrealistic Sightings', pts: 992 },
  { name: 'Tower of Maybe In Mumbai', pts: 991 },
  { name: 'Tower of Blind Fate', pts: 990 },
  { name: 'Tower of Paradise', pts: 989 },
  { name: 'Tower of Celestial Bloom', pts: 988 },
  { name: 'Tower of Withered Consensus', pts: 987 },
  { name: 'Citadel of The Eternal Calamity', pts: 986 },
  { name: 'Citadel of Infinite Void', pts: 985 },
  { name: 'Tower of Qwerty Uiop', pts: 984 },
  { name: 'Target Tower', pts: 983 },
  { name: 'Pazoingus Of Of', pts: 982 },
  { name: '3008-Tower', pts: 981 },
  { name: 'Tower of Zen Surplus', pts: 980 },
  { name: 'Tower of Twenty Two', pts: 979 },
  { name: 'Ikea Tower', pts: 978 },
  { name: 'Tower of Sudden Death', pts: 977 },
  { name: 'Great Citadel of Great Difficulty Chart', pts: 977 },
  { name: 'Tower of Yasamsal Kiyamet', pts: 976 },
  { name: 'Tower of Lucid Nightmares', pts: 975 },
  { name: 'Tower of Light Speed Buttons', pts: 974 },
  { name: 'Tower of Ruthless Retribution', pts: 973 },
  { name: 'Tower of Stardust Conflagration', pts: 972 },
  { name: 'Tower of Computer Crippling', pts: 971 },
  { name: 'Zalgo Annihilated Purgatory', pts: 970 },
  { name: 'Tower of Jaded Compromise', pts: 969 },
  { name: 'Tower of Head Quarters', pts: 968 },
  { name: 'Tower of Dissociative Force', pts: 967 },
  { name: 'Tower of Dense Beauty', pts: 966 },
  { name: 'Tower of Where Are You Going', pts: 965 },
  { name: 'Citadel of The Final Destination', pts: 964 },
  { name: 'Tower of Substantial Quietus', pts: 963 },
  { name: 'Tower of Splice Construct', pts: 962 },
  { name: 'Tower of The Curve\'s Desire', pts: 961 },
  { name: 'Tower of Fragmented Wallscape', pts: 960 },
  { name: 'Tower of Zither Harmony', pts: 959 },
  { name: 'Tower of Inferno Galore: Unnerfed', pts: 958 },
  { name: 'Tower of Vague Luminescence', pts: 957 },
  { name: 'Tower of Impressions of a Lunatic', pts: 956 },
  { name: 'Tower of Umrah Market', pts: 955 },
  { name: 'Tower of Compromised Fear', pts: 954 },
  { name: 'Tower of Sinful Calvary', pts: 953 },
  { name: 'Tower of Eternal Distress', pts: 952 },
  { name: 'Tower of The Horizontal Wall', pts: 951 },
  { name: 'Tower of Eternal Void', pts: 950 },
  { name: 'Tower of Spiritual Rise', pts: 950 },
  { name: 'Tower of Lavender Lustre', pts: 949 },
  { name: 'Tower of The Roof\'s Pique', pts: 948 },
  { name: 'Found You Tower', pts: 947 },
  { name: 'Tower of Diabolical Corner Multitude', pts: 946 },
  { name: 'Tower of Prismal Radiance', pts: 945 },
  { name: 'Tower of Thje Floor', pts: 944 },
  { name: 'Tower of Drifting Nights', pts: 943 },
  { name: 'Tower of Overwhelming Doom', pts: 942 },
  { name: 'Nvidia Tower', pts: 941 },
  { name: 'Steeple of Daze', pts: 940 },
  { name: 'Tower of Weird Core', pts: 939 },
  { name: 'Sans Steeple', pts: 938 },
  { name: 'Tower of Chromatic Inclination', pts: 937 },
  { name: 'Tower of Disjointed Alliance', pts: 936 },
  { name: 'Tower of Flowing Haze', pts: 935 },
  { name: 'Tower of Quite Devious', pts: 934 },
  { name: 'Tower of Reborn Vertigo', pts: 933 },
  { name: 'Steeple of Transcendence', pts: 932 },
  { name: 'Tower of Flagrant Aggravation', pts: 931 },
  { name: 'Tower of Descending Towards Oblivion', pts: 931 },
  { name: 'Tower of The Sky\'s The Limit', pts: 930 },
  { name: 'Tower of Overhanging Obstacles', pts: 929 },
  { name: 'Tower of Vital Valiance', pts: 928 },
  { name: 'Tower of Exhausting Journey', pts: 927 },
  { name: 'Steeple of Cha Cha Real Smooth', pts: 926 },
  { name: 'Corner Tower', pts: 925 },
  { name: 'Tower of Eternal Doom', pts: 924 },
  { name: 'Tower of Living Life to the Fullest', pts: 923 },
  { name: 'Tower of Lucas Penteado', pts: 922 },
  { name: 'Tower of Wigglecore: Classic', pts: 921 },
  { name: 'Citadel of Cruel Punishment', pts: 920 },
  { name: 'Steeple of Nilly Bob', pts: 919 },
  { name: 'Tower of Water Melon', pts: 918 },
  { name: 'Tower of Thinning Bacon', pts: 917 },
  { name: 'Tower of Disturbing Dread', pts: 916 },
  { name: 'Tower of Quiescent Spiralism', pts: 915 },
  { name: 'Tower of Greyscale', pts: 915 },
  { name: 'Tower of Virescent Cascade', pts: 914 },
  { name: 'Tower of My Eternal Destination', pts: 913 },
  { name: 'Tower of Vynn Crael', pts: 912 },
  { name: 'Tower of Luminous Reflections', pts: 911 },
  { name: 'Tower of Spatial Awareness', pts: 910 },
  { name: 'Tower of Corruption\'s Embrace', pts: 909 },
  { name: 'Byung Jin Rae', pts: 908 },
  { name: 'Tower of Existential Crisis: Super Nerf', pts: 907 },
  { name: 'Tower of Familiar Voids', pts: 906 },
  { name: 'Tower of Absolute Zero', pts: 905 },
  { name: 'Tower of Brief Enmity', pts: 904 },
  { name: 'Tower of pro pillars', pts: 903 },
  { name: 'Tower of Gridlock Madness', pts: 902 },
  { name: 'Tower of The Bussin', pts: 902 },
  { name: 'Great Citadel of Difficulty Chart: Classic', pts: 901 },
  { name: 'Tower of Who Moved My Camera', pts: 900 },
  { name: 'Tower of Psychological Torture', pts: 899 },
  { name: 'Tower of Truss Behemoth', pts: 898 },
  { name: 'Tower of Hollow Obstacles', pts: 897 },
  { name: 'Cone Tower', pts: 896 },
  { name: 'Tower of The Altruistic Serosity', pts: 895 },
  { name: 'Tower of Microsoft Service', pts: 894 },
  { name: 'Tower of Subsequent Comprises', pts: 893 },
  { name: 'Tower of Italianray Never Clear', pts: 892 },
  { name: 'Tower of Elongated Runs: Unnerfed', pts: 891 },
  { name: 'Tower of The Ice Wall', pts: 890 },
  { name: 'Tower of Futile Perusal', pts: 890 },
  { name: 'Tower of Gtg House On Fire', pts: 889 },
  { name: 'Doomsday Tower', pts: 888 },
  { name: 'Tower of Technical Requirements', pts: 887 },
  { name: 'Tower of Malefic Nuisances', pts: 886 },
  { name: 'Tower of Elysian Crossings', pts: 885 },
  { name: 'Tower of Corrupted Zenith', pts: 884 },
  { name: 'Tower of small pillars', pts: 883 },
  { name: 'Tower of Hollow Iridescences', pts: 882 },
  { name: 'Tower of Bizkit', pts: 881 },
  { name: 'Tower of Devious Purism', pts: 880 },
  { name: 'Citadel of Vacant Hindrances', pts: 879 },
  { name: 'Steeple of Pit of Misery Soul Crushing+', pts: 879 },
  { name: 'Steeple of Cheese Burger', pts: 878 },
  { name: 'Tower of Winner\'s Pad', pts: 877 },
  { name: 'Tower of The Quest For Perfection', pts: 876 },
  { name: 'Tower of Venerated Attrition', pts: 875 },
  { name: 'Tower of Rezz Oant', pts: 874 },
  { name: 'Tower of The Homefinder', pts: 873 },
  { name: 'Tower of Nebulaic Remnants', pts: 872 },
  { name: 'Tower of Fragile Balance', pts: 871 },
  { name: 'Tower of Nether Lands', pts: 870 },
  { name: 'Tower of Incessant Vexation', pts: 869 },
  { name: 'Bocchi The Rock Tower', pts: 869 },
  { name: 'Tower of Terrorific Jumps', pts: 868 },
  { name: 'Tower of Thje Wall', pts: 867 },
  { name: 'Edifice of Flicking and Clicking: Double Time', pts: 866 },
  { name: 'Tower of Timed Button Fury', pts: 865 },
  { name: 'Tower of Jabberwock Jagger', pts: 864 },
  { name: 'Tower of Cruel Punishment', pts: 863 },
  { name: 'Barely Even A Tower', pts: 862 },
  { name: 'Steeple of Dead Is You', pts: 861 },
  { name: 'Tower of Meaningfulness', pts: 860 },
  { name: 'Tower of Prolonged Condemnation', pts: 860 },
  { name: 'Homefinder Steeple', pts: 859 },
  { name: 'Tower of Zumbo Sauce Consumption', pts: 858 },
  { name: 'Yanny Laurel Edifice', pts: 857 },
  { name: 'Citadel of Descent Into Exile', pts: 856 },
  { name: 'Citadel of 25 Jumps: True Mode', pts: 855 },
  { name: 'Citadel of Terse Persecution', pts: 854 },
  { name: 'Tower of Vertigo', pts: 853 },
  { name: 'Tower of Righteous Indignation', pts: 852 },
  { name: 'Tower of Time to Say Goodbye', pts: 851 },
  { name: 'Tower of The Goodguygabed', pts: 851 },
  { name: 'Jumbo Tower', pts: 850 },
  { name: 'Steeple of Twisty Turning Horrific Difficulty', pts: 849 },
  { name: 'Tower of Missing Benefits', pts: 848 },
  { name: 'Tower of Various Masochistic Tortures', pts: 847 },
  { name: 'Tower of Corner Kerfuffle', pts: 846 },
  { name: 'Steeple of Kyodai na Paul', pts: 845 },
  { name: 'Tower of Elysian Crossings: Classic', pts: 844 },
  { name: 'Citadel of Uncanny', pts: 843 },
  { name: 'Obelisk of Dominance', pts: 843 },
  { name: 'Tower of Virulent Sojourn', pts: 842 },
  { name: 'Tower of Mental Torture', pts: 841 },
  { name: 'Thje Steeple', pts: 840 },
  { name: 'Steeple of Quill Canyon', pts: 839 },
  { name: 'The Diceman\'s Wrath', pts: 838 },
  { name: 'Tower of Daunting Experiences', pts: 837 },
  { name: 'Steeple of The Divined Sequence', pts: 836 },
  { name: 'Steeple of Suspiciously Large Right Arm', pts: 835 },
  { name: 'towero f gunga ginga', pts: 835 },
  { name: 'Mesmerizer Tower', pts: 834 },
  { name: 'Tower of Heaven\'s Gate', pts: 833 },
  { name: 'Tower of Offset Lacrimosa', pts: 832 },
  { name: 'Tower of Vacant Hindrances', pts: 831 },
  { name: 'Tower of Tarapop Two', pts: 830 },
  { name: 'Tower of Challenging Obstacle Anarchy', pts: 829 },
  { name: 'Tower of Elongated Runs', pts: 828 },
  { name: 'Steeple of Eco-Friendly Wood Veneers', pts: 827 },
  { name: 'Edifice of Wooting 80HE Zinc', pts: 827 },
  { name: 'Edifice of Wallhop Against Time', pts: 826 },
  { name: 'Tower of O\'er The Skies', pts: 825 },
  { name: 'Tower of Lethal Countdown', pts: 824 },
  { name: 'Tower of Pyrrhic Ascent', pts: 823 },
  { name: 'Tower of Play to Win', pts: 822 },
  { name: 'Tower of Shunning Excursion', pts: 821 },
  { name: 'Citadel of Perfect Cherry Blossom', pts: 820 },
  { name: 'Steeple of Pole Pole Pole', pts: 820 },
  { name: 'Tower of The Wedge\'s Vengeance', pts: 819 },
  { name: 'Tower of Your Short-term Session', pts: 818 },
  { name: 'Tower of Cosmix Resonance', pts: 817 },
  { name: 'Tower of Ruthless Punishment', pts: 816 },
  { name: 'Tower of Reproachful Eyewall', pts: 815 },
  { name: 'Tower of Tempestous Twilight', pts: 814 },
  { name: 'Tower of Factorial Difficulty', pts: 813 },
  { name: 'Tower of Thje Toilet', pts: 813 },
  { name: 'Tower of Pulsating Ambition', pts: 812 },
  { name: 'Tower of Champion\'s Road', pts: 811 },
  { name: 'Tower of Insane Discomfort', pts: 810 },
  { name: 'Citadel of Infinite Void: Nerf', pts: 809 },
  { name: 'Tower of Alien Radiance: Unnerfed', pts: 808 },
  { name: 'Tower of Exodus Obscurity', pts: 807 },
  { name: 'steeple of support-tickets', pts: 807 },
  { name: 'Tower of Unpremeditated Paraphernalia', pts: 806 },
  { name: 'Tower of Raging Tempest', pts: 805 },
  { name: 'Tower of The Jankening', pts: 804 },
  { name: 'Tower of Monty Mole Mayhem', pts: 803 },
  { name: 'Lighthouse', pts: 802 },
  { name: 'Steeple of Leaden Heights', pts: 801 },
  { name: 'Tower of Punishing Runs', pts: 800 },
  { name: 'Tower of Explore My World: Classic', pts: 800 },
  { name: 'Tower of Hydraulic Rummage', pts: 799 },
  { name: 'Tower of Atmospheric Launch', pts: 798 },
  { name: 'Tower of Terse Persecution', pts: 797 },
  { name: 'Tower of Thin Mints', pts: 796 },
  { name: 'Steeple of Endless Assembly', pts: 795 },
  { name: 'Tower of Centchade', pts: 794 },
  { name: 'Turbulent Tower: Super Hard Mode', pts: 794 },
  { name: 'Tower of Fujiwara no Mokou', pts: 793 },
  { name: 'Tower of Monumental Abyss', pts: 792 },
  { name: 'Tower of Annoyingly Complex Trials', pts: 791 },
  { name: 'Tower of The Turkey Sandwich Trials', pts: 790 },
  { name: 'Tower of Relentless Fate', pts: 789 },
  { name: 'Steeple of Jeopardized Romance', pts: 788 },
  { name: 'Tower of Kidney Stones', pts: 788 },
  { name: 'Tower of Organamix Twistalivious', pts: 787 },
  { name: 'Citadel of Generation Failure', pts: 786 },
  { name: 'Tower of The Flowering Cyclone', pts: 785 },
  { name: 'teehee colon three tower', pts: 784 },
  { name: '＜', pts: 783 },
  { name: 'Tower of Endless Marathon', pts: 782 },
  { name: 'Tower of The Final Moment', pts: 782 },
  { name: 'Tower of Difficulty Spike', pts: 781 },
  { name: 'Schizophrenic Steeple', pts: 780 },
  { name: 'Tower of Unter dem Schwarzschildradius', pts: 779 },
  { name: 'Tower of Jim and Tim\'s Ultimate Birthday Blowout!', pts: 778 },
  { name: 'Tower of The Drive Towards Human Limits: Super Nerf', pts: 777 },
  { name: 'Tower of Raging Tempest: Everstorm', pts: 777 },
  { name: 'Tower of Oblivious Twist', pts: 776 },
  { name: 'Citadel of Augmented Misery', pts: 775 },
  { name: 'Tower of Live The Dream', pts: 774 },
  { name: 'Steeple of Denouementer', pts: 773 },
  { name: 'Citadel of Colorless Despair', pts: 772 },
  { name: 'S.T.O.N.E Facility', pts: 771 },
  { name: 'Obelisk of I Have No Idea What I\'m Even Doing Anymore Please Help', pts: 771 },
  { name: 'Tower of Pure Ability', pts: 770 },
  { name: 'Radio Tower', pts: 769 },
  { name: 'Tower of Necrotic Incantation', pts: 768 },
  { name: 'Great Citadel of Great Joobly Chart', pts: 767 },
  { name: 'Tower of Asteroid Corrode Mismanagement', pts: 766 },
  { name: 'Tower of Lost In Eden', pts: 766 },
  { name: 'Steeple of Cognizant Freedom', pts: 765 },
  { name: 'Steeple of Lex', pts: 764 },
  { name: 'Advancement of Taboo Tower', pts: 763 },
  { name: 'Tower of Jocundigluey', pts: 762 },
  { name: 'Not Even a Not Even a Great Citadel', pts: 761 },
  { name: 'Tower of Lika 98', pts: 761 },
  { name: 'Tower of Screaming and Creaming', pts: 760 },
  { name: 'Steeple of Coconut', pts: 759 },
  { name: 'Obelisk of Long', pts: 758 },
  { name: 'Tower of Yeah, It\'s Pretty Empty Entirely', pts: 757 },
  { name: 'Tower of Doubly Deadly Descent', pts: 756 },
  { name: 'Unnerfed Tower of Melancholic Misery', pts: 756 },
  { name: 'Unnerfed Tower of Perlin Dreams of Greatness', pts: 755 },
  { name: 'Steeple of 50 Wraps of Hell', pts: 754 },
  { name: 'Tower of Un Ca', pts: 753 },
  { name: 'Tower of Otherworldly Expertise', pts: 752 },
  { name: 'Sprite Cranberry Steeple', pts: 751 },
  { name: 'Ultimate Obby Tower', pts: 751 },
  { name: 'Tower of Ring Rang Rung Rong', pts: 750 },
  { name: 'Tower of Explore My World', pts: 749 },
  { name: 'Tower of Upbeat Dejectional Rascality', pts: 748 },
  { name: 'Tower of Inner Repose', pts: 747 },
  { name: 'Tower of Elongated Torments', pts: 746 },
  { name: 'Tower of Unorthodoxy', pts: 746 },
  { name: 'Sorry Richo Steeple', pts: 745 },
  { name: 'Tower of Thje Ecotism', pts: 744 },
  { name: 'Tower of Jumping', pts: 743 },
  { name: 'Tower of Sacrilegious Jumps: Super Nerf', pts: 742 },
  { name: 'Tower of Endless Spreading Bane', pts: 741 },
  { name: 'Tower of Do Not Play', pts: 741 },
  { name: 'Tower of Disengaging Lunacy', pts: 740 },
  { name: 'Tower of Parody: Super Nerf', pts: 739 },
  { name: 'Tower of Vibrant Overcomings', pts: 738 },
  { name: 'Treacherous Extremist Ascension Neat', pts: 737 },
  { name: 'Tower of Pierogi', pts: 736 },
  { name: 'Steeple of Wallhop Destiny', pts: 736 },
  { name: 'Tower of Quadrilaterals', pts: 735 },
  { name: 'S.C.O.N.E Facility', pts: 734 },
  { name: 'Tower of Beast Weaver', pts: 733 },
  { name: 'Tower of Withering Dirges', pts: 732 },
  { name: 'Tower of Lung Chugging', pts: 732 },
  { name: 'Tower of Empty Meaningless Patterns', pts: 731 },
  { name: 'Tower of Spicy Headcream', pts: 730 },
  { name: 'Steeple of Xei Pei Disagreement', pts: 729 },
  { name: 'Tower of Descent Into Exile', pts: 728 },
  { name: 'Tower of Wooden Planks', pts: 728 },
  { name: 'Tower of Wiggly Worm', pts: 727 },
  { name: 'Tower of My End', pts: 726 },
  { name: 'Was a Citadel', pts: 725 },
  { name: 'Steeple of Mori Calliope', pts: 724 },
  { name: 'Jeronimo\'s Nest, Chapter 1: The Rice & Beans Coalition', pts: 723 },
  { name: 'Steeple of Sweet Tendency', pts: 723 },
  { name: 'Tower of Hard Chart', pts: 722 },
  { name: 'Tower of Conceptual Phase', pts: 721 },
  { name: 'Obelisk of Latest Difficulty Chart', pts: 720 },
  { name: 'Tower of Thje Tower', pts: 719 },
  { name: 'Tower of Melodramatic Esoteric Nebulosity', pts: 719 },
  { name: 'Tower of Being Extremely Rude', pts: 718 },
  { name: 'Steeple of Anything Can Happen', pts: 717 },
  { name: 'The Really Ugly Sad Steeple', pts: 716 },
  { name: 'Tower of FL Studio F', pts: 715 },
  { name: 'Edifice of Adrift in Utopia', pts: 715 },
  { name: 'Steeple of Cybersecurity', pts: 714 },
  { name: 'Tower of Infernal Turpitude', pts: 713 },
  { name: 'Tower of Death Corridor: Super Nerf', pts: 712 },
  { name: 'Tower of Wacky Truss Destruction', pts: 711 },
  { name: 'Tower of Infuriating Misfortune', pts: 711 },
  { name: 'Steeple of Benevolence', pts: 710 },
  { name: 'Citadel of Inception', pts: 709 },
  { name: 'Steeple of Ranka Lee', pts: 708 },
  { name: 'Citadel of Linear Jank', pts: 707 },
  { name: 'Tower of Angled Passageways', pts: 707 },
  { name: 'Tower of AbyssalChaos Never Clear', pts: 706 },
  { name: 'SLAUGHTERHOUSE STEEPLE', pts: 705 },
  { name: 'Steeple of Extreme Awkwardness', pts: 704 },
  { name: 'Tower of Arduous Architecture', pts: 703 },
  { name: 'Tower of Button Peril', pts: 703 },
  { name: 'Tower of Math.Random', pts: 702 },
  { name: 'Tower of Kemochao Wonderland', pts: 701 },
  { name: 'Tower of Tortuous Oblivion', pts: 700 },
  { name: 'Tower of Cata4', pts: 699 },
  { name: 'Tower of Vibrant Visuals', pts: 699 },
  { name: 'Hecing Egg Facility: A-Sides', pts: 698 },
  { name: 'Tower of Spiralling Fates: Nerf', pts: 697 },
  { name: 'Steeple of KittyEmi\'s Birthday', pts: 696 },
  { name: 'Tower of Challenging Obstacle Anarchy: EToH Edition', pts: 695 },
  { name: 'Citadel of Infinite Void: Super Nerf', pts: 695 },
  { name: 'Tower of Rove Culmination', pts: 694 },
  { name: 'Steeple of Abrasive Whitening', pts: 693 },
  { name: 'Steeple of Wallwalk Difficulty Chart', pts: 692 },
  { name: 'Tower of Divine Purity', pts: 691 },
  { name: 'Edifice of Bluehopping', pts: 691 },
  { name: 'Tower of Hellfire and Brimstone', pts: 690 },
  { name: 'Tower of Light To Dark', pts: 689 },
  { name: 'Tower of Tiny Dome Men', pts: 688 },
  { name: 'GUGGLE OF HUNGO MA YUNGLE', pts: 687 },
  { name: 'Tower of Hectic Corridor', pts: 687 },
  { name: 'mongubopgomogmgommoommomoomoomongumanguguggogogogo', pts: 686 },
  { name: 'Tower of Hard Jumps', pts: 685 },
  { name: 'Tower of Persevering Through the Storm', pts: 684 },
  { name: 'Tower of Obnoxious Times', pts: 684 },
  { name: 'Steeple of Was Really Bored', pts: 683 },
  { name: 'Tower of Tuff', pts: 682 },
  { name: 'Tower of Cold and False Sonder', pts: 681 },
  { name: 'Tower of Outerspatial Fatalities', pts: 680 },
  { name: 'Tower of The Volcano', pts: 680 },
  { name: 'Steeple of Upsetting', pts: 679 },
  { name: 'Tower of Unexplainable Hatred', pts: 678 },
  { name: 'Tower of Truss Mania', pts: 677 },
  { name: 'Tower of I Beat Tidal Wave', pts: 676 },
  { name: 'Tower of Scareyy Night Mares S Oooooo', pts: 676 },
  { name: 'Tower of Difficulty Chart: Buff', pts: 675 },
  { name: 'Edifice of 2号', pts: 674 },
  { name: 'Steeple of Repetitive Tries', pts: 673 },
  { name: 'Tower of Peace and Chaos', pts: 673 },
  { name: 'Tower of Bonbonsteve Never Clear', pts: 672 },
  { name: 'Tower of File Corruption', pts: 671 },
  { name: 'Tower of Utter Wack', pts: 670 },
  { name: 'Tower of Submissive Furry', pts: 670 },
  { name: 'Was A Tower', pts: 669 },
  { name: 'Tower of Fiend Massacre', pts: 668 },
  { name: 'Tower of Ruthless Royal Architecture', pts: 667 },
  { name: 'tour de stylo', pts: 666 },
  { name: 'Bargain Bin Steeples', pts: 666 },
  { name: 'Tower of Absolutely Brutal Failures', pts: 665 },
  { name: 'Tower of Interdimensional Gateway', pts: 664 },
  { name: 'Tower of Final Resolve', pts: 663 },
  { name: 'Steeple of Lyme Disease', pts: 663 },
  { name: 'Tower of Transcendental Mastery: Unnerfed', pts: 662 },
  { name: 'Tower of Devilish Judgements', pts: 661 },
  { name: 'Citadel of Glory', pts: 660 },
  { name: 'Tower of Speedy Cat Deluxe', pts: 659 },
  { name: 'Tower of Blue Devotion', pts: 659 },
  { name: 'Tower of Gelidity', pts: 658 },
  { name: 'Tower of Generation Failure', pts: 657 },
  { name: 'very tall neat', pts: 656 },
  { name: 'Tower of Unconventional Structuring', pts: 656 },
  { name: 'Steeple of Sophisticated Challenges', pts: 655 },
  { name: 'Tower of Skyscraper Scaling', pts: 654 },
  { name: 'Steeple of Severed Light', pts: 653 },
  { name: 'Mercadona Tower', pts: 653 },
  { name: 'Tower of Decaying Serenity', pts: 652 },
  { name: 'Edifice of Denmark Hopping', pts: 651 },
  { name: 'Expensive sc', pts: 650 },
  { name: 'Tower of Monochrome', pts: 650 },
  { name: 'Unnerfed Thanos Citadel', pts: 649 },
  { name: 'Tower of Mushroom: Super Nerf', pts: 648 },
  { name: 'Tower of Wigglecore: Catastrophic', pts: 647 },
  { name: 'Tower of Contrasting Boundaries', pts: 646 },
  { name: 'Tower of Fervent Imperfection', pts: 646 },
  { name: 'Tower of Long Lasting Leukophobia', pts: 645 },
  { name: 'Tower of High Vigilance', pts: 644 },
  { name: 'Tower of It\'s Just a Game', pts: 643 },
  { name: 'Free cata', pts: 643 },
  { name: 'Torre De Difficulty Chart Para Pasarmela', pts: 642 },
  { name: 'Tower of Linear Jank', pts: 641 },
  { name: 'Tower of Movin\' Right Along: Unnerfed', pts: 640 },
  { name: 'Tower of I Am So Done With Everything The World Has Layed Upon Me / Tower of Simple Obstacles', pts: 640 },
  { name: 'Tower of Perplexed Ascent', pts: 639 },
  { name: 'Obelisk of Endless Obby', pts: 638 },
  { name: 'Tower of The Seventh Chromosome', pts: 637 },
  { name: 'Tower of Inferno Galore', pts: 637 },
  { name: 'Tower of Damask Accretion', pts: 636 },
  { name: 'Ikea Tower: Catastrophic', pts: 635 },
  { name: '3008-Tower: Super Nerf', pts: 634 },
  { name: 'Tower of Blind Fate: Nerf', pts: 634 },
  { name: 'Tower of Vindictive Maneuvers', pts: 633 },
  { name: 'Tower of Glory', pts: 632 },
  { name: 'Tower of Burning Hopes', pts: 631 },
  { name: 'Tower of Cataclysmic Layers', pts: 631 },
  { name: 'Tower of Retracing Footsteps', pts: 630 },
  { name: 'Tower of Dead Arctic', pts: 629 },
  { name: 'Tower of Chromatic Inclination: Unnerfed', pts: 628 },
  { name: 'Kaizo Steeple', pts: 628 },
  { name: 'steeple of zvoidrr', pts: 627 },
  { name: 'Steeple of Gilded Rust', pts: 626 },
  { name: 'Tower of Kill or Be Killed', pts: 625 },
  { name: 'Steeple of Lifelessness', pts: 625 },
  { name: 'Steeple of Pine Apple', pts: 624 },
  { name: 'Steeple of Larp', pts: 623 },
  { name: 'Tower of Everlasting Endeavour', pts: 622 },
  { name: 'Citadel of Latest Difficulty Chart', pts: 622 },
  { name: 'Tower of Wayward Venture', pts: 621 },
  { name: 'Steeple of The Troublemaker', pts: 620 },
  { name: 'Tower of Champion\'s Gaming: Revamp', pts: 620 },
  { name: 'Tower of Always Losing', pts: 619 },
  { name: 'Tower of Hitbox and Health Abuse', pts: 618 },
  { name: 'Tower of Micro Management: Unnerfed', pts: 617 },
  { name: 'Tower of Yummy Hotdog', pts: 617 },
  { name: 'Steeple of Final Fantasy', pts: 616 },
  { name: 'Tower of Sprite Manipulation', pts: 615 },
  { name: 'Tower of Narrow Intensification', pts: 614 },
  { name: 'Steeple of Miku Miku Miku', pts: 614 },
  { name: 'Tower of Impending Doom: Super Nerf', pts: 613 },
  { name: 'Tower of Interstellar Division', pts: 612 },
  { name: 'Tower of Augmented Misery', pts: 611 },
  { name: 'Tower of Transcendental Mastery', pts: 611 },
  { name: 'Tower of Crying and Dying', pts: 610 },
  { name: 'Tower of S Pi Ra Ls', pts: 609 },
  { name: 'Tower of Eternal Void: Nerf', pts: 608 },
  { name: 'Steeple of Serek', pts: 608 },
  { name: 'Tower of Champion\'s Gaming', pts: 607 },
  { name: 'Tower of Precise Turns', pts: 606 },
  { name: 'Tower of Perfect Love', pts: 606 },
  { name: 'Steeple of Cheese Burger: Nerf', pts: 605 },
  { name: 'S.T.O.N.E Facility: VIP', pts: 604 },
  { name: 'Tower of Flummin\' Time', pts: 603 },
  { name: 'Tower of Vindication', pts: 603 },
  { name: 'Steeple of Au Revoir', pts: 602 },
  { name: 'Tower of Elongated Runs: Difficulty Chart', pts: 601 },
  { name: 'Hecing Egg Facility: B-Sides', pts: 600 },
  { name: 'Tower of Colossal Crossroad Climbing', pts: 600 },
  { name: 'Liadus Absolute Chomikness', pts: 599 },
  { name: 'Tower of Truss Fuss', pts: 598 },
  { name: 'Tower of Absolute Zero: AHoSCT', pts: 598 },
  { name: 'Steeple of Anathematized Maltreatment', pts: 597 },
  { name: 'Tower of Goofy Trusses', pts: 596 },
  { name: 'Tower of Edgy Name', pts: 595 },
  { name: 'Definitely Not a There Is No God', pts: 595 },
  { name: 'Tower of Zenith', pts: 594 },
  { name: 'Tower of Relentless Altitude', pts: 593 },
  { name: 'Tower of Cyanide', pts: 593 },
  { name: 'Tower of Classical Difficult Spike', pts: 592 },
  { name: 'Tower of Heinous Interference', pts: 591 },
  { name: 'Tower of Mauve Attestations', pts: 590 },
  { name: 'Steeple of Mewing NEAT', pts: 590 },
  { name: 'Tower of Sandy Meat', pts: 589 },
  { name: 'Tower of Eternal Agony', pts: 588 },
  { name: 'Tower of Destructive Peril', pts: 588 },
  { name: 'Tower of Overthinking Life Choices', pts: 587 },
  { name: 'Tower of Spiraling The Frame', pts: 586 },
  { name: 'Maybe I Know U', pts: 585 },
  { name: 'Tower of Mc Donald', pts: 585 },
  { name: 'Höhentranszendenteätherflammenprojektionmanufaktur', pts: 584 },
  { name: 'N.O.O.B. Facility', pts: 583 },
  { name: 'Citadel of The Finale Bro!', pts: 583 },
  { name: 'Tower of Wigglecore: Super Nerf', pts: 582 },
  { name: 'Tower of Hellish Nightmares', pts: 581 },
  { name: 'Tower of I Trosuve', pts: 580 },
  { name: 'Tower of Big Big Footies', pts: 580 },
  { name: 'Denouement Clicker', pts: 579 },
  { name: 'Citadel of Xerically Infuriating Calamity', pts: 578 },
  { name: 'Tower of Layering Torment', pts: 578 },
  { name: 'Tower of Atrocious Truss Catastrophe', pts: 577 },
  { name: 'Tower of Mushy Peas', pts: 576 },
  { name: 'Tower of Despondency', pts: 575 },
  { name: 'Tower of Seclusion', pts: 575 },
  { name: 'You vs Homer Steeple', pts: 574 },
  { name: 'Steeple of Indoor Ordeals', pts: 573 },
  { name: 'Tower of Cliffside Madness: Unnerfed', pts: 573 },
  { name: 'Tower of Hell and Despair', pts: 572 },
  { name: 'Tower of Circuitous Spiral', pts: 571 },
  { name: 'Tower of Isoprophl-X', pts: 570 },
  { name: 'Tower of Light and Dark', pts: 570 },
  { name: 'Tower of Zimble Zamble', pts: 569 },
  { name: 'Tower of Cataclysmic Layers: Classic', pts: 568 },
  { name: 'Steeple of Linear Speedrunning', pts: 568 },
  { name: 'Steeple of Precise Perfection', pts: 567 },
  { name: 'Tower of Oscillating Punishment', pts: 566 },
  { name: 'Tower of Enhanced Persistence', pts: 566 },
  { name: 'Tower of Inception', pts: 565 },
  { name: 'Tower of The Mythic Project', pts: 564 },
  { name: 'Tower of Knead That Fried Chicken, Shake That Fried Chicken', pts: 563 },
  { name: 'Tower of Oblique Agony', pts: 563 },
  { name: 'Tower of Chromatic Inclination: Classic', pts: 562 },
  { name: 'Tower of Wildly Wacky Wonders', pts: 561 },
  { name: 'Tower of Handful Wrap', pts: 561 },
  { name: 'Tower of Hindrancing Vacants', pts: 560 },
  { name: 'Tower of muumitalo', pts: 559 },
  { name: 'Steeple of Prolonged Suffering: Classic', pts: 559 },
  { name: 'Tower of Spiced Up Sand', pts: 558 },
  { name: 'Tower of Bad Design', pts: 557 },
  { name: 'Tower of Perlin Dreams of Greatness', pts: 556 },
  { name: 'Tower of Cringe Rage Madness', pts: 556 },
  { name: 'Tower of Vivid Distress', pts: 555 },
  { name: 'Tower of Sudden Death: Super Nerf', pts: 554 },
  { name: 'Tower of Reflecting Impediments', pts: 554 },
  { name: 'Tower of Frameless Linear Mobility', pts: 553 },
  { name: 'A BARBERSHOP HAIRCUT THAT COSTS A QUARTER', pts: 552 },
  { name: 'Tower of Brazen Brusque', pts: 552 },
  { name: 'Mr Beast', pts: 551 },
  { name: 'Tower of The Roof\'s Pique: Nerf', pts: 550 },
  { name: 'Obelisk of Frightening Nightmares', pts: 550 },
  { name: 'Steeple of Tight Jumps', pts: 549 },
  { name: 'Tower of Melodramatic Esoteric Nebulosity: Classic', pts: 548 },
  { name: 'Tower of Brisk Movement', pts: 548 },
  { name: 'Tower about Wall hopping against Transistor', pts: 547 },
  { name: 'Tower of Critical Corruption', pts: 546 },
  { name: 'Citadel of Walkies', pts: 545 },
  { name: 'Tower of Precariously Positioned Platforms', pts: 545 },
  { name: 'Tower of Uncanny Agony', pts: 544 },
  { name: 'Pillar of Schnobbleclob', pts: 543 },
  { name: 'Tower of Jamba', pts: 543 },
  { name: 'Steeple of Hopouement', pts: 542 },
  { name: 'Tower of Zen Surplus: Super Nerf', pts: 541 },
  { name: 'Tower of Cruel Underestimated Parkour', pts: 541 },
  { name: 'Citadel of 25 Jumps', pts: 540 },
  { name: 'Tower of The Sky, The Success', pts: 539 },
  { name: 'Tower of Tee Hee Time: The Perfect Run', pts: 539 },
  { name: 'Tower of Miserable Journeys', pts: 538 },
  { name: 'Steeple of Griddy', pts: 537 },
  { name: 'Edifice of Loopfail Hell', pts: 537 },
  { name: 'The Salty Spitoon', pts: 536 },
  { name: 'Tower of Polychromatic Zero: Super Buff', pts: 535 },
  { name: 'Tower of Chacina Repentina', pts: 535 },
  { name: 'Tower of Lime Skittle', pts: 534 },
  { name: 'Tower of Falling and Failing: Super Buff', pts: 533 },
  { name: 'Tower of Unrelenting Precipice', pts: 533 },
  { name: 'Wallhop Steeple', pts: 532 },
  { name: 'Steeple of Greek Alphabet Hop', pts: 531 },
  { name: 'Steeple of An Unjust War', pts: 531 },
  { name: 'Tower of Ethereal Punishment', pts: 530 },
  { name: 'Tower of Double Up', pts: 529 },
  { name: 'Tower of Nervous Sweating', pts: 529 },
  { name: 'Tower of Vibrant Purism', pts: 528 },
  { name: 'Tower of Illuminated Vitality', pts: 527 },
  { name: 'Tower of Expected Outcomes', pts: 526 },
  { name: 'Tower of Penultimate Nostalgia', pts: 526 },
  { name: 'Tower of Five Nights at Awsome', pts: 525 },
  { name: 'Pissgang Tower', pts: 524 },
  { name: 'Steeple of Thje Roof', pts: 524 },
  { name: 'Tower of Frightening and Confusing Trials: Difficulty Chart', pts: 523 },
  { name: 'Tower of My Terrible Ribosome', pts: 522 },
  { name: 'Tower of Ubiquitous Zany', pts: 522 },
  { name: 'Certainly A Tower', pts: 521 },
  { name: 'Tower of Water Melon: Nerf', pts: 520 },
  { name: 'Tower of 1lus Centrifuge', pts: 520 },
  { name: 'Wora Tower', pts: 519 },
  { name: 'Steeple of Basic Jumps', pts: 518 },
  { name: 'Tower of Rather Empty Spaces', pts: 518 },
  { name: 'Great Citadel of Wacky Strategy', pts: 517 },
  { name: 'Tower of Quirky Wraps', pts: 516 },
  { name: 'Tower of Hazardous Catastrophe', pts: 516 },
  { name: 'Tower of Slipping Through Reality: Unnerfed', pts: 515 },
  { name: 'Tower of Niflheimr Hvergelmir', pts: 515 },
  { name: 'Tower of Varying Punishment', pts: 514 },
  { name: 'Tower of True Skill: Buff: Unnerfed', pts: 513 },
  { name: 'Tower of Hopeless Hell: Reimagined', pts: 513 },
  { name: 'Tower of Big Momma\'s Twisted Fate', pts: 512 },
  { name: 'Tower of Roughly Rotated Ruin: Classic', pts: 511 },
  { name: 'Tower of Perishing', pts: 511 },
  { name: 'Tower of Exasperantial Tranquility', pts: 510 },
  { name: 'Steeple of Huge Cliff', pts: 509 },
  { name: 'Tower of Melancholic Misery', pts: 509 },
  { name: 'Tower of Duality', pts: 508 },
  { name: 'Tower of Neophobe Adagio', pts: 507 },
  { name: 'Tower of Crawl a Ladder', pts: 507 },
  { name: 'Tower of Lifting Foundations', pts: 506 },
  { name: 'Tower of Journey\'s End', pts: 505 },
  { name: 'Tower of Monochromatic Journey', pts: 505 },
  { name: 'Steeple of Divine', pts: 504 },
  { name: 'Tower of Extravagant Borders', pts: 503 },
  { name: 'Tower of DA BABY', pts: 503 },
  { name: 'Tower of Disintegrating Into Latex', pts: 502 },
  { name: 'Tower of Sleek Keels', pts: 501 },
  { name: 'Steeple of Lika 99', pts: 501 },
  { name: 'Tower of Thinning Layers: Reignited', pts: 500 },
  { name: 'Tower of Obese Charts', pts: 499 },
  { name: 'Tower of Flipping Everything', pts: 499 },
  { name: 'steeple of laser emoji', pts: 498 },
  { name: 'Tower of Ring One', pts: 497 },
  { name: 'Tower of Expanding Layers: Alternate 2 2', pts: 497 },
  { name: 'Tower of Impractical Chances', pts: 496 },
  { name: 'Tower of Hopeless Hell: Difficulty Chart', pts: 496 },
  { name: 'Tower of Lavish Thrones', pts: 495 },
  { name: 'European Wallhop Edifice', pts: 494 },
  { name: 'Tower of Lucas Penteado: Nerf', pts: 494 },
  { name: 'Tower of Internalizing Insanity', pts: 493 },
  { name: 'Tower of Undying Light', pts: 492 },
  { name: 'Tower of Kiwi Fruit', pts: 492 },
  { name: 'Great Citadel of Laptop Splitting: Secret Ending', pts: 491 },
  { name: 'Steeple of Undarlegur Turn', pts: 490 },
  { name: 'Steeple of Sweet As Honey', pts: 490 },
  { name: 'Nokia Tower: Super Nerf', pts: 489 },
  { name: 'Tower of Fragile Salvation', pts: 488 },
  { name: 'Steeple of Wacky Obstructions', pts: 488 },
  { name: 'Tower of Pure Skill: Unnerfed', pts: 487 },
  { name: 'Tower of Vital Vector Venture', pts: 487 },
  { name: 'Tower of Tilted Serenity', pts: 486 },
  { name: 'Citadel of New Difficulty Chart', pts: 485 },
  { name: 'Tower of Soul Crushing Difficulty Chart', pts: 485 },
  { name: 'Tower of Long Stressful Expeditions', pts: 484 },
  { name: 'Tower of This Might Be Linonophobia', pts: 483 },
  { name: 'Tower of Chromatic Density', pts: 483 },
  { name: 'Steeple of Prolonged Suffering', pts: 482 },
  { name: 'Steeple of Hard Wraps', pts: 481 },
  { name: 'Tower of Strategic Techniques', pts: 481 },
  { name: 'Tower of Punishing Paroxysm', pts: 480 },
  { name: 'Tower of Umrah Retail', pts: 480 },
  { name: 'BRAT TOWER', pts: 479 },
  { name: 'Tower of Skibidi Toilet Sigma Gaming', pts: 478 },
  { name: 'Tower of The Mewing Sigma', pts: 478 },
  { name: 'Tower of Short and Fatal Trouble', pts: 477 },
  { name: 'Tower of Atomical Geometry', pts: 476 },
  { name: 'Citadel of Quicktek Clients', pts: 476 },
  { name: 'Obelisk of Jump King', pts: 475 },
  { name: 'Steeple of Wrap God', pts: 474 },
  { name: 'Tower of Spiralling Fates: Super Nerf', pts: 474 },
  { name: 'Painful Obby Tower', pts: 473 },
  { name: 'Tower of Shrinking Layers', pts: 473 },
  { name: 'Tower of Glorious Crown', pts: 472 },
  { name: 'Tower of Screen Punching: Super Buff', pts: 471 },
  { name: 'Steeple of Truss Trauma', pts: 471 },
  { name: 'Tower of Punishing Descent', pts: 470 },
  { name: 'Steeple of Thje Thinning Voidcore Hindrances Chart', pts: 469 },
  { name: 'Steeple of Stop, Wait And Go', pts: 469 },
  { name: 'Never A Tower', pts: 468 },
  { name: 'Steeple of A Purist\'s Nightmare', pts: 468 },
  { name: 'Tower 2', pts: 467 },
  { name: 'Tower of Possible Movement', pts: 466 },
  { name: 'Tower of Bodacious Maneuvering', pts: 466 },
  { name: 'Tower of Googly Jar', pts: 465 },
  { name: '나랏〮말〯ᄊᆞ미〮 듀ᇰ귁〮에〮달아〮', pts: 464 },
  { name: 'Steeple of Death Difficulty', pts: 464 },
  { name: 'Tower of Adventure to Wyoming', pts: 463 },
  { name: 'Tower of Against All Odds', pts: 463 },
  { name: 'Tower of The Opp Block', pts: 462 },
  { name: 'Tower of Dynamic Pulse', pts: 461 },
  { name: 'Tower of Xerotic Inescapable Nervebreak', pts: 461 },
  { name: 'Steeple of Excruciating Strategies', pts: 460 },
  { name: 'Steeple of Unorganized Chaos', pts: 459 },
  { name: 'Tower of Quadratic Infinity', pts: 459 },
  { name: 'Tower of Two Sided Misery', pts: 458 },
  { name: 'Tower of Reoriented Vintage', pts: 458 },
  { name: 'Unnerfed Thanos Tower', pts: 457 },
  { name: 'Tower of Total Liabilities', pts: 456 },
  { name: 'Citadel of Frightening Nightmares', pts: 456 },
  { name: 'Tower of Vacant Hindrances: Nerf', pts: 455 },
  { name: 'Citadel of Impossible Movement', pts: 455 },
  { name: 'Tower of LA \'ROTTE IN CHRISTMASTOWN DE LA SANTA', pts: 454 },
  { name: 'Tower of The Everlasting Vexation', pts: 453 },
  { name: 'Tower of Enigmatic Cliffs', pts: 453 },
  { name: 'Tower of Swift Chacine', pts: 452 },
  { name: 'fever dream 5', pts: 452 },
  { name: 'Что? Почему? Три.', pts: 451 },
  { name: 'Calamity Steeple', pts: 450 },
  { name: 'π846', pts: 450 },
  { name: 'Giant Tower of Frightening Nightmares', pts: 449 },
  { name: 'Creo', pts: 448 },
  { name: 'Tower of Agonizing Demise', pts: 448 },
  { name: 'World\'s Hardest Tower: The Perfect Run', pts: 447 },
  { name: 'Tower of Unstable Ruins', pts: 447 },
  { name: 'Tower of Thje Corner', pts: 446 },
  { name: 'Tower of Micro Management', pts: 445 },
  { name: 'Tower of Ten Is Enough', pts: 445 },
  { name: 'Pillar of Clipping Into Damage', pts: 444 },
  { name: 'Buffed Tower of Very Fast Building', pts: 444 },
  { name: 'Tower of Opposition', pts: 443 },
  { name: 'Tower of Radiant Terror', pts: 442 },
  { name: 'Tower of Plated Thoughts', pts: 442 },
  { name: 'SISTER FINGER SISTER FINGER WHERE ARE YOU', pts: 441 },
  { name: 'Tower of Infinity Trials', pts: 441 },
  { name: 'Tower of Spiralling Fates: Zee\'s Nerf', pts: 440 },
  { name: 'Tower of Roughly Rotated Ruin', pts: 439 },
  { name: 'Tower of Prolific Gardens', pts: 439 },
  { name: 'Tower of Hotel Exploration', pts: 438 },
  { name: 'Tower of Cautious Crossings', pts: 438 },
  { name: 'Tower of Deprivation Purgatory', pts: 437 },
  { name: 'Samuel\'s Platoon', pts: 436 },
  { name: 'I AM TOWER', pts: 436 },
  { name: 'Tower of Frightening Nightmares: Unnerfed', pts: 435 },
  { name: 'Steeple of Hyllesakel', pts: 435 },
  { name: 'Tower of Running Outta Time', pts: 434 },
  { name: 'Tower of Misconception', pts: 433 },
  { name: 'Tower of Quantum Mentality', pts: 433 },
  { name: 'Tower of Alien Radiance', pts: 432 },
  { name: 'Steeple of Fading Astray', pts: 432 },
  { name: 'Steeple of Luke Licorice', pts: 431 },
  { name: 'Tower of Whimsical Flummification', pts: 430 },
  { name: 'Tower of Used To Shop At Aldis', pts: 430 },
  { name: 'Tower of Quantum Quadrivium', pts: 429 },
  { name: 'Steeple of True Exponential Difficulty', pts: 429 },
  { name: 'Steeple of Noob', pts: 428 },
  { name: 'Steeple of Getting Lazier', pts: 427 },
  { name: 'Tower of Was Bored', pts: 427 },
  { name: 'Tower of Insensible Distress', pts: 426 },
  { name: 'Steeple of Spite', pts: 426 },
  { name: 'Tower of True Terrible Misalignments', pts: 425 },
  { name: 'Tower of Convolution Meticulousness', pts: 424 },
  { name: 'Tower of Tranquil Resonance', pts: 424 },
  { name: 'Tower of Architectural Agony', pts: 423 },
  { name: 'Tower of Adversity Tabulation: Unnerfed', pts: 423 },
  { name: 'Tower of Fatal Agitation: Unnerfed', pts: 422 },
  { name: 'Tower of Snaky Ascended Obstacles', pts: 422 },
  { name: 'Tower of Jonah Complex', pts: 421 },
  { name: 'Steeple of TUNG TUNG SAHUR', pts: 420 },
  { name: 'Tower of Ultimate Terrifying Chaos', pts: 420 },
  { name: 'Tower of Weakening Anamneses', pts: 419 },
  { name: 'Tower of Dismaying Gesticulation', pts: 419 },
  { name: 'Tower of Yelling A Whole Lot', pts: 418 },
  { name: 'Steeple of Wallhop, Wallhop and Wallhop', pts: 417 },
  { name: 'Tower of Crying and Dying: Alternate', pts: 417 },
  { name: 'Tower of Divine Wrath', pts: 416 },
  { name: 'SUPREME DAKOTA', pts: 416 },
  { name: 'Tower of Excruciating Anguish: Unnerfed', pts: 415 },
  { name: 'Pillar of Indomitable Encumbrances', pts: 415 },
  { name: 'Patrick Pillar', pts: 414 },
  { name: 'D.I.G.I Facility', pts: 413 },
  { name: 'Tower of Dripping Obstacles', pts: 413 },
  { name: 'Tower of Classiception', pts: 412 },
  { name: 'Spire of Confined Spaces', pts: 412 },
  { name: 'Tower of Phat Clouds', pts: 411 },
  { name: 'Column of Outer Layers', pts: 410 },
  { name: 'Tower of Conraderien JToH', pts: 410 },
  { name: 'Steeple of Precarious and Antiquated Spelunking', pts: 409 },
  { name: 'Tower of The Spiciest Memes 2077', pts: 409 },
  { name: 'Tower of Death, Death, Even More Death.', pts: 408 },
  { name: 'Tower of Pillar Panic', pts: 408 },
  { name: 'Tower of Chaos Mountain', pts: 407 },
  { name: 'Tower of Metropolis Downpour', pts: 406 },
  { name: 'Tower of Slop Chart', pts: 406 },
  { name: 'Tower of Abrasive Playground', pts: 405 },
  { name: 'Not Even a Monolith', pts: 405 },
  { name: 'Tower of Jukecalla\'s Fury', pts: 404 },
  { name: 'Tower of Exquisite Death', pts: 404 },
  { name: 'Tower of Thickening', pts: 403 },
  { name: 'Citadel of Goku', pts: 402 },
  { name: 'Tower of Anarchist Fantasies', pts: 402 },
  { name: 'Steeple of Rainy Day', pts: 401 },
  { name: 'Edifice of Dark Depths', pts: 401 },
  { name: 'Tower of Slope Into Destiny', pts: 400 },
  { name: 'Tower of Leaning Interferences', pts: 400 },
  { name: 'Edifice of Spherical Demise', pts: 399 },
  { name: 'Tower of Silly Wiggle Issues', pts: 398 },
  { name: 'Steeple of Central Tribulation', pts: 398 },
  { name: 'Steeple of Raw Salmon', pts: 397 },
  { name: 'Tower of Fractured Complex', pts: 397 },
  { name: 'Tower of A E ER T Y H F R R', pts: 396 },
  { name: 'Tower of Scattered Challenges', pts: 396 },
  { name: 'Steeple of Xenocritic Parallel', pts: 395 },
  { name: 'Steeple of Ljuset', pts: 395 },
  { name: 'Tower of Extreme Yelling', pts: 394 },
  { name: 'Tower of Creamer Based Coffee', pts: 393 },
  { name: 'Tower of Complexity and Volatility', pts: 393 },
  { name: 'Steeple of 15 Minutes', pts: 392 },
  { name: 'Tower of True Skill: Buff', pts: 392 },
  { name: 'Tower of Not Many Days', pts: 391 },
  { name: 'Steeple of A Ton of Tears', pts: 391 },
  { name: 'Tower of Destructive Phantom', pts: 390 },
  { name: 'Tower of THE GRANDE BRAINROT', pts: 389 },
  { name: 'Steeple of Electromegentiyot Mehira', pts: 389 },
  { name: 'Tower of Two Layered Terror', pts: 388 },
  { name: 'Tower of Sempiternal Disquietude', pts: 388 },
  { name: 'Tower of Hell and Heaven: Classic', pts: 387 },
  { name: 'Tower of Questionable and Gimmicky Gameplay', pts: 387 },
  { name: 'Tower of Zip It', pts: 386 },
  { name: 'Tower of Killbrick Calamity', pts: 386 },
  { name: 'Tower of No Time', pts: 385 },
  { name: 'Tower of Specific and Precise Positioning', pts: 384 },
  { name: 'Tower of I Am Iceman', pts: 384 },
  { name: 'Tower of Troubling Purism', pts: 383 },
  { name: 'Tower of Curator\'s Demise', pts: 383 },
  { name: 'France Edifice', pts: 382 },
  { name: 'Tower of Losing', pts: 382 },
  { name: 'Tower of Claustrophobic Anomalies', pts: 381 },
  { name: 'Tower of Abandoned Pillars', pts: 381 },
  { name: 'Tower of Wierd Sections', pts: 380 },
  { name: 'Tower of Hello Tower', pts: 379 },
  { name: 'Tower of Horizontal Traction', pts: 379 },
  { name: 'Tower of Greenlit Scenery', pts: 378 },
  { name: 'Steeple of Seraphic Energy', pts: 378 },
  { name: 'Tower of Skill Immersion', pts: 377 },
  { name: 'Tower of Painful Poling', pts: 377 },
  { name: 'Truss Tower', pts: 376 },
  { name: 'Polska Wieża', pts: 376 },
  { name: 'Steeple of Purist Anarchy', pts: 375 },
  { name: 'Tower of Purification', pts: 375 },
  { name: 'Tower of Itetsuku Hoshi', pts: 374 },
  { name: '₯ƒʩɲʠʨʦʯ৻ʯʐɠxƴơ', pts: 373 },
  { name: 'touch grass', pts: 373 },
  { name: 'Tower of Think Is Interesting', pts: 372 },
  { name: 'Cylinder of Evil Retribution', pts: 372 },
  { name: 'Tower of Forever Broken Tears', pts: 371 },
  { name: 'Tower of Rising Foundations', pts: 371 },
  { name: 'Tower of Sorrowful Purgatory', pts: 370 },
  { name: 'Tower of Cat Meow Soup Car Parking Zone But I Wanna Go Play a Soccer', pts: 370 },
  { name: 'Edifice of Nets', pts: 369 },
  { name: 'Tower of Ouroboros', pts: 369 },
  { name: 'Tower of The Avalanche', pts: 368 },
  { name: 'Tower of Prestigious Void', pts: 367 },
  { name: 'Tower of Idiotic Ideas', pts: 367 },
  { name: 'Tower of Big Disappointment', pts: 366 },
  { name: 'Tower of Never Ending Hysteria', pts: 366 },
  { name: 'Tower of Kino', pts: 365 },
  { name: 'Tower of Raw Hotdog', pts: 365 },
  { name: 'Tower of Starblaze', pts: 364 },
  { name: 'Tower of Greyscale: Alternate', pts: 364 },
  { name: 'Tower of Intergalactic Facilities', pts: 363 },
  { name: 'Tower of Kidney Krunching', pts: 363 },
  { name: 'Tower of Kaleidoclash', pts: 362 },
  { name: 'Tower of Neural Duality', pts: 362 },
  { name: 'Tower of Frightening Nightmares', pts: 361 },
  { name: 'SWEDEN TOWER', pts: 360 },
  { name: 'Found You Tower: Super Nerf', pts: 360 },
  { name: 'Tower of Devious Purism: Nerf', pts: 359 },
  { name: 'Steeple of Colorless Precision', pts: 359 },
  { name: 'Citadel of Terrifying Beauty', pts: 358 },
  { name: 'World\'s Hardest Tower: Classic', pts: 358 },
  { name: 'Steeple of Denouement: Alternate', pts: 357 },
  { name: 'Escalator To Heaven', pts: 357 },
  { name: 'Tower of Blast Power: Classic', pts: 356 },
  { name: 'Tower of Painful Remembrance', pts: 356 },
  { name: 'Tower of Intricate Precision', pts: 355 },
  { name: 'Tower of High Velocity', pts: 355 },
  { name: 'Great Citadel of The Drive Towards Boredom\'s Limit', pts: 354 },
  { name: 'Unnerfed Huvin ja Hauskanpidon Torni', pts: 354 },
  { name: 'Tower of Everlasting Darkness', pts: 353 },
  { name: 'Tower of Impossible Movement', pts: 353 },
  { name: 'two pints of ice cream', pts: 352 },
  { name: 'Tower of Non Flex Wrap', pts: 351 },
  { name: 'Tower of Peace Breaker', pts: 351 },
  { name: 'Tower of Kreeamy Ohio', pts: 350 },
  { name: 'Tower of Mark Tower', pts: 350 },
  { name: 'Tower of Lus Abutendi', pts: 349 },
  { name: 'Tower of Lunar Expansion', pts: 349 },
  { name: 'MOMMY FINGER MOMMY FINGER WHERE ARE YOU', pts: 348 },
  { name: 'Citadel of Corrupted Madness', pts: 348 },
  { name: 'Tower of Encountering The J', pts: 347 },
  { name: 'Citadel of The Eternal Calamity: Super Nerf', pts: 347 },
  { name: 'Tower of Xerically Infuriating Calamity', pts: 346 },
  { name: 'Tower of Modern Ascension', pts: 346 },
  { name: 'Unnerfed Steeple of Toxic of Failure Acid', pts: 345 },
  { name: 'Edifice of Thje Mango', pts: 345 },
  { name: 'Tower of Mangos In Time', pts: 344 },
  { name: 'Tower of THE Pillar', pts: 344 },
  { name: 'Tower of Stingy Tartu', pts: 343 },
  { name: 'Tower of thej10n Should Beat a Cata', pts: 343 },
  { name: 'Steeple of Irrelevant Movement', pts: 342 },
  { name: 'Tower of Jittering Hands', pts: 342 },
  { name: 'Steeple of Twisted Space Time', pts: 341 },
  { name: 'THE ULTIMATE DESTROYER OF LIMITS', pts: 341 },
  { name: 'Tower of The Upper Limit', pts: 340 },
  { name: 'STEEPLE OF MAYBE A DIFFICULTY CHART WITH WALLHOPS', pts: 340 },
  { name: 'Brazil Tower', pts: 339 },
  { name: 'Steeple of The Legendary Rock', pts: 338 },
  { name: 'Steeple of My Permanent Indecision', pts: 338 },
  { name: 'Tower of Thickening Demise', pts: 337 },
  { name: 'Tower of Screaming and Yeeling', pts: 337 },
  { name: 'Steeple of Consistent Ledge Grabbing', pts: 336 },
  { name: 'Steeple of Polynomial-C', pts: 336 },
  { name: 'Tower of Fractured Memories', pts: 335 },
  { name: 'Citadel of a Direct Approach: B-Side', pts: 335 },
  { name: 'Tower of Adversity Tabulation', pts: 334 },
  { name: 'Steeple of Vanishing Vengeance', pts: 334 },
  { name: 'Tower of Ill Humor', pts: 333 },
  { name: 'Tower of Mean Tasks: GBJ Edition', pts: 333 },
  { name: 'Citadel of Scream Like AAAAAA', pts: 332 },
  { name: 'Tower of STONE Hard Very', pts: 332 },
  { name: 'Tower of Stupiduement', pts: 331 },
  { name: 'Tower of Wiggly Layers', pts: 331 },
  { name: 'Tower of Unfathomable Pain', pts: 330 },
  { name: 'Tower of Elongated Runs: Nerf', pts: 330 },
  { name: 'Steeple of Vivid Violet Rot', pts: 329 },
  { name: 'Citadel of Hopeless Hell', pts: 329 },
  { name: 'Tower of Precise and Accurate Jumps', pts: 328 },
  { name: 'Obby 8', pts: 328 },
  { name: 'Tower of Unraveled Code', pts: 327 },
  { name: 'Tower of Going Against Reality', pts: 327 },
  { name: 'Tower of Panelling Barricades: Classic', pts: 326 },
  { name: 'Tower of Extreme Anxiety', pts: 326 },
  { name: 'Tower of Hateful Reflections', pts: 325 },
  { name: 'Tower of A Lonely Travel', pts: 325 },
  { name: 'Dr Frank Hanchoisses Honarnary PHDs Lair', pts: 324 },
  { name: 'Tower of Weird Core: Super Nerf', pts: 324 },
  { name: 'Steeple of The World\'s Tightest Timer', pts: 323 },
  { name: 'Tower of Austere Designs: Unnerfed', pts: 323 },
  { name: 'Giant Tower of Inception', pts: 322 },
  { name: 'Fortnite Facility', pts: 322 },
  { name: 'Tower of Super Hard', pts: 321 },
  { name: 'Tower of Painful Depression', pts: 321 },
  { name: 'Tower of Simple Jumps: No Jump', pts: 320 },
  { name: 'Tower of Minimal Punishment', pts: 320 },
  { name: 'STEEPLE OF GO GOG OG', pts: 319 },
  { name: 'Tower of Great Perturbation', pts: 319 },
  { name: 'Tower of Externalizing Insanity', pts: 318 },
  { name: 'Steeple of Long Pillars', pts: 318 },
  { name: 'Tower of Lob Expizz', pts: 317 },
  { name: 'Tower of Very Chaotic', pts: 317 },
  { name: 'Tower of Infuriating Progression', pts: 316 },
  { name: 'Tower of Ruined Feeling', pts: 316 },
  { name: 'Tower of Shunning Excursion: Nerf', pts: 315 },
  { name: 'Tower of Some Interesting Gameplay', pts: 315 },
  { name: 'Tower of Colgate', pts: 314 },
  { name: 'Poland Edifice', pts: 314 },
  { name: 'Tower of Hollow Reformations: Absolution', pts: 313 },
  { name: 'Tower of Perebas CumpleAnos', pts: 313 },
  { name: 'Tower of Low Expectations', pts: 312 },
  { name: 'Tower of Hollow Victories', pts: 312 },
  { name: 'Steeple of Lemon Summer', pts: 311 },
  { name: 'Aoharu Tower', pts: 311 },
  { name: 'Tower of Palette Annihilation', pts: 310 },
  { name: 'Tower of Creature Feature', pts: 310 },
  { name: 'Step of Aeterno Dolor', pts: 309 },
  { name: 'Tower of Shattered Resolve', pts: 309 },
  { name: 'Tower of Shattered Distress', pts: 308 },
  { name: 'Tower of Corrupting Consequences', pts: 308 },
  { name: 'Tower of Neon Lights Party', pts: 308 },
  { name: 'Sprite Steeple', pts: 307 },
  { name: 'Rooms of Difficulty Chart', pts: 307 },
  { name: 'Tower of Escaping Lava', pts: 306 },
  { name: 'Tower of Excruciating, Demanding Hurdles', pts: 306 },
  { name: 'Tower of Pro', pts: 305 },
  { name: 'Tower of Strong And Incredible Poop', pts: 305 },
  { name: 'Tower of Ruthless Hidden Quintessence', pts: 304 },
  { name: 'Stupid Crown Tower', pts: 304 },
  { name: 'ZAP\\:XL (Classic) infinity redux II', pts: 303 },
  { name: 'Hollow Citadel of Vivid Sections', pts: 303 },
  { name: 'Tower of q Möller', pts: 302 },
  { name: 'Disco Steeple', pts: 302 },
  { name: 'Watering Hose 0.3 - Romanian Struggles', pts: 301 },
  { name: 'Big Outside Annihilation Tower', pts: 301 },
  { name: 'Tower of Neverending Agony', pts: 300 },
  { name: 'Tower of Shatter Heart and Dreams', pts: 300 },
  { name: 'DADDY FINGER DADDY FINGER WHERE ARE YOU', pts: 299 },
  { name: 'Tower of Champion\'s Road: Nerf', pts: 299 },
  { name: 'Tower of Hasty Hurdles', pts: 298 },
  { name: 'Hysterical Hexad', pts: 298 },
  { name: 'Tower of Carbonell Birthday', pts: 297 },
  { name: 'Tower of soon-ending happiness', pts: 297 },
  { name: 'Tower of Bacon Lettuce Tomato', pts: 296 },
  { name: 'Citadel of Lustrum Mechanica', pts: 296 },
  { name: 'Steeple of Terrifying Chaos', pts: 296 },
  { name: 'Tower 5', pts: 295 },
  { name: 'Tower of Hella Gimmicks', pts: 295 },
  { name: 'Tower of Cliffside Madness', pts: 294 },
  { name: 'butter tower', pts: 294 },
  { name: 'Steeple of Aquamarine', pts: 293 },
  { name: 'Tower of Stress: Super Buff', pts: 293 },
  { name: 'Tower of Industrial Torment', pts: 292 },
  { name: 'Tower of Blind Fate: Super Nerf', pts: 292 },
  { name: 'Vanuatu Edifice', pts: 291 },
  { name: 'Tower of The Avalanche: RT', pts: 291 },
  { name: 'Steeple of Vivid Disturbances', pts: 290 },
  { name: 'Tower of @#1Ω∞', pts: 290 },
  { name: 'Tower of Food Poisoning', pts: 289 },
  { name: 'Tower of Constructed As New', pts: 289 },
  { name: 'Steeple of Obscure Stability', pts: 288 },
  { name: 'Tower of Catastrophic Cataclysm', pts: 288 },
  { name: 'Steeple of I Hate You', pts: 288 },
  { name: 'Tower of Negative Reinforcement', pts: 287 },
  { name: 'Ultra Scary Wallhop Edifice', pts: 287 },
  { name: 'tour de crayon', pts: 286 },
  { name: 'Tower of Furry Jumps', pts: 286 },
  { name: 'Tower of The Night Terror', pts: 285 },
  { name: 'Tower of Unvaried Endurance', pts: 285 },
  { name: 'Tower of Multiple Different Fates', pts: 284 },
  { name: 'Tower of Thinning Layers: Unnerfed', pts: 284 },
  { name: 'Tower of The Third Apple', pts: 283 },
  { name: 'Tower of Inside nor Outside Repeat', pts: 283 },
  { name: 'Tower of Truly Terrible Gameplay and Spikes', pts: 282 },
  { name: 'Tower of Hectic Division', pts: 282 },
  { name: 'Citadel of Vivid Sections', pts: 282 },
  { name: 'Tower²', pts: 281 },
  { name: 'Unnerfed Sakupen Circles', pts: 281 },
  { name: 'Tower of Golden Skies', pts: 280 },
  { name: 'Citadel of Quadruple The Pain', pts: 280 },
  { name: 'Tower of Computer Demolishing', pts: 279 },
  { name: 'World\'s Hardest Tower', pts: 279 },
  { name: 'Tower of Overwhelming Dread', pts: 278 },
  { name: 'Tower of Vermillion Convolutions', pts: 278 },
  { name: 'Tower of Vibrant Solitude', pts: 277 },
  { name: 'Tower of Mayor Humdinger', pts: 277 },
  { name: 'Tower of Frame Destruction', pts: 276 },
  { name: 'Tower of Prolific Gardens: KToN', pts: 276 },
  { name: 'Steeple of Free Real Estate, Egads!', pts: 276 },
  { name: 'Tower of Flagrant Aggravation: Super Nerf', pts: 275 },
  { name: 'Tower of Difficulty Chart: It\\_Near\'s Revamp', pts: 275 },
  { name: 'Tower of Upended Vapor', pts: 274 },
  { name: 'skish5', pts: 274 },
  { name: 'Tower of Forty Five Degrees', pts: 273 },
  { name: 'tower of cold hands: terrifying edition', pts: 273 },
  { name: 'Tower of Astronomically Aimless Annoyances: Unnerfed', pts: 272 },
  { name: 'Tower of Deus Ex Machina', pts: 272 },
  { name: 'Tower of Qwerty Uiop: Super Nerf', pts: 271 },
  { name: 'Tower of Confusion Theory', pts: 271 },
  { name: 'Tower of Bob Never Clear', pts: 271 },
  { name: 'Tower of Rugged Endurance', pts: 270 },
  { name: 'Tower of Factual Expertise', pts: 270 },
  { name: '1 0 0 M Revenge', pts: 269 },
  { name: 'Tower of Untitled Tower', pts: 269 },
  { name: 'Tower of Franchun\'s Lullaby: Classic', pts: 268 },
  { name: 'Steeple of Ultra Rage', pts: 268 },
  { name: 'Tower of Luminescent Tint', pts: 267 },
  { name: 'Tower of Vicious Obstructions', pts: 267 },
  { name: 'Tower of Seeking Extra Enchantments', pts: 267 },
  { name: 'Tower of Increasing Pressure', pts: 266 },
  { name: 'Tower of Ascent to Glory', pts: 266 },
  { name: 'Steeple of Simple Horizons', pts: 265 },
  { name: 'Tower of Hands Flicking', pts: 265 },
  { name: 'Tower of Watering Spiders Challenging You', pts: 264 },
  { name: 'Tower of Prismatic Haze', pts: 264 },
  { name: 'Tower of Augmented Corruption', pts: 263 },
  { name: 'Tower of Eternal Nightmares', pts: 263 },
  { name: 'Tower of Silver', pts: 263 },
  { name: 'Tower of Killbrick Hell', pts: 262 },
  { name: 'Tower of Een Plus Een Gratis Matras Tuberculose', pts: 262 },
  { name: 'Tower of Lament', pts: 261 },
  { name: 'Tower of Fearing The Heights', pts: 261 },
  { name: 'Tower of Unfortunate Conscious Deliberation', pts: 260 },
  { name: 'Tower of Elongated Runs: Zee\'s Nerf', pts: 260 },
  { name: 'Tower of The Flag of Rebellion', pts: 259 },
  { name: 'Tower of David Bazooka', pts: 259 },
  { name: 'SQTETEPELT OF FSIPOLUF§QCVBT5GF9/OQUB /Y9TFUQP V', pts: 259 },
  { name: 'Tower of Crippling Debt', pts: 258 },
  { name: 'Tower of Extra Hard Part', pts: 258 },
  { name: 'Tower of Mass Severe Punishment', pts: 257 },
  { name: 'Steeple of Joon Yorigami', pts: 257 },
  { name: 'Tower of THE FOREBODING WALL', pts: 256 },
  { name: 'Tower of Ridiculously Relentless Rage', pts: 256 },
  { name: 'Luminosity', pts: 256 },
  { name: 'Illusionary Night Tower', pts: 255 },
  { name: 'Tower of Maniacal Obstructions', pts: 255 },
  { name: 'Tower of Ease to Abyss', pts: 254 },
  { name: 'Citadel of Ferocious Heights', pts: 254 },
  { name: 'Citadel of Featherine Augustus Aurora', pts: 253 },
  { name: 'Bernard', pts: 253 },
  { name: 'Tower of Appalling Ramification', pts: 253 },
  { name: 'Marlboro Tower', pts: 252 },
  { name: 'Tower of True Skill: Extreme Difficulty Edition', pts: 252 },
  { name: 'Tower of Mijn Toren', pts: 251 },
  { name: 'Tower of Externalizing Insanity: Difficulty Chart', pts: 251 },
  { name: 'Tower of Pure Skill', pts: 250 },
  { name: 'Tower of Blast Power', pts: 250 },
  { name: 'Tower of Wandering Nostalgia', pts: 250 },
  { name: 'Lietuvos Bokštas', pts: 249 },
  { name: 'Tower of Cardiac Arrest', pts: 249 },
  { name: 'Tower of Difficulty Chart: Accurate Edition', pts: 248 },
  { name: 'Tower of Crying In Your Sleep', pts: 248 },
  { name: 'Tower of Severe Trauma', pts: 247 },
  { name: 'Tower of Parallel Heights', pts: 247 },
  { name: 'Tower of Fee Fi Fo Fum', pts: 247 },
  { name: 'Tower of Cruel Memories', pts: 246 },
  { name: 'Tower of Compromised Fear: Super Nerf', pts: 246 },
  { name: 'Tower of Transcendence', pts: 245 },
  { name: 'Tower of Glitching and Breaking', pts: 245 },
  { name: 'Tower of Amazing Skill', pts: 244 },
  { name: 'Tower of Understanding the Medium', pts: 244 },
  { name: 'Citadel of This Man Buff Man', pts: 244 },
  { name: 'Tower of TOILET Ladder Flicks', pts: 243 },
  { name: 'Tower of Shifting Laminations', pts: 243 },
  { name: 'Tower of Hellish Void', pts: 242 },
  { name: 'Tower of Neon Nightmares', pts: 242 },
  { name: 'Red Green Blue Edifice', pts: 241 },
  { name: 'Leaning Tower of Lire', pts: 241 },
  { name: 'Tower of Akougomai Crossings', pts: 241 },
  { name: 'Citadel of Void', pts: 240 },
  { name: 'Cylinder of Pure Pain', pts: 240 },
  { name: 'Tower of Pure Malarkey: The Perfect Run', pts: 239 },
  { name: 'Tower of Game Mn', pts: 239 },
  { name: 'Steeple of Legalizing Nuclear Bombs', pts: 239 },
  { name: 'Steeple of Shrimp and Shell Shindig', pts: 238 },
  { name: 'Tower of Obdurate Conception', pts: 238 },
  { name: 'Obelisk of Thinning Layers', pts: 237 },
  { name: 'Tower of Raspy Cascades', pts: 237 },
  { name: 'Abstract Collab Steeple', pts: 236 },
  { name: 'Tower of Having a Heart Attack', pts: 236 },
  { name: 'steeple of holybrilliant emoji', pts: 236 },
  { name: 'Tower of Sol Luna', pts: 235 },
  { name: 'Giant Tower of Mind Breaking', pts: 235 },
  { name: 'Tower of Bland Gimmicks', pts: 234 },
  { name: 'Slobelisk of Silver Slopes', pts: 234 },
  { name: 'Tower of Goofy Stickers', pts: 234 },
  { name: 'Tower of Polymer Greg Egg', pts: 233 },
  { name: 'Tower of Painful Memories', pts: 233 },
  { name: 'Tower of Glazing On Purism', pts: 232 },
  { name: 'Tower of Table Flipping: Buff', pts: 232 },
  { name: 'Tower of Excruciating Anguish', pts: 232 },
  { name: 'Tower of Underlying Grief', pts: 231 },
  { name: 'Steeple of My Strange Little Existence', pts: 231 },
  { name: 'Denouement Tower', pts: 230 },
  { name: 'Tower of Infuriating Agoraphobia Adventures', pts: 230 },
  { name: 'Tower of Callous Desolation', pts: 230 },
  { name: 'Tower of Manifestation', pts: 229 },
  { name: 'Tower of Uttermost Antagonism', pts: 229 },
  { name: 'Tower of The Dripping Amalgam', pts: 228 },
  { name: 'Target Tower: TC Edition', pts: 228 },
  { name: 'Tower of Variation Into Turmoil', pts: 227 },
  { name: 'Tower of Gaming Expression', pts: 227 },
  { name: 'π265', pts: 227 },
  { name: 'Tower of No Confidence Left', pts: 226 },
  { name: 'Tower of Exuberant Encumbrances', pts: 226 },
  { name: 'Tower of Heavy Remorse', pts: 225 },
  { name: 'Tower of Hope', pts: 225 },
  { name: 'Tower of Cold Hands: Super Buff', pts: 225 },
  { name: 'Tower of Cyan Craze', pts: 224 },
  { name: 'Tower of Technological Procedure', pts: 224 },
  { name: 'Steeple of Secret Box', pts: 223 },
  { name: 'Tower of Trusst Issues', pts: 223 },
  { name: 'Tower of Looksmaxxing', pts: 223 },
  { name: 'Tower of Tears of Joy', pts: 222 },
  { name: 'Meta Tower', pts: 222 },
  { name: 'Tower of Doltish Ninny Dunce', pts: 221 },
  { name: 'Tower of Deep End Displeasure', pts: 221 },
  { name: 'Edifice of Akidasher Fun', pts: 221 },
  { name: 'Tower of Nocturnal Paradise', pts: 220 },
  { name: 'Tower of Mean Obstacles', pts: 220 },
  { name: 'Tower of The Black Goop', pts: 219 },
  { name: 'Tower of Centigrade', pts: 219 },
  { name: 'Tower of Ascent Into Exile', pts: 219 },
  { name: 'Tower of Skit Vs Oliver', pts: 218 },
  { name: 'Steeple of Humble Time', pts: 218 },
  { name: 'Citadel of Difficulty Chart: Revamp', pts: 217 },
  { name: 'Steeple of Unyielding Obsession', pts: 217 },
  { name: 'Tower of Prolonged Runs', pts: 217 },
  { name: 'Tower of Perpetual Speed Required', pts: 216 },
  { name: 'Tower of Wood Fortress', pts: 216 },
  { name: 'Tower of Cascading Uncertainty', pts: 216 },
  { name: 'Tower of Jolly Layers', pts: 215 },
  { name: 'Tower of Inverted Hope', pts: 215 },
  { name: 'Citadel of Muy Scary', pts: 214 },
  { name: 'Steeple of Trusting Techniques', pts: 214 },
  { name: 'ярик кент стипл', pts: 214 },
  { name: 'Tower of Fine Line', pts: 213 },
  { name: 'Steeple of Nyn☆', pts: 213 },
  { name: 'Tower of Frightening Nightmares: Difficulty Chart', pts: 212 },
  { name: 'Not Even In Ruins', pts: 212 },
  { name: 'Steeple of Green Apple', pts: 212 },
  { name: 'Tower of Nyctophobia Confrontation', pts: 211 },
  { name: 'Tower of Virulent Basilisk', pts: 211 },
  { name: 'Great Citadel of Ring 3: The Perfect Run', pts: 210 },
  { name: 'Tower of U N', pts: 210 },
  { name: 'Tower of Pervasive Torment', pts: 210 },
  { name: 'Tower of Dry Hands', pts: 209 },
  { name: 'Tower of Divine Mastery', pts: 209 },
  { name: 'Tower of Lowest Act', pts: 209 },
  { name: 'Citadel of The All-Seeing', pts: 208 },
  { name: 'Tower of Stupidio Namio', pts: 208 },
  { name: 'Citadel of Utter Confusion: Alternate', pts: 207 },
  { name: 'Tower of Familiar Encounters', pts: 207 },
  { name: 'Tower of Horridly Atrocious Architecture', pts: 207 },
  { name: 'Tower of Room Destruction', pts: 206 },
  { name: 'Tower of Wet Socks', pts: 206 },
  { name: 'Tower of Infuriating Supplement', pts: 205 },
  { name: 'Tower of Demented Oddities', pts: 205 },
  { name: 'Tower of Quarrelsome Quarters', pts: 205 },
  { name: 'Tower of Googoo Gaagaa', pts: 204 },
  { name: 'Tower of Pure Dopamine', pts: 204 },
  { name: 'Tower of Strategic Mechanics', pts: 204 },
  { name: 'Tower of Inverse Difficulty Chart', pts: 203 },
  { name: 'Tower of Minimalist\'s Delight', pts: 203 },
  { name: 'Tower of Runes', pts: 202 },
  { name: 'Tower of Quickly Increasing Anger', pts: 202 },
  { name: 'Tower of Keyboard Yeeting: Super Buff', pts: 202 },
  { name: 'Tower of Intense Increasing Pressure', pts: 201 },
  { name: 'Tower of Spatial Awareness: Super Nerf', pts: 201 },
  { name: 'Tower of Skill and Patience', pts: 201 },
  { name: 'Tower of Taking The Complete Micky', pts: 200 },
  { name: '100 Thousand Trials', pts: 200 },
  { name: 'Steeple of Rampant Hourly Fabrication', pts: 199 },
  { name: 'Tower of Grand Demise', pts: 199 },
  { name: 'Citadel of Condescendingly Convulsive Climbing', pts: 199 },
  { name: 'Tower of Wicked Fortress', pts: 198 },
  { name: 'Tower of Shattered Penality', pts: 198 },
  { name: 'Tower of Quaint Quadricity', pts: 198 },
  { name: 'Tower of Last Destination', pts: 197 },
  { name: 'Tower of The Wall Gameplay', pts: 197 },
  { name: 'Tower of Fast Paced Descent', pts: 196 },
  { name: 'Steeple of Heart Failure', pts: 196 },
  { name: 'Citadel of Icy Blizzards', pts: 196 },
  { name: 'Tower of Ceaseless Shizzling', pts: 195 },
  { name: 'Tower of Converged Agitation', pts: 195 },
  { name: 'Edifice of This Edifice Has Nothing To Do With Undead Corporation', pts: 195 },
  { name: 'Steeple of Growing Despair', pts: 194 },
  { name: 'Tower of Short Purist Lover', pts: 194 },
  { name: 'Citadel of Frightening and Confusing Trials', pts: 194 },
  { name: 'Tower of Long Lasting Leukophobia: Revamp', pts: 193 },
  { name: 'Tower of Hop on Pop', pts: 193 },
  { name: 'Even A Tower', pts: 192 },
  { name: 'Tower of Terrifying Beauty', pts: 192 },
  { name: 'SEPOL OF GAAA ZELPLUS VS BO VS X Y Z', pts: 192 },
  { name: 'Steeple of Quick Kebab', pts: 191 },
  { name: 'Tower of Extreme Devious Eternity', pts: 191 },
  { name: 'Tower of Quemeful Quoin', pts: 191 },
  { name: 'Tower of Smiley\'s Hotel', pts: 190 },
  { name: 'Tower of Subspatial Convergence', pts: 190 },
  { name: 'Tower of The Detrimental Dexterity', pts: 190 },
  { name: 'Tower of Abysmal Wrath', pts: 189 },
  { name: 'Steeple of Glitched Memories', pts: 189 },
  { name: 'Tower of Expanding Layers: Alternate 2', pts: 188 },
  { name: 'Tower of Dividing and Confusing Frames', pts: 188 },
  { name: 'Steeple of Sculk', pts: 188 },
  { name: 'Tower of The Jump Junkyard', pts: 187 },
  { name: 'Untitled Tower', pts: 187 },
  { name: 'Tower of Kindest Pineapple', pts: 187 },
  { name: 'Tower of Uncanny Unpleasantness', pts: 186 },
  { name: 'Tower of Frantic Voyages', pts: 186 },
  { name: 'Tower of Tech n Wraps', pts: 186 },
  { name: 'Tower of Torturous Suffering', pts: 185 },
  { name: 'Steeple of Decaying Depths', pts: 185 },
  { name: 'Tower of The Giant Peas', pts: 184 },
  { name: 'Tower of Agonizing Spinners', pts: 184 },
  { name: 'Tower of Suffering Outside', pts: 184 },
  { name: 'Tower of Hopeless Hell', pts: 183 },
  { name: 'Tower of Unknown Shadows', pts: 183 },
  { name: 'Steeple of Screams From The Void', pts: 183 },
  { name: 'Tower of Difficulty Chud', pts: 182 },
  { name: 'Tower of Spoiled Milk', pts: 182 },
  { name: 'Tower of Kakorraphiaphobia', pts: 182 },
  { name: 'Tower of Bon Voyage', pts: 181 },
  { name: 'Tower of Instant Regret', pts: 181 },
  { name: 'Giant Steeple of Obrulaqualis', pts: 181 },
  { name: 'Tower of Unfair Punishment', pts: 180 },
  { name: 'Citadel of Difficulty Chart', pts: 180 },
  { name: 'Citadel of Mouse Bamming Oblivion', pts: 180 },
  { name: 'Tower of Empty Obstruction', pts: 179 },
  { name: 'Steeple of Snowstorm', pts: 179 },
  { name: 'Steeple of Gilly Basilly', pts: 178 },
  { name: 'Tower of Difficulty Chart 2.63', pts: 178 },
  { name: 'Tower of Blueish Monolith', pts: 178 },
  { name: 'Tower of Pestiferous Line', pts: 177 },
  { name: 'Tower of Billy Bob', pts: 177 },
  { name: 'Jumbo Tower: Super Nerf', pts: 177 },
  { name: 'Tower of Inerihl Katahv Qainrey', pts: 176 },
  { name: 'Tower of Dangerous Pillar Adventuring', pts: 176 },
  { name: 'tower of true skill: btool buff', pts: 176 },
  { name: 'Tower of Dreamstate', pts: 175 },
  { name: 'Tower of Horrific Tribulation', pts: 175 },
  { name: 'Tower of Cramping on The Couch', pts: 175 },
  { name: 'Thanos Obelisk', pts: 174 },
  { name: 'Tower of Recurring Agony', pts: 174 },
  { name: 'Steeple of Hope and Delight', pts: 174 },
  { name: 'Edifice of Disky Nitrite', pts: 173 },
  { name: 'Tower of Cold Tears', pts: 173 },
  { name: 'Uber Hard Tower / Tower of The Dawg', pts: 173 },
  { name: 'Tower of Pink Neon Bricks', pts: 172 },
  { name: 'Tower of Quadruple The Pain', pts: 172 },
  { name: 'Tower of Achromatic Nihility', pts: 172 },
  { name: 'Tower of Trouble Sleeping', pts: 171 },
  { name: 'Tower of Truss Hell', pts: 171 },
  { name: 'Tower of Legia Warszawa', pts: 171 },
  { name: 'Tower of Forget Me Not', pts: 170 },
  { name: 'Tower of Popus Gl6bus', pts: 170 },
  { name: 'Tower of Cluttered Cash Catastrophe', pts: 170 },
  { name: 'Tower of g Möller', pts: 169 },
  { name: 'Steeple of The Wall\'s Wrath', pts: 169 },
  { name: 'Tower of Stereo Madness', pts: 169 },
  { name: 'Tower of Big Risks', pts: 168 },
  { name: 'Tower of Merciless Treatment', pts: 168 },
  { name: 'Tower of Unusual Cacophony', pts: 167 },
  { name: 'Tower of Going Crazy', pts: 167 },
  { name: 'Edifice of Super Cool and Epic Gameplay', pts: 167 },
  { name: 'Steeple of Kocmoc But I Got Tired And Added Filler W PRC', pts: 166 },
  { name: 'Tower of Feel The Electric', pts: 166 },
  { name: 'Tower of Fatal Endeavours', pts: 166 },
  { name: 'Steeple of Thinning Mucus', pts: 165 },
  { name: 'Tower of 2 AM', pts: 165 },
  { name: 'Tower of Constant Color Fusion', pts: 165 },
  { name: 'Tower of An Iron Will', pts: 164 },
  { name: 'Tower of Pure Torment', pts: 164 },
  { name: 'Tower of Radio Vibe', pts: 164 },
  { name: 'Original Tower of Dark and Creepy', pts: 163 },
  { name: 'Dimension Steeple', pts: 163 },
  { name: 'Alalal Steeple', pts: 163 },
  { name: 'Tower of Falling Doom', pts: 162 },
  { name: 'Tower of Ultima Exitium', pts: 162 },
  { name: 'Tower of Devious Emptiness', pts: 162 },
  { name: 'Tower of Cruel Punishment: NToH Nerf', pts: 162 },
  { name: 'Tower of Occurring Ramifications', pts: 161 },
  { name: 'Edifice of One Jam One Jar', pts: 161 },
  { name: 'Edifice of Dirty Doctor Pepper', pts: 161 },
  { name: 'Great Citadel of Walking Across The Sahara', pts: 160 },
  { name: 'Steeple of Sparks Will Fly', pts: 160 },
  { name: 'Tower of Blue Zenith', pts: 160 },
  { name: 'Tower of Wolf\'s Roarness', pts: 159 },
  { name: 'Tower of Exponential Difficulty', pts: 159 },
  { name: 'Tower of D D D D D D D D Drop The Bass', pts: 159 },
  { name: 'Citadel of Goku V4', pts: 158 },
  { name: 'Tower Exists, Tower Obsolete', pts: 158 },
  { name: 'of Joca Monday 4 Void', pts: 158 },
  { name: 'Tower of Haery Hanchovies', pts: 157 },
  { name: 'Steeple of Tombs & Torture', pts: 157 },
  { name: 'Tower of Deceiving Failure', pts: 157 },
  { name: 'Steeple of Expecting Something Better: Buff', pts: 156 },
  { name: 'Cylinder of Irregular Movement', pts: 156 },
  { name: 'Citadel of Curved Ascent', pts: 156 },
  { name: 'Thor Tower', pts: 155 },
  { name: 'Tower of Festive Affairs', pts: 155 },
  { name: 'Tower of Incepted Difficulty Chart', pts: 155 },
  { name: 'Tower of Killbrick Hell: Classic', pts: 154 },
  { name: 'Tower of Difficulty Chart: Purist', pts: 154 },
  { name: 'Tower of Blissful Unconsciousness', pts: 154 },
  { name: 'Tower of Raw, Unfiltered Skill', pts: 153 },
  { name: 'Tower of Jolly Situations', pts: 153 },
  { name: 'fifteen', pts: 153 },
  { name: 'Tower of Zany Zigzags', pts: 152 },
  { name: 'Tower of Pure Torment: Classic', pts: 152 },
  { name: 'Steeple of Cube Tower', pts: 152 },
  { name: 'Tower of Zooming By', pts: 151 },
  { name: 'Tower of Stigmatism', pts: 151 },
  { name: 'Tower of Paradise: Super Nerf', pts: 151 },
  { name: 'Tower of Astronomically Aimless Annoyances', pts: 151 },
  { name: 'Tower of The Doom Wall', pts: 150 },
  { name: 'Tower of Mutilation', pts: 150 },
  { name: 'Tower of Claustrophobic Fates', pts: 150 },
  { name: 'Tower of Creamzicle Chart', pts: 149 },
  { name: 'Tower of Kesulitan Mendaki', pts: 149 },
  { name: 'Tower of Ten Floors Challenge: True Mode', pts: 149 },
  { name: 'Tower of Difficulty Chart: Difficulty Chart', pts: 148 },
  { name: 'Steeple of Corruption', pts: 148 },
  { name: 'Tower of Mental Breakdown', pts: 148 },
  { name: 'Tower of Extreme Anguish', pts: 147 },
  { name: 'Tower of Brimstone Flames', pts: 147 },
  { name: 'Room of Ghoulish Necromancy', pts: 147 },
  { name: 'Tower of Volition', pts: 146 },
  { name: 'Tower of Nightmarish Dreams', pts: 146 },
  { name: 'Tower of Super Ultimate', pts: 146 },
  { name: 'Steeple of Death and Despair', pts: 146 },
  { name: 'Citadel of Glitching and Healing: The Perfect Run', pts: 145 },
  { name: 'Tower of Under The Limit', pts: 145 },
  { name: 'Edifice of Flicking and Clicking', pts: 145 },
  { name: 'π323', pts: 144 },
  { name: 'Tower of Wacky, Symmetrical Confinements', pts: 144 },
  { name: 'Tower of Rain on My World: Ascension', pts: 144 },
  { name: 'Tower of Wackiness', pts: 143 },
  { name: 'Tower of Circuits and Lasers', pts: 143 },
  { name: 'Citadel of Deterioration', pts: 143 },
  { name: 'Fort of Baffling Anomalies', pts: 142 },
  { name: 'Tower of Corrupted Nightmares Nightmares Scary', pts: 142 },
  { name: 'Tower of Artificial Joy', pts: 142 },
  { name: 'Tower of Fumbling Frenzy', pts: 142 },
  { name: 'Tower of Malnourished Vindication', pts: 141 },
  { name: 'Tower of Umbratic Complexity: Secret Ending', pts: 141 },
  { name: 'Tower of Pig Rabbit Crab Thinning Layers', pts: 141 },
  { name: 'π314', pts: 140 },
  { name: 'Tower Infinity', pts: 140 },
  { name: 'Tower of No More Teleporters', pts: 140 },
  { name: 'Steeple of Exponential Difficulty', pts: 139 },
  { name: 'Tower of Classical Torment', pts: 139 },
  { name: 'Citadel of Skyward Ascension', pts: 139 },
  { name: 'Citadel of Trauma Stickout', pts: 139 },
  { name: 'Tower of Tabasco Sauce', pts: 138 },
  { name: 'Tower of The Lumen Sage', pts: 138 },
  { name: 'Windows Tower', pts: 138 },
  { name: 'Tower of Paint Thinner', pts: 137 },
  { name: 'Tower of Increasing Heart Rates', pts: 137 },
  { name: 'Tower of Senseless Internal Pain', pts: 137 },
  { name: 'Steeple of While Discussing Pneumonoultramicroscopicsilicovolcanoconiosis, The Hippopotomonstrosesquipedaliophobic Scholar Accidentally Mispronounced Supercalifragilisticexpialidocious During An Electroencephalographically Monitored Honorificabilitudinitatibus Symposium On Thyroparathyroidectomized Microorganisms.', pts: 136 },
  { name: 'Tower of Vigorous Xany', pts: 136 },
  { name: 'Tower of Ceiling Quiz', pts: 136 },
  { name: 'Pumpkin Steeple', pts: 136 },
  { name: 'Tower of Virulent Quiescence', pts: 135 },
  { name: 'Tower of Austere Designs', pts: 135 },
  { name: 'Tower of Panelling Barricades', pts: 135 },
  { name: 'DEVIOUS TOWER 1', pts: 134 },
  { name: 'Tower of Shunning Excursion: Super Nerf', pts: 134 },
  { name: 'Tower of Doing The', pts: 134 },
  { name: 'Tower of Hollow Augmentations', pts: 133 },
  { name: 'Steeple of Untitled Griddy', pts: 133 },
  { name: 'Tower of Gameplay Test', pts: 133 },
  { name: 'Kuwait Edifice', pts: 133 },
  { name: 'Steeple of Miss Pink Elf', pts: 132 },
  { name: 'Citadel of Quirky Inconveniences', pts: 132 },
  { name: 'Tower of Impossible Movement: Difficulty Chart', pts: 132 },
  { name: 'Tower of Octophobia', pts: 131 },
  { name: 'Tower of Bitter Melancholy', pts: 131 },
  { name: 'Steeple of Surging Trove', pts: 131 },
  { name: 'Steeple of Agra: Extreme', pts: 131 },
  { name: 'Tower of josh', pts: 130 },
  { name: 'Impossible Obby Tower', pts: 130 },
  { name: 'Tower of The Average TC Empty Tower', pts: 130 },
  { name: 'a mini tower that is slightly bigger, and has 54+61 floors of nibbling on purple apples', pts: 129 },
  { name: 'Tower of Vindictive Maneuvers: Nerf', pts: 129 },
  { name: 'Tower of Real Lies', pts: 129 },
  { name: 'Tower of Perpendicular Layers', pts: 129 },
  { name: 'Tower of Raw Skill Required', pts: 128 },
  { name: 'Tower of Softlock Heaven', pts: 128 },
  { name: 'Tower of Kratic', pts: 128 },
  { name: 'Citadel of Utter Confusion', pts: 127 },
  { name: 'Tower of TSCR Exclusive', pts: 127 },
  { name: 'Tower of Noobs Road', pts: 127 },
  { name: 'Tower of Darkest Nebulae', pts: 127 },
  { name: 'Tower of Space Resizing', pts: 126 },
  { name: 'Tower of Hecc and Back', pts: 126 },
  { name: 'Citadel of Infinity Gauntlet', pts: 126 },
  { name: 'Mali Edifice', pts: 125 },
  { name: 'Steeple of Zero Reinforced Frameworks', pts: 125 },
  { name: 'Great Citadel of Laptop Splitting', pts: 125 },
  { name: 'Tower of Complex and Idiotic Gameplay', pts: 125 },
  { name: 'Tower 1', pts: 124 },
  { name: 'Tower of Laser Bean', pts: 124 },
  { name: 'Tower of Perpendicular Angle', pts: 124 },
  { name: 'Tower of My Uncanny World', pts: 123 },
  { name: 'Tower of Dwindling Veneer', pts: 123 },
  { name: 'Salt Pillar of Increasification Demotivizationizer', pts: 123 },
  { name: 'Dakotan Steeple', pts: 123 },
  { name: 'Tower of Revolving Peril', pts: 122 },
  { name: 'Not Thanos Tower', pts: 122 },
  { name: 'Steeple of Languorousness', pts: 122 },
  { name: 'Tower of Irritating Structures', pts: 122 },
  { name: 'Tower of Clean Glass', pts: 121 },
  { name: 'Tower of Baleful Impedes', pts: 121 },
  { name: 'Edifice of Wigglecore Without Wiggles and Zeronium', pts: 121 },
  { name: 'Tower of Repeated Frame Action', pts: 120 },
  { name: 'Tower of Yuxian Kongjian', pts: 120 },
  { name: 'Steeple of Bridging The Gap', pts: 120 },
  { name: 'Tower of Chromatic Chaos', pts: 120 },
  { name: 'Tower of Super Sweet Scaling', pts: 119 },
  { name: 'Steeple of Celestial Serenity', pts: 119 },
  { name: 'Tower of the Planets', pts: 119 },
  { name: 'Baldi Citadel', pts: 118 },
  { name: 'Buffed Tower of Analysis Explorer', pts: 118 },
  { name: 'Tower of Laying Thinners', pts: 118 },
  { name: 'Tower of Yap Yap Yap', pts: 118 },
  { name: 'Tower of The Perfect Run', pts: 117 },
  { name: 'Tower of Impossible Expectations: Buff', pts: 117 },
  { name: 'Tower of Void Storm', pts: 117 },
  { name: 'Tower of Bloodthirsty Kenos', pts: 117 },
  { name: 'America Ediface', pts: 116 },
  { name: 'Tower of Orang Hamsterball', pts: 116 },
  { name: 'Tower of Little Shlant', pts: 116 },
  { name: 'Steeple of Insanity: ZHT', pts: 116 },
  { name: 'Steeple of Regular Shmegular', pts: 115 },
  { name: 'Tower of Extreme Demon Escalation', pts: 115 },
  { name: 'Steeple of Blood Clot: Deathless', pts: 115 },
  { name: 'Tower of Just Do It', pts: 114 },
  { name: 'Tower of Bodacious Blinding Blue Purism', pts: 114 },
  { name: 'Steeple of Muscle Atrophy', pts: 114 },
  { name: 'Tower of Obscene Outside Chaos', pts: 114 },
  { name: 'Tower of Elite Mechanics', pts: 113 },
  { name: 'Tower of Frameless Works', pts: 113 },
  { name: 'Tower of Luminescent Windows', pts: 113 },
  { name: 'tower of supercalifragilistic expialidocious', pts: 113 },
  { name: 'Steeple of Expecting Something Better: Least Parts', pts: 112 },
  { name: 'Steeple of No Safety Available', pts: 112 },
  { name: 'Tower of GBJ', pts: 112 },
  { name: 'Fort of Twisted Torsion', pts: 112 },
  { name: 'Tower of Glu Glu Glu', pts: 111 },
  { name: 'Steeple of Obeliscolychny', pts: 111 },
  { name: 'Tower of Sideways Strides', pts: 111 },
  { name: 'Tower of The DiCaprio Story', pts: 110 },
  { name: 'Tower of Zilly Xany', pts: 110 },
  { name: 'Tower of Geometrical Purgation', pts: 110 },
  { name: 'Chinese House Expansion Tips', pts: 110 },
  { name: 'Tower of A Simple Time: Least Parts', pts: 109 },
  { name: 'Tower of Mass Severe Punishment: Revamp', pts: 109 },
  { name: 'Tower of Menacing Jank', pts: 109 },
  { name: 'Steeple of Against All Authority', pts: 109 },
  { name: 'Tower of Elongated Runs: NToH Nerf', pts: 108 },
  { name: 'Giant Steeple of Towering Pillars', pts: 108 },
  { name: 'Tower of Gateway Protocol', pts: 108 },
  { name: 'Tower of Ruptured Division', pts: 108 },
  { name: 'Tower of Scoliosis', pts: 107 },
  { name: 'Citadel of Triangle Difficulty Chart', pts: 107 },
  { name: 'Raybe A Tower', pts: 107 },
  { name: 'Tower of Goofy Antics', pts: 107 },
  { name: 'Tower of Was Bored: Place Version', pts: 106 },
  { name: 'Tower of Systematically Malfunctioned', pts: 106 },
  { name: '⅏⅏⅏⅏⅏⅏⅏⅏⅏ edifice', pts: 106 },
  { name: 'Tower of Rushing and Dashing', pts: 106 },
  { name: 'Tower of Questionable Structural Integrity', pts: 105 },
  { name: 'Citadel of Extreme Confusion', pts: 105 },
  { name: 'Tower of Extremely Troublesome Obstacle Hell', pts: 105 },
  { name: 'Enlightened Pathways', pts: 105 },
  { name: 'Steeple of Denouement', pts: 104 },
  { name: 'The Challenge Tower', pts: 104 },
  { name: 'Tower of Yonder Wisterias', pts: 104 },
  { name: 'B̉illy', pts: 104 },
  { name: 'Steeple of Mentally Dying', pts: 103 },
  { name: 'Tower of Breaking the Core', pts: 103 },
  { name: 'Tower of Contraposition', pts: 103 },
  { name: 'Tower of Ascending Luminosity', pts: 103 },
  { name: 'Steeple of Jank Smoothie', pts: 102 },
  { name: 'Steeple of True Insanity', pts: 102 },
  { name: 'Tower of Hijacked Voltage: Hard Mode', pts: 102 },
  { name: 'Tower of Quiescent Excruciations', pts: 102 },
  { name: 'Tower of Leap Impairment', pts: 101 },
  { name: 'Tower of Jayingeration Ultimates 12', pts: 101 },
  { name: 'Tower of Painful Purism', pts: 101 },
  { name: 'Tower of Spatial Ruins', pts: 101 },
  { name: 'Tower of Both Sides', pts: 100 },
  { name: 'Tower of Arduous Agility', pts: 100 },
  { name: 'Tower of Linear Slop', pts: 100 },
  { name: 'Pillar of Button Abundance', pts: 100 },
  { name: 'Tower of 40 Obstacles To Victory', pts: 99 },
  { name: 'Denouement Tower: Classic', pts: 99 },
  { name: 'THE Tower of Hell', pts: 99 },
  { name: 'Mini Obelisk of Mini Obelisk', pts: 99 },
  { name: 'Tower of Short French Fries', pts: 98 },
  { name: 'Steeple of A Down', pts: 98 },
  { name: 'Tower of Chocolate Milk', pts: 98 },
  { name: 'Tower of Kyoi Tekina', pts: 98 },
  { name: 'Tower of Astral Eclipse', pts: 97 },
  { name: 'Tower of Reckless Noble Construction', pts: 97 },
  { name: 'Conservative Steeple', pts: 97 },
  { name: 'Tower of Crawling Literally Apples Unreally Stressing The Really Obbyful Phobias Hitting Our Best Intense Apples', pts: 97 },
  { name: 'Tower of Obskurer Einfallsreichtum', pts: 96 },
  { name: 'Tower of Thinning Slop', pts: 96 },
  { name: 'Citadel of Varying Difficulties: Classic', pts: 96 },
  { name: 'Citadel of Accepting Defeat', pts: 96 },
  { name: 'Tower of Confronting The Z', pts: 95 },
  { name: 'Tower of Rage: Buff', pts: 95 },
  { name: 'Tower of Frightening and Confusing Trials', pts: 95 },
  { name: 'Tower of Phonk Is Incredible', pts: 95 },
  { name: 'Tower of Ultra Forgiveness', pts: 94 },
  { name: 'Steeple of Runes', pts: 94 },
  { name: 'Edifice of Frightening Obligations', pts: 94 },
  { name: 'Tower of Joobly Chart: Classic', pts: 94 },
  { name: 'Tower of Confusingly Curved Pole', pts: 94 },
  { name: 'Tower of Contemporary Simplicity', pts: 93 },
  { name: 'Tower of Northern Winds', pts: 93 },
  { name: 'Tower of Race To The Crown', pts: 93 },
  { name: 'Steeple of Vicious Obstructions', pts: 93 },
  { name: 'Tower of One Line', pts: 92 },
  { name: 'Tower of Reverse Difficulty Chart', pts: 92 },
  { name: 'Steeple of Extremity', pts: 92 },
  { name: 'Citadel of The Hippopotamus Wikipedia', pts: 92 },
  { name: 'Tower of The Walls Have Eyes', pts: 91 },
  { name: 'Tower of Sitting Down', pts: 91 },
  { name: 'Tower of Greedy Spare', pts: 91 },
  { name: 'Tower of lildly lacky londers', pts: 91 },
  { name: 'Tower of George Washington Never Clear: Freedom Mode', pts: 90 },
  { name: 'Tower of Btools Difficulty Chart Obby', pts: 90 },
  { name: 'Tower of Crazy Agony Real Treacherous Insanity', pts: 90 },
  { name: 'Tower of The Homefinder: Super Nerf', pts: 90 },
  { name: 'Tower of Heaven', pts: 90 },
  { name: 'Citadel of Whimsical Ways', pts: 89 },
  { name: 'Citadel of Mind Breaking', pts: 89 },
  { name: 'Tower of Tee Hee Time', pts: 89 },
  { name: 'Tower of Potbelly Pop', pts: 89 },
  { name: 'Steeple of \'); DROP TABLE Towers;--', pts: 88 },
  { name: 'Tower of Agonizing Structures', pts: 88 },
  { name: 'Tower of Horrendous Nuisances', pts: 88 },
  { name: 'Tower of Challenging Obstacle Anarchy: Zee\'s Nerf', pts: 88 },
  { name: 'Tower of Shattered Dreams: Buff', pts: 88 },
  { name: 'Citadel of Impending Risk', pts: 87 },
  { name: 'Tower of Spinning Nightmare', pts: 87 },
  { name: 'Tower of Spiral Obligations', pts: 87 },
  { name: 'Citadel of Infinity Gauntlet: Alternate', pts: 87 },
  { name: 'Tower of Difficulty Tower X', pts: 86 },
  { name: 'Tower of Pain, Agitation and Frustration', pts: 86 },
  { name: 'Tower of Elongated Runs: Insane', pts: 86 },
  { name: 'Tower of BIG IGB GIB FAIL AILF ILFA LFAI: Unnerfed', pts: 86 },
  { name: 'Steeple of Painful Fails', pts: 85 },
  { name: 'Tower of Cruel Punishment: Super Nerf', pts: 85 },
  { name: 'Tower of Conveyor Alignment Visible', pts: 85 },
  { name: 'Tower of Round N\' Round', pts: 85 },
  { name: 'Citadel of Difficulty Chart: Classic RToA', pts: 85 },
  { name: 'Tower of Selling Your Soul', pts: 84 },
  { name: 'Tower of Elaborate Solutions', pts: 84 },
  { name: 'Steeple of Hazardous Xesturgy', pts: 84 },
  { name: 'Tower of Curved Ascent: Requiem', pts: 84 },
  { name: 'Hello, My Name is Steeple', pts: 83 },
  { name: 'Edifice of Toothpaste', pts: 83 },
  { name: 'Steeple of Insanity', pts: 83 },
  { name: 'Great Citadel of Ring 2', pts: 83 },
  { name: 'Tower of Linked Insanity', pts: 83 },
  { name: 'Thanos Citadel', pts: 82 },
  { name: 'Tower of Humpty Dummy', pts: 82 },
  { name: 'Great Citadel of Lesbian', pts: 82 },
  { name: 'Tower of Velleity Skills', pts: 82 },
  { name: 'Tower of Sunflower Seeds', pts: 82 },
  { name: 'Tower of Descent Into Depths', pts: 81 },
  { name: 'Citadel of Forever Resetting', pts: 81 },
  { name: 'Steeple of Irritating Unbalance', pts: 81 },
  { name: 'Tower of Arctic Hollows', pts: 81 },
  { name: 'Tower of Glitching and Healing: Difficulty Chart', pts: 80 },
  { name: 'Tower of Cerulean Jeopardy', pts: 80 },
  { name: 'Tower Tower Tower Tower', pts: 80 },
  { name: 'Tower of Claustrophobia', pts: 80 },
  { name: 'Tower of Spiritual Rise: Super Nerf', pts: 80 },
  { name: 'Tower of Thinning Layers: Modern Revamp: Unnerfed', pts: 79 },
  { name: 'Tower of The Tutorial', pts: 79 },
  { name: 'Tower of Distorted Nightmares', pts: 79 },
  { name: 'Tower of Soul Crushing Escalation', pts: 79 },
  { name: 'Tower of Korean Style', pts: 78 },
  { name: 'Tower of Pure Evil', pts: 78 },
  { name: 'Ikea Tower: Super Nerf', pts: 78 },
  { name: 'Tower Point Five', pts: 78 },
  { name: 'Tower of Augmenting Purism', pts: 78 },
  { name: 'Mesmerizer Tower: Super Nerf', pts: 77 },
  { name: 'Tower of Quirky Structuring', pts: 77 },
  { name: 'Citadel of Unsettling Heights', pts: 77 },
  { name: 'Not Even Fun', pts: 77 },
  { name: 'Tower of Really Very Artificial Inspiration', pts: 77 },
  { name: 'Tower of Spin to Win', pts: 76 },
  { name: 'Tower of Saliva³', pts: 76 },
  { name: 'Steeple of Broken Hearts', pts: 76 },
  { name: 'Tower of Practice Skill', pts: 76 },
  { name: 'Tower of Eles Tar Jus', pts: 76 },
  { name: 'Citadel of Insanity', pts: 75 },
  { name: 'Tower of Nonsense', pts: 75 },
  { name: 'Tower of Malefic Nuisances: Super Nerf', pts: 75 },
  { name: 'Tower of Rough Endoplasmic Reticulum', pts: 75 },
  { name: 'Steeple of 16 Minutes', pts: 75 },
  { name: 'purism', pts: 74 },
  { name: 'The Lesser Centurial: nerfde', pts: 74 },
  { name: 'Steeple of Oblivious Obligations', pts: 74 },
  { name: 'Tower of Annoyingly Simple Trials: Difficulty Chart', pts: 74 },
  { name: 'Tower of Mirrored Hecc: Super Buff', pts: 73 },
  { name: 'Tower of Seal The Deal', pts: 73 },
  { name: 'Tower of Wildly Spreaded Dangers', pts: 73 },
  { name: 'Citadel of High Sky Rise', pts: 73 },
  { name: 'Unnerfed Steeple of Final One', pts: 73 },
  { name: 'Tower of Acu Nuance', pts: 72 },
  { name: 'Steeple of Miscolorful Agony', pts: 72 },
  { name: 'Obelisk of Impossible Expectations: The Perfect Run', pts: 72 },
  { name: 'Tower of Code Red', pts: 72 },
  { name: 'Tower of Tedious and Stodgy', pts: 72 },
  { name: 'Tower of Descent Into Exile: Super Nerf', pts: 71 },
  { name: 'Cylinder of Irritating Frontiers', pts: 71 },
  { name: 'Steeple of Heavenly Dreams', pts: 71 },
  { name: 'Tower of Deep Darkness: Buff', pts: 71 },
  { name: 'Tower of Elysium: Super Buff', pts: 71 },
  { name: 'Tower of Industrial Revolution', pts: 70 },
  { name: 't', pts: 70 },
  { name: 'Tower of Sour Grapes', pts: 70 },
  { name: 'Tower of Empty Inside', pts: 70 },
  { name: 'Radio Tower: Super Nerf', pts: 70 },
  { name: 'crusty sock', pts: 69 },
  { name: 'Tower of Futile Retribution', pts: 69 },
  { name: 'Steeple of Fervent Festivities', pts: 69 },
  { name: 'Tower of Questions: Buffed', pts: 69 },
  { name: 'Tower of Swift Annihilation', pts: 69 },
  { name: 'Tower of Purist Obscurity', pts: 68 },
  { name: 'Tower of Combustion', pts: 68 },
  { name: 'Tower of Climbing Wall', pts: 68 },
  { name: 'Tower of Blissful Ignorance', pts: 68 },
  { name: 'Tower of Aligned Deliration', pts: 68 },
  { name: 'Tower and Peanuts Tower and Prunes', pts: 68 },
  { name: 'Steeple of Herniated Disks', pts: 67 },
  { name: 'Tower of Neon Orange', pts: 67 },
  { name: 'Earl Sweatshirt\'s Forest', pts: 67 },
  { name: 'Tower of Abstract Galaxies', pts: 67 },
  { name: 'Thanos Tower: Classic', pts: 67 },
  { name: 'Tower of Otherworldly Expertise: Super Nerf', pts: 66 },
  { name: 'Spire of Water Bottle', pts: 66 },
  { name: 'Tower of Reverse Layers', pts: 66 },
  { name: 'Tower of Mom', pts: 66 },
  { name: 'Tower of Shifting Sizes', pts: 66 },
  { name: 'Tower of Matcha Labubu', pts: 65 },
  { name: 'Tower of Terrifying Sorcery', pts: 65 },
  { name: 'Tower of Cancer', pts: 65 },
  { name: 'Tower of Scaling Simple Intensity', pts: 65 },
  { name: 'Tower of Deadly Pitfalls', pts: 65 },
  { name: 'Tower of Pure Skill: Classic', pts: 64 },
  { name: 'Tower of Claustrophobic Nightmares', pts: 64 },
  { name: 'Tower of Scattered Rooms', pts: 64 },
  { name: 'Crossfire Steeple', pts: 64 },
  { name: 'Tower of Warranted Obstructions', pts: 64 },
  { name: 'Power Tower', pts: 64 },
  { name: 'Tower of Seeking Unused Techniques', pts: 63 },
  { name: 'Tower of Rain on My World', pts: 63 },
  { name: 'Tower of Virulent Sojourn: Super Nerf', pts: 63 },
  { name: 'c', pts: 63 },
  { name: 'Steeple of Trusscapes', pts: 63 },
  { name: 'Tower of Why So Serious?', pts: 62 },
  { name: 'Tower of Oceanic Views', pts: 62 },
  { name: 'Steeple of Idiosyncratic Ruins', pts: 62 },
  { name: 'Steeple of Lodge', pts: 62 },
  { name: 'Tower of Delicate Quiescence', pts: 62 },
  { name: 'Tower of Two To One', pts: 61 },
  { name: 'Tower of Polychromatic Zero', pts: 61 },
  { name: 'Tower of Jump Incapacity', pts: 61 },
  { name: 'Steeple of Suspension', pts: 61 },
  { name: 'Steeple of Super Cutesy Climb', pts: 61 },
  { name: 'Tower of Pure Skill: solsrngguy97', pts: 61 },
  { name: 'Tower of Elongated Runs: Myth\'s Nerf', pts: 60 },
  { name: 'Tower of Minimal Part Usage', pts: 60 },
  { name: 'Tower of Prompt Purism', pts: 60 },
  { name: 'Tower of Thje', pts: 60 },
  { name: 'Tower of Ultimate Painful: Classic', pts: 60 },
  { name: 'Tower of Rushed Collaborative Efforts', pts: 59 },
  { name: 'Tower of Never Winning', pts: 59 },
  { name: 'Tower of One Hour Difficulty Chart', pts: 59 },
  { name: 'Tower of #####', pts: 59 },
  { name: 'Tower of Pure Unfun', pts: 59 },
  { name: 'Tower of Bitter Sweet Suffering', pts: 59 },
  { name: 'Sushi Steeple', pts: 58 },
  { name: 'Tower of Chandler Softwood', pts: 58 },
  { name: 'Tower of Pure Suffering', pts: 58 },
  { name: 'Tower of The Fog Is Coming', pts: 58 },
  { name: 'Steeple of Gears Locked Up Because It\'s Cold', pts: 58 },
  { name: 'Steeple of The Fracture', pts: 58 },
  { name: 'Tower of Purist Hell', pts: 57 },
  { name: 'Steeple of An Ascension', pts: 57 },
  { name: 'Tower of Awesome Stuff', pts: 57 },
  { name: 'Tower of \\:SteamHappy:', pts: 57 },
  { name: 'Tower of Quality', pts: 57 },
  { name: 'Tower of Vicious Punishment', pts: 56 },
  { name: 'Tower of Luscious Greenery', pts: 56 },
  { name: 'Citadel of Papaya Journey', pts: 56 },
  { name: 'Tower of Accepting Defeat', pts: 56 },
  { name: 'Tower of Kančia Išorėje', pts: 56 },
  { name: 'Tower of Un Ca: Super Nerf', pts: 56 },
  { name: 'vved\\_12', pts: 55 },
  { name: 'Steeple of Suspiciously Large Right Arm: Super Nerf', pts: 55 },
  { name: 'Steeple of Zehn Kekse', pts: 55 },
  { name: 'Tower of Thinning Sanity', pts: 55 },
  { name: 'Edifice of Technological Retrospective', pts: 55 },
  { name: 'Tower of Inevitable Failure: Difficulty Chart', pts: 55 },
  { name: 'Tower of Underlying Grief: Nerfdate', pts: 54 },
  { name: 'Tower of Onerous Purification', pts: 54 },
  { name: 'Tower of Vicious Interludes', pts: 54 },
  { name: 'Tower of Skill Test', pts: 54 },
  { name: 'Tower of Intense Situations', pts: 54 },
  { name: 'Tower of Greatening Compaction: The Perfect Run', pts: 54 },
  { name: 'Tower of Bursting Veins', pts: 53 },
  { name: 'Tower of The Greenish Ascent', pts: 53 },
  { name: 'Steeple of Truss Difficulty Chart', pts: 53 },
  { name: 'Tower of Neverending Madness', pts: 53 },
  { name: 'Tower of Scarred, Infernal Calamity', pts: 53 },
  { name: 'Tower of The Corner Ascension', pts: 53 },
  { name: 'Tower of Pits and Death', pts: 52 },
  { name: 'Tower of Unending Bamboozles', pts: 52 },
  { name: 'Tower of Back and Forth Maneuvers', pts: 52 },
  { name: 'Tower of Thje Baseline', pts: 52 },
  { name: 'Steeple of Aspiration', pts: 52 },
  { name: 'Citadel of Difficulty Chart: Classic', pts: 52 },
  { name: 'Steeple of Broccoli', pts: 51 },
  { name: 'Tower of Sat On The Toe', pts: 51 },
  { name: 'Tower of Nice Tasks', pts: 51 },
  { name: 'collabidel', pts: 51 },
  { name: 'Nacre of Plum Chewing', pts: 51 },
  { name: 'Tower of Die Kurve', pts: 51 },
  { name: 'Column of Anemic Pandemonium', pts: 50 },
  { name: 'Tower of Plaque Etiquette', pts: 50 },
  { name: 'Tower of Performing Hideous Exercises', pts: 50 },
  { name: 'Tower of Killjoys: Super Buff', pts: 50 },
  { name: 'Tower of Abandonment', pts: 50 },
  { name: 'Tower of Au Revoir, Sunset', pts: 50 },
  { name: 'Tower of Narrowing Levels', pts: 49 },
  { name: 'popsicle', pts: 49 },
  { name: 'Tower of Abstract Duality', pts: 49 },
  { name: 'Tower of Impossibility', pts: 49 },
  { name: 'Tower of Awfulnis', pts: 49 },
  { name: 'Tower of Treacherous Parkour', pts: 49 },
  { name: 'Tower of annoyingox Never Clear', pts: 48 },
  { name: 'Tower of Eye of Tranquil Tempest', pts: 48 },
  { name: 'Tower of Rheumatoid Arthritis', pts: 48 },
  { name: 'Tower of Destructive Uprise', pts: 48 },
  { name: 'Tower of Twenty Nineteen', pts: 48 },
  { name: 'Tower of Perplexity Tabulation', pts: 48 },
  { name: 'Tower of Eternal Purple', pts: 48 },
  { name: 'Tower of Extremely Empty Entire', pts: 47 },
  { name: 'tomo pi palisa suli', pts: 47 },
  { name: 'Tower of Modern Art', pts: 47 },
  { name: 'Tower of XMas Ascension', pts: 47 },
  { name: 'Tower of Established Grievances', pts: 47 },
  { name: 'Tower of Rotten Burger', pts: 47 },
  { name: 'Obelisk of Peril', pts: 46 },
  { name: 'Steeple of Wandering Willow', pts: 46 },
  { name: 'Edifice of Frame Switch', pts: 46 },
  { name: 'Miguel O\' Towa', pts: 46 },
  { name: 'Patch Edifice', pts: 46 },
  { name: 'Tower of Decayed Silo', pts: 46 },
  { name: 'Tower of Death Conglomerate', pts: 46 },
  { name: 'Tower of Linonophobia: Super Buff', pts: 45 },
  { name: 'Tower of Witnessing The Q', pts: 45 },
  { name: 'Tower of Vast Scarcity', pts: 45 },
  { name: 'Tower of Aesthetic Urbanization', pts: 45 },
  { name: 'Tower of Movin\' Right Along', pts: 45 },
  { name: 'Tower of Carpal Tunnels', pts: 45 },
  { name: 'Steeple of Greatful Memories', pts: 44 },
  { name: 'Tower of I Like Infernos', pts: 44 },
  { name: 'Steeple of Celestial Fade', pts: 44 },
  { name: 'Tower of Needed Dexterity', pts: 44 },
  { name: 'Tower of Elegant Purism', pts: 44 },
  { name: 'Tower of Colon 3', pts: 44 },
  { name: 'Tower of Minimum Wage', pts: 44 },
  { name: 'Tower of Hollow Reformations', pts: 43 },
  { name: 'Tower of Icy Blizzards', pts: 43 },
  { name: 'Tower of Slowly Giving Up', pts: 43 },
  { name: 'Mastery of Tanuki Half Stud', pts: 43 },
  { name: 'Tower of Astral Fusion: Unnerfed', pts: 43 },
  { name: 'Steeple of Dying Inside', pts: 43 },
  { name: 'Tower of Mild Destruction', pts: 43 },
  { name: 'Tower of Big Wave Beach', pts: 42 },
  { name: 'Tower of Scintillating Microscale', pts: 42 },
  { name: 'nineteen characters', pts: 42 },
  { name: 'Tower of Desperation', pts: 42 },
  { name: 'Tower of Brain Damage', pts: 42 },
  { name: 'Tower of Unforgiving Obstacles', pts: 42 },
  { name: 'Tower of Outlined Outsides', pts: 42 },
  { name: 'Tower of Nonsensical Slope Trekking', pts: 41 },
  { name: 'Tower of Undeify', pts: 41 },
  { name: 'Tower of Cataclysmic Layers: Super Nerf', pts: 41 },
  { name: 'Citadel of Thinning Layers', pts: 41 },
  { name: 'Steeple of Truss Issues', pts: 41 },
  { name: 'Tower of Small Window of Opportunity', pts: 41 },
  { name: 'Steeple of Pillaring Fusion', pts: 41 },
  { name: 'Tower of Deviating Levels', pts: 40 },
  { name: 'Tower of Tower One', pts: 40 },
  { name: 'Tower of Help Me, Please', pts: 40 },
  { name: 'Tower of Bad Purism', pts: 40 },
  { name: 'Steeple of Head Hitter Hell', pts: 40 },
  { name: 'Tower of Curved Madness', pts: 40 },
  { name: 'Tower of Increasing Paroxysm', pts: 40 },
  { name: 'S.T.O.N.E Facility: Super Nerf', pts: 39 },
  { name: 'Tower of Ultimate Painful', pts: 39 },
  { name: 'Steeple of Kirill and Arseniu are Twins', pts: 39 },
  { name: 'Dark Steeple', pts: 39 },
  { name: 'Stunning Tower of Fantasy: Hard Mode', pts: 39 },
  { name: 'Tower of Pillaring Heights', pts: 39 },
  { name: 'Tower of Pushin o\' Plenty', pts: 39 },
  { name: 'Tower of Extremely Secluding Emptiness', pts: 38 },
  { name: 'Tower of Jpeg Jaffa Caked Carti', pts: 38 },
  { name: 'Tower of Enraging Advancement', pts: 38 },
  { name: 'Tower of Slipping Through Reality', pts: 38 },
  { name: 'Citadel of Greenery', pts: 38 },
  { name: 'Tower of Ruined Rotated Platforms', pts: 38 },
  { name: 'Steeple of Mat Recycling', pts: 38 },
  { name: 'Tower of Random Thoughts', pts: 37 },
  { name: 'Tower of 20 Obstacles To Victory', pts: 37 },
  { name: 'Steeple of Aurora Skies', pts: 37 },
  { name: 'Tower of Lonesome Sorrow', pts: 37 },
  { name: 'Paul\'s Mayhem', pts: 37 },
  { name: 'Tower of Unfortunate Outcomes', pts: 37 },
  { name: 'Tower of Silly String', pts: 37 },
  { name: 'Tower of Bruh Moments', pts: 37 },
  { name: 'Tower of Hellish Rouge', pts: 36 },
  { name: 'Citadel of Safety Equals False', pts: 36 },
  { name: 'Doubtably a Wonderful Greatness', pts: 36 },
  { name: 'Tower of System Solarize', pts: 36 },
  { name: 'Edifice of You\'re Ou\'re U\'re Re E Good Ood Od D', pts: 36 },
  { name: 'Tower of Crimson Synthesize', pts: 36 },
  { name: 'Tower of Viridescent Severity', pts: 36 },
  { name: 'Tower of Hopeless Defeat', pts: 35 },
  { name: 'Tower of I Don\'t Know', pts: 35 },
  { name: 'Tower of Just Hard Gameplay', pts: 35 },
  { name: 'Tower of Confusion', pts: 35 },
  { name: 'Tower of Abrasive Ascent', pts: 35 },
  { name: 'Tower of Pig Rabbit Crab True Skill', pts: 35 },
  { name: 'Citadel of Double Trouble: Alternate', pts: 35 },
  { name: 'Gengetsu Tower', pts: 35 },
  { name: 'Tower of Calvary Venturing', pts: 34 },
  { name: 'Tower of Ascent From Hellfire', pts: 34 },
  { name: 'Steeple of Surmounting', pts: 34 },
  { name: 'Tower of Thinning Layers: Difficulty Chart MToDC', pts: 34 },
  { name: 'Problematic Steeple', pts: 34 },
  { name: 'Steeple of Fateful Gloominess', pts: 34 },
  { name: 'Steeple of Cortical Granules', pts: 34 },
  { name: 'Tower of Thin Mints: Super Nerf', pts: 34 },
  { name: 'Obelisk of Wacky Strategy', pts: 33 },
  { name: 'Tower of Contrasting Themes', pts: 33 },
  { name: 'Steeple of Fearing Down', pts: 33 },
  { name: 'Tower of Going Crazy: Original', pts: 33 },
  { name: 'Tower of Thinning Confusion', pts: 33 },
  { name: 'Tower of Mustard Bag', pts: 33 },
  { name: 'Daniel\'s Tower of Hecc', pts: 33 },
  { name: 'Tower of Voidless Maelstrom', pts: 33 },
  { name: 'Tower of Vivid Sections', pts: 32 },
  { name: 'Tower of Funny Dog', pts: 32 },
  { name: 'Tower of Minimal Obstacles', pts: 32 },
  { name: 'Tower of Raging Ronalds Red Revenge', pts: 32 },
  { name: 'tower of idk what name', pts: 32 },
  { name: 'Tower of Cosmic Radiance', pts: 32 },
  { name: 'Fort of Negligence', pts: 32 },
  { name: 'Tower of Short N\' Bitter', pts: 32 },
  { name: 'Citadel of Wacky Strategy: Unnerfed', pts: 31 },
  { name: 'Tower of Flipping Over and Over', pts: 31 },
  { name: 'Tower of Air Pollution', pts: 31 },
  { name: 'Citadel of Linear Death', pts: 31 },
  { name: 'Steeple of Cheese Burger: Super Nerf', pts: 31 },
  { name: 'Tower of Speed Buildin\' It', pts: 31 },
  { name: 'Steeple of Blind Ate', pts: 31 },
  { name: 'Column of Arduous Ascension', pts: 31 },
  { name: 'Spire of Extreme Deadliness', pts: 30 },
  { name: 'Tower of Purified Illusions', pts: 30 },
  { name: 'Citadel of Satan\'s Wrath', pts: 30 },
  { name: 'Tower of Massive Regret', pts: 30 },
  { name: 'Tower of Abysmal Inferno', pts: 30 },
  { name: 'Citadel of Indeterminate Turf', pts: 30 },
  { name: 'Citadel of Varying Difficulties', pts: 30 },
  { name: 'Steeple of Lika 97', pts: 30 },
  { name: 'Edifice of Rocket', pts: 30 },
  { name: 'Tower of Killjoys: Least Parts', pts: 29 },
  { name: 'Edifice of Epressiond', pts: 29 },
  { name: 'Tower of Being Outdoors: Classic', pts: 29 },
  { name: 'Giant Steeple of Huge Pain', pts: 29 },
  { name: 'Tower of Thinning Ascent', pts: 29 },
  { name: 'Tower of True Confusion', pts: 29 },
  { name: 'Tower of Spiralling Fates: Insane', pts: 29 },
  { name: 'Tower of Great Gimmicky Gizmos', pts: 29 },
  { name: 'Tower of Cognition', pts: 29 },
  { name: 'Tower of Vague Perceptions', pts: 28 },
  { name: 'Tower of Recurring Obstacles', pts: 28 },
  { name: 'tower of FRIGHTENING', pts: 28 },
  { name: 'Cylinder of Pure Insanity', pts: 28 },
  { name: 'Tower of The Mighty Corner', pts: 28 },
  { name: 'Tower of Ridicoulous Jumps', pts: 28 },
  { name: 'Tower of Partying Partying Partying', pts: 28 },
  { name: 'Tower of Quick Purism', pts: 28 },
  { name: 'Tower of Umbratic Complexity', pts: 27 },
  { name: 'Tower of Toilet Clogging', pts: 27 },
  { name: 'Steeple of Big Justice', pts: 27 },
  { name: 'WAwesome of Wrappies', pts: 27 },
  { name: 'Tower of Insane Jumps', pts: 27 },
  { name: 'Tower of Unreliable Jumps', pts: 27 },
  { name: 'Tower of Scaling The Depths', pts: 27 },
  { name: 'Tower of Quick Overcoming', pts: 27 },
  { name: 'Tower of Hecc: Super Buff', pts: 27 },
  { name: 'Tower of Never Xenial Traveling', pts: 26 },
  { name: 'Tower of Vice Versa', pts: 26 },
  { name: 'Tower of Increasing Intensity', pts: 26 },
  { name: 'Tower of Traps and Techniques', pts: 26 },
  { name: 'pen pineapple apple pen', pts: 26 },
  { name: 'Citadel of Sovereignty', pts: 26 },
  { name: 'Steeple of Zero Chance', pts: 26 },
  { name: 'Great Citadel of Familiarity', pts: 26 },
  { name: 'Steeple of The Milennial Pause', pts: 26 },
  { name: 'Tower of True Torment', pts: 26 },
  { name: 'Pillar of Difficulty Chart', pts: 25 },
  { name: 'Tower of Virtuous Ascendance', pts: 25 },
  { name: 'Tower of Low Fever', pts: 25 },
  { name: 'Tower of Stat Boosts', pts: 25 },
  { name: 'Tower of Escaping Lava: Classic', pts: 25 },
  { name: 'Edifice of Kawaii Corners', pts: 25 },
  { name: 'Tower of Quadrilaterals: Insane', pts: 25 },
  { name: 'Steeple of HUgE HUngEr', pts: 25 },
  { name: 'Tower of Work It', pts: 25 },
  { name: 'Tower of Overcoming Hatred: Super Buff', pts: 24 },
  { name: 'Baldi Tower', pts: 24 },
  { name: 'Tower of Boreal Disarray', pts: 24 },
  { name: 'Tower of Functions Inverse', pts: 24 },
  { name: 'Edifice of Awaiting Morning', pts: 24 },
  { name: 'Buffed Tinkercad Obbies', pts: 24 },
  { name: 'Tower of Total Organ Failure', pts: 24 },
  { name: 'Tower of 282979', pts: 24 },
  { name: 'Tower of Forsaken Fragments', pts: 24 },
  { name: 'Tower of What The Flip', pts: 24 },
  { name: 'Tower of Celestial Infrastructure', pts: 23 },
  { name: 'Steeple of I Forgot Where To Go', pts: 23 },
  { name: 'Steeple For Multitaskers', pts: 23 },
  { name: 'Tower of Erebus', pts: 23 },
  { name: 'Tower of Nothing Nothing', pts: 23 },
  { name: 'Tower of Oblique Annoyances', pts: 23 },
  { name: 'Tower of Thje Ecotism: Super Nerf', pts: 23 },
  { name: 'Steeple of Side Eye Scaling', pts: 23 },
  { name: 'Steeple of Unwrapping Rituals', pts: 23 },
  { name: 'Thanos Tower: Fan Revamp', pts: 23 },
  { name: 'Tower of The Didgeridoo', pts: 22 },
  { name: 'Steeple of Plif Taskje', pts: 22 },
  { name: 'Tax Evasion Tower', pts: 22 },
  { name: 'Tower of Paying Them Bills', pts: 22 },
  { name: 'Tower of Thinning Layers: Difficulty Chart', pts: 22 },
  { name: 'Steeple of Winds Away', pts: 22 },
  { name: 'Tower of Quaint Activations', pts: 22 },
  { name: 'Tower of Familiar Deaths', pts: 22 },
  { name: 'Tower of Big Toe', pts: 22 },
  { name: 'Meeple of Muppet Making', pts: 22 },
  { name: 'Tower of Increasing Claustrophobia', pts: 21 },
  { name: 'Tower of Realities Peak', pts: 21 },
  { name: 'Tower of Overmind Nexus', pts: 21 },
  { name: 'Wacky Wendigo Facility', pts: 21 },
  { name: 'Tower of Climbing Up', pts: 21 },
  { name: 'Tower of Disruptive Obstacles', pts: 21 },
  { name: 'Steeple of Underlining Bleakness', pts: 21 },
  { name: 'Tower of A Rainbow Colored Septentrion', pts: 21 },
  { name: 'Tower of Fairly Thin but Tall Pole', pts: 21 },
  { name: 'Tower of Dave Dash', pts: 21 },
  { name: 'Wait It\'s A Tower?', pts: 21 },
  { name: 'Slate Tower', pts: 20 },
  { name: 'Tower of Turkey Sandwich', pts: 20 },
  { name: 'Tower of True Traps', pts: 20 },
  { name: 'Citadel of Extreme Pain', pts: 20 },
  { name: 'Tower of Laptop Smashing', pts: 20 },
  { name: 'He Will Always Be A Tower', pts: 20 },
  { name: 'Steeple of Stressful Suffering', pts: 20 },
  { name: 'small but difficult tower or basalt', pts: 20 },
  { name: 'Tower of The Funny Event', pts: 20 },
  { name: 'Steeple of Let It All Out', pts: 20 },
  { name: 'Fort of Inconsolable Instability', pts: 20 },
  { name: 'Double Jump Tower: Hard Mode', pts: 19 },
  { name: 'Tower of Chaos and Corruption', pts: 19 },
  { name: 'Tower of Absolute Nonsense', pts: 19 },
  { name: 'Tower of Kutsen Rouge', pts: 19 },
  { name: 'Tower of Curved Ascent', pts: 19 },
  { name: 'NIGHTHAWK 22 STEEPLE', pts: 19 },
  { name: 'Tower of I Beat The Living Crap Out Of Computer Mice Just To Feel Something On A Day To Day Basis: Lap 2', pts: 19 },
  { name: 'Tower of Whiteness', pts: 19 },
  { name: 'Tower of Hecc: Difficulty Chart', pts: 19 },
  { name: 'Tower of Inferno Galore: Zee\'s Nerf', pts: 19 },
  { name: 'Tower of Outlasting The Storm', pts: 19 },
  { name: 'Tower of Inevitable Failure', pts: 18 },
  { name: 'Tower of Nitting Some Wits', pts: 18 },
  { name: 'Steeple of Potato Chips', pts: 18 },
  { name: 'Tower of Wigglecore: Insane', pts: 18 },
  { name: 'Steeple of Agra', pts: 18 },
  { name: 'Tower of Ill Temperance', pts: 18 },
  { name: 'Tower of Back and Forth', pts: 18 },
  { name: 'Tower of Stress: Least Parts', pts: 18 },
  { name: 'Tower of Ethereal Fantasies', pts: 18 },
  { name: 'Tower of Cruel Punishments', pts: 18 },
  { name: 'Steeple of X-Sport', pts: 18 },
  { name: 'Steeple of Bupple Gubble', pts: 18 },
  { name: 'Citadel of Double Trouble', pts: 17 },
  { name: 'Steeple of Greater Than', pts: 17 },
  { name: 'Tower of Hellish Existence', pts: 17 },
  { name: 'Steeple of Luminescent Determination', pts: 17 },
  { name: 'Tower of Generation Failure: NToH Nerf', pts: 17 },
  { name: 'Tower of Vigorous Terror', pts: 17 },
  { name: 'Steeple of Absolute Hysteria', pts: 17 },
  { name: 'Steeple of Deep Wounds', pts: 17 },
  { name: 'Citadel of Hilariously Annoying Circumstances', pts: 17 },
  { name: 'Tower of Nothing Ever Happens', pts: 17 },
  { name: 'Tower of The Frameless Shock', pts: 17 },
  { name: 'Tower of The Ultra Super Amazing Jump', pts: 17 },
  { name: 'Tower of THE MEDIOCRE BRAINROT', pts: 16 },
  { name: 'Tower of Nutella Bread', pts: 16 },
  { name: 'Citadel of Inconceivable Deception', pts: 16 },
  { name: 'Tower of Forever Resetting', pts: 16 },
  { name: 'Tower of Luxuriant Interference', pts: 16 },
  { name: 'Tower of Harsh Endeavour', pts: 16 },
  { name: 'The Challenge 5', pts: 16 },
  { name: 'Steeple of Frozen Pee', pts: 16 },
  { name: 'Tower of Archivable On NextSelection', pts: 16 },
  { name: 'Tower of Disconnection', pts: 16 },
  { name: 'Citadel of Laptop Cracking', pts: 16 },
  { name: 'Citadel of Bits and Pieces', pts: 16 },
  { name: 'Cylinder of Scattered Obstacles', pts: 16 },
  { name: 'citadel of two hundred', pts: 15 },
  { name: 'Tower of Unprecedented Realities', pts: 15 },
  { name: 'Tower of Keepin\' It Together', pts: 15 },
  { name: 'Tower of Outer Ego', pts: 15 },
  { name: 'Tower of Being Outdoors', pts: 15 },
  { name: 'Citadel of Malicious Intent', pts: 15 },
  { name: 'Tower of Relentless Tension', pts: 15 },
  { name: 'Tower of Heccerson But Something Is Off', pts: 15 },
  { name: 'Cylinder of Vanaheim', pts: 15 },
  { name: 'Steeple of Awkward Gameplay', pts: 15 },
  { name: 'Tower of Infinity Gauntlet', pts: 15 },
  { name: 'Tower of Confined Scrutiny', pts: 15 },
  { name: 'Tower of Slightly Queasy: Super Nerf', pts: 15 },
  { name: 'Tower of Plafondic Traversing', pts: 14 },
  { name: 'Tower of Insanely Tall Heights', pts: 14 },
  { name: 'Dead Chat', pts: 14 },
  { name: 'Tower of Huge Frustration', pts: 14 },
  { name: 'Tower of The Wandering Truss', pts: 14 },
  { name: 'Pillar of Ascending The Barrier', pts: 14 },
  { name: 'Tower of Risky Expeditions', pts: 14 },
  { name: 'Steeple of Swift Rise', pts: 14 },
  { name: 'Tower of Lucas Penteado: Zee\'s Nerf', pts: 14 },
  { name: 'Tower of Fifteen Degrees', pts: 14 },
  { name: 'Tower of Hijacked Voltage', pts: 14 },
  { name: 'Tower of Thinning Vengeance', pts: 14 },
  { name: 'Tower of Two Side Catastrophie', pts: 14 },
  { name: 'Tower of Sliding Into Normality: Classic', pts: 13 },
  { name: 'Tower of Slanted Cruelty', pts: 13 },
  { name: 'Tower of It\\_Near Strikes Back', pts: 13 },
  { name: 'Baldi Tower Classic Remastered', pts: 13 },
  { name: 'Tower of Hazardous and Lengthy Obstacles', pts: 13 },
  { name: 'Steeple of WaxySs', pts: 13 },
  { name: 'Tower of Calm Tranquility', pts: 13 },
  { name: 'Tower of Water Cup', pts: 13 },
  { name: 'Tower of Elongated Runs: Super Nerf', pts: 13 },
  { name: 'Super Awesome Towers', pts: 13 },
  { name: 'Steeple of Anointed Violence', pts: 13 },
  { name: 'Tower of Vindictive Maneuvers: Super Nerf', pts: 13 },
  { name: 'Tower of Screen Punching: Buff', pts: 13 },
  { name: 'Tower of Chair Throwing', pts: 13 },
  { name: 'Tower of Mind Breaking', pts: 13 },
  { name: 'why the fangame archive is cool', pts: 12 },
  { name: 'Steeple of Apple Sauce', pts: 12 },
  { name: 'Tower of Cataclysmic Calamity', pts: 12 },
  { name: 'Steeple of Truss RTruss UTruss STruss STruss', pts: 12 },
  { name: 'Tower of Treacherous Death', pts: 12 },
  { name: 'Tower of Vindictive Maneuvers: Zee\'s Nerf', pts: 12 },
  { name: 'Tower of Jumping Around', pts: 12 },
  { name: 'Tower of Unknown Geometrical Calculations', pts: 12 },
  { name: 'Tower of Water Melon: Super Nerf', pts: 12 },
  { name: 'a', pts: 12 },
  { name: 'Tower of Thej Studs', pts: 12 },
  { name: 'Tower of Fast Timed Buttons', pts: 12 },
  { name: 'Cylinder of Excursion', pts: 12 },
  { name: 'Tower of One Equals Zero: Super Buff', pts: 12 },
  { name: 'Tower of Pure Malarkey', pts: 12 },
  { name: 'Tower of No Chance', pts: 11 },
  { name: 'Tower of Tortuous Oblivion: Super Nerf', pts: 11 },
  { name: 'Tower of Lemon Lime Sublime', pts: 11 },
  { name: 'Tower of Hellish Rouge: Classic', pts: 11 },
  { name: 'Tower of Tilt Controls', pts: 11 },
  { name: 'twenty-three characters', pts: 11 },
  { name: 'Unnerfed Steeple of Low Woe: Buffed', pts: 11 },
  { name: 'Tower of Quality and Quantity', pts: 11 },
  { name: 'Tower of Elongated Farts', pts: 11 },
  { name: 'Steeple of One Hour', pts: 11 },
  { name: 'Steeple of Hs Could Never', pts: 11 },
  { name: 'Tower of Saving Citizen Girl', pts: 11 },
  { name: 'Tower of Lunatic Corruption', pts: 11 },
  { name: 'One Over a Million', pts: 11 },
  { name: 'Great Citadel of 7All7', pts: 11 },
  { name: 'Tower of Risky Expeditions: Classic', pts: 11 },
  { name: 'Tower of Flattened Uprising', pts: 10 },
  { name: 'citadel of laptop splitting: upside down', pts: 10 },
  { name: 'Tower of Confection', pts: 10 },
  { name: 'Steeple of Beautiful Memories', pts: 10 },
  { name: 'Tower of Thinning Trouble', pts: 10 },
  { name: 'Steeple of Meow Mrp Prr', pts: 10 },
  { name: 'Tower of Insignificant Resourcefulness', pts: 10 },
  { name: 'Tower of Eternal Void: Super Nerf', pts: 10 },
  { name: 'Citadel of Double Trouble: BoltZRun900', pts: 10 },
  { name: 'Tower of Hyper Fantasy Overdrive', pts: 10 },
  { name: 'Tower of Slowly Darkening Descent', pts: 10 },
  { name: 'Steeple of Lika 98', pts: 10 },
  { name: 'Tower of Somnium, Aeternum', pts: 10 },
  { name: 'Tower of Pinky To Darkness', pts: 10 },
  { name: 'Tower of Cataclysmic Galore', pts: 10 },
  { name: 'Tower of Space Management', pts: 10 },
  { name: 'Tower of Eternal Freezing', pts: 10 },
  { name: 'Tower of Aquatic Rivers', pts: 9 },
  { name: 'Tower of Rising Pressure', pts: 9 },
  { name: 'Steeple of Epicness at 3AM', pts: 9 },
  { name: 'Tower of True Skill: Difficulty Chart', pts: 9 },
  { name: 'Tower of Number Nightmare', pts: 9 },
  { name: 'Tower of Wanting to Cry', pts: 9 },
  { name: 'Giant Tower of Corrupted Nightmares', pts: 9 },
  { name: 'Tower of Otady and Vli', pts: 9 },
  { name: 'Citadel of Upended Chromatism', pts: 9 },
  { name: 'Steeple of Trying to get Radioimmunoelectrophoresis While Discovering Methionylthreonylthreonylglutaminyl, I Got a Floccinaucinihilipilificationous Pseudopseudohypoparathyroidism Around the Area Of Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenu-akitanatahu', pts: 9 },
  { name: 'Tower of Catapedaphobia', pts: 9 },
  { name: 'Huvin ja Hauskanpidon Torni', pts: 9 },
  { name: 'Tower of Violet Mania', pts: 9 },
  { name: 'Tower of Tricky Jumps', pts: 9 },
  { name: 'Tower of Brimstone Facility', pts: 9 },
  { name: 'Tower of Going Insane', pts: 9 },
  { name: 'Tower of Dexterity', pts: 9 },
  { name: 'Tower of Desktop Annihilation', pts: 9 },
  { name: 'Steeple of Jack o\' Lament', pts: 9 },
  { name: 'Mini Citadel of Epic Potatoes', pts: 8 },
  { name: 'Tower of Button Deactivating', pts: 8 },
  { name: 'Tower of Silly Long Line', pts: 8 },
  { name: 'Tower of Blissful Arcadia', pts: 8 },
  { name: 'This deployment is currently paused', pts: 8 },
  { name: 'ToFaF Buff', pts: 8 },
  { name: 'Tower of Centripetal Deterrence', pts: 8 },
  { name: 'Obelisk of Wacky Strategy: Joke Edition', pts: 8 },
  { name: 'Tower of BIG IGB GIB FAIL AILF ILFA LFAI', pts: 8 },
  { name: 'Tower of Hot Cheerios', pts: 8 },
  { name: 'Tower of Expanding Layers: Alternate', pts: 8 },
  { name: 'Tower of Thinning Layers', pts: 8 },
  { name: 'Tower of Hydrogen 1', pts: 8 },
  { name: 'Tower of Horrible Darkness', pts: 8 },
  { name: 'Tower of How Do I Name A Tower', pts: 8 },
  { name: 'Edifice of Denouement', pts: 8 },
  { name: 'Tower of Wretchedness', pts: 8 },
  { name: 'Tower of Trust The Process', pts: 8 },
  { name: 'Cylinder of External Madness', pts: 8 },
  { name: 'Tower of Criminal Intent', pts: 7 },
  { name: 'Tower of Dying Inside Eternally', pts: 7 },
  { name: 'Tower of Zigzagging', pts: 7 },
  { name: 'Tower of Server Sided R15 Adventures: Solo', pts: 7 },
  { name: 'Facility of Increasing Difficulty', pts: 7 },
  { name: 'Tower of Nightly Horrors', pts: 7 },
  { name: 'Tower of Arrangement', pts: 7 },
  { name: 'Tower of No Return: The Perfect Run', pts: 7 },
  { name: 'Ter', pts: 7 },
  { name: 'Tower of Past Forward', pts: 7 },
  { name: 'Steeple of Homer\'s Rampage', pts: 7 },
  { name: 'Tower of Structural Instability', pts: 7 },
  { name: 'Tower of Futuristic Annoyance', pts: 7 },
  { name: 'Tower of Loud Nine', pts: 7 },
  { name: 'Eualaa Tower: The Ultimate Omega Booster Legandary Awesome Evolution Master King Null Void Wonderful Absolute Cinema Sigma True Form Infinite', pts: 7 },
  { name: 'Steeple of Side To Side', pts: 7 },
  { name: 'Hey, Vsauce. Tower Here: Super Nerf', pts: 7 },
  { name: 'Tower of Drinc Water', pts: 7 },
  { name: 'Tower of Disappointment Into Sadness', pts: 7 },
  { name: 'Tower of A Long Decline', pts: 7 },
  { name: 'Tower of Emancipated Elephants', pts: 7 },
  { name: 'Tower of Speeding Right Through', pts: 7 },
  { name: 'Tower of Fatal Heights', pts: 6 },
  { name: 'Tower of Big Pain', pts: 6 },
  { name: 'Tower of The Treacherous Climb', pts: 6 },
  { name: 'Towering Heights', pts: 6 },
  { name: 'Steeple of Reverie', pts: 6 },
  { name: 'Steeple of Build Time Crisis', pts: 6 },
  { name: 'Tower of A Fading Memory', pts: 6 },
  { name: 'Tower of Frameless Unlikely Natural', pts: 6 },
  { name: 'Steeple of Fever Dreams', pts: 6 },
  { name: 'Tower of Aslanted Scrimmage', pts: 6 },
  { name: 'Tower of Scaling Large Heights', pts: 6 },
  { name: 'Tower of Pure Intimidation', pts: 6 },
  { name: 'Tower of Hands Sweating: Super Buff', pts: 6 },
  { name: 'Tower of Blast From The Past', pts: 6 },
  { name: 'Tower of Expanding Layers', pts: 6 },
  { name: 'Steeple of Abandonment', pts: 6 },
  { name: 'Tower of Louis V Sandals', pts: 6 },
  { name: 'ARTHRAIX STEEPLE', pts: 6 },
  { name: 'Tower of Great Skill', pts: 6 },
  { name: 'Tower of Agglomeration', pts: 6 },
  { name: 'Citadel of Let Him Cook', pts: 6 },
  { name: 'Citadel of Corrupted Nightmares: Netless', pts: 6 },
  { name: 'Tower of Extensive Extensions', pts: 6 },
  { name: 'Tower of Franchun\'s Lullaby', pts: 6 },
  { name: 'Tower of Eroding Layers', pts: 6 },
  { name: 'Citadel of Subway', pts: 5 },
  { name: 'Tower of Fear of Heights', pts: 5 },
  { name: 'Tower of Possible Movement: HTF', pts: 5 },
  { name: 'Steeple of Jumps', pts: 5 },
  { name: 'Tower of Vibrant Overhang', pts: 5 },
  { name: 'Citadel of Ultra Tasty Stew', pts: 5 },
  { name: 'Tower of Terror', pts: 5 },
  { name: 'Tower of Really Ideal Gameplay', pts: 5 },
  { name: 'Tower of The Chaos Levels', pts: 5 },
  { name: 'Tower of Questionable Hell', pts: 5 },
  { name: 'Tower of Whatever This Is', pts: 5 },
  { name: 'Tower of Absolute Broken Reality', pts: 5 },
  { name: 'Tower of My Ribosomes', pts: 5 },
  { name: 'Tower of Mr. Pibb', pts: 5 },
  { name: 'Mini Citadel of Somewhere Around Fifteen Chairs', pts: 5 },
  { name: 'Tower of Dashing Upwards', pts: 5 },
  { name: 'Citadel of Rampancy', pts: 5 },
  { name: 'Tower of Difficulty Chart: Wacky', pts: 5 },
  { name: 'Steeple of The Flossified Floppalith', pts: 5 },
  { name: 'Tower of Skill Issue', pts: 5 },
  { name: 'Tower of Being On The Clock', pts: 5 },
  { name: 'Cylinder of Psychotic Wraparounds', pts: 5 },
  { name: 'Tower of The Letter T', pts: 5 },
  { name: 'Tower of Indigo Rivers', pts: 5 },
  { name: 'Tower of Bacterial Meningitis', pts: 5 },
  { name: 'Tower of Plastic Wonders', pts: 5 },
  { name: 'Steeple of God\'s Plan', pts: 5 },
  { name: 'Tower of Incoherent Insanity', pts: 5 },
  { name: 'Tower of Cerebrum Munching', pts: 4 },
  { name: 'Steeple of Twisted Eternal Panic', pts: 4 },
  { name: 'Tower of Name Placeholder', pts: 4 },
  { name: 'Tower of Bluespace', pts: 4 },
  { name: 'Tower of Sleepy Flower', pts: 4 },
  { name: 'Tower of Never Coming Back', pts: 4 },
  { name: 'Tower of Downpour Vortex', pts: 4 },
  { name: 'Tower of Jolly Deterrent', pts: 4 },
  { name: 'Tower of A Weird Combination', pts: 4 },
  { name: 'Tower of Unsettling Heights', pts: 4 },
  { name: 'Edifice of No Creativity', pts: 4 },
  { name: 'Tower of Enduring Insanity', pts: 4 },
  { name: 'Tower of Ultimate Rockefeller Street', pts: 4 },
  { name: 'steeple of 20 minutes', pts: 4 },
  { name: 'Mini Obelisk of Mini Obelisk: Alternate', pts: 4 },
  { name: 'Tower of Great Victories', pts: 4 },
  { name: 'Tower of Substantial Quietus: Zee\'s Nerf', pts: 4 },
  { name: 'Tower of Ascension to Heaven', pts: 4 },
  { name: 'Obelisk of Falling and Failing', pts: 4 },
  { name: 'Steeple of Absolute Insanity', pts: 4 },
  { name: 'Edifice of Let It Go', pts: 4 },
  { name: 'Citadel of Goku V3', pts: 4 },
  { name: 'Tower of Air Conditioning', pts: 4 },
  { name: 'Tower of Confusing Mirrors', pts: 4 },
  { name: 'Tower of Layers and Purism', pts: 4 },
  { name: 'Tower of Clustered Amalgamations', pts: 4 },
  { name: 'Edifice of Fun', pts: 4 },
  { name: 'Tower of Triangle Difficulty Chart', pts: 4 },
  { name: 'Hard Citadel of Void', pts: 4 },
  { name: 'Tower of Difficulty Chart: Revamp', pts: 4 },
  { name: 'Tower of Jupiter My Favourite', pts: 4 },
  { name: 'Tower of Fatal Agitation', pts: 4 },
  { name: 'Tower of Obbyist\'s League', pts: 4 },
  { name: 'Tower of Dumb Stuff', pts: 3 },
  { name: 'Tower of Reverse Difficulty Chart: st', pts: 3 },
  { name: 'Steeple of Rising Intensity', pts: 3 },
  { name: 'Tower of Ballooooons and Whimsy', pts: 3 },
  { name: 'Tower of Keyboard Yeeting: Insane', pts: 3 },
  { name: 'Giant Tower of Confusion', pts: 3 },
  { name: 'Tower of Incomprehension and Imperfection', pts: 3 },
  { name: 'Tower of Harsh Progression', pts: 3 },
  { name: 'Steeple of Blood Clot', pts: 3 },
  { name: 'Tower of Cartoony Architecture', pts: 3 },
  { name: 'Tower of Libyan Interdimensional Airlines', pts: 3 },
  { name: 'Tower of A Bad Time', pts: 3 },
  { name: 'Wallhop Steeple for Eualaa\\_01', pts: 3 },
  { name: 'Steeple of Israel-GPT', pts: 3 },
  { name: 'Steeple of Extreme Paranoia and Screaming', pts: 3 },
  { name: 'Tower of Great Fear', pts: 3 },
  { name: 'Would Never Be A Good Tower', pts: 3 },
  { name: 'Tower of Crooked Symmetry', pts: 3 },
  { name: 'Tower of Wrapped Up Rage', pts: 3 },
  { name: 'Steeple of Fragile', pts: 3 },
  { name: 'Tower of Going To Brazil', pts: 3 },
  { name: 'Tower of Bent Trauma', pts: 3 },
  { name: 'Mini Citadel of The Journey', pts: 3 },
  { name: 'Steeple of The Triple T', pts: 3 },
  { name: 'Steeple of Crimson Castle: Inferno Mode', pts: 3 },
  { name: '100 Thousand Thank Yous', pts: 3 },
  { name: 'Tower of Incoherent Blabbering', pts: 3 },
  { name: 'Citadel of Love Death', pts: 3 },
  { name: 'Tower of Medial Mayhem', pts: 3 },
  { name: 'Tower of Difficulty Breezing', pts: 3 },
  { name: 'Tower of Extreme Hell', pts: 3 },
  { name: 'Free sc', pts: 3 },
  { name: 'Tower of In It To Win It', pts: 3 },
  { name: 'Tower of Double Trouble: Classic', pts: 3 },
  { name: 'Tower of Wrath', pts: 3 },
  { name: 'Medium Tower', pts: 3 },
  { name: 'Tower of Thinning Flanimal', pts: 3 },
  { name: 'Tower of Outright Excursion', pts: 3 },
  { name: 'Tower of Suffering In The Night', pts: 3 },
  { name: 'Tower of Reactive Action', pts: 3 },
  { name: 'Tower of High Adrenaline', pts: 3 },
  { name: 'Tower of Z Fighting', pts: 3 },
  { name: 'Tower of Pie In The Sky', pts: 2 },
  { name: 'Edifice of Is It Too Easy', pts: 2 },
  { name: 'Steeple of Emptiness', pts: 2 },
  { name: 'Tower of Difficulty Chart II', pts: 2 },
  { name: 'Tower of Relentless Objectives', pts: 2 },
  { name: 'Steeple of Insecure Tranquility', pts: 2 },
  { name: 'Tower of The Roof\'s Pique: Super Nerf', pts: 2 },
  { name: 'Tower of Peacebringer 7 7 7', pts: 2 },
  { name: 'Tower of Dimension Frenetic', pts: 2 },
  { name: 'Edifice of Quarry Excavations', pts: 2 },
  { name: 'Tower of The Wedge\'s Vengeance: Super Nerf', pts: 2 },
  { name: 'Bastion of Lobotomy', pts: 2 },
  { name: 'Tower of Distant Void Comprehension', pts: 2 },
  { name: 'Tower of Feeling So Unhappy', pts: 2 },
  { name: 'Tower of Don\'t Look Down', pts: 2 },
  { name: 'Tower of Dreaming Wedge', pts: 2 },
  { name: 'Tower of Zetsudai', pts: 2 },
  { name: 'Tower of Mad', pts: 2 },
  { name: 'Tower of Nefarious Confrontation: Classic', pts: 2 },
  { name: 'Tower of Dizzyjumps Delight', pts: 2 },
  { name: 'Tower of Futile Perusal: Super Nerf', pts: 2 },
  { name: 'tower of big anger', pts: 2 },
  { name: 'Tower of Quitting', pts: 2 },
  { name: 'Difficulty Street', pts: 2 },
  { name: 'Tower of Polar Tones', pts: 2 },
  { name: 'Tower of Vacant Hindrances: OG Nerf', pts: 2 },
  { name: 'The Darkness Steeple', pts: 2 },
  { name: 'Tower of Rhythm Heaven: Unnerfed', pts: 2 },
  { name: 'Tower of Five Below', pts: 2 },
  { name: 'Thanos Tower', pts: 2 },
  { name: 'Edifice of Emart', pts: 2 },
  { name: 'Steeple of Enjoyable Wraparounds', pts: 2 },
  { name: '1 Hour Tower of Difficulty Chart', pts: 2 },
  { name: 'Tower of Odd Color Combos', pts: 2 },
  { name: 'ψaybe a Tower', pts: 2 },
  { name: 'Tower of Critical Endurance', pts: 2 },
  { name: 'Tower of Hectic Excel', pts: 2 },
  { name: 'Tower of Satan\'s Wrath', pts: 2 },
  { name: 'Great Citadel of The Five Elements', pts: 2 },
  { name: 'Tower of The Single Spiral', pts: 2 },
  { name: 'Tower of SC Frenzy 4', pts: 2 },
  { name: 'Steeple of Endless Danger Encounters', pts: 2 },
  { name: 'Steeple of Low Woe: Super Buff', pts: 2 },
  { name: 'tower of epic thinning layers', pts: 2 },
  { name: 'Tower of Pulsing Damage', pts: 2 },
  { name: 'Citadel of Pure Pwnage', pts: 2 },
  { name: 'Tower of Ozempic', pts: 2 },
  { name: 'Steeple of Difficulty Chart', pts: 2 },
  { name: 'Tower of Throttling Up', pts: 2 },
  { name: 'Tower of Pessimistic Platforms', pts: 2 },
  { name: 'Tower of Anything Goes', pts: 2 },
  { name: 'Tower of Lethal Ruins', pts: 2 },
  { name: 'Steeple of Very Evil Things', pts: 2 },
  { name: 'Tower of Joobly Chart', pts: 2 },
  { name: 'Mini Obelisk of Blazing Mirage', pts: 2 },
  { name: 'Tower of Reddish Monolith', pts: 2 },
  { name: 'Tower of Fabled Passage', pts: 2 },
  { name: 'Burj Khalifa', pts: 2 },
  { name: 'Mesmerizer Tower: Timerless', pts: 2 },
  { name: 'Steeple of Suffering From Severe Inconsistencies', pts: 2 },
  { name: 'Tower of Minimalistic Construction', pts: 2 },
  { name: 'Tower of Vacant Hindrances: Super Nerf', pts: 2 },
  { name: 'Tower of Narrowing Space', pts: 2 },
  { name: 'Tower of Persistence', pts: 2 },
  { name: 'Steeple of Devious Yield', pts: 2 },
  { name: 'Steeple of Sprite Berry Blast', pts: 2 },
  { name: 'Steeple of Destined Despair', pts: 2 },
  { name: 'Tower of Science-Like Relic', pts: 1 },
  { name: 'Liberal Steeple', pts: 1 },
  { name: 'Eg: Buffed', pts: 1 },
  { name: 'Tower of Dystopia', pts: 1 },
  { name: 'Tower of You\'re A Star', pts: 1 },
  { name: 'Citadel of Glitching and Healing', pts: 1 },
  { name: 'Tower of Irritating Results', pts: 1 },
  { name: 'Tower of Difficulty Chart: Classic', pts: 1 },
  { name: 'Garfield Tower', pts: 1 },
  { name: 'UnBuffed Tower of Analysis Explorer', pts: 1 },
  { name: 'Tower of A Thinning Layers Copy', pts: 1 },
  { name: 'Tower of Portals', pts: 1 },
  { name: 'Tower of Pepper Roni', pts: 1 },
  { name: 'Tower of Butka Havoc', pts: 1 },
  { name: 'Tower of Safety Equals False', pts: 1 },
  { name: 'Tower of Climbing a Pillar', pts: 1 },
  { name: 'Tower of Nefarious Confrontation', pts: 1 },
  { name: 'Tower of Mirrored Mountainous Mechanics', pts: 1 },
  { name: 'Tower of Super Probably Tower', pts: 1 },
  { name: 'Tower of Thje Wall: Super Nerf', pts: 1 },
  { name: 'Steeple of Oreo Hell', pts: 1 },
  { name: 'Tower of jeffy toilet paper dragon poop ken carson', pts: 1 },
  { name: 'Tower of Unrelenting Insanity', pts: 1 },
  { name: 'Lemon Tree', pts: 1 },
  { name: 'Tower of Pumice', pts: 1 },
  { name: 'Steeple of Difficulty Spikes', pts: 1 },
  { name: 'Steeple of 35 Lodges of Hell', pts: 1 },
  { name: 'Tower of Fortnite Boogie Bomb', pts: 1 },
  { name: 'Tower of Terse Persecution: Super Nerf', pts: 1 },
  { name: 'Tower of Silent Panic', pts: 1 },
  { name: 'Steeple of Present Stairs', pts: 1 },
  { name: 'Oops! All Floors!', pts: 1 },
  { name: 'Tower of Achromatopsia', pts: 1 },
  { name: 'Steeple of Wallhop Difficulty Chart', pts: 1 },
  { name: 'Tower of Submissive Furry: Super Nerf', pts: 1 },
  { name: 'Steeple of Supreme Signature Sorting Simulator', pts: 1 },
  { name: 'Tower of Familiar Layers', pts: 1 },
  { name: 'Steeple of Purist Anarchy: Classic', pts: 1 },
  { name: 'Tower of Immanent Control', pts: 1 },
  { name: 'Tower of Barbarous Structures', pts: 1 },
  { name: 'Tower of Lucas Penteado: Super Nerf', pts: 1 },
  { name: 'Tower of Sukhavati Eternal Paradise', pts: 1 },
  { name: 'Tower of Flimsy Architecture', pts: 1 },
  { name: 'Tower of Warped Reality', pts: 1 },
  { name: 'Edifice of C T G', pts: 1 },
  { name: 'Tower of Truss Frenzy', pts: 1 },
  { name: 'Edifice of Bulgaria\'s Tasty Air', pts: 1 },
  { name: 'Unnerfed Steeple of Great Humicolous', pts: 1 },
  { name: 'Steeple of Rainbow Flag', pts: 1 },
  { name: 'Tower of Anxiety', pts: 1 },
  { name: 'Tower of Transmitting Frequency', pts: 1 },
  { name: 'Tower of Hating This Tower', pts: 1 },
  { name: 'Steeple of Below Zero: Unnerfed', pts: 1 },
  { name: 'Tower of Funny Thoughts: Difficulty Chart', pts: 1 },
  { name: 'Tower of Skibidi Very Skibidi Truss', pts: 1 },
  { name: 'π159', pts: 1 },
  { name: 'Steeple of Forsaken Nexus', pts: 1 },
  { name: 'Tower of Pain and Agony', pts: 1 },
  { name: 'Tower of Xerically Infuriating Calamity: Nerf', pts: 1 },
  { name: 'Tower of Perfect Timing', pts: 1 },
  { name: 'Tower of Blazing Industrial Furnaces', pts: 1 },
  { name: 'Tower of Empty Impediments', pts: 1 },
  { name: 'Tower of que dice megan cuando pierde', pts: 1 },
  { name: 'Tower of Monochromatic Anguish', pts: 1 },
  { name: 'Steeple of Charger Ripping', pts: 1 },
  { name: 'Citadel of Grand Ultimate', pts: 1 },
  { name: 'Tower of Infuriating Ascension', pts: 1 },
  { name: 'Cylinder of Frameless Terror', pts: 1 },
  { name: 'Giant Tower of Thinning Layers', pts: 1 },
  { name: 'Tower of Expanding Layers: AToBM', pts: 1 },
  { name: 'Tower of Conjoined Chaos', pts: 1 },
  { name: 'Steeple of Teapot\'s Hyperdoom', pts: 1 },
  { name: 'Tower of Kendrick\'s Final Lamar', pts: 1 },
  { name: 'Tower of Perpetual Eccentricity', pts: 1 },
  { name: 'Costco Wholesale Tower', pts: 1 },
  { name: 'Tower of Goku', pts: 1 },
  { name: 'i build what i want okay', pts: 1 },
  { name: 'Edifice of Sticking To The Wall', pts: 1 },
  { name: 'Tower of Vacant Hindrances: Myth\'s Nerf', pts: 1 },
  { name: 'Steeple of Expecting Something Better: Difficulty Chart', pts: 1 },
  { name: 'M.U.N.C.H Facility', pts: 1 },
  { name: 'Steeple of What I See', pts: 1 },
  { name: 'Tower of Sweet Revenge', pts: 1 },
  { name: 'Tower of Super Silver Insanity', pts: 1 },
  { name: 'Edifice of GBJ Hell', pts: 1 },
  { name: 'Tower of Ripping Reality\'s Fabric', pts: 1 },
  { name: 'Tower of Warping Wraps', pts: 1 },
  { name: 'Tower of Wraparound Catastrophe', pts: 1 },
  { name: 'Steeple of Rig', pts: 1 },
  { name: 'Citadel of Ultimate Symmetry', pts: 1 },
  { name: 'Tower of Terrain Climbing Adventures', pts: 1 },
  { name: 'Tower of Blimp In The Sky', pts: 1 },
  { name: 'Three Counts of Home Invasion', pts: 1 },
  { name: 'Steeple of Petri Disk Barbell', pts: 1 },
  { name: 'happy tower', pts: 1 },
  { name: 'Tower of Atrocious Vacancy', pts: 1 },
  { name: 'Obelisk of True Skill: Classic', pts: 1 },
  { name: 'Kaizo Tower of Madness', pts: 1 },
  { name: 'Steeple of Integrate By Parts', pts: 1 },
  { name: 'Tower of Inside Chill Man', pts: 1 },
  { name: 'Steeple of Random Killbrick Torment', pts: 1 },
  { name: 'Steeple of Rage Quitting', pts: 1 },
  { name: 'Steeple of Trauma Stickout', pts: 1 },
  { name: 'Ace\'s Tower', pts: 1 },
  { name: 'Tower of Harsh Aesthetical Obstacles', pts: 1 },
  { name: 'Obelisk of True Skill', pts: 1 },
  { name: 'Tower of Difficulty Chart', pts: 1 },
  { name: 'Tower of Bends and Curves', pts: 1 },
  { name: 'Steeple of Vibrant Vistas', pts: 1 },
  { name: 'Steeple of Empty Scaling', pts: 1 },
  { name: 'Tower of Sky\'s Rupture', pts: 1 },
  { name: 'Mini Great Citadel of The Filler Factory', pts: 1 },
  { name: 'Tower of Fallen Overgrowth', pts: 1 },
  { name: 'Steeple of Fleeting Mistakes', pts: 1 },
  { name: 'Tower of Questions', pts: 1 },
  { name: 'Tower of 40 Jumps of Hell', pts: 1 },
  { name: 'Tower of Where When What', pts: 1 },
  { name: 'Steeple of Crohn\'s', pts: 1 },
  { name: 'Steeple of Esoteric Arcane', pts: 1 },
  { name: 'Steeple of Treacherous Gnomery', pts: 1 },
  { name: 'Tower of Reddish Monolith: Classic', pts: 1 },
  { name: 'Tower of Double Trouble', pts: 1 },
];

// ─── Tower roll system ────────────────────────────────────────────────────────
// Memory stored in TOWER_MEMORY_CHANNEL_ID as a single JSON message
// Schema: { scores: { userId: { username, pts } }, cooldowns: { userId: expiresAt } }

let towerMemoryMessageId = null;
let towerMemoryWriteLock = Promise.resolve();

async function fetchTowerMemoryChannel() {
    return await client.channels.fetch(TOWER_MEMORY_CHANNEL_ID);
}

async function loadTowerMemory() {
    try {
        const channel = await fetchTowerMemoryChannel();

        if (towerMemoryMessageId) {
            try {
                const msg = await channel.messages.fetch(towerMemoryMessageId);
                let raw = msg.content;
                const m = raw.match(/```json\s*([\s\S]*?)```/);
                if (m) raw = m[1];
                return JSON.parse(raw.trim());
            } catch {
                towerMemoryMessageId = null;
            }
        }

        // Scan for oldest bot message
        const messages = await channel.messages.fetch({ limit: 50 });
        const botMessages = messages
            .filter(m => m.author.id === client.user.id)
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        if (botMessages.size === 0) return { scores: {}, cooldowns: {} };

        const msg = botMessages.first();
        towerMemoryMessageId = msg.id;

        let raw = msg.content;
        const m = raw.match(/```json\s*([\s\S]*?)```/);
        if (m) raw = m[1];
        return JSON.parse(raw.trim());
    } catch (err) {
        console.error('Failed to load tower memory:', err);
        return { scores: {}, cooldowns: {} };
    }
}

async function saveTowerMemory(data) {
    try {
        const channel = await fetchTowerMemoryChannel();
        const content = '```json\n' + JSON.stringify(data, null, 2) + '\n```';

        if (towerMemoryMessageId) {
            try {
                const msg = await channel.messages.fetch(towerMemoryMessageId);
                await msg.edit(content);
                return;
            } catch {
                towerMemoryMessageId = null;
            }
        }

        const newMsg = await channel.send(content);
        towerMemoryMessageId = newMsg.id;
    } catch (err) {
        console.error('Failed to save tower memory:', err);
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

async function handleTowerRoll(message) {
    const userId = message.author.id;
    const username = message.author.username;
    const bypassCooldown = TOWER_COOLDOWN_BYPASS.includes(userId);

    towerMemoryWriteLock = towerMemoryWriteLock.then(async () => {
        const data = await loadTowerMemory();
        if (!data.scores) data.scores = {};
        if (!data.cooldowns) data.cooldowns = {};

        // Check cooldown
        if (!bypassCooldown) {
            const cooldownExpiry = data.cooldowns[userId];
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

        // Update score
        if (!data.scores[userId]) data.scores[userId] = { username, pts: 0 };
        data.scores[userId].pts += tower.pts;
        data.scores[userId].username = username; // keep name fresh

        // Set cooldown
        if (!bypassCooldown) {
            data.cooldowns[userId] = Date.now() + TOWER_COOLDOWN_MS;
        }

        await saveTowerMemory(data);

        await message.channel.send(
            `Rolled **${tower.name}**!! *${tower.pts} tower points!*`
        );
    });

    await towerMemoryWriteLock;
}

async function handleLeaderboard(message) {
    towerMemoryWriteLock = towerMemoryWriteLock.then(async () => {
        const data = await loadTowerMemory();
        const scores = data.scores || {};

        const sorted = Object.entries(scores)
            .sort(([, a], [, b]) => b.pts - a.pts)
            .slice(0, 15);

        if (sorted.length === 0) {
            await message.channel.send('No tower points have been earned yet!');
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        const lines = sorted.map(([uid, entry], i) => {
            const prefix = medals[i] ?? `**#${i + 1}**`;
            return `${prefix} <@${uid}> — **${entry.pts.toLocaleString()}** pts`;
        });

        const embed = new EmbedBuilder()
            .setTitle('Tower Points Leaderboard')
            .setDescription(lines.join('\n'))
            .setColor(0xB9B4FF)
            .setFooter({ text: 'ECR Console' })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    });

    await towerMemoryWriteLock;
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
    if (message.content.trim().toLowerCase() === 'hi' && Math.random() < 0.25) {
        await message.channel.send('hi');
        return;
    }

    // Tower roll commands (no prefix needed — exact match)
    const rawTrim = message.content.trim();
    if (rawTrim === ';tower' || rawTrim === ';toer' || rawTrim === '[]') {
        await handleTowerRoll(message);
        return;
    }

    if (rawTrim === ';lb') {
        await handleLeaderboard(message);
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
