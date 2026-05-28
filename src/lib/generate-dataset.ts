import fs from 'fs';
import path from 'path';

interface CourseRaw {
  name: string;
  duration: number;
  fees: number;
  seats: number;
  cutoffRank: number;
  exam: string;
}

interface CollegeRaw {
  id: string;
  name: string;
  location: string;
  state: string;
  city: string;
  ownership: string;
  nirfRank: number | null;
  fees: number;
  rating: number;
  description: string;
  established: number;
  logoUrl: string;
  bannerUrl: string;
  placementRate: number;
  averagePackage: number;
  highestPackage: number;
  accreditation: string | null;
  website: string;
  exams: string[];
  facilities: string[];
  collegeIntelligenceScore: number;
  roiScore: number;
  scholarshipFriendly: boolean;
  trending: boolean;
  courses: CourseRaw[];
}

const statesAndCities: { [state: string]: string[] } = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Delhi': ['New Delhi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Vellore'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Manipal'],
  'Telangana': ['Hyderabad', 'Warangal'],
  'Uttar Pradesh': ['Noida', 'Kanpur', 'Lucknow', 'Varanasi', 'Allahabad'],
  'West Bengal': ['Kolkata', 'Kharagpur', 'Durgapur'],
  'Gujarat': ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara'],
  'Rajasthan': ['Pilani', 'Jaipur', 'Jodhpur', 'Kota'],
  'Kerala': ['Trivandrum', 'Kochi', 'Calicut', 'Kottayam'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  'Punjab': ['Patiala', 'Jalandhar', 'Ropar', 'Ludhiana'],
  'Bihar': ['Patna'],
  'Odisha': ['Bhubaneswar', 'Rourkela'],
  'Haryana': ['Gurgaon', 'Sonepat', 'Kurukshetra'],
  'Uttarakhand': ['Roorkee', 'Dehradun'],
  'Jharkhand': ['Ranchi', 'Jamshedpur'],
  'Assam': ['Guwahati', 'Silchar'],
  'Goa': ['Panaji', 'Vasco', 'Ponda'],
};

