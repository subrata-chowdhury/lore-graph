import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import Comment from "./models/comment";
import { Filter } from "bad-words";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    const filter = new Filter();

    // 1. User enters the node page
    socket.on("join-node-room", (nodeId) => {
      socket.join(nodeId);
      const count = io.sockets.adapter.rooms.get(nodeId)?.size || 0;
      io.to(nodeId).emit("room-count-update", count);
      console.log(`User ${socket.id} joined room: ${nodeId}`);
    });

    // 2. User leaves the node page
    socket.on("leave-node-room", (nodeId) => {
      socket.leave(nodeId);
      const count = io.sockets.adapter.rooms.get(nodeId)?.size || 0;
      io.to(nodeId).emit("room-count-update", count);
      console.log(`User ${socket.id} left room: ${nodeId}`);
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
        // ONLY emit to users inside this specific nodeId room
        io.to(commentData.nodeId).emit("new-comment", commentData);
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
          // Only update "node" rooms, not the private user room
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
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
