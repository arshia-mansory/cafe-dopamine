export async function GET() {
  return new Response(
    'google-site-verification: google5eaf92436a6dea71.html',
    {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  );
}