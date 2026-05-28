import { prisma, checkDatabaseConnection } from './db';
import * as mockDb from './mock-data';

let isDbOnline = false;
let lastCheckTime = 0;
const CHECK_INTERVAL_MS = 10000; // Check DB status every 10s at most

async function isPostgresAvailable(): Promise<boolean> {
  const now = Date.now();
  if (now - lastCheckTime > CHECK_INTERVAL_MS) {
    isDbOnline = await checkDatabaseConnection();
    lastCheckTime = now;
  }
  return isDbOnline;
}

// Helper to run query with fallback
async function executeQuery<T>(prismaQuery: () => Promise<T>, mockQuery: () => T): Promise<{ data: T; isFallback: boolean }> {
  const online = await isPostgresAvailable();
  if (online) {
    try {
      const result = await prismaQuery();
      return { data: result, isFallback: false };
    } catch (error) {
      console.error('Database query failed. Falling back to JSON database.', error);
      isDbOnline = false; // Mark offline for future queries
      return { data: mockQuery(), isFallback: true };
    }
  }
  return { data: mockQuery(), isFallback: true };
}

// 1. College Listing, Search, Filters, Sorting, and Pagination
export async function getColleges(params: {
  search?: string;
  state?: string;
  city?: string;
  ownership?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  minPlacementRate?: number;
  minPackage?: number;
  nirfRankMax?: number;
  exams?: string[];
  accreditation?: string;
  course?: string;
  roiScoreMin?: number;
  scholarshipFriendly?: boolean;
  trending?: boolean;
  sortBy?: 'fees' | 'rating' | 'averagePackage' | 'placementRate' | 'collegeIntelligenceScore' | 'roiScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  const search = params.search || '';
  const state = params.state || '';
  const city = params.city || '';
  const ownership = params.ownership || 'all';
  const minFees = params.minFees ?? 0;
  const maxFees = params.maxFees ?? 10000000;
  const minRating = params.minRating ?? 0;
  const minPlacementRate = params.minPlacementRate ?? 0;
  const minPackage = params.minPackage ?? 0;
  const nirfRankMax = params.nirfRankMax ?? null;
  const exams = params.exams || [];
  const accreditation = params.accreditation || '';
  const course = params.course || '';
  const roiScoreMin = params.roiScoreMin ?? 0;
  const scholarshipFriendly = params.scholarshipFriendly ?? false;
  const trending = params.trending ?? false;

  const sortBy = params.sortBy || 'rating';
  const sortOrder = params.sortOrder || 'desc';
  const page = params.page || 1;
  const limit = params.limit || 6;
  const skip = (page - 1) * limit;

  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      // Prisma filter
      const where: any = {
        fees: { gte: minFees, lte: maxFees },
        rating: { gte: minRating },
        placementRate: { gte: minPlacementRate },
        averagePackage: { gte: minPackage },
        roiScore: { gte: roiScoreMin }
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (state) {
        where.state = { contains: state, mode: 'insensitive' };
      }

      if (city) {
        where.city = { contains: city, mode: 'insensitive' };
      }

      if (ownership && ownership !== 'all') {
        where.ownership = { equals: ownership, mode: 'insensitive' };
      }

      if (accreditation) {
        where.accreditation = { contains: accreditation, mode: 'insensitive' };
      }

      if (scholarshipFriendly) {
        where.scholarshipFriendly = true;
      }

      if (trending) {
        where.trending = true;
      }

      if (nirfRankMax) {
        where.nirfRank = { lte: nirfRankMax, not: null };
      }

      if (exams.length > 0) {
        where.exams = { hasSome: exams };
      }

      if (course) {
        where.courses = {
          some: {
            name: { contains: course, mode: 'insensitive' }
          }
        };
      }

      const total = await prisma.college.count({ where });
      const colleges = await prisma.college.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      });

      return {
        colleges: colleges.map(c => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          syncLastUpdated: c.syncLastUpdated.toISOString(),
        })),
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    },
    () => {
      const data = mockDb.readFallbackDb();
      let filtered = data.colleges.filter(c => {
        // Fuzzy search matching
        const matchesSearch =
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.location.toLowerCase().includes(search.toLowerCase()) ||
          c.state.toLowerCase().includes(search.toLowerCase()) ||
          c.city.toLowerCase().includes(search.toLowerCase()) ||
          c.exams.some(ex => ex.toLowerCase().includes(search.toLowerCase()));

        const matchesState = !state || c.state.toLowerCase() === state.toLowerCase();
        const matchesCity = !city || c.city.toLowerCase() === city.toLowerCase();
        const matchesOwnership = ownership === 'all' || c.ownership.toLowerCase() === ownership.toLowerCase();
        const matchesFees = c.fees >= minFees && c.fees <= maxFees;
        const matchesRating = c.rating >= minRating;
        const matchesPlacementRate = c.placementRate >= minPlacementRate;
        const matchesPackage = c.averagePackage >= minPackage;
        const matchesRoi = c.roiScore >= roiScoreMin;
        const matchesScholarship = !scholarshipFriendly || c.scholarshipFriendly;
        const matchesTrending = !trending || c.trending;
        const matchesNirf = !nirfRankMax || (c.nirfRank !== null && c.nirfRank <= nirfRankMax);
        const matchesExams = exams.length === 0 || c.exams.some(ex => exams.includes(ex));
        
        let matchesCourse = true;
        if (course) {
          const colCourses = data.courses.filter(crs => crs.collegeId === c.id);
          matchesCourse = colCourses.some(crs => crs.name.toLowerCase().includes(course.toLowerCase()));
        }

        return (
          matchesSearch &&
          matchesState &&
          matchesCity &&
          matchesOwnership &&
          matchesFees &&
          matchesRating &&
          matchesPlacementRate &&
          matchesPackage &&
          matchesRoi &&
          matchesScholarship &&
          matchesTrending &&
          matchesNirf &&
          matchesExams &&
          matchesCourse
        );
      });

      // Sorting
      filtered.sort((a: any, b: any) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        
        // Handle nulls for NIRF rank (put at bottom for desc, top for asc)
        if (sortBy === 'fees' && valA === undefined) valA = 99999999;
        if (sortBy === 'fees' && valB === undefined) valB = 99999999;

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);

      return {
        colleges: paginated,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    }
  );
}

