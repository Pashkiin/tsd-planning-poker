const gameLogic = require("../gameLogic/gameLogic");

function broadcastSessionUpdate(io, sessionId) {
  if (!io || !sessionId) {
    console.error("broadcastSessionUpdate: io and sessionId are required.");
    return;
  }
  const sessionState = gameLogic.getSessionState(sessionId);
  if (sessionState) {
    io.to(sessionId).emit("sessionUpdate", sessionState);
    console.log(`🔄 Broadcasted sessionUpdate for ${sessionId} to room.`);
  } else {
    console.warn(
      `broadcastSessionUpdate: Session ${sessionId} not found, no update sent.`
    );
    io.to(sessionId).emit("sessionError", {
      message: `Session ${sessionId} no longer exists or could not be found.`,
    });
  }
}

module.exports = {
  broadcastSessionUpdate,
};
