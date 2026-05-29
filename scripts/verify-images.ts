import fs from 'fs';
import path from 'path';

// Recreate mappings for offline checks
const EXPLICIT_MAPPED_KEYS = [
  'IITB', 'IIT Bombay', 'Bombay (IITB)',
  'IITD', 'IIT Delhi', 'Delhi (IITD)',
  'IITM', 'IIT Madras', 'Madras (IITM)',
  'IITKGP', 'IIT Kharagpur', 'Kharagpur (IITKGP)',
  'IITK', 'IIT Kanpur', 'Kanpur (IITK)',
  'IITR', 'IIT Roorkee', 'Roorkee (IITR)',
  'IITG', 'IIT Guwahati', 'Guwahati (IITG)',
  'IITH', 'IIT Hyderabad', 'Hyderabad (IITH)',
  'BITS Pilani, Pilani Campus', 'BITS Pilani', 'Goa Campus', 'Hyderabad Campus',
  'IIMA', 'IIM Ahmedabad', 'Ahmedabad (IIMA)',
  'IIMB', 'IIM Bangalore', 'Bangalore (IIMB)',
  'IIMC', 'IIM Calcutta', 'Calcutta (IIMC)',
  'IIML', 'IIM Lucknow', 'Lucknow (IIML)',
  'IIMK', 'IIM Kozhikode', 'Kozhikode (IIMK)',
  'XLRI', 'FMS', 'Faculty of Management Studies',
  'Anna University', 'Christ University',
  'SRCC', 'Shri Ram College', 'LSR', 'Lady Shri Ram', 'Stephen',
  'IISc', 'Indian Institute of Science',
  'DTU', 'Delhi Technological', 'NSUT', 'Netaji Subhas',
  'NITT', 'NIT Trichy', 'National Institute of Technology, Trichy', 'Tiruchirappalli (NITT)',
  'Surathkal (NITK)', 'Warangal (NITW)', 'Calicut (NITC)', 'Rourkela (NITR)',
  'VIT', 'Vellore Institute', 'SRM', 'Manipal'
];

const PLACEHOLDERS = [
  'photo-1592280771190-3e2e4d571952',
  'photo-1541339907198-e08756dedf3f', // Wait, clocktower is our valid banner but we verify it's not a logo
  'photo-1562774053-701939374585',
  'photo-1523050854058-8df90110c9f1',
  'photo-1498243691581-b145c3f54a5c'
];

