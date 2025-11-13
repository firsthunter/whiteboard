// Debug utility to check environment variables
export function checkEnvVars() {
  console.log('=== Environment Variables Debug ===');
  console.log('NEXT_PUBLIC_GEMINI_API_KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'Set ✓' : 'Missing ✗');
  console.log('NEXT_PUBLIC_GEMINI_MODEL:', process.env.NEXT_PUBLIC_GEMINI_MODEL || 'Not set');
  console.log('NEXT_PUBLIC_GEMINI_API_URL:', process.env.NEXT_PUBLIC_GEMINI_API_URL || 'Not set');
  console.log('===================================');
}
