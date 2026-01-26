import dbConnect from "@/config/db";
import Plan from "@/models/Plan";

const PLAN_LIMITS = {
  free: 10,
  premium: 100,
  "ultra-premium": Infinity,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const apiKey = process.env.YOUTUBE_API_KEY;

  const userId = request.headers.get("x-user");
  const username = request.headers.get("x-username");
  const userRole = request.headers.get("x-user-role");

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is not configured on the server.");
    return Response.json({ error: "Server configuration error", success: false }, { status: 500 });
  }

  if (!videoId) {
    return Response.json({ error: "Missing videoId", success: false }, { status: 400 });
  }

  if (!userId) {
    return Response.json({ error: "Unauthorized", success: false }, { status: 401 });
  }

  try {
    await dbConnect();

    // 1. Get or Create Plan for the user
    let userPlan = await Plan.findOne({ userId });
    if (!userPlan) {
      userPlan = await Plan.create({
        userId,
        username: username || "Unknown",
        plan: "free",
      });
    }

    // 2. Daily Reset Logic
    const now = new Date();
    const lastReset = new Date(userPlan.usage.youtubeApi.lastReset);
    if (now.toDateString() !== lastReset.toDateString()) {
      userPlan.usage.youtubeApi.count = 0;
      userPlan.usage.youtubeApi.lastReset = now;
    }

    // 3. Check Limits (Bypass for super-admin)
    const limit = PLAN_LIMITS[userPlan.plan as keyof typeof PLAN_LIMITS] || 0;
    const totalAllowed = limit + userPlan.extraCredits.youtubeApi;

    if (userPlan.usage.youtubeApi.count >= totalAllowed && userRole !== "super-admin") {
      return Response.json(
        {
          error: "Daily YouTube API limit reached. Upgrade your plan or buy credits.",
          success: false,
        },
        { status: 403 }
      );
    }

    const videoDetails = await getFullDetails(videoId, apiKey);
    if (!videoDetails) {
      return Response.json({ error: "Video not found", success: false }, { status: 404 });
    }

    // 4. Increment Usage on successful fetch
    userPlan.usage.youtubeApi.count += 1;
    await userPlan.save();

    return Response.json({
      data: {
        title: videoDetails.title,
        description: videoDetails.description,
        thumbnails: videoDetails.thumbnails,
        tags: videoDetails.tags,
        isEmbeddable: videoDetails.isEmbeddable,
        isPublic: videoDetails.isPublic,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error in video-details API:", error);
    return Response.json(
      { error: "Failed to fetch video details", success: false },
      { status: 500 }
    );
  }
}

async function getFullDetails(videoId: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status&id=${videoId}&key=${apiKey}`;

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
      isEmbeddable: video.status.embeddable,
      isPublic: video.status.privacyStatus === "public",
    };
  }
}
