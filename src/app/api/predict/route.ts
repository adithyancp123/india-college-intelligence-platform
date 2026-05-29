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

    // 1. Dynamic Exam Mapping to Base Database Exams (guarantees recommendations exist!)
    let targetExam = exam;
    const nameLower = exam.toLowerCase();
    
    if (nameLower.includes('jee main') || nameLower.includes('viteee') || nameLower.includes('srmjeee') || nameLower.includes('comedk') || nameLower.includes('wbjee') || nameLower.includes('mht cet') || nameLower.includes('kcet') || nameLower.includes('keam') || nameLower.includes('ap eamcet') || nameLower.includes('ts eamcet') || nameLower.includes('gujcet') || nameLower.includes('tnea')) {
      targetExam = 'JEE Main';
    } else if (nameLower.includes('jee advanced') || nameLower.includes('uceed') || nameLower.includes('nid dat')) {
      targetExam = 'JEE Advanced';
    } else if (nameLower.includes('bitsat')) {
      targetExam = 'BITSAT';
    } else if (nameLower.includes('cat') || nameLower.includes('xat') || nameLower.includes('snap') || nameLower.includes('nmat') || nameLower.includes('mat') || nameLower.includes('atma') || nameLower.includes('cmat')) {
      targetExam = 'CAT';
    } else if (nameLower.includes('gate') || nameLower.includes('neet pg') || nameLower.includes('ceed')) {
      targetExam = 'GATE';
    } else {
      // General UG, Law, Design, Commerce fall back to CUET
      targetExam = 'CUET';
    }

    // 2. Score Normalization Parameters
    let candidateRank = Number(rank);
    const higherIsBetter = [
      'CAT', 'XAT', 'MAT', 'CMAT', 'SNAP', 'NMAT', 'ATMA', 
      'BITSAT', 'NEET UG', 'NEET PG', 'GATE', 'TNEA', 'CUET UG', 'CUET PG',
      'CA FOUNDATION', 'CMA', 'CS EXECUTIVE'
    ].includes(exam.toUpperCase());

    if (exam.toUpperCase() === 'TNEA') {
      // TNEA score out of 200 mapped to JEE Main Rank out of 100k
      const pct = (candidateRank / 200) * 100;
      candidateRank = Math.round((100 - pct) * 450 + 1500);
    } else if (exam.toUpperCase() === 'NEET UG') {
      // NEET UG score out of 720 mapped to CUET score out of 800
      candidateRank = Math.round((candidateRank / 720) * 800);
    } else if (exam.toUpperCase() === 'NEET PG') {
      // NEET PG score out of 800 mapped to GATE score out of 1000
      candidateRank = Math.round((candidateRank / 800) * 1000);
    } else if (['XAT', 'SNAP', 'NMAT', 'MAT', 'CMAT', 'ATMA'].includes(exam.toUpperCase())) {
      // Standardize to CAT Percentile directly
    }

    // Fetch all colleges and courses
    let colleges: any[] = [];
    let courses: any[] = [];

    const isDbOnline = await checkDatabaseConnection();
    if (isDbOnline && prisma) {
      colleges = await prisma.college.findMany({
        include: { courses: true }
      });
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

    // Filter courses based on user choices
    const filteredCourses = courses.filter(crs => {
      const col = crs.college;
      
      // Match Exam against mapped base exam
      const matchesExam = crs.exam.toLowerCase() === targetExam.toLowerCase() || col.exams.some((ex: string) => ex.toLowerCase() === targetExam.toLowerCase());
      if (!matchesExam) return false;

      // Match Branch/Course
      const branchLower = branch.toLowerCase();
      const courseNameLower = crs.name.toLowerCase();
      let matchesBranch = false;
      if (branchLower === 'all') {
        matchesBranch = true;
      } else if (branchLower.includes('computer') || branchLower.includes('cse') || branchLower.includes('ai') || branchLower.includes('data') || branchLower.includes('it') || branchLower.includes('robotics')) {
        matchesBranch = courseNameLower.includes('computer') || courseNameLower.includes('cse') || courseNameLower.includes('information') || courseNameLower.includes('ai') || courseNameLower.includes('ml') || courseNameLower.includes('data');
      } else if (branchLower.includes('electronics') || branchLower.includes('ece') || branchLower.includes('eee')) {
        matchesBranch = courseNameLower.includes('electronics') || courseNameLower.includes('ece') || courseNameLower.includes('electrical');
      } else if (branchLower.includes('mba') || branchLower.includes('management') || branchLower.includes('finance') || branchLower.includes('marketing') || branchLower.includes('hr') || branchLower.includes('operations') || branchLower.includes('analytics')) {
        matchesBranch = courseNameLower.includes('management') || courseNameLower.includes('mba') || courseNameLower.includes('business');
      } else if (branchLower.includes('commerce') || branchLower.includes('bcom') || branchLower.includes('accounting') || branchLower.includes('economics')) {
        matchesBranch = courseNameLower.includes('commerce') || courseNameLower.includes('b.com') || courseNameLower.includes('finance') || courseNameLower.includes('economics');
      } else {
        matchesBranch = courseNameLower.includes(branchLower);
      }

      if (!matchesBranch) return false;

      // Match Budget (course annual fees)
      if (crs.fees > budget) return false;

      // Match College Type
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

    // Score and Categorize matches
    const recommendations = filteredCourses.map(crs => {
      const col = crs.college;
      const cutoff = crs.cutoffRank;

      let category: 'Safe' | 'Target' | 'Stretch' = 'Target';
      let scoreDiff = 0;
      let ratio = 1;

      if (higherIsBetter) {
        // Higher score/percentile is better
        scoreDiff = candidateRank - cutoff;
        if (scoreDiff >= 5) {
          category = 'Safe';
        } else if (scoreDiff >= 0 && scoreDiff < 5) {
          category = 'Target';
        } else if (scoreDiff >= -10 && scoreDiff < 0) {
          category = 'Stretch';
        } else {
          return null; // Score too low
        }
      } else {
        // Lower AIR rank is better
        scoreDiff = cutoff - candidateRank;
        ratio = candidateRank / cutoff;
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

      // Compute match confidence percentage
      let confidence = 50;
      if (category === 'Safe') {
        confidence = 85 + Math.min(10, Math.floor(Math.abs(scoreDiff) / (higherIsBetter ? 1 : (cutoff * 0.15))));
      } else if (category === 'Target') {
        confidence = 65 + Math.floor((higherIsBetter ? (scoreDiff + 5) * 2 : (1.15 - ratio) * 60));
      } else {
        confidence = 40 + Math.floor((higherIsBetter ? (scoreDiff + 12) * 2 : (1.55 - ratio) * 50));
      }
      confidence = Math.max(30, Math.min(99, confidence));

      // Build personalized text fits using the user's input exam label
      let fitReason = '';
      if (category === 'Safe') {
        fitReason = `Your score of ${rank} on ${exam} is well within the historical cutoff of ${cutoff}. You have an exceptionally high probability of securing admission.`;
      } else if (category === 'Target') {
        fitReason = `Your score of ${rank} on ${exam} matches close to the median cutoff of ${cutoff}. This college represents a highly realistic target option for this admission cycle.`;
      } else {
        fitReason = `The historical cutoff is ${cutoff}. With your score of ${rank} on ${exam}, securing admission here is competitive but highly possible during subsequent seat allotment rounds.`;
      }

      const budgetPercentSaved = Math.max(0, Math.floor(((budget - crs.fees) / budget) * 100));
      let valueReason = budgetPercentSaved > 20 
        ? `Saves ${budgetPercentSaved}% of your budget with an excellent annual fee of ₹${crs.fees.toLocaleString('en-IN')}.` 
        : `Fits comfortably in your specified budget.`;

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
        exam, // Display user's selected exam pathway name
        category,
        confidenceScore: confidence,
        explanation: `${fitReason} Additionally, the program offers a high ROI rating of ${col.roiScore}/10. ${valueReason}`,
        whySelected: `Recommended because it matches your preferred exam (${exam}), branch (${branch}), and is located in ${col.city} (${col.state}). It provides solid average placement salary packages of ${col.averagePackage} LPA.`,
      };
    }).filter(Boolean) as any[];

    recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore || b.rating - a.rating);

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
      recommendations: recommendations.slice(0, 10),
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