// 2. College Detail Page (with courses and reviews)
export async function getCollegeById(id: string) {
  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      const college = await prisma.college.findUnique({
        where: { id },
        include: {
          courses: true,
          reviews: {
            include: {
              user: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!college) return null;

      return {
        ...college,
        createdAt: college.createdAt.toISOString(),
        updatedAt: college.updatedAt.toISOString(),
        syncLastUpdated: college.syncLastUpdated.toISOString(),
        courses: college.courses.map(course => ({
          ...course,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
        })),
        reviews: college.reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          userId: review.userId,
          userName: review.user.name,
          collegeId: review.collegeId,
          createdAt: review.createdAt.toISOString(),
        })),
      };
    },
    () => {
      const data = mockDb.readFallbackDb();
      const college = data.colleges.find(c => c.id === id);
      if (!college) return null;

      const courses = data.courses.filter(c => c.collegeId === id);
      const reviews = data.reviews.filter(r => r.collegeId === id);

      return {
        ...college,
        courses,
        reviews,
      };
    }
  );
}

// 3. User Authentication Data Queries
export async function getUserByEmail(email: string) {
  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.password,
      };
    },
    () => {
      const data = mockDb.readFallbackDb();
      const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  );
}

export async function createUser(email: string, name: string, passwordHash: string) {
  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: passwordHash,
        },
      });
      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    },
    () => {
      const data = mockDb.readFallbackDb();
      const newUser = {
        id: 'user-' + Date.now(),
        email,
        name,
        passwordHash,
      };
      data.users.push(newUser);
      mockDb.writeFallbackDb(data);
      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      };
    }
  );
}

// 4. College Saved Status Actions
export async function toggleSavedCollege(userId: string, collegeId: string) {
  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      const existing = await prisma.savedCollege.findUnique({
        where: {
          userId_collegeId: { userId, collegeId },
        },
      });

      if (existing) {
        await prisma.savedCollege.delete({
          where: {
            userId_collegeId: { userId, collegeId },
          },
        });
        return { saved: false };
      } else {
        await prisma.savedCollege.create({
          data: { userId, collegeId },
        });
        return { saved: true };
      }
    },
    () => {
      const data = mockDb.readFallbackDb();
      const index = data.savedColleges.findIndex(sc => sc.userId === userId && sc.collegeId === collegeId);

      if (index > -1) {
        data.savedColleges.splice(index, 1);
        mockDb.writeFallbackDb(data);
        return { saved: false };
      } else {
        data.savedColleges.push({
          id: 'sc-' + Date.now(),
          userId,
          collegeId,
          createdAt: new Date().toISOString(),
        });
        mockDb.writeFallbackDb(data);
        return { saved: true };
      }
    }
  );
}