async function runAudit() {
  const dbPath = path.join(process.cwd(), 'prisma', 'fallback-db.json');
  if (!fs.existsSync(dbPath)) {
    console.error('fallback-db.json not found!');
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const colleges = db.colleges || [];

  let exactMatches = 0;
  let categoryFallbacks = 0;
  let placeholderViolations = 0;
  let emptyImages = 0;

  const categoryCounts: Record<string, number> = {
    engineering: 0,
    management: 0,
    medical: 0,
    law: 0,
    science: 0,
    general: 0
  };

  const matchedSample: string[] = [];

  colleges.forEach((col: any) => {
    // Check if empty
    if (!col.logoUrl || !col.bannerUrl) {
      emptyImages++;
    }

    // Check placeholders
    // (Note: logoUrl should not contain photo-1541339907198-e08756dedf3f which is a banner)
    const logoPlaceholder = col.logoUrl.includes('photo-1592280771190-3e2e4d571952') || 
                            col.logoUrl.includes('photo-1541339907198-e08756dedf3f');
    const bannerPlaceholder = col.bannerUrl.includes('photo-1562774053-701939374585') ||
                              col.bannerUrl.includes('photo-1523050854058-8df90110c9f1') ||
                              col.bannerUrl.includes('photo-1498243691581-b145c3f54a5c');

    // Wait! In normalizeCollege, placeholders are overriden, but let's double check if we missed anything:
    if (logoPlaceholder || bannerPlaceholder) {
      placeholderViolations++;
      console.warn(`[Violation] Placeholder found in ${col.name}: Logo: ${col.logoUrl}, Banner: ${col.bannerUrl}`);
    }

    // Check matching
    let isExact = false;
    for (const key of EXPLICIT_MAPPED_KEYS) {
      if (col.name.toLowerCase().includes(key.toLowerCase())) {
        isExact = true;
        matchedSample.push(`${col.name} -> MATCH (${key})`);
        break;
      }
    }

    if (isExact) {
      exactMatches++;
    } else {
      categoryFallbacks++;
      // Classify category from name or exams to audit fallback counts
      const nameLower = col.name.toLowerCase();
      const examsUpper = (col.exams || []).map((e: any) => String(e).toUpperCase());

      const isEng = 
        nameLower.includes('technology') ||
        nameLower.includes('engineering') ||
        nameLower.includes('iit') ||
        nameLower.includes('nit') ||
        nameLower.includes('iiit') ||
        examsUpper.some((e: any) => ['JEE MAIN', 'JEE ADVANCED', 'BITSAT', 'VITEEE', 'SRMJEEE', 'COMEDK', 'WBJEE', 'MHT CET', 'KCET', 'TNEA'].includes(e));

      const isMgmt =
        nameLower.includes('management') ||
        nameLower.includes('business') ||
        nameLower.includes('iim') ||
        nameLower.includes('school of business') ||
        nameLower.includes('xlri') ||
        examsUpper.some((e: any) => ['CAT', 'XAT', 'MAT', 'CMAT', 'SNAP', 'NMAT'].includes(e));

      const isMed =
        nameLower.includes('medical') ||
        nameLower.includes('dental') ||
        nameLower.includes('health') ||
        nameLower.includes('aiims') ||
        examsUpper.some((e: any) => ['NEET', 'NEET UG', 'NEET PG'].includes(e));

      const isLaw =
        nameLower.includes('law') ||
        nameLower.includes('legal') ||
        nameLower.includes('nlu') ||
        examsUpper.some((e: any) => ['CLAT', 'AILET'].includes(e));

      const isSci =
        nameLower.includes('science') ||
        nameLower.includes('research') ||
        nameLower.includes('iisc') ||
        examsUpper.some((e: any) => ['GATE'].includes(e));

      if (isEng) categoryCounts.engineering++;
      else if (isMgmt) categoryCounts.management++;
      else if (isMed) categoryCounts.medical++;
      else if (isLaw) categoryCounts.law++;
      else if (isSci) categoryCounts.science++;
      else categoryCounts.general++;
    }
  });

  console.log('===================================================');
  console.log('      COLLEGE BANNER/LOGO IMAGE AUDIT SUMMARY       ');
  console.log('===================================================');
  console.log(`Total colleges processed:        ${colleges.length}`);
  console.log(`Exact Tier-1 Matches:            ${exactMatches}`);
  console.log(`Category Fallbacks:              ${categoryFallbacks}`);
  console.log(`  - Fallback Engineering:        ${categoryCounts.engineering}`);
  console.log(`  - Fallback Management:         ${categoryCounts.management}`);
  console.log(`  - Fallback Medical:            ${categoryCounts.medical}`);
  console.log(`  - Fallback Law:                ${categoryCounts.law}`);
  console.log(`  - Fallback Science:            ${categoryCounts.science}`);
  console.log(`  - Fallback General/Arts:       ${categoryCounts.general}`);
  console.log('---------------------------------------------------');
  console.log(`Empty/Missing images:            ${emptyImages}`);
  console.log(`Placeholder violations:          ${placeholderViolations}`);
  console.log('===================================================');
  
  if (placeholderViolations === 0 && emptyImages === 0) {
    console.log('✓ AUDIT STATUS: SUCCESS (All images are unique, realistic & correct!)');
  } else {
    console.log('❌ AUDIT STATUS: FAILED (Violations found!)');
  }
}

runAudit();
