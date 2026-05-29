import fs from 'fs';
import path from 'path';
import { getCollegeImages, getCollegeCategory } from './image-mapper';

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

function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash);
}

function generateProceduralDescription(
  name: string,
  city: string,
  state: string,
  category: string,
  established: number,
  rating: number,
  ownership: string
): string {
  const introTemplates = [
    `Established in ${established}, ${name} is a leading ${ownership.toLowerCase()} institution in ${city}, ${state}.`,
    `Located in the academic hub of ${city}, ${state}, ${name} was founded in ${established} to provide quality education.`,
    `Since its inception in ${established}, ${name} has been dedicated to offering premium academic programs in ${city}.`,
    `Nestled in ${city}, ${state}, ${name} is a highly respected ${ownership.toLowerCase()} campus established in ${established}.`
  ];

  const strengthTemplates: { [cat: string]: string[] } = {
    engineering: [
      `The campus is widely recognized for its high-performance research laboratories, industrial automation centers, and student innovation clubs.`,
      `It features state-of-the-art computational infrastructure, mechanical testing bays, and deep engineering design labs.`,
      `The institution places strong emphasis on collaborative technology projects, coding bootcamps, and robotics research.`,
      `Students benefit from modern electrical grid labs, civil engineering simulators, and advanced material sciences facilities.`
    ],
    management: [
      `It is well-regarded for its case-study pedagogy, active entrepreneurship cell, and leadership development programs.`,
      `The curriculum is built around corporate business strategy, financial modeling labs, and executive seminar workshops.`,
      `It stands out for its strong focus on digital marketing trends, portfolio management, and global executive interactions.`,
      `It offers state-of-the-art business labs, regular startup incubation pitch events, and industry-oriented workshops.`
    ],
    medical: [
      `The college operates a modern research hospital on-campus, providing students with intensive clinical rotations and laboratory training.`,
      `It is equipped with advanced diagnostics labs, intensive patient care simulated wards, and anatomy museums.`,
      `It is recognized for its medical sciences research, advanced pathology setups, and state-of-the-art surgical suites.`,
      `The institution offers strong hands-on healthcare training, bio-chemical research centers, and hospital internship guidance.`
    ],
    law: [
      `It is famous for its active moot court society, comprehensive legal aid clinics, and legal writing workshops.`,
      `The campus features an extensive corporate law library, national moot courtroom simulators, and human rights discussion forums.`,
      `It highlights a strong criminal and constitutional law curriculum, mock-trial sessions, and student debate groups.`,
      `Legal students undergo intense judicial internship programs, public advocacy training, and debate semesters.`
    ],
    science: [
      `It serves as a primary center for advanced botanical, chemical, and physical sciences research in the region.`,
      `The research labs host modern physics equipment, chemical compound synthesizers, and environmental testing blocks.`,
      `It is dedicated to deep scientific discovery, statistical analytics courses, and publishing peer-reviewed research.`,
      `Students are actively involved in biochemistry projects, mathematical research programs, and scientific field studies.`
    ],
    design: [
      `The creative environment features state-of-the-art prototyping studios, animation suites, and fashion design labs.`,
      `It is highly celebrated for its industrial product design workshops, UI/UX laboratories, and arts exhibitions.`,
      `It offers digital rendering centers, clay modeling rooms, and regular design portfolio reviews from experts.`,
      `The campus encourages creative design thinking, sustainable fashion labs, and interactive media studios.`
    ],
    commerce: [
      `It highlights intensive financial accounting courses, corporate taxation workshops, and stock market simulation tools.`,
      `The curriculum focuses on business management, audit guidelines, and advanced commerce studies.`,
      `It provides excellent return-on-investment, active placement cells, and CA/CS professional guidance.`,
      `It focuses on financial analytics, international trade courses, and corporate governance practices.`
    ],
    general: [
      `It features a sprawling green campus, multi-disciplinary seminar halls, and rich co-curricular activities.`,
      `The university is known for its diverse student groups, active sports complex, and large Central library resources.`,
      `It offers a balanced mixture of traditional arts and modern professional certificate programs.`,
      `Students enjoy a vibrant campus life, digital classrooms, and multiple interest-based club networks.`
    ]
  };

  const outcomeTemplates = [
    `With regular recruitment drives from leading companies, the campus guarantees strong corporate placements.`,
    `It maintains excellent industry tie-ups, ensuring high career placement rates and summer internship opportunities.`,
    `Graduates from the institute are highly sought after in corporate, research, and public sectors alike.`,
    `A dedicated training and placement cell works closely with students to secure top-tier national job offers.`
  ];

  const hash = hashString(name);
  const intro = introTemplates[hash % introTemplates.length];
  const strengths = strengthTemplates[category] || strengthTemplates.general;
  const strength = strengths[hash % strengths.length];
  const outcome = outcomeTemplates[hash % outcomeTemplates.length];

  return `${intro} ${strength} ${outcome}`;
}

