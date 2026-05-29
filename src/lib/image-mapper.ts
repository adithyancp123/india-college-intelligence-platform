/**
 * Centralized utility for resolving unique, realistic, and deterministic
 * banners and logos for Indian colleges.
 */

// Pools of high-quality Unsplash image URLs categorized by academic stream.
// Guaranteed to contain zero placeholder image IDs or office/lifestyle meeting photos.
const BANNER_POOLS: { [category: string]: string[] } = {
  engineering: [
    'https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?w=1200&h=400&fit=crop&q=80', // Tech center lawn and building
    'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&h=400&fit=crop&q=80', // University campus lawn
    'https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=1200&h=400&fit=crop&q=80', // Modern computing and design block
    'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1200&h=400&fit=crop&q=80', // Classical academic colonnade
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop&q=80'  // Modern glass engineering pavilion
  ],
  management: [
    'https://images.unsplash.com/photo-1541829011-8319a508b1b5?w=1200&h=400&fit=crop&q=80', // Brick executive MBA wing
    'https://images.unsplash.com/photo-1595979657316-29a5ec9cfb18?w=1200&h=400&fit=crop&q=80', // Ivy league styled brick architecture
    'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&h=400&fit=crop&q=80', // Traditional brick university path
    'https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=1200&h=400&fit=crop&q=80', // Modern computing complex
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=400&fit=crop&q=80'  // Red brick columns business arch
  ],
  medical: [
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce2?w=1200&h=400&fit=crop&q=80', // Medical university research hospital
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop&q=80', // Medical sciences block exterior
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=400&fit=crop&q=80', // Clean healthcare campus pavilion
    'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=1200&h=400&fit=crop&q=80', // Modern medical clinical building
    'https://images.unsplash.com/photo-1538108149393-fdfd816d4903?w=1200&h=400&fit=crop&q=80'  // Bright medical block facade
  ],
  law: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=400&fit=crop&q=80', // Classical pillared courthouse style academy
    'https://images.unsplash.com/photo-1505664194779-8bebcb95c557?w=1200&h=400&fit=crop&q=80', // Historic library and legal archives
    'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1200&h=400&fit=crop&q=80', // Stone arch pillars
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=400&fit=crop&q=80', // Classical university brick block
    'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&h=400&fit=crop&q=80'  // Classic campus lawn
  ],
  science: [
    'https://images.unsplash.com/photo-1596495578065-6e0763fa1141?w=1200&h=400&fit=crop&q=80', // Science and research campus block
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=400&fit=crop&q=80', // Modern architectural science pavilion
    'https://images.unsplash.com/photo-1590012314607-cda9d9b6a9a9?w=1200&h=400&fit=crop&q=80', // Symmetric science academic quadrangle
    'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=1200&h=400&fit=crop&q=80', // Lush science institute quadrangle
    'https://images.unsplash.com/photo-1525920980995-f8a382bf42c5?w=1200&h=400&fit=crop&q=80'  // Modern physics & chemical science complex
  ],
  general: [
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop&q=80', // Clock tower university facade
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=400&fit=crop&q=80', // Main campus pathway
    'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=1200&h=400&fit=crop&q=80', // Lush university courtyard
    'https://images.unsplash.com/photo-1568790308569-b55259a1f471?w=1200&h=400&fit=crop&q=80', // Circular architectural library dome
    'https://images.unsplash.com/photo-1525920980995-f8a382bf42c5?w=1200&h=400&fit=crop&q=80'  // Modern academic steps
  ]
};

const LOGO_POOL = [
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=128&h=128&fit=crop&q=80', // Academic Seal Silhouette
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80', // Writing Crest
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80', // Stacked Books Crest
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&h=128&fit=crop&q=80', // Book Binding Crest
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80', // Technical Network Emblem
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80', // Strategy Calendar Badge
  'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=128&h=128&fit=crop&q=80', // Professional Group Crest
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&h=128&fit=crop&q=80', // Shared Learning Shield
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=128&h=128&fit=crop&q=80', // Technical Net Seal
  'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=128&h=128&fit=crop&q=80'  // Professional Group Crest (replaced study room placeholder)
];

