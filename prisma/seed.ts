import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getCollegeImages } from '../src/lib/image-mapper';

const connectionString = process.env.DATABASE_URL;

async function main() {
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }

  console.log('Connecting to PostgreSQL database for seeding...');
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Clearing existing data...');
  await prisma.savedComparison.deleteMany({});
  await prisma.savedCollege.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.college.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating demo user...');
  const user = await prisma.user.create({
    data: {
      id: 'demo-user-1',
      email: 'student@example.com',
      name: 'Aditya Kumar',
      password: '$2a$10$TqyUfQ/UfQ1u0Q3.vO11ze/Wj2bZ464i6N.p013zXU90J4hZ2bU7W' // 'password123'
    }
  });

  console.log('Creating colleges...');
  const collegesData = [
    {
      id: 'col-1',
      name: 'Indian Institute of Technology, Bombay (IITB)',
      location: 'Mumbai, Maharashtra',
      fees: 220000,
      rating: 4.9,
      description: 'Established in 1958, IIT Bombay is one of the premier engineering and research institutes in India, globally recognized for academic excellence and innovation.',
      established: 1958,
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop&q=80',
      placementRate: 98.4,
      averagePackage: 23.5,
      highestPackage: 168.0
    },
    {
      id: 'col-2',
      name: 'BITS Pilani, Pilani Campus',
      location: 'Pilani, Rajasthan',
      fees: 480000,
      rating: 4.7,
      description: 'BITS Pilani is a leading private deemed university known for its flexible academic structure, strong alumni network, and excellent placements in tech and finance.',
      established: 1964,
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80',
      placementRate: 95.0,
      averagePackage: 19.8,
      highestPackage: 60.5
    },
    {
      id: 'col-3',
      name: 'Indian Institute of Management, Ahmedabad (IIMA)',
      location: 'Ahmedabad, Gujarat',
      fees: 1150000,
      rating: 4.95,
      description: 'The top-ranked business school in India, famous for its rigorous case-study pedagogy, world-class faculty, and global career opportunities.',
      established: 1961,
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=1200&h=400&fit=crop&q=80',
      placementRate: 100.0,
      averagePackage: 32.7,
      highestPackage: 115.0
    },
    {
      id: 'col-4',
      name: 'Delhi Technological University (DTU)',
      location: 'New Delhi, Delhi',
      fees: 190000,
      rating: 4.4,
      description: 'Formerly known as Delhi College of Engineering (DCE), DTU is one of India\'s oldest and most prestigious engineering institutions, producing industry leaders for decades.',
      established: 1941,
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80',
      placementRate: 91.2,
      averagePackage: 15.3,
      highestPackage: 64.0
    },
    {
      id: 'col-5',
      name: 'Vellore Institute of Technology (VIT)',
      location: 'Vellore, Tamil Nadu',
      fees: 200000,
      rating: 4.1,
      description: 'VIT is a highly ranked private university offering state-of-the-art infrastructure, flexible credit systems, and massive industrial placement drives.',
      established: 1984,
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop&q=80',
      placementRate: 88.5,
      averagePackage: 9.2,
      highestPackage: 44.0
    },
    {
      id: 'col-6',
      name: 'National Institute of Technology, Trichy (NITT)',
      location: 'Tiruchirappalli, Tamil Nadu',
      fees: 145000,
      rating: 4.6,
      description: 'NIT Trichy is consistently ranked as the number one National Institute of Technology in India, highly regarded for engineering disciplines.',
      established: 1964,
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=1200&h=400&fit=crop&q=80',
      placementRate: 94.8,
      averagePackage: 17.5,
      highestPackage: 52.8
    },
    {
      id: 'col-7',
      name: 'Manipal Institute of Technology (MIT Manipal)',
      location: 'Manipal, Karnataka',
      fees: 325000,
      rating: 4.2,
      description: 'MIT Manipal is a premier private college offering holistic education, superb campus facilities, and outstanding international student exchange programs.',
      established: 1957,
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop&q=80',
      placementRate: 89.0,
      averagePackage: 10.5,
      highestPackage: 43.3
    },
    {
      id: 'col-8',
      name: 'SRM Institute of Science and Technology (SRM)',
      location: 'Chennai, Tamil Nadu',
      fees: 260000,
      rating: 4.0,
      description: 'One of the largest private university campuses in India, SRM offers diverse engineering courses and multi-disciplinary career paths.',
      established: 1985,
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80',
      placementRate: 86.0,
      averagePackage: 8.5,
      highestPackage: 41.6
    },
    {
      id: 'col-9',
      name: 'Indian Institute of Technology, Madras (IITM)',
      location: 'Chennai, Tamil Nadu',
      fees: 215000,
      rating: 4.95,
      description: 'IIT Madras has been ranked the No. 1 Engineering Institute in India for several consecutive years, hosting the advanced IITM Research Park.',
      established: 1959,
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=1200&h=400&fit=crop&q=80',
      placementRate: 97.5,
      averagePackage: 22.8,
      highestPackage: 131.0
    },
    {
      id: 'col-10',
      name: 'Indian Institute of Science (IISc), Bangalore',
      location: 'Bengaluru, Karnataka',
      fees: 35000,
      rating: 4.98,
      description: 'A pre-eminent institute for advanced scientific research and engineering in India, IISc is globally renowned for its academic contributions and postgraduate research.',
      established: 1909,
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80',
      placementRate: 92.0,
      averagePackage: 26.0,
      highestPackage: 85.0
    },
    {
      id: 'col-11',
      name: 'Indian Institute of Technology, Delhi (IITD)',
      location: 'New Delhi, Delhi',
      fees: 225000,
      rating: 4.92,
      description: 'IIT Delhi is a premier public research university located in Hauz Khas, Delhi. It is one of the oldest IITs and consistently ranked in the top 3 engineering colleges in India.',
      established: 1961,
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop&q=80',
      placementRate: 96.5,
      averagePackage: 21.9,
      highestPackage: 125.0
    },
    {
      id: 'col-12',
      name: 'Indian Institute of Management, Bangalore (IIMB)',
      location: 'Bengaluru, Karnataka',
      fees: 1100000,
      rating: 4.94,
      description: 'IIM Bangalore is a leading graduate school of management in Asia. Established in 1973, it is known for its beautiful campus and highly competitive management programs.',
      established: 1973,
      logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&h=128&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5c?w=1200&h=400&fit=crop&q=80',
      placementRate: 100.0,
      averagePackage: 30.1,
      highestPackage: 95.5
    }
  ];

  for (const college of collegesData) {
    const images = getCollegeImages(college.id, college.name);
    await prisma.college.create({
      data: {
        ...college,
        logoUrl: images.logoUrl,
        bannerUrl: images.bannerUrl
      }
    });
  }

  console.log('Creating courses...');
  const coursesData = [
    { id: 'c-1', name: 'B.Tech Computer Science & Engineering', duration: 4, fees: 220000, seats: 120, collegeId: 'col-1' },
    { id: 'c-2', name: 'B.Tech Computer Science & Engineering', duration: 4, fees: 480000, seats: 180, collegeId: 'col-2' },
    { id: 'c-3', name: 'B.Tech Computer Science & Engineering', duration: 4, fees: 190000, seats: 240, collegeId: 'col-4' },
    { id: 'c-4', name: 'B.Tech Computer Science & Engineering', duration: 4, fees: 200000, seats: 600, collegeId: 'col-5' },
    { id: 'c-5', name: 'B.Tech Computer Science & Engineering', duration: 4, fees: 145000, seats: 90, collegeId: 'col-6' },
    { id: 'c-6', name: 'B.Tech Computer Science & Engineering', duration: 4, fees: 325000, seats: 200, collegeId: 'col-7' },
    { id: 'c-7', name: 'B.Tech Computer Science & Engineering', duration: 4, fees: 260000, seats: 450, collegeId: 'col-8' },
    { id: 'c-8', name: 'B.Tech Computer Science & Engineering', duration: 4, fees: 215000, seats: 120, collegeId: 'col-9' },
    { id: 'c-16', name: 'B.Tech Computer Science & Engineering', duration: 4, fees: 225000, seats: 150, collegeId: 'col-11' },

    { id: 'c-9', name: 'B.Tech Electronics & Communication', duration: 4, fees: 220000, seats: 90, collegeId: 'col-1' },
    { id: 'c-10', name: 'B.Tech Electronics & Communication', duration: 4, fees: 480000, seats: 120, collegeId: 'col-2' },
    { id: 'c-11', name: 'B.Tech Electronics & Communication', duration: 4, fees: 190000, seats: 180, collegeId: 'col-4' },
    { id: 'c-12', name: 'B.Tech Electrical & Electronics', duration: 4, fees: 145000, seats: 90, collegeId: 'col-6' },

    { id: 'c-13', name: 'Post Graduate Program in Management (MBA)', duration: 2, fees: 1150000, seats: 380, collegeId: 'col-3' },
    { id: 'c-17', name: 'Post Graduate Program in Management (MBA)', duration: 2, fees: 1100000, seats: 400, collegeId: 'col-12' },
    { id: 'c-14', name: 'M.Tech Computer Science', duration: 2, fees: 30000, seats: 50, collegeId: 'col-10' },
    { id: 'c-15', name: 'Bachelor of Science (Research)', duration: 4, fees: 25000, seats: 120, collegeId: 'col-10' }
  ];

  for (const course of coursesData) {
    await prisma.course.create({ data: course });
  }

  console.log('Creating reviews...');
  const reviewsData = [
    {
      id: 'rev-1',
      rating: 5,
      comment: 'Absolutely unmatched academic rigor and peer group. The campus life at IIT Bombay is incredible, and the coding culture is world-class.',
      userId: 'demo-user-1',
      collegeId: 'col-1'
    },
    {
      id: 'rev-2',
      rating: 4.8,
      comment: 'BITS Pilani offers complete flexibility with its zero-attendance policy and dual degree options. Very high quality placement companies.',
      userId: 'demo-user-1',
      collegeId: 'col-2'
    },
    {
      id: 'rev-3',
      rating: 5,
      comment: 'The case study method prepares you for real-world business challenges. Outstanding peer learning and massive salary packages.',
      userId: 'demo-user-1',
      collegeId: 'col-3'
    }
  ];

  for (const review of reviewsData) {
    await prisma.review.create({ data: review });
  }

  console.log('Creating pre-configured comparison profiles...');
  await prisma.savedComparison.create({
    data: {
      id: 'comp-seed-1',
      name: 'Top Tier Engineering Choices',
      collegeIds: ['col-1', 'col-2', 'col-9'],
      userId: 'demo-user-1'
    }
  });

  console.log('Seeding completed successfully!');
  await pool.end();
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  });
