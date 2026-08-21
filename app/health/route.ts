export async function GET() {
  return Response.json(
    {
      status: "UP",
      service: "greentech-web",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}