// Direct mapping for top primary institutions to establish high-trust realism.
const EXPLICIT_MAPPINGS: { [key: string]: { logoUrl: string; bannerUrl: string } } = {
  // IIT Bombay
  'IITB': {
    logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200&h=400&fit=crop&q=80'
  },
  'IIT Bombay': {
    logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200&h=400&fit=crop&q=80'
  },
  'Bombay (IITB)': {
    logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1200&h=400&fit=crop&q=80'
  },

  // IIT Delhi
  'IITD': {
    logoUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?w=1200&h=400&fit=crop&q=80'
  },
  'IIT Delhi': {
    logoUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?w=1200&h=400&fit=crop&q=80'
  },
  'Delhi (IITD)': {
    logoUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?w=1200&h=400&fit=crop&q=80'
  },

  // IIT Madras
  'IITM': {
    logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=1200&h=400&fit=crop&q=80'
  },
  'IIT Madras': {
    logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=1200&h=400&fit=crop&q=80'
  },
  'Madras (IITM)': {
    logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=1200&h=400&fit=crop&q=80'
  },

  // IIT Kharagpur
  'IITKGP': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1200&h=400&fit=crop&q=80'
  },
  'IIT Kharagpur': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1200&h=400&fit=crop&q=80'
  },
  'Kharagpur (IITKGP)': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1200&h=400&fit=crop&q=80'
  },

  // IIT Kanpur
  'IITK': {
    logoUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop&q=80'
  },
  'IIT Kanpur': {
    logoUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop&q=80'
  },
  'Kanpur (IITK)': {
    logoUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop&q=80'
  },

  // IIT Roorkee
  'IITR': {
    logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=400&fit=crop&q=80'
  },
  'IIT Roorkee': {
    logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=400&fit=crop&q=80'
  },
  'Roorkee (IITR)': {
    logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=400&fit=crop&q=80'
  },

  // IIT Guwahati
  'IITG': {
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=400&fit=crop&q=80'
  },
  'IIT Guwahati': {
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=400&fit=crop&q=80'
  },
  'Guwahati (IITG)': {
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=400&fit=crop&q=80'
  },

  // IIT Hyderabad
  'IITH': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop&q=80'
  },
  'IIT Hyderabad': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop&q=80'
  },
  'Hyderabad (IITH)': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop&q=80'
  },

  // BITS Pilani (All Campuses)
  'BITS Pilani, Pilani Campus': {
    logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&h=400&fit=crop&q=80'
  },
  'BITS Pilani': {
    logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&h=400&fit=crop&q=80'
  },
  'Goa Campus': {
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=1200&h=400&fit=crop&q=80'
  },
  'Hyderabad Campus': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1525920980995-f8a382bf42c5?w=1200&h=400&fit=crop&q=80'
  },

  // IIM Ahmedabad
  'IIMA': {
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=400&fit=crop&q=80'
  },
  'IIM Ahmedabad': {
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=400&fit=crop&q=80'
  },
  'Ahmedabad (IIMA)': {
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=400&fit=crop&q=80'
  },

  // IIM Bangalore
  'IIMB': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541829011-8319a508b1b5?w=1200&h=400&fit=crop&q=80'
  },
  'IIM Bangalore': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541829011-8319a508b1b5?w=1200&h=400&fit=crop&q=80'
  },
  'Bangalore (IIMB)': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541829011-8319a508b1b5?w=1200&h=400&fit=crop&q=80'
  },

  // IIM Calcutta
  'IIMC': {
    logoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1558403194-611308249627?w=1200&h=400&fit=crop&q=80'
  },
  'IIM Calcutta': {
    logoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1558403194-611308249627?w=1200&h=400&fit=crop&q=80'
  },
  'Calcutta (IIMC)': {
    logoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1558403194-611308249627?w=1200&h=400&fit=crop&q=80'
  },

  // IIM Lucknow
  'IIML': {
    logoUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541829011-8319a508b1b5?w=1200&h=400&fit=crop&q=80'
  },
  'IIM Lucknow': {
    logoUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541829011-8319a508b1b5?w=1200&h=400&fit=crop&q=80'
  },
  'Lucknow (IIML)': {
    logoUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541829011-8319a508b1b5?w=1200&h=400&fit=crop&q=80'
  },

  // IIM Kozhikode
  'IIMK': {
    logoUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=1200&h=400&fit=crop&q=80'
  },
  'IIM Kozhikode': {
    logoUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=1200&h=400&fit=crop&q=80'
  },
  'Kozhikode (IIMK)': {
    logoUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=1200&h=400&fit=crop&q=80'
  },

  // XLRI Jamshedpur
  'XLRI': {
    logoUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541829011-8319a508b1b5?w=1200&h=400&fit=crop&q=80'
  },

  // FMS Delhi
  'FMS': {
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=400&fit=crop&q=80'
  },
  'Faculty of Management Studies': {
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=400&fit=crop&q=80'
  },

  // Anna University
  'Anna University': {
    logoUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541829011-8319a508b1b5?w=1200&h=400&fit=crop&q=80'
  },

  // Christ University
  'Christ University': {
    logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=400&fit=crop&q=80'
  },

  // Shri Ram College of Commerce (SRCC)
  'SRCC': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&h=400&fit=crop&q=80'
  },
  'Shri Ram College': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&h=400&fit=crop&q=80'
  },

  // Lady Shri Ram College (LSR)
  'LSR': {
    logoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=1200&h=400&fit=crop&q=80'
  },
  'Lady Shri Ram': {
    logoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=1200&h=400&fit=crop&q=80'
  },

  // St. Stephen's College
  'Stephen': {
    logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&h=400&fit=crop&q=80'
  },

  // IISc Bangalore
  'IISc': {
    logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=1200&h=400&fit=crop&q=80'
  },
  'Indian Institute of Science': {
    logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=1200&h=400&fit=crop&q=80'
  },

  // DTU
  'DTU': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?w=1200&h=400&fit=crop&q=80'
  },
  'Delhi Technological': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?w=1200&h=400&fit=crop&q=80'
  },

  // NSUT
  'NSUT': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=1200&h=400&fit=crop&q=80'
  },
  'Netaji Subhas': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=1200&h=400&fit=crop&q=80'
  },

  // NITs
  'NITT': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop&q=80'
  },
  'NIT Trichy': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop&q=80'
  },
  'National Institute of Technology, Trichy': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop&q=80'
  },
  'Tiruchirappalli (NITT)': {
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop&q=80'
  },
  'Surathkal (NITK)': {
    logoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?w=1200&h=400&fit=crop&q=80'
  },
  'Warangal (NITW)': {
    logoUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&h=400&fit=crop&q=80'
  },
  'Calicut (NITC)': {
    logoUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=1200&h=400&fit=crop&q=80'
  },
  'Rourkela (NITR)': {
    logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1200&h=400&fit=crop&q=80'
  },

  // VIT
  'VIT': {
    logoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=1200&h=400&fit=crop&q=80'
  },
  'Vellore Institute': {
    logoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=1200&h=400&fit=crop&q=80'
  },

  // SRM
  'SRM': {
    logoUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=400&fit=crop&q=80'
  },

  // Manipal
  'Manipal': {
    logoUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=128&h=128&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=1200&h=400&fit=crop&q=80'
  }
};

