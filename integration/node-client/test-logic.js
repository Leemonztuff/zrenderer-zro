const ZRendererClient = require('./zrenderer-client');

/**
 * Basic logic test for ZRendererClient
 */
function testClient() {
  console.log('--- Testing ZRendererClient Logic ---');

  const client = new ZRendererClient({
    zrendererUrl: 'http://localhost:11011/',
    accessToken: 'test-token',
    supabase: {
      url: 'https://xyz.supabase.co',
      key: 'anon-key',
      bucket: 'assets'
    }
  });

  // Verify URL normalization
  if (client.zrendererUrl === 'http://localhost:11011') {
    console.log('✅ URL Normalization works');
  } else {
    console.error('❌ URL Normalization failed:', client.zrendererUrl);
  }

  // Verify client existence
  if (typeof client.render === 'function' && typeof client.uploadToSupabase === 'function') {
    console.log('✅ Client methods are defined');
  } else {
    console.error('❌ Client methods missing');
  }

  console.log('--- Logic test finished ---');
}

try {
  testClient();
} catch (e) {
  console.error('Test failed with error:', e);
  process.exit(1);
}
