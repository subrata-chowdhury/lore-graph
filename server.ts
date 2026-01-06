import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
// import Comment from "./models/comment";
import { Filter } from "bad-words";

const dev = process.env.NODE_ENV !== "production";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    const filter = new Filter();

    // 1. User enters the lore page
    socket.on("join-lore-room", (loreId) => {
      socket.join(loreId);
      const count = io.sockets.adapter.rooms.get(loreId)?.size || 0;
      io.to(loreId).emit("room-count-update", count);
      console.log(`User ${socket.id} joined room: ${loreId}`);
    });

    // 2. User leaves the lore page
    socket.on("leave-lore-room", (loreId) => {
      socket.leave(loreId);
      const count = io.sockets.adapter.rooms.get(loreId)?.size || 0;
      io.to(loreId).emit("room-count-update", count);
      console.log(`User ${socket.id} left room: ${loreId}`);
    });

    // 3. Handling a new comment
    socket.on("send-comment", async (commentData) => {
      // Save to MongoDB first
      try {
        if (filter.isProfane(commentData.content)) {
          socket.emit("error", {
            message: "Failed to save comment.",
          });
          return;
        }
        // const newComment = await new Comment(commentData);
        // await newComment.save();
        // ONLY emit to users inside this specific loreId room
        io.to(commentData.loreId).emit("new-comment", commentData);
      } catch (error) {
        socket.emit("error", {
          message: "Failed to save comment.",
        });
        console.error("Error saving comment:", error);
      }
    });

    socket.on("disconnecting", () => {
      // Use socket.rooms instead of the whole adapter for better performance
      const rooms = socket.rooms;
      rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          // Only update "lore" rooms, not the private user room
          const count = (io.sockets.adapter.rooms.get(roomId)?.size || 1) - 1;
          io.to(roomId).emit("room-count-update", count);
        }
      });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Server listening at http://localhost:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
    });
});