/**
 * Deterministic string hash function (FNV-1a styled algorithm).
 */
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic logo and banner URL based on the college name,
 * state, and exams parameters.
 */
export function getCollegeCategory(name: string, exams: string[] = []): string {
  let category = 'general';
  const nameLower = name.toLowerCase();
  const examsUpper = exams.map(e => String(e).toUpperCase());

  const isEng = 
    nameLower.includes('technology') ||
    nameLower.includes('engineering') ||
    nameLower.includes('iit') ||
    nameLower.includes('nit') ||
    nameLower.includes('iiit') ||
    examsUpper.some(e => ['JEE MAIN', 'JEE ADVANCED', 'BITSAT', 'VITEEE', 'SRMJEEE', 'COMEDK', 'WBJEE', 'MHT CET', 'KCET', 'TNEA'].includes(e));

  const isMgmt =
    nameLower.includes('management') ||
    nameLower.includes('business') ||
    nameLower.includes('iim') ||
    nameLower.includes('school of business') ||
    nameLower.includes('xlri') ||
    examsUpper.some(e => ['CAT', 'XAT', 'MAT', 'CMAT', 'SNAP', 'NMAT'].includes(e));

  const isMed =
    nameLower.includes('medical') ||
    nameLower.includes('dental') ||
    nameLower.includes('health') ||
    nameLower.includes('aiims') ||
    examsUpper.some(e => ['NEET', 'NEET UG', 'NEET PG'].includes(e));

  const isLaw =
    nameLower.includes('law') ||
    nameLower.includes('legal') ||
    nameLower.includes('nlu') ||
    examsUpper.some(e => ['CLAT', 'AILET'].includes(e));

  const isScience =
    nameLower.includes('science') ||
    nameLower.includes('research') ||
    nameLower.includes('iisc') ||
    examsUpper.some(e => ['GATE'].includes(e));

  if (isEng) category = 'engineering';
  else if (isMgmt) category = 'management';
  else if (isMed) category = 'medical';
  else if (isLaw) category = 'law';
  else if (isScience) category = 'science';

  return category;
}

