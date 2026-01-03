export function GET(request: Request) {
  return new Response(
    JSON.stringify({ message: "Super Admin Stats Endpoint" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}