function generateData() {
  const colleges: CollegeRaw[] = [];
  
  // 1. SPECIFIC HANDCRAFTED TOP TIER INSTITUTES (38 Colleges across fields)
  const topTier = [
    // IITs
    { 
      name: 'Indian Institute of Technology, Bombay (IITB)', city: 'Mumbai', state: 'Maharashtra', rank: 3, type: 'Government', cat: 'Eng', established: 1958, avgPkg: 24.8, maxPkg: 168.0, rate: 98.2, fees: 220000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iitb.ac.in',
      description: 'Established in 1958 in Powai, IIT Bombay is a global engineering powerhouse celebrated for its top-tier computing research, entrepreneurial culture, and exceptional campus placements. Its scenic lakeside campus is home to India\'s most sought-after tech programs.'
    },
    { 
      name: 'Indian Institute of Technology, Delhi (IITD)', city: 'New Delhi', state: 'Delhi', rank: 2, type: 'Government', cat: 'Eng', established: 1961, avgPkg: 23.5, maxPkg: 150.0, rate: 97.5, fees: 225000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iitd.ac.in',
      description: 'Located in the heart of the national capital, IIT Delhi is renowned for its pioneering technology incubators, deep industry research partnerships, and stellar startup ecosystem. The institution consistently produces world-class innovators and tech leaders.'
    },
    { 
      name: 'Indian Institute of Technology, Madras (IITM)', city: 'Chennai', state: 'Tamil Nadu', rank: 1, type: 'Government', cat: 'Eng', established: 1959, avgPkg: 22.8, maxPkg: 131.0, rate: 96.8, fees: 215000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iitm.ac.in',
      description: 'Nestled in a lush forest campus in Chennai, IIT Madras is recognized as India\'s top engineering institution under NIRF. It is distinguished by its world-class research park, strong patents output, and cutting-edge industrial collaborations.'
    },
    { 
      name: 'Indian Institute of Technology, Kharagpur (IITKGP)', city: 'Kharagpur', state: 'West Bengal', rank: 6, type: 'Government', cat: 'Eng', established: 1951, avgPkg: 21.0, maxPkg: 120.0, rate: 95.5, fees: 210000, acc: 'NAAC A+', exams: ['JEE Advanced'], site: 'www.iitkgp.ac.in',
      description: 'As India\'s first IIT, IIT Kharagpur boasts the largest campus and the most diverse academic curriculum, spanning law, architecture, and engineering. Its vast alumni network and legacy of academic rigor define its global reputation.'
    },
    { 
      name: 'Indian Institute of Technology, Kanpur (IITK)', city: 'Kanpur', state: 'Uttar Pradesh', rank: 4, type: 'Government', cat: 'Eng', established: 1959, avgPkg: 22.0, maxPkg: 140.0, rate: 96.2, fees: 218000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iitk.ac.in',
      description: 'Known for its academic intensity and research-driven science and engineering curricula, IIT Kanpur operates India\'s premier computer science program and a unique student-run airstrip. It remains a center for deep mathematical and engineering science.'
    },
    { 
      name: 'Indian Institute of Technology, Roorkee (IITR)', city: 'Roorkee', state: 'Uttarakhand', rank: 5, type: 'Government', cat: 'Eng', established: 1847, avgPkg: 18.5, maxPkg: 90.0, rate: 94.0, fees: 230000, acc: 'NAAC A+', exams: ['JEE Advanced'], site: 'www.iitr.ac.in',
      description: 'Tracing its roots back to 1847 as India\'s oldest civil engineering institution, IIT Roorkee combines heritage architecture with modern research facilities. It is globally respected for its contributions to structural, hydrological, and mechanical sciences.'
    },
    { 
      name: 'Indian Institute of Technology, Guwahati (IITG)', city: 'Guwahati', state: 'Assam', rank: 7, type: 'Government', cat: 'Eng', established: 1994, avgPkg: 19.2, maxPkg: 85.0, rate: 93.8, fees: 220000, acc: 'NAAC A', exams: ['JEE Advanced'], site: 'www.iitg.ac.in',
      description: 'Set on the banks of the Brahmaputra River, IIT Guwahati features one of India\'s most visually stunning campuses. It stands out in high-performance computing, biotechnology, and environmental engineering research.'
    },
    { 
      name: 'Indian Institute of Technology, Hyderabad (IITH)', city: 'Hyderabad', state: 'Telangana', rank: 8, type: 'Government', cat: 'Eng', established: 2008, avgPkg: 20.4, maxPkg: 95.0, rate: 94.5, fees: 225000, acc: 'NAAC A++', exams: ['JEE Advanced'], site: 'www.iith.ac.in',
      description: 'A leading second-generation IIT, IIT Hyderabad is celebrated for its deep research collaborations with Japan, state-of-the-art climate-responsive infrastructure, and strong focus on artificial intelligence and quantum computing.'
    },
    
    // NITs
    { 
      name: 'National Institute of Technology, Tiruchirappalli (NITT)', city: 'Tiruchirappalli', state: 'Tamil Nadu', rank: 9, type: 'Government', cat: 'Eng', established: 1964, avgPkg: 17.5, maxPkg: 52.8, rate: 95.2, fees: 145000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nitt.edu',
      description: 'Commonly known as NIT Trichy, this premier public engineering college is the top-ranked NIT in India. It is highly regarded for its intensive campus placements, active technical clubs, and excellent manufacturing and core engineering laboratories.'
    },
    { 
      name: 'National Institute of Technology, Surathkal (NITK)', city: 'Mangalore', state: 'Karnataka', rank: 12, type: 'Government', cat: 'Eng', established: 1960, avgPkg: 16.8, maxPkg: 48.0, rate: 94.8, fees: 150000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nitk.ac.in',
      description: 'Boasting its own private beach on the Arabian Sea, NITK Surathkal offers a vibrant campus life alongside premier engineering instruction. It is highly competitive, attracting top JEE Main rankers for its computer science and core mechanical programs.'
    },
    { 
      name: 'National Institute of Technology, Warangal (NITW)', city: 'Warangal', state: 'Telangana', rank: 21, type: 'Government', cat: 'Eng', established: 1959, avgPkg: 16.0, maxPkg: 45.0, rate: 94.0, fees: 148000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nitw.ac.in',
      description: 'As the very first regional engineering college established in India, NIT Warangal holds a legacy of academic excellence. It has earned a reputation for producing outstanding software engineers and industry-ready graduates.'
    },
    { 
      name: 'National Institute of Technology, Calicut (NITC)', city: 'Calicut', state: 'Kerala', rank: 23, type: 'Government', cat: 'Eng', established: 1961, avgPkg: 14.2, maxPkg: 40.5, rate: 92.5, fees: 142000, acc: 'NAAC A', exams: ['JEE Main'], site: 'www.nitc.ac.in',
      description: 'Set in a scenic location in Kerala, NIT Calicut provides a peaceful, research-aligned study environment. The institute excels in civil, architecture, and computer science education, with strong regional placement tie-ups.'
    },
    { 
      name: 'National Institute of Technology, Rourkela (NITR)', city: 'Rourkela', state: 'Odisha', rank: 16, type: 'Government', cat: 'Eng', established: 1961, avgPkg: 14.5, maxPkg: 42.0, rate: 91.8, fees: 144000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nitrkl.ac.in',
      description: 'NIT Rourkela is known for having one of India\'s largest and most modern engineering campuses. It is highly recognized for its materials science, chemical engineering, and research output, providing excellent ROI for its graduates.'
    },
    
    // BITS
    { 
      name: 'BITS Pilani, Pilani Campus', city: 'Pilani', state: 'Rajasthan', rank: 25, type: 'Private', cat: 'Eng', established: 1964, avgPkg: 19.8, maxPkg: 60.5, rate: 95.0, fees: 480000, acc: 'NAAC A++', exams: ['BITSAT'], site: 'www.bits-pilani.ac.in',
      description: 'A legendary symbol of private higher education in India, BITS Pilani is famous for its strict zero-reservation admissions policy and its flexible \'no-attendance\' rules. It maintains an elite startup ecosystem and a powerful global alumni network.'
    },
    { 
      name: 'BITS Pilani, Goa Campus', city: 'Vasco', state: 'Goa', rank: 35, type: 'Private', cat: 'Eng', established: 2004, avgPkg: 18.2, maxPkg: 55.0, rate: 93.5, fees: 480000, acc: 'NAAC A++', exams: ['BITSAT'], site: 'www.bits-goa.ac.in',
      description: 'Located along the scenic coast of Zuari River, BITS Goa offers premium technical education in a vibrant, collaborative setting. It is highly popular for its software development culture and outstanding BITSAT cutoffs.'
    },
    { 
      name: 'BITS Pilani, Hyderabad Campus', city: 'Hyderabad', state: 'Telangana', rank: 38, type: 'Private', cat: 'Eng', established: 2008, avgPkg: 18.0, maxPkg: 52.0, rate: 92.8, fees: 480000, acc: 'NAAC A++', exams: ['BITSAT'], site: 'www.bits-hyderabad.ac.in',
      description: 'Featuring a modern, sprawling campus, BITS Hyderabad is equipped with state-of-the-art labs and a major technology incubator. It is renowned for its focus on microelectronics, biotechnology, and computer science.'
    },
    
    // IIITs
    { 
      name: 'International Institute of Information Technology, Hyderabad (IIITH)', city: 'Hyderabad', state: 'Telangana', rank: 55, type: 'Private', cat: 'Eng', established: 1998, avgPkg: 32.0, maxPkg: 102.0, rate: 100.0, fees: 360000, acc: 'NAAC A++', exams: ['JEE Main'], site: 'www.iiit.ac.in',
      description: 'IIIT Hyderabad is an elite, research-first computer science institute famous for its unparalleled coding culture, competitive programming achievements, and 100% placement records. It remains the top choice for advanced computer vision and NLP research.'
    },
    { 
      name: 'International Institute of Information Technology, Bangalore (IIITB)', city: 'Bangalore', state: 'Karnataka', rank: 74, type: 'Private', cat: 'Eng', established: 1999, avgPkg: 28.5, maxPkg: 78.0, rate: 99.0, fees: 380000, acc: 'NAAC A+', exams: ['JEE Main'], site: 'www.iiitb.ac.in',
      description: 'Nestled in the tech hub of Electronic City, IIIT Bangalore offers highly specialized postgraduate and integrated programs in computing. Its deep links with multinational tech giants ensure exceptional placement averages.'
    },
    { 
      name: 'Indian Institute of Information Technology, Allahabad (IIITA)', city: 'Allahabad', state: 'Uttar Pradesh', rank: 89, type: 'Government', cat: 'Eng', established: 1999, avgPkg: 22.4, maxPkg: 82.5, rate: 98.5, fees: 190000, acc: 'NBA', exams: ['JEE Main'], site: 'www.iiita.ac.in',
      description: 'IIIT Allahabad is highly celebrated for its computer science and information technology curricula, featuring one of the strongest coding environments in North India. It boasts stellar placements that rival several top IITs.'
    },

    // State Premier & Private
    { 
      name: 'Delhi Technological University (DTU)', city: 'New Delhi', state: 'Delhi', rank: 29, type: 'Government', cat: 'Eng', established: 1941, avgPkg: 16.4, maxPkg: 82.0, rate: 93.4, fees: 190050, acc: 'NAAC A', exams: ['JEE Main'], site: 'www.dtu.ac.in',
      description: 'DTU (formerly DCE) is a premier engineering university in Delhi with a legendary 80-year legacy. It is famous for its large-scale recruitment drives, massive student tech teams, and rich campus culture.'
    },
    { 
      name: 'Netaji Subhas University of Technology (NSUT)', city: 'New Delhi', state: 'Delhi', rank: 60, type: 'Government', cat: 'Eng', established: 1983, avgPkg: 15.8, maxPkg: 75.0, rate: 92.1, fees: 195000, acc: 'NBA', exams: ['JEE Main'], site: 'www.nsut.ac.in',
      description: 'NSUT is a highly competitive state engineering university in Delhi, known for its rigorous academic curriculum and excellent placement records in software and core analytics domains. Its green campus features advanced engineering labs.'
    },
    { 
      name: 'Vellore Institute of Technology (VIT)', city: 'Vellore', state: 'Tamil Nadu', rank: 11, type: 'Private', cat: 'Eng', established: 1984, avgPkg: 9.2, maxPkg: 44.0, rate: 88.5, fees: 198000, acc: 'NAAC A++', exams: ['VITEEE', 'JEE Main'], site: 'www.vit.ac.in',
      description: 'VIT Vellore is one of India\'s largest and most popular private universities, celebrated for its modern campus, robust infrastructure, and massive recruitment drives. It features an active international exchange program.'
    },
    { 
      name: 'SRM Institute of Science and Technology (SRM)', city: 'Chennai', state: 'Tamil Nadu', rank: 28, type: 'Private', cat: 'Eng', established: 1985, avgPkg: 8.5, maxPkg: 41.6, rate: 86.0, fees: 260000, acc: 'NAAC A++', exams: ['SRMJEEE', 'JEE Main'], site: 'www.srmist.edu.in',
      description: 'SRM Chennai features a massive, highly diverse campus with top-tier research centers and design labs. It is well-known for its flexible choice-based credit system and active industry-linked internships.'
    },
    { 
      name: 'Manipal Institute of Technology (MIT Manipal)', city: 'Manipal', state: 'Karnataka', rank: 61, type: 'Private', cat: 'Eng', established: 1957, avgPkg: 10.5, maxPkg: 43.3, rate: 89.0, fees: 325000, acc: 'NAAC A+', exams: ['MET'], site: 'www.manipal.edu',
      description: 'MIT Manipal is a premium private college offering a cosmopolitan campus environment and state-of-the-art infrastructure. It is highly recognized for its student projects (like solar cars and student satellites) and great career starters.'
    },
    { 
      name: 'RV College of Engineering (RVCE)', city: 'Bangalore', state: 'Karnataka', rank: 96, type: 'Private', cat: 'Eng', established: 1963, avgPkg: 11.2, maxPkg: 46.0, rate: 92.0, fees: 250000, acc: 'NBA', exams: ['COMEDK', 'KCET'], site: 'www.rvce.edu.in',
      description: 'Located in Bangalore, RVCE is the most prestigious private engineering college in Karnataka. It is highly sought after for its exceptional placements with leading tech companies and strong industrial project training.'
    },

    // IIMs (Management)
    { 
      name: 'Indian Institute of Management, Ahmedabad (IIMA)', city: 'Ahmedabad', state: 'Gujarat', rank: 1, type: 'Government', cat: 'Mgt', established: 1961, avgPkg: 32.7, maxPkg: 115.0, rate: 100.0, fees: 1250000, acc: 'EQUIS', exams: ['CAT'], site: 'www.iima.ac.in',
      description: 'IIM Ahmedabad is India\'s premier business school, globally recognized for its iconic Louis Kahn brick architecture and its rigorous case-study teaching method. It consistently leads in executive placement, consulting, and finance recruitment.'
    },
    { 
      name: 'Indian Institute of Management, Bangalore (IIMB)', city: 'Bangalore', state: 'Karnataka', rank: 2, type: 'Government', cat: 'Mgt', established: 1973, avgPkg: 30.1, maxPkg: 95.5, rate: 100.0, fees: 1200000, acc: 'EQUIS', exams: ['CAT'], site: 'www.iimb.ac.in',
      description: 'Situated in a beautiful stone-walled campus, IIM Bangalore is a world-class business school leading in digital innovation, entrepreneurship, and public policy. It attracts elite candidates seeking careers in strategy consulting and product management.'
    },
    { 
      name: 'Indian Institute of Management, Calcutta (IIMC)', city: 'Kolkata', state: 'West Bengal', rank: 3, type: 'Government', cat: 'Mgt', established: 1961, avgPkg: 31.0, maxPkg: 98.0, rate: 100.0, fees: 1220000, acc: 'AACSB', exams: ['CAT'], site: 'www.iimcal.ac.in',
      description: 'Famously known as the \'Finance Campus\' of the IIMs, IIM Calcutta is set amidst serene lakes in Joka. It is globally acclaimed for its quantitative finance curriculum, management consulting placements, and robust alumni presence on Wall Street.'
    },
    { 
      name: 'Indian Institute of Management, Lucknow (IIML)', city: 'Lucknow', state: 'Uttar Pradesh', rank: 4, type: 'Government', cat: 'Mgt', established: 1984, avgPkg: 28.0, maxPkg: 85.0, rate: 100.0, fees: 980000, acc: 'AACSB', exams: ['CAT'], site: 'www.iiml.ac.in',
      description: 'IIM Lucknow is renowned for its intense academic curriculum, student-run enterprise ecosystems, and strong placement records in marketing, consulting, and finance. Its beautiful campus features modern lecture halls and library resources.'
    },
    { 
      name: 'Indian Institute of Management, Kozhikode (IIMK)', city: 'Kochi', state: 'Kerala', rank: 5, type: 'Government', cat: 'Mgt', established: 1996, avgPkg: 27.2, maxPkg: 72.0, rate: 100.0, fees: 950000, acc: 'AMBA', exams: ['CAT'], site: 'www.iimk.ac.in',
      description: 'Set atop two scenic hills in Kerala, IIM Kozhikode features a modern, oxygen-rich campus. It is celebrated for pioneer initiatives in gender diversity and stands out in corporate marketing and human resource leadership.'
    },
    { 
      name: 'Faculty of Management Studies, Delhi University (FMS)', city: 'New Delhi', state: 'Delhi', rank: 8, type: 'Government', cat: 'Mgt', established: 1954, avgPkg: 32.4, maxPkg: 102.0, rate: 100.0, fees: 10000, acc: 'NAAC A++', exams: ['CAT'], site: 'www.fms.edu',
      description: 'Known as the \'Red Building of Dreams\', FMS Delhi offers India\'s most legendary return-on-investment, combining nominal university fees with elite average packages that rival the top IIMs. It is highly competitive and prestigious.'
    },
    { 
      name: 'XLRI - Xavier School of Management', city: 'Jamshedpur', state: 'Jharkhand', rank: 9, type: 'Private', cat: 'Mgt', established: 1949, avgPkg: 29.8, maxPkg: 88.0, rate: 100.0, fees: 1180000, acc: 'AACSB', exams: ['XAT'], site: 'www.xlri.ac.in',
      description: 'Established in 1949, XLRI Jamshedpur is India\'s oldest business school and the undisputed leader in human resource management. It is celebrated for its values-driven management education and elite placement records across all business fields.'
    },

    // Universities (Science, Commerce, Arts)
    { 
      name: 'Indian Institute of Science (IISc), Bangalore', city: 'Bangalore', state: 'Karnataka', rank: 1, type: 'Government', cat: 'Sci', established: 1909, avgPkg: 26.0, maxPkg: 85.0, rate: 92.0, fees: 35000, acc: 'NAAC A++', exams: ['JEE Main', 'JEE Advanced', 'GATE'], site: 'www.iisc.ac.in',
      description: 'Founded in 1909 by Jamsetji Tata, IISc is India\'s premier scientific research university, leading global charts in citations per faculty. Its historic Bangalore campus is dedicated to advanced science, quantum research, and engineering labs.'
    },
    { 
      name: 'Shri Ram College of Commerce (SRCC)', city: 'New Delhi', state: 'Delhi', rank: 11, type: 'Government', cat: 'Com', established: 1926, avgPkg: 10.2, maxPkg: 35.0, rate: 91.2, fees: 28000, acc: 'NAAC A++', exams: ['CUET'], site: 'www.srcc.edu',
      description: 'As India\'s undisputed leader in commerce education under Delhi University, SRCC attracts the highest-scoring school graduates in the country. It is famous for its placement cell, corporate interactions, and rigorous finance education.'
    },
    { 
      name: 'Lady Shri Ram College for Women (LSR)', city: 'New Delhi', state: 'Delhi', rank: 9, type: 'Government', cat: 'Arts', established: 1956, avgPkg: 9.8, maxPkg: 30.0, rate: 89.0, fees: 25000, acc: 'NAAC A++', exams: ['CUET'], site: 'www.lsr.edu.in',
      description: 'LSR is a premier liberal arts and commerce college under Delhi University, highly respected for its leadership development, debate society, and academic excellence. It consistently places its graduates in top consulting and policy research institutions.'
    },
    { 
      name: 'St. Stephen\'s College', city: 'New Delhi', state: 'Delhi', rank: 14, type: 'Government', cat: 'Arts', established: 1881, avgPkg: 9.5, maxPkg: 28.0, rate: 88.0, fees: 32000, acc: 'NAAC A++', exams: ['CUET'], site: 'www.ststephens.edu',
      description: 'St. Stephen\'s College combines rich historical legacy, residential collegiate life, and elite arts and science programs. It is highly respected for its liberal arts traditions, close faculty mentorship, and distinguished alumni base.'
    },
    { 
      name: 'Christ University, Bangalore', city: 'Bangalore', state: 'Karnataka', rank: 60, type: 'Private', cat: 'All', established: 1969, avgPkg: 7.2, maxPkg: 22.0, rate: 85.0, fees: 185000, acc: 'NAAC A+', exams: ['CUET', 'MAT', 'CAT'], site: 'www.christuniversity.in',
      description: 'Christ University is a highly popular private university in Bangalore, known for its vibrant campus culture, strict discipline, and diverse student body. It excels in business administration, arts, and commerce studies.'
    },
    { 
      name: 'Anna University, Chennai', city: 'Chennai', state: 'Tamil Nadu', rank: 13, type: 'Government', cat: 'Eng', established: 1978, avgPkg: 8.5, maxPkg: 36.0, rate: 88.0, fees: 55000, acc: 'NAAC A++', exams: ['TNEA'], site: 'www.annauniv.edu',
      description: 'Anna University is a premier public university in Chennai, featuring the historic College of Engineering Guindy campus. It is widely respected for its engineering research output, highly structured TNEA counseling, and strong placement tie-ups.'
    },
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
        cutoffRank: col.rank ? 100 - col.rank + 85 : 90
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

    const colId = `col-${idCounter++}`;
    const images = getCollegeImages(colId, col.name, col.exams);

    // Differentiate tags realistically
    let facilitiesList = [...commonFacilities];
    if (col.cat === 'Eng' || col.cat === 'Sci') {
      facilitiesList.push('Research Labs', 'Research Focus', 'Industry Tie-Ups');
    } else if (col.cat === 'Mgt') {
      facilitiesList.push('Entrepreneurship', 'Global Exposure', 'Industry Tie-Ups');
    }
    if (fees < 50000) {
      facilitiesList.push('High ROI', 'Scholarship Friendly');
    }

    colleges.push({
      id: colId,
      name: col.name,
      location: `${col.city}, ${col.state}`,
      state: col.state,
      city: col.city,
      ownership: col.type,
      nirfRank: col.rank,
      fees: fees,
      rating: rating,
      description: col.description,
      established: col.established,
      logoUrl: images.logoUrl,
      bannerUrl: images.bannerUrl,
      placementRate: col.rate,
      averagePackage: avgPkg,
      highestPackage: col.maxPkg,
      accreditation: col.acc,
      website: col.site,
      exams: col.exams,
      facilities: Array.from(new Set(facilitiesList)).slice(0, 7 + Math.floor(Math.random() * 4)),
      collegeIntelligenceScore: intelligenceScore,
      roiScore: roi,
      scholarshipFriendly: isGovt || Math.random() > 0.5,
      trending: col.rank <= 10,
      courses: courses
    });
  });

  // 2. GENERATE PROGRAMMATIC REMAINDER (220 colleges across 7 streams)
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

  const engineeringPrefixes = [
    'National Institute of Technology',
    'Indian Institute of Information Technology',
    'Birla Institute of Technology',
    'PSG College of Technology',
    'Thapar College of Engineering',
    'RV College of Engineering',
    'Coimbatore Institute of Technology',
    'Vellore Institute of Technology',
    'SRM Institute of Science & Technology',
    'Manipal Institute of Technology'
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
    'Xavier Institute of Management'
  ];

  const medicalPrefixes = [
    'All India Institute of Medical Sciences',
    'Christian Medical College',
    'Kasturba Medical College',
    'King George\'s Medical University',
    'Madras Medical College',
    'Grant Medical College',
    'St. John\'s Medical College',
    'Bangalore Medical College',
    'Armed Forces Medical College',
    'Maulana Azad Medical College'
  ];

  const lawPrefixes = [
    'National Law School',
    'National Law University',
    'NALSAR University of Law',
    'Symbiosis Law School',
    'Gujarat National Law University',
    'National Law Institute University',
    'ILS Law College',
    'Government Law College',
    'Amity Law School',
    'Army Institute of Law'
  ];

  const sciencePrefixes = [
    'Indian Institute of Science Education and Research',
    'St. Xavier\'s College',
    'Presidency College',
    'Madras Christian College',
    'Fergusson College',
    'Ramjas College',
    'Hansraj College',
    'Miranda House',
    'Loyola College',
    'National Institute of Science Education'
  ];

  const designPrefixes = [
    'National Institute of Design',
    'National Institute of Fashion Technology',
    'Symbiosis Institute of Design',
    'MIT Institute of Design',
    'Srishti Manipal Institute of Design',
    'Pearl Academy',
    'World University of Design',
    'JD Institute of Fashion Technology',
    'Army Institute of Fashion & Design',
    'Unitedworld Institute of Design'
  ];

  const commercePrefixes = [
    'Shri Ram College of Commerce',
    'Lady Shri Ram College',
    'Sydenham College of Commerce',
    'Loyola College of Commerce',
    'Nirma College of Commerce',
    'St. Joseph\'s College of Commerce',
    'RA Podar College of Commerce',
    'HR College of Commerce',
    'Goenka College of Commerce',
    'Hinduja College of Commerce'
  ];

  const categories = ['engineering', 'management', 'medical', 'law', 'science', 'design', 'commerce'];

  let rankGenerator = 40;
  for (let i = 0; i < 220; i++) {
    const cityObj = cities[i % cities.length];
    const category = categories[i % categories.length];

    let prefix = '';
    let exams: string[] = [];
    let courseName = '';
    let courseDuration = 3;
    let courseExam = '';

    // Assign prefixes, exams and courses based on category
    if (category === 'engineering') {
      prefix = engineeringPrefixes[Math.floor(i / 7) % engineeringPrefixes.length];
      const stateExams: { [state: string]: string } = {
        'Maharashtra': 'MHT CET',
        'Karnataka': 'KCET',
        'Tamil Nadu': 'TNEA',
        'Telangana': 'TS EAMCET',
        'Andhra Pradesh': 'AP EAMCET',
        'West Bengal': 'WBJEE'
      };
      const stateExam = stateExams[cityObj.state] || 'COMEDK';
      exams = ['JEE Main', stateExam];
      courseName = 'B.Tech Computer Science & Engineering';
      courseDuration = 4;
      courseExam = 'JEE Main';
    } else if (category === 'management') {
      prefix = managementPrefixes[Math.floor(i / 7) % managementPrefixes.length];
      exams = ['CAT', 'CMAT', 'MAT'];
      courseName = 'Post Graduate Program in Management (MBA)';
      courseDuration = 2;
      courseExam = 'CAT';
    } else if (category === 'medical') {
      prefix = medicalPrefixes[Math.floor(i / 7) % medicalPrefixes.length];
      exams = ['NEET UG', 'NEET PG'];
      courseName = 'Bachelor of Medicine & Surgery (MBBS)';
      courseDuration = 5;
      courseExam = 'NEET UG';
    } else if (category === 'law') {
      prefix = lawPrefixes[Math.floor(i / 7) % lawPrefixes.length];
      exams = ['CLAT', 'AILET'];
      courseName = 'Integrated B.A. LL.B. (Honours)';
      courseDuration = 5;
      courseExam = 'CLAT';
    } else if (category === 'science') {
      prefix = sciencePrefixes[Math.floor(i / 7) % sciencePrefixes.length];
      exams = ['CUET UG', 'CUET PG', 'GATE'];
      courseName = 'Bachelor of Science (B.Sc Research)';
      courseDuration = 4;
      courseExam = 'CUET UG';
    } else if (category === 'design') {
      prefix = designPrefixes[Math.floor(i / 7) % designPrefixes.length];
      exams = ['NID DAT', 'UCEED'];
      courseName = 'Bachelor of Design (B.Des)';
      courseDuration = 4;
      courseExam = 'UCEED';
    } else {
      // commerce
      prefix = commercePrefixes[Math.floor(i / 7) % commercePrefixes.length];
      exams = ['CUET UG', 'CA Foundation'];
      courseName = 'B.Com (Honours) Financial Accounting';
      courseDuration = 3;
      courseExam = 'CUET UG';
    }
    
    const suffix = (prefix.includes('NIT') || prefix.includes('IIIT') || prefix.includes('IIM') || prefix.includes('AIIMS') || prefix.includes('NALSAR') || prefix.includes('College of Commerce') || prefix.includes('College of Engineering')) ? '' : ` campus`;
    const name = `${prefix}${suffix} (${cityObj.city})`;
    
    // Ownership configuration
    const ownership = Math.random() > 0.5 ? 'Private' : 'Government';
    const established = 1970 + (i % 45);

    // Realistic Packages and Fees by Stream and Ownership
    let avgPkg = 4.5;
    let highestPackage = 12.0;
    let baseFees = 50000;

    if (category === 'engineering') {
      baseFees = ownership === 'Government' ? 95000 : 260000;
      avgPkg = parseFloat((5.5 + (i % 8) + Math.random()).toFixed(1));
    } else if (category === 'management') {
      baseFees = ownership === 'Government' ? 220000 : 620000;
      avgPkg = parseFloat((6.5 + (i % 10) + Math.random()).toFixed(1));
    } else if (category === 'medical') {
      baseFees = ownership === 'Government' ? 30000 : 850000;
      avgPkg = parseFloat((8.0 + (i % 12) + Math.random()).toFixed(1));
    } else if (category === 'law') {
      baseFees = ownership === 'Government' ? 90000 : 210000;
      avgPkg = parseFloat((5.0 + (i % 7) + Math.random()).toFixed(1));
    } else if (category === 'science') {
      baseFees = ownership === 'Government' ? 15000 : 90000;
      avgPkg = parseFloat((4.0 + (i % 5) + Math.random()).toFixed(1));
    } else if (category === 'design') {
      baseFees = 160000;
      avgPkg = parseFloat((5.0 + (i % 6) + Math.random()).toFixed(1));
    } else {
      // commerce
      baseFees = ownership === 'Government' ? 20000 : 85000;
      avgPkg = parseFloat((4.2 + (i % 5) + Math.random()).toFixed(1));
    }

    highestPackage = parseFloat((avgPkg * (2.1 + (i % 3) * 0.3 + Math.random() * 0.5)).toFixed(1));
    const placementRate = parseFloat((75 + (i % 20) + Math.random() * 4).toFixed(1));
    const fees = baseFees + (i % 10) * 5000;

    const nirfRank = Math.random() > 0.65 ? null : rankGenerator++;
    
    // Ratings spread: top tier elements get higher ratings
    let rating = 3.8;
    if (avgPkg >= 12.0) rating = parseFloat((4.5 + Math.random() * 0.4).toFixed(1));
    else if (avgPkg >= 8.0) rating = parseFloat((4.1 + Math.random() * 0.4).toFixed(1));
    else rating = parseFloat((3.6 + Math.random() * 0.4).toFixed(1));

    const acc = rating >= 4.4 ? 'NAAC A++' : (rating >= 4.1 ? 'NAAC A+' : 'NAAC A');
    const roi = parseFloat(((avgPkg * 100000) / fees).toFixed(2));
    const intelligenceScore = Math.min(100, parseFloat(((101 - (nirfRank || 150)) * 0.12 + (avgPkg * 1.4) + (rating * 7)).toFixed(1)));
    const site = `www.${prefix.toLowerCase().replace(/[^a-z]/g, '')}-${cityObj.city.toLowerCase()}.edu.in`;

    const courses: CourseRaw[] = [
      {
        name: courseName,
        duration: courseDuration,
        fees: fees,
        seats: 120,
        exam: courseExam,
        cutoffRank: courseExam === 'JEE Main' ? 20000 + (i % 30) * 1500 : 
                    courseExam === 'CLAT' ? 1200 + (i % 25) * 100 :
                    courseExam === 'NEET UG' ? 520 + (i % 15) * 10 :
                    courseExam === 'CAT' ? 75 + (i % 20) :
                    courseExam === 'UCEED' ? 300 + (i % 10) * 50 : 600 // CUET
      }
    ];

    // Add a secondary course
    if (category === 'engineering') {
      courses.push({
        name: 'B.Tech Electronics & Communication',
        duration: 4,
        fees: Math.floor(fees * 0.95),
        seats: 90,
        exam: 'JEE Main',
        cutoffRank: 32000 + (i % 30) * 1800
      });
    } else if (category === 'management') {
      courses.push({
        name: 'Executive MBA (General Management)',
        duration: 1,
        fees: Math.floor(fees * 1.15),
        seats: 60,
        exam: 'CAT',
        cutoffRank: 70 + (i % 15)
      });
    }

    const colId = `col-${idCounter++}`;
    const colCategory = getCollegeCategory(name, exams);
    const images = getCollegeImages(colId, name, exams);

    const description = generateProceduralDescription(
      name,
      cityObj.city,
      cityObj.state,
      colCategory,
      established,
      rating,
      ownership
    );

    // Categorized tags
    let facilitiesList = [...commonFacilities];
    if (category === 'engineering' || category === 'science') {
      facilitiesList.push('Research Labs', 'Research Focus', 'Industry Tie-Ups');
    } else if (category === 'management') {
      facilitiesList.push('Entrepreneurship', 'Global Exposure', 'Industry Tie-Ups');
    } else if (category === 'law') {
      facilitiesList.push('Moot Court', 'Global Exposure');
    } else if (category === 'design') {
      facilitiesList.push('Design Studio', 'Vibrant Campus');
    }
    if (fees < 50000) {
      facilitiesList.push('High ROI', 'Scholarship Friendly');
    }

    colleges.push({
      id: colId,
      name: name,
      location: `${cityObj.city}, ${cityObj.state}`,
      state: cityObj.state,
      city: cityObj.city,
      ownership: ownership,
      nirfRank: nirfRank,
      fees: fees,
      rating: rating,
      description: description,
      established: established,
      logoUrl: images.logoUrl,
      bannerUrl: images.bannerUrl,
      placementRate: placementRate,
      averagePackage: avgPkg,
      highestPackage: highestPackage,
      accreditation: acc,
      website: site,
      exams: exams.slice(0, 2),
      facilities: Array.from(new Set(facilitiesList)).slice(0, 5 + (i % 5)),
      collegeIntelligenceScore: intelligenceScore,
      roiScore: roi,
      scholarshipFriendly: ownership === 'Government' || i % 3 === 0,
      trending: rating >= 4.3 && Math.random() > 0.5,
      courses: courses
    });
  }

  // Write files
  const dataPath = path.join(process.cwd(), 'prisma', 'india-colleges-raw.json');
  fs.writeFileSync(dataPath, JSON.stringify({ colleges }, null, 2), 'utf-8');
  console.log(`Generated ${colleges.length} colleges inside prisma/india-colleges-raw.json`);
}

generateData();
