const {
  startServer,
  httpServer: importedHttpServer,
  io: serverIoInstance,
  configuredPort,
} = require("../../../server");
const ioc = require("socket.io-client");
const sessionManager = require("../../src/gameLogic/sessionManager");

const TEST_SERVER_PORT = configuredPort === 3001 ? 3002 : 3001;

function connectClient(port) {
  return ioc(`http://localhost:${port}`, {
    reconnection: false,
    forceNew: true,
    transports: ["websocket"],
    timeout: 5000,
  });
}

describe("WebSocket Task Management Events", () => {
  let creatorSocket, player2Socket;
  let testSessionId;
  let actualCreatorPlayerModelId, actualPlayer2PlayerModelId;
  let initialTask1, initialTask2;
  let runningHttpServer;

  jest.setTimeout(10000);

  beforeAll(async () => {
    try {
      runningHttpServer = await startServer(TEST_SERVER_PORT);
      console.log(
        `Test server listening on port ${TEST_SERVER_PORT} for WebSocket tests.`
      );
    } catch (error) {
      console.error("FATAL: Test server failed to start in beforeAll:", error);
      process.exit(1);
    }
  });

  afterAll(async () => {
    if (creatorSocket && creatorSocket.connected) creatorSocket.disconnect();
    if (player2Socket && player2Socket.connected) player2Socket.disconnect();

    if (serverIoInstance) serverIoInstance.close();

    return new Promise((resolve, reject) => {
      if (runningHttpServer && runningHttpServer.listening) {
        runningHttpServer.close((err) => {
          if (err) return reject(err);
          console.log("Test server closed.");
          resolve();
        });
      } else {
        resolve();
      }
    });
  });

  beforeEach((done) => {
    sessionManager.sessions.clear(); // Clear sessions from previous tests

    const creatorLoginId = "test-creator-profile-id"; // An ID from a hypothetical login system
    const player2LoginId = "test-player2-profile-id";

    // 1. Create the session first, using the creator's login/profile ID temporarily for creatorId.
    //    The actual creatorId will be updated once the PlayerModel is created.
    const tempSession = sessionManager.createSession(
      creatorLoginId,
      "Task Test Session - Initial",
      [
        { name: "Initial Task 1", description: "First task" },
        { name: "Initial Task 2", description: "Second task" },
      ]
    );
    if (!tempSession)
      return done(new Error("Failed to create initial session in beforeEach"));
    testSessionId = tempSession.sessionId; // This is the stable session ID for this test run

    creatorSocket = connectClient(TEST_SERVER_PORT);
    player2Socket = connectClient(TEST_SERVER_PORT);

    let creatorSetupComplete = false;
    let player2SetupComplete = false;

    const attemptDone = () => {
      if (creatorSetupComplete && player2SetupComplete) {
        // Ensure tasks are set on the session object for tests to use
        const session = sessionManager.getSession(testSessionId);
        if (session && session.tasks.length >= 2) {
          initialTask1 = session.tasks[0];
          initialTask2 = session.tasks[1];
        } else {
          return done(
            new Error("Tasks not properly initialized on session for tests.")
          );
        }
        done();
      }
    };

    creatorSocket.on("connect", () => {
      creatorSocket.emit("joinSession", {
        sessionId: testSessionId,
        userId: creatorLoginId, // This is the ID the server expects from client's "login"
        username: "Creator User",
      });
    });

    creatorSocket.on("joinedSession", (data) => {
      if (creatorSetupComplete) return;
      expect(data.sessionId).toBe(testSessionId);
      actualCreatorPlayerModelId = data.playerId; // This is the server-generated PlayerModel.id

      // CRITICAL FIX: Update the session's creatorId to be the actual PlayerModel.id
      const sessionToUpdate = sessionManager.getSession(testSessionId);
      if (sessionToUpdate) {
        sessionToUpdate.creatorId = actualCreatorPlayerModelId;
        console.log(
          `Test: Session ${testSessionId} creatorId updated to ${actualCreatorPlayerModelId}`
        );
      } else {
        return done(
          new Error(
            `Test: Session ${testSessionId} not found in manager after creator join.`
          )
        );
      }
      creatorSetupComplete = true;
      attemptDone();
    });

    player2Socket.on("connect", () => {
      player2Socket.emit("joinSession", {
        sessionId: testSessionId,
        userId: player2LoginId,
        username: "Player Two",
      });
    });

    player2Socket.on("joinedSession", (data) => {
      if (player2SetupComplete) return;
      expect(data.sessionId).toBe(testSessionId);
      actualPlayer2PlayerModelId = data.playerId;
      player2SetupComplete = true;
      attemptDone();
    });

    const errorHandler = (socketName) => (err) => {
      if (!creatorSetupComplete || !player2SetupComplete) {
        done(
          new Error(`${socketName} error during setup: ${err.message || err}`)
        );
      }
    };
    creatorSocket.on("joinError", errorHandler("Creator"));
    creatorSocket.on("connect_error", errorHandler("Creator connect"));
    player2Socket.on("joinError", errorHandler("Player2"));
    player2Socket.on("connect_error", errorHandler("Player2 connect"));
  });

  afterEach(() => {
    if (creatorSocket && creatorSocket.connected) creatorSocket.disconnect();
    if (player2Socket && player2Socket.connected) player2Socket.disconnect();
    if (testSessionId) {
      sessionManager.removeSession(testSessionId);
      testSessionId = null;
    }
    actualCreatorPlayerModelId = null;
    actualPlayer2PlayerModelId = null;
    initialTask1 = null;
    initialTask2 = null;
  });

  describe("'addNewTaskRequest'", () => {
    it("should allow creator to add a new task and broadcast update", (done) => {
      const newTaskName = "Newly Added Task";
      const newTaskDesc = "Description for new task";

      player2Socket.once("sessionUpdate", (sessionState) => {
        expect(sessionState.sessionId).toBe(testSessionId);
        const addedTask = sessionState.tasks.find(
          (t) => t.name === newTaskName
        );
        expect(addedTask).toBeDefined();
        expect(addedTask.name).toBe(newTaskName);
        done();
      });
      // Ensure creator socket is ready
      if (
        creatorSocket &&
        creatorSocket.connected &&
        actualCreatorPlayerModelId
      ) {
        creatorSocket.emit("addNewTaskRequest", {
          taskName: newTaskName,
          taskDescription: newTaskDesc,
        });
      } else {
        done(new Error("Creator socket not ready for 'addNewTaskRequest'"));
      }
    });

    it("should prevent non-creator from adding a task", (done) => {
      player2Socket.once("taskError", (error) => {
        expect(error.message).toContain(
          "Only the session creator can add tasks"
        );
        done();
      });
      if (
        player2Socket &&
        player2Socket.connected &&
        actualPlayer2PlayerModelId
      ) {
        player2Socket.emit("addNewTaskRequest", {
          taskName: "Unauthorized Task",
        });
      } else {
        done(
          new Error(
            "Player2 socket not ready for unauthorized 'addNewTaskRequest'"
          )
        );
      }
    });

    it("should require taskName when adding a task", (done) => {
      creatorSocket.once("taskError", (error) => {
        expect(error.message).toContain("Task name is required");
        done();
      });
      if (
        creatorSocket &&
        creatorSocket.connected &&
        actualCreatorPlayerModelId
      ) {
        creatorSocket.emit("addNewTaskRequest", {
          taskDescription: "No name task",
        });
      } else {
        done(
          new Error(
            "Creator socket not ready for 'addNewTaskRequest' without name"
          )
        );
      }
    });
  });

  describe("'setCurrentTaskRequest'", () => {
    it("should allow creator to set current task and broadcast update", (done) => {
      if (!initialTask2 || !initialTask2.id)
        return done(new Error("initialTask2 not defined in test setup"));

      player2Socket.once("sessionUpdate", (sessionState) => {
        expect(sessionState.sessionId).toBe(testSessionId);
        expect(sessionState.currentTaskId).toBe(initialTask2.id);
        expect(sessionState.currentTaskName).toBe(initialTask2.name);
        sessionState.players.forEach((p) => {
          expect(
            p.selectedCardValue === null || p.selectedCardValue === "Voted"
          ).toBe(true);
          expect(p.hasLockedVote).toBe(false);
        });
        done();
      });
      if (
        creatorSocket &&
        creatorSocket.connected &&
        actualCreatorPlayerModelId
      ) {
        creatorSocket.emit("setCurrentTaskRequest", {
          taskId: initialTask2.id,
        });
      } else {
        done(new Error("Creator socket not ready for 'setCurrentTaskRequest'"));
      }
    });

    it("should prevent non-creator from setting current task", (done) => {
      if (!initialTask2 || !initialTask2.id)
        return done(new Error("initialTask2 not defined for non-creator test"));
      player2Socket.once("taskError", (error) => {
        expect(error.message).toContain(
          "Only the session creator can change the task"
        );
        done();
      });
      if (
        player2Socket &&
        player2Socket.connected &&
        actualPlayer2PlayerModelId
      ) {
        player2Socket.emit("setCurrentTaskRequest", {
          taskId: initialTask2.id,
        });
      } else {
        done(
          new Error(
            "Player2 socket not ready for unauthorized 'setCurrentTaskRequest'"
          )
        );
      }
    });

    it("should return error for invalid taskId", (done) => {
      creatorSocket.once("taskError", (error) => {
        // The server logic for setCurrentTask in SessionModel might return null if task not found,
        // leading to "Failed to set task..." in socketHandler.
        // If sessionManager.setCurrentTask itself can't find the session, it would be "Session not found."
        // Given the previous error, let's assume the session IS found due to beforeEach fix.
        expect(error.message).toMatch(
          /Failed to set task. Task ID "invalid-task-id" might be invalid./i
        );
        done();
      });
      if (
        creatorSocket &&
        creatorSocket.connected &&
        actualCreatorPlayerModelId
      ) {
        creatorSocket.emit("setCurrentTaskRequest", {
          taskId: "invalid-task-id",
        });
      } else {
        done(
          new Error(
            "Creator socket not ready for 'setCurrentTaskRequest' with invalid ID"
          )
        );
      }
    });
  });

  describe("'nextTaskRequest'", () => {
    it("should allow creator to move to the next task and broadcast update", (done) => {
      const session = sessionManager.getSession(testSessionId);
      if (!session || !initialTask1 || !initialTask2)
        return done(new Error("Session or tasks not ready for nextTask test"));
      session.setCurrentTask(initialTask1.id); // Ensure first task is current

      player2Socket.once("sessionUpdate", (sessionState) => {
        expect(sessionState.currentTaskId).toBe(initialTask2.id);
        expect(sessionState.currentTaskName).toBe(initialTask2.name);
        done();
      });
      if (
        creatorSocket &&
        creatorSocket.connected &&
        actualCreatorPlayerModelId
      ) {
        creatorSocket.emit("nextTaskRequest");
      } else {
        done(new Error("Creator socket not ready for 'nextTaskRequest'"));
      }
    });

    it("should prevent non-creator from moving to next task", (done) => {
      player2Socket.once("taskError", (error) => {
        expect(error.message).toContain("Only the session creator can advance");
        done();
      });
      if (
        player2Socket &&
        player2Socket.connected &&
        actualPlayer2PlayerModelId
      ) {
        player2Socket.emit("nextTaskRequest");
      } else {
        done(
          new Error(
            "Player2 socket not ready for unauthorized 'nextTaskRequest'"
          )
        );
      }
    });

    it("should return error if already at the last task", (done) => {
      const session = sessionManager.getSession(testSessionId);
      if (!session || !initialTask2)
        return done(
          new Error("Session or last task not ready for 'at last task' test")
        );
      session.setCurrentTask(initialTask2.id); // initialTask2 is the last of two

      creatorSocket.once("taskError", (error) => {
        expect(error.message).toContain("Already at the last task");
        done();
      });
      if (
        creatorSocket &&
        creatorSocket.connected &&
        actualCreatorPlayerModelId
      ) {
        creatorSocket.emit("nextTaskRequest");
      } else {
        done(
          new Error(
            "Creator socket not ready for 'nextTaskRequest' at last task"
          )
        );
      }
    });
  });

  describe("'resetCurrentTaskVotesRequest'", () => {
    it("should allow creator to reset votes for current task and broadcast update", (done) => {
      const session = sessionManager.getSession(testSessionId);
      if (
        !session ||
        !initialTask1 ||
        !actualCreatorPlayerModelId ||
        !actualPlayer2PlayerModelId
      ) {
        return done(
          new Error("Session/task/players not ready for reset votes test")
        );
      }
      session.setCurrentTask(initialTask1.id);

      // Simulate some votes directly
      sessionManager.recordVote(testSessionId, actualCreatorPlayerModelId, 5);
      sessionManager.lockPlayerVote(testSessionId, actualCreatorPlayerModelId);
      sessionManager.recordVote(testSessionId, actualPlayer2PlayerModelId, 8);
      sessionManager.lockPlayerVote(testSessionId, actualPlayer2PlayerModelId);

      player2Socket.once("sessionUpdate", (sessionState) => {
        expect(sessionState.currentTaskId).toBe(initialTask1.id);
        const updatedCreator = sessionState.players.find(
          (p) => p.id === actualCreatorPlayerModelId
        );
        const updatedPlayer2 = sessionState.players.find(
          (p) => p.id === actualPlayer2PlayerModelId
        );

        expect(updatedCreator).toBeDefined();
        expect(updatedPlayer2).toBeDefined();
        expect(updatedCreator.hasLockedVote).toBe(false);
        expect(updatedPlayer2.hasLockedVote).toBe(false);

        // Check how selectedCardValue is represented after reset in sessionState
        // It should be null as votes are reset and not yet revealed
        expect(updatedCreator.selectedCardValue).toBeNull();
        expect(updatedPlayer2.selectedCardValue).toBeNull();

        const serverTask = sessionManager
          .getSession(testSessionId)
          ?.getCurrentTask();
        expect(serverTask?.estimations).toEqual({});
        expect(serverTask?.revealed).toBe(false);
        done();
      });

      if (
        creatorSocket &&
        creatorSocket.connected &&
        actualCreatorPlayerModelId
      ) {
        creatorSocket.emit("resetCurrentTaskVotesRequest");
      } else {
        done(
          new Error(
            "Creator socket not ready for 'resetCurrentTaskVotesRequest'"
          )
        );
      }
    });

    it("should prevent non-creator from resetting votes", (done) => {
      player2Socket.once("taskError", (error) => {
        expect(error.message).toContain(
          "Only the session creator can reset votes"
        );
        done();
      });
      if (
        player2Socket &&
        player2Socket.connected &&
        actualPlayer2PlayerModelId
      ) {
        player2Socket.emit("resetCurrentTaskVotesRequest");
      } else {
        done(
          new Error(
            "Player2 socket not ready for unauthorized 'resetCurrentTaskVotesRequest'"
          )
        );
      }
    });
  });
});
