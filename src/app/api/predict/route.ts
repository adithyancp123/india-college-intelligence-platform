import { NextResponse } from 'next/server';
import { readFallbackDb } from '@/lib/mock-data';
import { prisma, checkDatabaseConnection } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      exam = 'JEE Main',
      rank = 10000,
      budget = 1000000,
      preferredState = 'All',
      preferredCity = '',
      branch = 'Computer Science',
      collegeType = 'All', // "Government" | "Private" | "All"
      placementExpectation = 0, // Min Average LPA package
    } = body;

    // 1. Fetch all colleges and courses
    let colleges: any[] = [];
    let courses: any[] = [];

    const isDbOnline = await checkDatabaseConnection();
    if (isDbOnline && prisma) {
      colleges = await prisma.college.findMany({
        include: { courses: true }
      });
      // Flatten courses with college embedded
      colleges.forEach(col => {
        if (col.courses) {
          col.courses.forEach((crs: any) => {
            courses.push({
              ...crs,
              college: col
            });
          });
        }
      });
    } else {
      const fallbackDb = readFallbackDb();
      colleges = fallbackDb.colleges;
      // Map courses with college
      fallbackDb.courses.forEach(crs => {
        const col = colleges.find(c => c.id === crs.collegeId);
        if (col) {
          courses.push({
            ...crs,
            college: col
          });
        }
      });
    }

    // 2. Filter courses based on user choices
    const filteredCourses = courses.filter(crs => {
      const col = crs.college;
      
      // Match Exam
      if (crs.exam.toLowerCase() !== exam.toLowerCase() && !col.exams.some((ex: string) => ex.toLowerCase() === exam.toLowerCase())) {
        return false;
      }

      // Match Branch/Course (e.g. Computer Science, Electronics, MBA, Commerce)
      const branchLower = branch.toLowerCase();
      const courseNameLower = crs.name.toLowerCase();
      let matchesBranch = false;
      if (branchLower === 'all') {
        matchesBranch = true;
      } else if (branchLower.includes('computer') || branchLower.includes('cse')) {
        matchesBranch = courseNameLower.includes('computer') || courseNameLower.includes('cse') || courseNameLower.includes('information');
      } else if (branchLower.includes('electronics') || branchLower.includes('ece')) {
        matchesBranch = courseNameLower.includes('electronics') || courseNameLower.includes('ece') || courseNameLower.includes('electrical');
      } else if (branchLower.includes('mba') || branchLower.includes('management')) {
        matchesBranch = courseNameLower.includes('management') || courseNameLower.includes('mba') || courseNameLower.includes('business');
      } else if (branchLower.includes('commerce') || branchLower.includes('finance')) {
        matchesBranch = courseNameLower.includes('commerce') || courseNameLower.includes('b.com') || courseNameLower.includes('finance');
      } else {
        matchesBranch = courseNameLower.includes(branchLower);
      }

      if (!matchesBranch) return false;

      // Match Budget (course annual fees)
      if (crs.fees > budget) return false;

      // Match College Type (Government vs Private)
      if (collegeType !== 'All' && col.ownership.toLowerCase() !== collegeType.toLowerCase()) {
        return false;
      }

      // Match Preferred State
      if (preferredState !== 'All' && col.state.toLowerCase() !== preferredState.toLowerCase()) {
        return false;
      }

      // Match Preferred City
      if (preferredCity && col.city.toLowerCase() !== preferredCity.toLowerCase()) {
        return false;
      }

      // Match Placement Expectation
      if (col.averagePackage < placementExpectation) return false;

      return true;
    });

    // 3. Score and Categorize matches
    const recommendations = filteredCourses.map(crs => {
      const col = crs.college;
      const cutoff = crs.cutoffRank;
      const isPercentile = exam.toUpperCase() === 'CAT' || exam.toUpperCase() === 'MAT' || exam.toUpperCase() === 'XAT';

      let category: 'Safe' | 'Target' | 'Stretch' = 'Target';
      let scoreDiff = 0;
      let ratio = 1;

      if (isPercentile) {
        // Higher is better for percentiles
        scoreDiff = rank - cutoff; // Candidate score - cutoff threshold
        if (scoreDiff >= 5) {
          category = 'Safe';
        } else if (scoreDiff >= 0 && scoreDiff < 5) {
          category = 'Target';
        } else if (scoreDiff >= -8 && scoreDiff < 0) {
          category = 'Stretch';
        } else {
          return null; // Rank too low
        }
      } else {
        // Lower is better for ranks
        scoreDiff = cutoff - rank; // cutoff threshold - candidate rank
        ratio = rank / cutoff;
        if (ratio <= 0.85) {
          category = 'Safe';
        } else if (ratio > 0.85 && ratio <= 1.15) {
          category = 'Target';
        } else if (ratio > 1.15 && ratio <= 1.55) {
          category = 'Stretch';
        } else {
          return null; // Rank too poor
        }
      }

      // Compute match confidence percentage (0 to 100)
      let confidence = 50;
      if (category === 'Safe') {
        confidence = 85 + Math.min(10, Math.floor(Math.abs(scoreDiff) / (isPercentile ? 1 : (cutoff * 0.15))));
      } else if (category === 'Target') {
        confidence = 65 + Math.floor((isPercentile ? (scoreDiff + 5) * 2 : (1.15 - ratio) * 60));
      } else {
        confidence = 40 + Math.floor((isPercentile ? (scoreDiff + 12) * 2 : (1.55 - ratio) * 50));
      }
      confidence = Math.max(30, Math.min(99, confidence));

      // Build personalized text fits
      let fitReason = '';
      if (category === 'Safe') {
        fitReason = `Your score of ${rank} ${isPercentile ? 'percentile' : 'rank'} is well within the historical cutoff of ${cutoff}. You have an exceptionally high probability of securing admission.`;
      } else if (category === 'Target') {
        fitReason = `Your score of ${rank} ${isPercentile ? 'percentile' : 'rank'} matches close to the median cutoff of ${cutoff}. This college represents a highly realistic target option for this admission cycle.`;
      } else {
        fitReason = `The historical cutoff is ${cutoff}. With your score of ${rank}, securing admission here is competitive but possible during subsequent seat allotment rounds.`;
      }

      const budgetPercentSaved = Math.max(0, Math.floor(((budget - crs.fees) / budget) * 100));
      let valueReason = budgetPercentSaved > 20 
        ? `Saves ${budgetPercentSaved}% of your budget with an excellent annual fee of ₹${crs.fees.toLocaleString('en-IN')}.` 
        : `Fits comfortably in your specified budget.`;

      const roiRatio = col.roiScore;

      return {
        collegeId: col.id,
        collegeName: col.name,
        location: col.location,
        state: col.state,
        city: col.city,
        logoUrl: col.logoUrl,
        bannerUrl: col.bannerUrl,
        nirfRank: col.nirfRank,
        rating: col.rating,
        ownership: col.ownership,
        averagePackage: col.averagePackage,
        highestPackage: col.highestPackage,
        placementRate: col.placementRate,
        roiScore: col.roiScore,
        collegeIntelligenceScore: col.collegeIntelligenceScore,
        scholarshipFriendly: col.scholarshipFriendly,
        accreditation: col.accreditation,
        website: col.website,
        exams: col.exams,
        facilities: col.facilities,
        trending: col.trending,
        description: col.description || '',
        established: col.established || 2000,
        courseName: crs.name,
        courseFees: crs.fees,
        courseCutoff: crs.cutoffRank,
        exam: crs.exam,
        category,
        confidenceScore: confidence,
        explanation: `${fitReason} additionally, the program offers a high ROI rating of ${roiRatio}/10. ${valueReason}`,
        whySelected: `Recommended because it matches your preferred exam (${exam}), branch (${branch}), and is located in ${col.city} (${col.state}). It provides solid average placement salary packages of ${col.averagePackage} LPA.`,
      };
    }).filter(Boolean) as any[];

    // Sort recommendations by confidence score and rating
    recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore || b.rating - a.rating);

    // 4. Extract specialized categorized alternatives
    const roiAlternatives = [...recommendations]
      .sort((a, b) => b.roiScore - a.roiScore)
      .slice(0, 3);

    const scholarshipOptions = recommendations.filter(r => r.scholarshipFriendly).slice(0, 3);
    const placementFocused = [...recommendations]
      .sort((a, b) => b.averagePackage - a.averagePackage)
      .slice(0, 3);
    
    const affordableOptions = [...recommendations]
      .sort((a, b) => a.courseFees - b.courseFees)
      .slice(0, 3);

    return NextResponse.json({
      recommendations: recommendations.slice(0, 10), // return top 10 general recommendations
      roiAlternatives,
      scholarshipOptions,
      placementFocused,
      affordableOptions,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Prediction API Error:', error);
    return NextResponse.json({ error: 'Failed to compute recommendations' }, { status: 500 });
  }
}
