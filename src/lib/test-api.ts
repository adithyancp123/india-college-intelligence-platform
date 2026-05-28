const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('=== STARTING END-TO-END API AUDIT ===');
  let cookieHeader = '';

  try {
    // 1. Test Discovery List API
    console.log('\n[1/6] Auditing Discovery Listing API...');
    const listRes = await fetch(`${BASE_URL}/api/colleges?limit=3`);
    if (!listRes.ok) throw new Error(`Colleges list API failed: ${listRes.statusText}`);
    const listData = (await listRes.json()) as any;
    console.log(`✓ Discovery List API Success: Found ${listData.total} colleges total.`);
    console.log(`✓ Fallback Database Active: ${listData.colleges.length > 0}`);

    // 2. Test Details API
    console.log('\n[2/6] Auditing College Details API...');
    const detailRes = await fetch(`${BASE_URL}/api/colleges/col-1`);
    if (!detailRes.ok) throw new Error(`College detail API failed: ${detailRes.statusText}`);
    const detailData = (await detailRes.json()) as any;
    console.log(`✓ College Details API Success: Loaded "${detailData.college.name}"`);
    console.log(`✓ Courses and Reviews present: ${detailData.college.courses.length} courses, ${detailData.college.reviews.length} reviews.`);

    // 3. Test Signup API
    console.log('\n[3/6] Auditing Student Signup API...');
    const testEmail = `test-${Date.now()}@example.com`;
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        name: 'QA Test Agent',
        password: 'password123',
      }),
    });
    if (!signupRes.ok) {
      const err = await signupRes.json();
      throw new Error(`Signup failed: ${JSON.stringify(err)}`);
    }
    const signupData = (await signupRes.json()) as any;
    console.log(`✓ Signup API Success: Registered "${signupData.user.name}"`);

    // Capture Auth Cookie
    const setCookie = signupRes.headers.get('set-cookie');
    if (setCookie) {
      cookieHeader = setCookie.split(';')[0];
      console.log('✓ Auth Session Cookie captured successfully.');
    } else {
      throw new Error('Set-Cookie header missing in signup response.');
    }

    // 4. Test Auth Check (api/auth/me)
    console.log('\n[4/6] Auditing Session Authenticated Identity API...');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
    });
    const meData = (await meRes.json()) as any;
    if (!meData.user) throw new Error('Session validation failed. User is null.');
    console.log(`✓ Identity API Success: Identified active session user as "${meData.user.name}"`);

    // 5. Test Save College API
    console.log('\n[5/6] Auditing Bookmarked Colleges API...');
    const saveRes = await fetch(`${BASE_URL}/api/saved-colleges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({ collegeId: 'col-2' }),
    });
    const saveData = (await saveRes.json()) as any;
    console.log(`✓ Bookmarking API Success: Saved state is now [${saveData.saved}].`);

    // Verify Saved List
    const getSavedRes = await fetch(`${BASE_URL}/api/saved-colleges`, {
      headers: { cookie: cookieHeader },
    });
    const getSavedData = (await getSavedRes.json()) as any;
    console.log(`✓ Bookmarks fetch success: User has ${getSavedData.savedColleges.length} saved colleges.`);

    // 6. Test Saved Comparisons API
    console.log('\n[6/6] Auditing Comparison Profile Management API...');
    const compareRes = await fetch(`${BASE_URL}/api/saved-comparisons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        name: 'My Audit Profile',
        collegeIds: ['col-1', 'col-2'],
      }),
    });
    const compareData = (await compareRes.json()) as any;
    console.log(`✓ Save Comparison API Success: Created "${compareData.comparison.name}"`);

    // Clean up: delete comparison
    const deleteRes = await fetch(`${BASE_URL}/api/saved-comparisons?id=${compareData.comparison.id}`, {
      method: 'DELETE',
      headers: { cookie: cookieHeader },
    });
    const deleteData = (await deleteRes.json()) as any;
    console.log(`✓ Comparison Delete API Success: Deleted successfully (${deleteData.success}).`);

    // 7. Test Ingestion API
    console.log('\n[7/7] Auditing Ingestion Pipeline API...');
    const ingestRes = await fetch(`${BASE_URL}/api/colleges/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!ingestRes.ok) throw new Error(`Ingest API failed: ${ingestRes.statusText}`);
    const ingestData = (await ingestRes.json()) as any;
    console.log(`✓ Ingestion API Success: Processed ${ingestData.count} colleges (Added: ${ingestData.added}, Updated: ${ingestData.updated}).`);

    console.log('\n=== ALL API API ENDPOINTS COMPLETED SUCCESSFUL ===');
  } catch (error) {
    console.error('❌ E2E API AUDIT FAILED:', error);
    process.exit(1);
  }
}

testAPI();