export async function getSavedColleges(userId: string) {
  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      const saved = await prisma.savedCollege.findMany({
        where: { userId },
        include: { college: true },
      });
      return saved.map(s => ({
        ...s.college,
        createdAt: s.college.createdAt.toISOString(),
        updatedAt: s.college.updatedAt.toISOString(),
        syncLastUpdated: s.college.syncLastUpdated.toISOString(),
      }));
    },
    () => {
      const data = mockDb.readFallbackDb();
      const savedIds = data.savedColleges.filter(sc => sc.userId === userId).map(sc => sc.collegeId);
      return data.colleges.filter(c => savedIds.includes(c.id));
    }
  );
}

// 5. Submit College Review
export async function submitReview(params: {
  collegeId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}) {
  const { collegeId, userId, userName, rating, comment } = params;

  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      // Upsert review
      const review = await prisma.review.upsert({
        where: {
          userId_collegeId: { userId, collegeId },
        },
        update: { rating, comment },
        create: { userId, collegeId, rating, comment },
      });

      // Recalculate average rating of the college
      const reviews = await prisma.review.findMany({
        where: { collegeId },
        select: { rating: true },
      });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const newRating = parseFloat((totalRating / reviews.length).toFixed(2));

      await prisma.college.update({
        where: { id: collegeId },
        data: { rating: newRating },
      });

      return {
        ...review,
        userName,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      };
    },
    () => {
      const data = mockDb.readFallbackDb();
      const existingIndex = data.reviews.findIndex(r => r.userId === userId && r.collegeId === collegeId);

      const review: mockDb.Review = {
        id: existingIndex > -1 ? data.reviews[existingIndex].id : 'rev-' + Date.now(),
        rating,
        comment,
        userId,
        userName,
        collegeId,
        createdAt: new Date().toISOString(),
      };

      if (existingIndex > -1) {
        data.reviews[existingIndex] = review;
      } else {
        data.reviews.push(review);
      }

      // Recalculate rating
      const collegeReviews = data.reviews.filter(r => r.collegeId === collegeId);
      const totalRating = collegeReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = parseFloat((totalRating / collegeReviews.length).toFixed(2));

      const collegeIndex = data.colleges.findIndex(c => c.id === collegeId);
      if (collegeIndex > -1) {
        data.colleges[collegeIndex].rating = avgRating;
      }

      mockDb.writeFallbackDb(data);
      return review;
    }
  );
}

// 6. Saved Comparisons Actions
export async function saveComparison(userId: string, name: string, collegeIds: string[]) {
  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      const comparison = await prisma.savedComparison.create({
        data: {
          name,
          collegeIds,
          userId,
        },
      });
      return {
        ...comparison,
        createdAt: comparison.createdAt.toISOString(),
      };
    },
    () => {
      const data = mockDb.readFallbackDb();
      const newComp: mockDb.SavedComparison = {
        id: 'comp-' + Date.now(),
        name,
        collegeIds,
        userId,
        createdAt: new Date().toISOString(),
      };
      data.savedComparisons.push(newComp);
      mockDb.writeFallbackDb(data);
      return newComp;
    }
  );
}

export async function getSavedComparisons(userId: string) {
  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      const comparisons = await prisma.savedComparison.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return comparisons.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      }));
    },
    () => {
      const data = mockDb.readFallbackDb();
      return data.savedComparisons
        .filter(sc => sc.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  );
}

export async function deleteComparison(userId: string, id: string) {
  return executeQuery(
    async () => {
      if (!prisma) throw new Error('Prisma offline');
      await prisma.savedComparison.delete({
        where: { id, userId },
      });
      return { success: true };
    },
    () => {
      const data = mockDb.readFallbackDb();
      const index = data.savedComparisons.findIndex(sc => sc.id === id && sc.userId === userId);
      if (index > -1) {
        data.savedComparisons.splice(index, 1);
        mockDb.writeFallbackDb(data);
        return { success: true };
      }
      return { success: false };
    }
  );
}