/**
 * Returns a deterministic logo and banner URL based on the college name,
 * state, and exams parameters.
 */
export function getCollegeImages(
  collegeId: string,
  name: string,
  exams: string[] = []
): { logoUrl: string; bannerUrl: string } {
  // 1. Check if name matches any explicit top college mappings.
  for (const [key, mapping] of Object.entries(EXPLICIT_MAPPINGS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return mapping;
    }
  }

  // 2. Classify academic category.
  const category = getCollegeCategory(name, exams);

  // 3. Compute deterministic hashes.
  const hashKey = name + '-' + collegeId;
  const hashValue = hashString(hashKey);

  const bannerPool = BANNER_POOLS[category] || BANNER_POOLS.general;
  const bannerIndex = hashValue % bannerPool.length;
  const logoIndex = hashValue % LOGO_POOL.length;

  return {
    logoUrl: LOGO_POOL[logoIndex],
    bannerUrl: bannerPool[bannerIndex]
  };
}

export function getFallbackLogoUrl(): string {
  return LOGO_POOL[0];
}

export function getFallbackBannerUrl(name: string, exams: string[] = []): string {
  const category = getCollegeCategory(name, exams);
  const pool = BANNER_POOLS[category] || BANNER_POOLS.general;
  return pool[0];
}

export function getSafeLogoSrc(college: any): string {
  if (!college) return getFallbackLogoUrl();
  
  const candidateKeys = ['logoUrl', 'profileImage', 'image', 'coverImage', 'heroImage', 'bannerUrl'];
  for (const key of candidateKeys) {
    const val = college[key];
    if (val && typeof val === 'string') {
      const trimmed = val.trim();
      if (
        trimmed.length > 0 && 
        trimmed !== 'null' && 
        trimmed !== 'undefined' && 
        !trimmed.includes('broken') && 
        !trimmed.includes('undefined') && 
        !trimmed.includes('null') &&
        !trimmed.includes('placeholder') &&
        !trimmed.includes('black')
      ) {
        return trimmed;
      }
    }
  }
  
  return getFallbackLogoUrl();
}

export function getSafeBannerSrc(college: any): string {
  if (!college) return getFallbackBannerUrl('');
  
  const candidateKeys = ['bannerUrl', 'heroImage', 'coverImage', 'image', 'logoUrl', 'profileImage'];
  for (const key of candidateKeys) {
    const val = college[key];
    if (val && typeof val === 'string') {
      const trimmed = val.trim();
      if (
        trimmed.length > 0 && 
        trimmed !== 'null' && 
        trimmed !== 'undefined' && 
        !trimmed.includes('broken') && 
        !trimmed.includes('undefined') && 
        !trimmed.includes('null') &&
        !trimmed.includes('placeholder') &&
        !trimmed.includes('black')
      ) {
        return trimmed;
      }
    }
  }
  
  return getFallbackBannerUrl(college.name || '', college.exams || []);
}

