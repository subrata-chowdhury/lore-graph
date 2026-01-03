export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is not configured on the server.");
    return Response.json({ error: "Server configuration error", success: false }, { status: 500 });
  }

  if (!videoId) {
    return Response.json({ error: "Missing videoId", success: false }, { status: 400 });
  }

  try {
    const videoDetails = await getFullDetails(videoId, apiKey);
    if (!videoDetails) {
      return Response.json({ error: "Video not found", success: false }, { status: 404 });
    }
    return Response.json({
      data: {
        title: videoDetails.title,
        description: videoDetails.description,
        thumbnails: videoDetails.thumbnails,
        tags: videoDetails.tags,
      },
      success: true,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch video details", success: false },
      { status: 500 }
    );
  }
}

async function getFullDetails(videoId: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.items.length > 0) {
    const video = data.items[0];
    return {
      title: video.snippet.title,
      description: video.snippet.description,
      views: video.statistics.viewCount,
      duration: video.contentDetails.duration,
      thumbnails: video.snippet.thumbnails.high.url,
      tags: video.snippet.tags,
    };
  }
}
