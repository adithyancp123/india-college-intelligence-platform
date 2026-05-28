import { searchFuzzy } from '../ingestion';
import { getColleges } from '../data-service';
import { College } from '../mock-data';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export async function parseAndAnswerQuery(queryText: string): Promise<string> {
  const query = queryText.toLowerCase().trim();

  // 1. Check for ROI query
  if (query.includes('roi') || query.includes('return on investment') || query.includes('value for money')) {
    // Fetch colleges, sort by ROI
    const result = await getColleges({
      sortBy: 'roiScore',
      sortOrder: 'desc',
      limit: 3
    });
    
    if (result && result.data && result.data.colleges.length > 0) {
      let response = `### 📊 Best Value-for-Money (ROI) Technical Camps in India\n\nReturn on Investment (ROI) is calculated as the ratio of the average annual placement package to the yearly tuition fee. Here are the top-ranked options:\n\n`;
      response += `| College Name | Average Package | Annual Fees | ROI Multiplier |\n| :--- | :--- | :--- | :--- |\n`;
      result.data.colleges.forEach((c: any) => {
        response += `| **${c.name}** | ${c.averagePackage} LPA | ₹${c.fees.toLocaleString()} | **${(c.roiScore || 1.0).toFixed(1)}x** |\n`;
      });
      response += `\n> [!TIP]\n> Goverment-funded institutions like **IITs/NITs** present high ROI coefficients due to heavily subsidized state fee parameters combined with elite corporate placements.`;
      return response;
    }
  }

  // 2. Check for private vs government query
  if (query.includes('private vs government') || query.includes('government vs private') || query.includes('govt vs private')) {
    return `### 🏛️ Government vs. Private Engineering Colleges: Key Differences\n\nWhen making your academic decisions, evaluating these standard operational metrics is crucial:\n\n1. **Tuition Fee & Expenses**:\n   * **Government (IITs/NITs/State-aided)**: Fees range from ₹1.2L to ₹2.5L per annum. Highly subsidized by state funds.\n   * **Private (BITS/VIT/Manipal)**: Fees range from ₹3.5L to ₹6L per annum. Self-financed structural parameters.\n\n2. **Academic & Cutoff Rigour**:\n   * **Government**: Elite cutoffs (requiring JEE Main/Advanced top percentiles). Extremely high competitive peer group.\n   * **Private**: Broader entry paths (conducting private exams like BITSAT, VITEEE or direct management seats).\n\n3. **Placement & Brand Power**:\n   * **BITS Pilani** matches and frequently exceeds top-tier IIT placements, despite being private, due to complete academic flexibility (Zero Attendance policy).\n   * Government brands like **IIT Bombay** carry immense global recognition and state funding boosts for research laboratories.`;
  }

  // 3. Check for specific branch & state & budget constraints
  // e.g. "Can I get CSE in Karnataka under ₹2 lakh?"
  let branchFilter = '';
  if (query.includes('cse') || query.includes('computer science')) branchFilter = 'computer science';
  else if (query.includes('ai') || query.includes('machine learning') || query.includes('ml')) branchFilter = 'machine learning';
  else if (query.includes('ece') || query.includes('electronics')) branchFilter = 'electronics';

  let stateFilter = '';
  if (query.includes('karnataka')) stateFilter = 'Karnataka';
  else if (query.includes('maharashtra')) stateFilter = 'Maharashtra';
  else if (query.includes('delhi')) stateFilter = 'Delhi';
  else if (query.includes('telangana') || query.includes('hyderabad')) stateFilter = 'Telangana';
  else if (query.includes('tamil nadu') || query.includes('chennai')) stateFilter = 'Tamil Nadu';

  let maxBudget = 10000000;
  const budgetMatch = query.match(/(?:under|below|within|max)\s*₹?\s*(\d+)\s*(?:lakh|lakhs|l|lac)?/);
  if (budgetMatch) {
    const num = parseInt(budgetMatch[1]);
    if (query.includes('lakh') || query.includes('l') || query.includes('lac')) {
      maxBudget = num * 100000;
    } else if (num < 100) { // e.g. "under 2" implying lakhs
      maxBudget = num * 100000;
    } else {
      maxBudget = num;
    }
  }

  if (branchFilter || stateFilter || maxBudget < 10000000) {
    const result = await getColleges({
      state: stateFilter || undefined,
      course: branchFilter || undefined,
      maxFees: maxBudget,
      sortBy: 'rating',
      limit: 3
    });

    if (result && result.data && result.data.colleges.length > 0) {
      let response = `### 🔍 Targeted Recommendations Matching Your Preferences\n\nBased on your query parameters, we scanned our large-scale normalized India college intelligence dataset and matched these top campuses:\n\n`;
      response += `| College Name | Location | Annual Fees | Top Exams Accepted |\n| :--- | :--- | :--- | :--- |\n`;
      result.data.colleges.forEach((c: any) => {
        response += `| **${c.name}** | ${c.city}, ${c.state} | ₹${c.fees.toLocaleString()} | \`${c.exams.join(', ')}\` |\n`;
      });
      response += `\n> [!NOTE]\n> Mapped recommendations are based on annual tuition costs. Cutoffs will vary dynamically based on JoSAA rounds and counseling registrations.`;
      return response;
    } else {
      return `### 🔍 Parameter Analysis\n\nWe couldn't locate any colleges matching your exact target criteria (**${branchFilter || 'B.Tech/MBA'}** in **${stateFilter || 'Any State'}** under **₹${maxBudget.toLocaleString()}**).\n\n**Advice**: Try expanding your budget limits or removing branch restrictions to view standard merit-aided options in that region!`;
    }
  }

  // 4. Default fuzzy match search response
  const fuzzyColleges = await searchFuzzy(queryText, 3);
  if (fuzzyColleges.length > 0) {
    let response = `### 🤝 Admissions Counselor Suggestions\n\nI located these highly relevant campus options matching your keywords **"${queryText}"**:\n\n`;
    fuzzyColleges.forEach((c: any) => {
      response += `*   **${c.name}** (${c.city}, ${c.state}) | **Placement Rate**: ${c.placementRate}% | **Avg Package**: ${c.averagePackage} LPA. Accepts \`${c.exams.join(', ')}\`.\n`;
    });
    response += `\nFeel free to ask me about their **ROI scores**, **fee structures**, or **government vs private** comparative metrics!`;
    return response;
  }

  return `### 👋 Welcome to the AI Chat College Counselor!\n\nI am your dedicated college admissions advisor. I can help you query our database of **254+ real Indian colleges** to make smarter, data-driven decisions.\n\n**Try asking me questions like:**\n*   *"Can I get CSE in Karnataka under ₹2 lakh?"*\n*   *"Which colleges have the best ROI in Delhi?"*\n*   *"Explain Private vs Government colleges"*`;
}
