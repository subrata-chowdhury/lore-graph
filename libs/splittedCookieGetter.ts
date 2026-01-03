import { cookies } from "next/headers";

async function generateFullTokenFromChunks(sessionSelector: string, customCookieStore?: ReturnType<typeof cookies>): Promise<string | false> {
  const cookieStore = customCookieStore? await customCookieStore : await cookies();
  const chunkCount = cookieStore.get(`${sessionSelector}_chunks`)?.value;
  if (!chunkCount) return false;

  let fullToken = "";
  for (let i = 0; i < parseInt(chunkCount); i++) {
    const chunk = cookieStore.get(`${sessionSelector}.${i}`)?.value;
    if (chunk) fullToken += chunk;
  }
  return fullToken;
}

export { generateFullTokenFromChunks };