// Generates 250+ colleges
function generateData() {
  const colleges: CollegeRaw[] = [];
  
  // 1. SPECIFIC TOP TIER INSTITUTES (IITs, IIMs, NITs, BITS, DTU, VIT, SRM, Christ, etc.)
  const topTier = [
    // IITs
    { name: 'Indian Institute of Technology, Bombay (IITB)', city: 'Mumbai', state: 'Maharashtra', rank: 3, type: 'Government', cat: 'Eng', established: 1958, avgPkg: 24.8, maxPkg: 168.0, rate: 98.2, fees: 220000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iitb.ac.in' },
    { name: 'Indian Institute of Technology, Delhi (IITD)', city: 'New Delhi', state: 'Delhi', rank: 2, type: 'Government', cat: 'Eng', established: 1961, avgPkg: 23.5, maxPkg: 150.0, rate: 97.5, fees: 225000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iitd.ac.in' },
    { name: 'Indian Institute of Technology, Madras (IITM)', city: 'Chennai', state: 'Tamil Nadu', rank: 1, type: 'Government', cat: 'Eng', established: 1959, avgPkg: 22.8, maxPkg: 131.0, rate: 96.8, fees: 215000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iitm.ac.in' },
    { name: 'Indian Institute of Technology, Kharagpur (IITKGP)', city: 'Kharagpur', state: 'West Bengal', rank: 6, type: 'Government', cat: 'Eng', established: 1951, avgPkg: 21.0, maxPkg: 120.0, rate: 95.5, fees: 210000, acc: 'NAAC A+', exams: ['JEE Advanced'], site: 'www.iitkgp.ac.in' },
    { name: 'Indian Institute of Technology, Kanpur (IITK)', city: 'Kanpur', state: 'Uttar Pradesh', rank: 4, type: 'Government', cat: 'Eng', established: 1959, avgPkg: 22.0, maxPkg: 140.0, rate: 96.2, fees: 218000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iitk.ac.in' },
    { name: 'Indian Institute of Technology, Roorkee (IITR)', city: 'Roorkee', state: 'Uttarakhand', rank: 5, type: 'Government', cat: 'Eng', established: 1847, avgPkg: 18.5, maxPkg: 90.0, rate: 94.0, fees: 230000, acc: 'NAAC A+', exams: ['JEE Advanced'], site: 'www.iitr.ac.in' },
    { name: 'Indian Institute of Technology, Guwahati (IITG)', city: 'Guwahati', state: 'Assam', rank: 7, type: 'Government', cat: 'Eng', established: 1994, avgPkg: 19.2, maxPkg: 85.0, rate: 93.8, fees: 220000, acc: 'NAAC A', exams: ['JEE Advanced'], site: 'www.iitg.ac.in' },
    { name: 'Indian Institute of Technology, Hyderabad (IITH)', city: 'Hyderabad', state: 'Telangana', rank: 8, type: 'Government', cat: 'Eng', established: 2008, avgPkg: 20.4, maxPkg: 95.0, rate: 94.5, fees: 225000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iith.ac.in' },
    
    // NITs
    { name: 'National Institute of Technology, Tiruchirappalli (NITT)', city: 'Tiruchirappalli', state: 'Tamil Nadu', rank: 9, type: 'Government', cat: 'Eng', established: 1964, avgPkg: 17.5, maxPkg: 52.8, rate: 95.2, fees: 145000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nitt.edu' },
    { name: 'National Institute of Technology, Surathkal (NITK)', city: 'Mangalore', state: 'Karnataka', rank: 12, type: 'Government', cat: 'Eng', established: 1960, avgPkg: 16.8, maxPkg: 48.0, rate: 94.8, fees: 150000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nitk.ac.in' },
    { name: 'National Institute of Technology, Warangal (NITW)', city: 'Warangal', state: 'Telangana', rank: 21, type: 'Government', cat: 'Eng', established: 1959, avgPkg: 16.0, maxPkg: 45.0, rate: 94.0, fees: 148000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nitw.ac.in' },
    { name: 'National Institute of Technology, Calicut (NITC)', city: 'Calicut', state: 'Kerala', rank: 23, type: 'Government', cat: 'Eng', established: 1961, avgPkg: 14.2, maxPkg: 40.5, rate: 92.5, fees: 142000, acc: 'NAAC A', exams: ['JEE Main'], site: 'www.nitc.ac.in' },
    { name: 'National Institute of Technology, Rourkela (NITR)', city: 'Rourkela', state: 'Odisha', rank: 16, type: 'Government', cat: 'Eng', established: 1961, avgPkg: 14.5, maxPkg: 42.0, rate: 91.8, fees: 144000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nitrkl.ac.in' },
    
    // BITS
    { name: 'BITS Pilani, Pilani Campus', city: 'Pilani', state: 'Rajasthan', rank: 25, type: 'Private', cat: 'Eng', established: 1964, avgPkg: 19.8, maxPkg: 60.5, rate: 95.0, fees: 480000, acc: 'NAAC A++', exams: ['BITSAT'], site: 'www.bits-pilani.ac.in' },
    { name: 'BITS Pilani, Goa Campus', city: 'Vasco', state: 'Goa', rank: 35, type: 'Private', cat: 'Eng', established: 2004, avgPkg: 18.2, maxPkg: 55.0, rate: 93.5, fees: 480000, acc: 'NAAC A++', exams: ['BITSAT'], site: 'www.bits-goa.ac.in' },
    { name: 'BITS Pilani, Hyderabad Campus', city: 'Hyderabad', state: 'Telangana', rank: 38, type: 'Private', cat: 'Eng', established: 2008, avgPkg: 18.0, maxPkg: 52.0, rate: 92.8, fees: 480000, acc: 'NAAC A++', exams: ['BITSAT'], site: 'www.bits-hyderabad.ac.in' },
    
    // IIITs
    { name: 'International Institute of Information Technology, Hyderabad (IIITH)', city: 'Hyderabad', state: 'Telangana', rank: 55, type: 'Private', cat: 'Eng', established: 1998, avgPkg: 32.0, maxPkg: 102.0, rate: 100.0, fees: 360000, acc: 'NAAC A++', exams: ['JEE Main', 'SPEC'], site: 'www.iiit.ac.in' },
    { name: 'International Institute of Information Technology, Bangalore (IIITB)', city: 'Bangalore', state: 'Karnataka', rank: 74, type: 'Private', cat: 'Eng', established: 1999, avgPkg: 28.5, maxPkg: 78.0, rate: 99.0, fees: 380000, acc: 'NAAC A+', exams: ['JEE Main'], site: 'www.iiitb.ac.in' },
    { name: 'Indian Institute of Information Technology, Allahabad (IIITA)', city: 'Allahabad', state: 'Uttar Pradesh', rank: 89, type: 'Government', cat: 'Eng', established: 1999, avgPkg: 22.4, maxPkg: 82.5, rate: 98.5, fees: 190000, acc: 'NBA', exams: ['JEE Main'], site: 'www.iiita.ac.in' },

    // State Premier & Private
    { name: 'Delhi Technological University (DTU)', city: 'New Delhi', state: 'Delhi', rank: 29, type: 'Government', cat: 'Eng', established: 1941, avgPkg: 16.4, maxPkg: 82.0, rate: 93.4, fees: 190050, acc: 'NAAC A', exams: ['JEE Main'], site: 'www.dtu.ac.in' },
    { name: 'Netaji Subhas University of Technology (NSUT)', city: 'New Delhi', state: 'Delhi', rank: 60, type: 'Government', cat: 'Eng', established: 1983, avgPkg: 15.8, maxPkg: 75.0, rate: 92.1, fees: 195000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nsut.ac.in' },
    { name: 'Vellore Institute of Technology (VIT)', city: 'Vellore', state: 'Tamil Nadu', rank: 11, type: 'Private', cat: 'Eng', established: 1984, avgPkg: 9.2, maxPkg: 44.0, rate: 88.5, fees: 198000, acc: 'NAAC A++', exams: ['VITEEE', 'JEE Main'], site: 'www.vit.ac.in' },
    { name: 'SRM Institute of Science and Technology (SRM)', city: 'Chennai', state: 'Tamil Nadu', rank: 28, type: 'Private', cat: 'Eng', established: 1985, avgPkg: 8.5, maxPkg: 41.6, rate: 86.0, fees: 260000, acc: 'NAAC A++', exams: ['SRMJEEE', 'JEE Main'], site: 'www.srmist.edu.in' },
    { name: 'Manipal Institute of Technology (MIT Manipal)', city: 'Manipal', state: 'Karnataka', rank: 61, type: 'Private', cat: 'Eng', established: 1957, avgPkg: 10.5, maxPkg: 43.3, rate: 89.0, fees: 325000, acc: 'NAAC A+', exams: ['MET'], site: 'www.manipal.edu' },
    { name: 'RV College of Engineering (RVCE)', city: 'Bangalore', state: 'Karnataka', rank: 96, type: 'Private', cat: 'Eng', established: 1963, avgPkg: 11.2, maxPkg: 46.0, rate: 92.0, fees: 250000, acc: 'NBA', exams: ['COMEDK', 'KCET'], site: 'www.rvce.edu.in' },

    // IIMs (Management)
    { name: 'Indian Institute of Management, Ahmedabad (IIMA)', city: 'Ahmedabad', state: 'Gujarat', rank: 1, type: 'Government', cat: 'Mgt', established: 1961, avgPkg: 32.7, maxPkg: 115.0, rate: 100.0, fees: 1250000, acc: 'EQUIS', exams: ['CAT'], site: 'www.iima.ac.in' },
    { name: 'Indian Institute of Management, Bangalore (IIMB)', city: 'Bangalore', state: 'Karnataka', rank: 2, type: 'Government', cat: 'Mgt', established: 1973, avgPkg: 30.1, maxPkg: 95.5, rate: 100.0, fees: 1200000, acc: 'EQUIS', exams: ['CAT'], site: 'www.iimb.ac.in' },
    { name: 'Indian Institute of Management, Calcutta (IIMC)', city: 'Kolkata', state: 'West Bengal', rank: 3, type: 'Government', cat: 'Mgt', established: 1961, avgPkg: 31.0, maxPkg: 98.0, rate: 100.0, fees: 1220000, acc: 'AACSB', exams: ['CAT'], site: 'www.iimcal.ac.in' },
    { name: 'Indian Institute of Management, Lucknow (IIML)', city: 'Lucknow', state: 'Uttar Pradesh', rank: 4, type: 'Government', cat: 'Mgt', established: 1984, avgPkg: 28.0, maxPkg: 85.0, rate: 100.0, fees: 980000, acc: 'AACSB', exams: ['CAT'], site: 'www.iiml.ac.in' },
    { name: 'Indian Institute of Management, Kozhikode (IIMK)', city: 'Kochi', state: 'Kerala', rank: 5, type: 'Government', cat: 'Mgt', established: 1996, avgPkg: 27.2, maxPkg: 72.0, rate: 100.0, fees: 950000, acc: 'AMBA', exams: ['CAT'], site: 'www.iimk.ac.in' },
    { name: 'Faculty of Management Studies, Delhi University (FMS)', city: 'New Delhi', state: 'Delhi', rank: 8, type: 'Government', cat: 'Mgt', established: 1954, avgPkg: 32.4, maxPkg: 102.0, rate: 100.0, fees: 10000, acc: 'NAAC A++', exams: ['CAT'], site: 'www.fms.edu' },
    { name: 'XLRI - Xavier School of Management', city: 'Jamshedpur', state: 'Jharkhand', rank: 9, type: 'Private', cat: 'Mgt', established: 1949, avgPkg: 29.8, maxPkg: 88.0, rate: 100.0, fees: 1180000, acc: 'AACSB', exams: ['XAT'], site: 'www.xlri.ac.in' },

    // Universities (Science, Commerce, Arts)
    { name: 'Indian Institute of Science (IISc), Bangalore', city: 'Bangalore', state: 'Karnataka', rank: 1, type: 'Government', cat: 'Sci', established: 1909, avgPkg: 26.0, maxPkg: 85.0, rate: 92.0, fees: 35000, acc: 'NAAC A++', exams: ['JEE Main', 'JEE Advanced', 'GATE', 'NEET'], site: 'www.iisc.ac.in' },
    { name: 'Shri Ram College of Commerce (SRCC)', city: 'New Delhi', state: 'Delhi', rank: 11, type: 'Government', cat: 'Com', established: 1926, avgPkg: 10.2, maxPkg: 35.0, rate: 91.2, fees: 28000, acc: 'NAAC A++', exams: ['CUET'], site: 'www.srcc.edu' },
    { name: 'Lady Shri Ram College for Women (LSR)', city: 'New Delhi', state: 'Delhi', rank: 9, type: 'Government', cat: 'Arts', established: 1956, avgPkg: 9.8, maxPkg: 30.0, rate: 89.0, fees: 25000, acc: 'NAAC A++', exams: ['CUET'], site: 'www.lsr.edu.in' },
    { name: 'St. Stephen\'s College', city: 'New Delhi', state: 'Delhi', rank: 14, type: 'Government', cat: 'Arts', established: 1881, avgPkg: 9.5, maxPkg: 28.0, rate: 88.0, fees: 32000, acc: 'NAAC A++', exams: ['CUET'], site: 'www.ststephens.edu' },
    { name: 'Christ University, Bangalore', city: 'Bangalore', state: 'Karnataka', rank: 60, type: 'Private', cat: 'All', established: 1969, avgPkg: 7.2, maxPkg: 22.0, rate: 85.0, fees: 185000, acc: 'NAAC A+', exams: ['CUET', 'MAT', 'CAT'], site: 'www.christuniversity.in' },
  ];

  // Map pre-configured list to actual format
  let idCounter = 1;
  const commonFacilities = ['Hostel', 'Wifi', 'Library', 'Gym', 'Labs', 'Cafeteria', 'Sports Complex', 'Auditorium', 'Medical Center'];

  topTier.forEach(col => {
    const fees = col.fees;
    const avgPkg = col.avgPkg;
    const roi = parseFloat(((avgPkg * 100000) / fees).toFixed(2));
    const isGovt = col.type === 'Government';
    
    // Rating mapping based on package/rank
    let rating = 4.0;
    if (col.rank <= 5) rating = 4.9;
    else if (col.rank <= 15) rating = 4.7;
    else if (col.rank <= 50) rating = 4.4;
    else rating = 4.1;

    // Intelligence Score = normalized ranking + packages + rating
    const intelligenceScore = Math.min(100, parseFloat(((101 - (col.rank || 80)) * 0.4 + (avgPkg * 1.5) + (rating * 6)).toFixed(1)));

    // Generate Courses
    const courses: CourseRaw[] = [];
    if (col.cat === 'Eng' || col.cat === 'Sci') {
      courses.push({
        name: 'B.Tech Computer Science & Engineering',
        duration: 4,
        fees: fees,
        seats: 120,
        exam: col.exams[0],
        cutoffRank: col.rank ? col.rank * 100 + 500 : 8000
      });
      courses.push({
        name: 'B.Tech Electronics & Communication Engineering',
        duration: 4,
        fees: Math.floor(fees * 0.95),
        seats: 90,
        exam: col.exams[0],
        cutoffRank: col.rank ? col.rank * 150 + 1200 : 12000
      });
      courses.push({
        name: 'B.Tech Mechanical Engineering',
        duration: 4,
        fees: Math.floor(fees * 0.9),
        seats: 90,
        exam: col.exams[0],
        cutoffRank: col.rank ? col.rank * 200 + 2500 : 18000
      });
      if (col.name.includes('Science') || col.name.includes('IISc')) {
        courses.push({
          name: 'Bachelor of Science (Research)',
          duration: 4,
          fees: Math.floor(fees * 0.5),
          seats: 150,
          exam: 'JEE Main',
          cutoffRank: 5000
        });
      }
    } else if (col.cat === 'Mgt') {
      courses.push({
        name: 'Post Graduate Program in Management (MBA)',
        duration: 2,
        fees: fees,
        seats: 360,
        exam: col.exams[0],
        cutoffRank: col.rank ? 100 - col.rank + 85 : 90 // Percentile threshold (simulated as rank here, but we will support percentiles in recommendations)
      });
      courses.push({
        name: 'Executive MBA',
        duration: 1,
        fees: Math.floor(fees * 1.2),
        seats: 120,
        exam: col.exams[0],
        cutoffRank: col.rank ? 100 - col.rank + 80 : 85
      });
    } else {
      courses.push({
        name: 'Bachelor of Commerce (B.Com Hons)',
        duration: 3,
        fees: fees,
        seats: 250,
        exam: 'CUET',
        cutoffRank: col.rank ? 800 - col.rank * 20 : 600
      });
      courses.push({
        name: 'Bachelor of Arts (Economics Hons)',
        duration: 3,
        fees: Math.floor(fees * 0.9),
        seats: 150,
        exam: 'CUET',
        cutoffRank: col.rank ? 900 - col.rank * 25 : 650
      });
    }

    colleges.push({
      id: `col-${idCounter++}`,
      name: col.name,
      location: `${col.city}, ${col.state}`,
      state: col.state,
      city: col.city,
      ownership: col.type,
      nirfRank: col.rank,
      fees: fees,
      rating: rating,
      description: `Established in ${col.established}, ${col.name} is a premier institution located in ${col.city}. Known for its exceptional faculty, advanced infrastructure, and industry-leading recruitment statistics.`,
      established: col.established,
      logoUrl: `https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80`,
      bannerUrl: `https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop&q=80`,
      placementRate: col.rate,
      averagePackage: avgPkg,
      highestPackage: col.maxPkg,
      accreditation: col.acc,
      website: col.site,
      exams: col.exams,
      facilities: commonFacilities.slice(0, 5 + Math.floor(Math.random() * 4)),
      collegeIntelligenceScore: intelligenceScore,
      roiScore: roi,
      scholarshipFriendly: isGovt || Math.random() > 0.5,
      trending: col.rank <= 10,
      courses: courses
    });
  });

  // 2. GENERATE PROGRAMMATIC REMAINDER (to reach 230+ colleges)
  const cities = [
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Bangalore', state: 'Karnataka' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Noida', state: 'Uttar Pradesh' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Kochi', state: 'Kerala' },
    { city: 'Bhopal', state: 'Madhya Pradesh' },
    { city: 'Patna', state: 'Bihar' },
    { city: 'Bhubaneswar', state: 'Odisha' },
    { city: 'Gurgaon', state: 'Haryana' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'Coimbatore', state: 'Tamil Nadu' },
    { city: 'Mysore', state: 'Karnataka' },
    { city: 'Vadodara', state: 'Gujarat' },
    { city: 'Varanasi', state: 'Uttar Pradesh' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Dehradun', state: 'Uttarakhand' },
    { city: 'Ranchi', state: 'Jharkhand' }
  ];

  const collegePrefixes = [
    'National Institute of Technology',
    'Indian Institute of Information Technology',
    'Birla Institute of Technology',
    'Amity University',
    'Symbiosis International University',
    'Savitribai Phule University College',
    'Kalinga Institute of Industrial Technology',
    'Lovely Professional University',
    'DY Patil College of Engineering',
    'PSG College of Technology',
    'Alliance University',
    'Presidency University',
    'Christ College of Engineering',
    'ICFAI Foundation for Higher Education',
    'SRM University campus',
    'Nirma University of Science & Tech',
    'Thapar College of Engineering',
    'Jawaharlal Nehru Engineering College',
    'Techno India University',
    'Manipal University campus'
  ];

  const managementPrefixes = [
    'Symbiosis Institute of Business Management',
    'Institute of Management Technology',
    'Great Lakes Institute of Management',
    'T A Pai Management Institute',
    'FORE School of Management',
    'Lal Bahadur Shastri Institute of Management',
    'Goa Institute of Management',
    'Nirma University Institute of Management',
    'K J Somaiya Institute of Management',
    'Xavier Institute of Management',
    'Management Development Institute campus',
    'International Management Institute',
    'Symbiosis Centre for Management & HRD',
    'Balaji Institute of Modern Management',
    'Jaipuria Institute of Management',
    'Welingkar Institute of Management',
    'Birla Institute of Management Technology',
    'Amity Business School',
    'Loyola Institute of Business Administration',
    'Alliance School of Business'
  ];

  const collegeSpecs = ['Engineering', 'Management', 'Technology', 'Science & Research', 'Arts & Commerce'];

  // Loop to generate 220 more colleges to make it 250+ total
  let rankGenerator = 40;
  for (let i = 0; i < 220; i++) {
    const cityObj = cities[i % cities.length];
    const isEng = i % 2 === 0;
    const prefix = isEng 
      ? collegePrefixes[Math.floor(i / 2) % collegePrefixes.length]
      : managementPrefixes[Math.floor(i / 2) % managementPrefixes.length];
    
    const suffix = (prefix.includes('NIT') || prefix.includes('IIIT') || prefix.includes('IIM')) ? '' : ` campus`;
    const name = `${prefix} (${cityObj.city})`;
    
    // Coerce details
    const ownership = Math.random() > 0.45 ? 'Private' : 'Government';
    const established = 1970 + (i % 45);
    const avgPkg = isEng ? parseFloat((4.5 + (i % 12) + Math.random()).toFixed(1)) : parseFloat((6.0 + (i % 18) + Math.random()).toFixed(1));
    const highestPackage = parseFloat((avgPkg * (2.5 + Math.random())).toFixed(1));
    const placementRate = parseFloat((75 + (i % 23) + Math.random()).toFixed(1));
    
    // Fees calculation
    const baseFees = isEng 
      ? (ownership === 'Government' ? 80000 : 250000)
      : (ownership === 'Government' ? 200000 : 650000);
    const fees = baseFees + (i % 15) * 10000;

    const nirfRank = Math.random() > 0.7 ? null : rankGenerator++;
    const rating = parseFloat((3.6 + (i % 13) * 0.1).toFixed(1));
    const acc = rating >= 4.4 ? 'NAAC A++' : (rating >= 4.1 ? 'NAAC A+' : 'NAAC A');
    
    const roi = parseFloat(((avgPkg * 100000) / fees).toFixed(2));
    const intelligenceScore = Math.min(100, parseFloat(((101 - (nirfRank || 150)) * 0.1 + (avgPkg * 1.5) + (rating * 7)).toFixed(1)));
    const exams = isEng ? ['JEE Main', 'COMEDK', 'MHT CET'] : ['CAT', 'MAT', 'XAT', 'CMAT'];
    const site = `www.${prefix.toLowerCase().replace(/[^a-z]/g, '')}-${cityObj.city.toLowerCase()}.edu.in`;

    const courses: CourseRaw[] = [];
    if (isEng) {
      courses.push({
        name: 'B.Tech Computer Science & Engineering',
        duration: 4,
        fees: fees,
        seats: 120,
        exam: 'JEE Main',
        cutoffRank: 15000 + (i % 30) * 1000
      });
      courses.push({
        name: 'B.Tech Electronics & Communication',
        duration: 4,
        fees: Math.floor(fees * 0.95),
        seats: 90,
        exam: 'JEE Main',
        cutoffRank: 22000 + (i % 30) * 1200
      });
    } else {
      courses.push({
        name: 'Post Graduate Program in Management (MBA)',
        duration: 2,
        fees: fees,
        seats: 180,
        exam: 'CAT',
        cutoffRank: 70 + (i % 25)
      });
    }

    colleges.push({
      id: `col-${idCounter++}`,
      name: name,
      location: `${cityObj.city}, ${cityObj.state}`,
      state: cityObj.state,
      city: cityObj.city,
      ownership: ownership,
      nirfRank: nirfRank,
      fees: fees,
      rating: rating,
      description: `Established in ${established}, ${name} is located in ${cityObj.city}, ${cityObj.state}. It is recognized for offering modern technical/management course curricula, placement guidance, and supportive educational services.`,
      established: established,
      logoUrl: `https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&h=128&fit=crop&q=80`,
      bannerUrl: `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80`,
      placementRate: placementRate,
      averagePackage: avgPkg,
      highestPackage: highestPackage,
      accreditation: acc,
      website: site,
      exams: exams.slice(0, 2),
      facilities: commonFacilities.slice(0, 4 + (i % 5)),
      collegeIntelligenceScore: intelligenceScore,
      roiScore: roi,
      scholarshipFriendly: ownership === 'Government' || i % 3 === 0,
      trending: rating >= 4.5 && Math.random() > 0.6,
      courses: courses
    });
  }

  // Write files
  const dataPath = path.join(process.cwd(), 'prisma', 'india-colleges-raw.json');
  fs.writeFileSync(dataPath, JSON.stringify({ colleges }, null, 2), 'utf-8');
  console.log(`Generated ${colleges.length} colleges inside prisma/india-colleges-raw.json`);
}

generateData();
