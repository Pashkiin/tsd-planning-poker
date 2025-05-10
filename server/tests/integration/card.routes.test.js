const request = require("supertest");
const mongoose = require("mongoose");
const { setup, teardown, clearDatabase } = require("../setup");
const app = require("../../app"); // Import Express app instance
const Card = require("../../src/models/cardModel");

// Test Suite for Card API
describe("Card API (/api/cards)", () => {
  // Setup: Start DB connection before all tests in this suite
  beforeAll(async () => {
    await setup(); // Connect to the in-memory database
  });

  // Cleanup: Clear DB before each test
  beforeEach(async () => {
    await clearDatabase(); // Ensure a clean slate for each test
  });

  // Teardown: Disconnect DB after all tests in this suite
  afterAll(async () => {
    await teardown(); // Disconnect and stop the in-memory database
  });

  // --- Test POST /cards ---
  describe("POST /", () => {
    it("should create a new card and return 201", async () => {
      const newCardData = {
        value: 5,
        label: "Test Card 5",
        description: "A card for testing",
        isSpecial: false,
        color: "#FF5733",
      };

      const response = await request(app)
        .post("/api/cards")
        .send(newCardData)
        .expect("Content-Type", /json/)
        .expect(201);

      // Check response body
      expect(response.body).toHaveProperty("_id");
      expect(response.body.value).toBe(newCardData.value);
      expect(response.body.label).toBe(newCardData.label);
      expect(response.body.description).toBe(newCardData.description);
      expect(response.body.isSpecial).toBe(newCardData.isSpecial);
      expect(response.body.color).toBe(newCardData.color);

      // Check database directly
      const dbCard = await Card.findById(response.body._id);
      expect(dbCard).not.toBeNull();
      expect(dbCard.value).toBe(newCardData.value);
      expect(dbCard.label).toBe(newCardData.label);
    });

    it("should return 500 if required fields are missing", async () => {
      const invalidCardData = { description: "Missing required fields" };

      await request(app)
        .post("/api/cards")
        .send(invalidCardData)
        .expect("Content-Type", /json/)
        .expect(500); // Assuming controller/validation handles this
    });
  });

  // --- Test GET /cards ---
  describe("GET /", () => {
    it("should return an empty array if no cards exist", async () => {
      const response = await request(app)
        .get("/api/cards")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it("should return all cards if they exist", async () => {
      // Seed the database using the new schema fields
      await Card.insertMany([
        { value: 1, label: "Card 1", description: "Desc 1", color: "#AAA" },
        { value: 2, label: "Card 2", description: "Desc 2", isSpecial: true },
      ]);

      const response = await request(app)
        .get("/api/cards")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].label).toBe("Card 1");
      expect(response.body[0].value).toBe(1);
      expect(response.body[0].color).toBe("#AAA");
      expect(response.body[1].label).toBe("Card 2");
      expect(response.body[1].value).toBe(2);
      expect(response.body[1].isSpecial).toBe(true);
    });
  });

  // --- Test GET /cards/:id ---
  describe("GET /:id", () => {
    it("should return a single card if ID is valid and exists", async () => {
      const card = await new Card({
        value: 8,
        label: "Specific Card 8",
        description: "Details here",
        color: "#123456",
      }).save();
      const cardId = card._id.toString();

      const response = await request(app)
        .get(`/api/cards/${cardId}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("_id", cardId);
      expect(response.body.label).toBe("Specific Card 8");
      expect(response.body.value).toBe(8);
      expect(response.body.color).toBe("#123456");
    });

    it("should return 404 if card ID does not exist", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/api/cards/${nonExistentId}`)
        .expect("Content-Type", /json/)
        .expect(404); // Assuming controller handles not found
    });

    it("should return 400 or 500 for an invalid ID format", async () => {
      const invalidId = "invalid-id-format";
      await request(app)
        .get(`/api/cards/${invalidId}`)
        .expect("Content-Type", /json/)
        .expect((res) => {
          if (res.status !== 400 && res.status !== 500) {
            throw new Error(`Expected 400 or 500, but received ${res.status}`);
          }
        });
    });
  });

  // --- Test PUT /cards/:id ---
  describe("PUT /:id", () => {
    it("should update the card and return 200", async () => {
      const card = await new Card({
        value: 13,
        label: "Original Label",
        description: "Original Desc",
        color: "#000000",
      }).save();
      const cardId = card._id.toString();

      const updateData = {
        value: 21,
        label: "Updated Label",
        description: "Updated Desc",
        color: "#FFFFFF",
        isSpecial: true,
      };

      const response = await request(app)
        .put(`/api/cards/${cardId}`)
        .send(updateData)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("_id", cardId);
      expect(response.body.label).toBe(updateData.label);
      expect(response.body.value).toBe(updateData.value);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.color).toBe(updateData.color);
      expect(response.body.isSpecial).toBe(updateData.isSpecial);

      const dbCard = await Card.findById(cardId);
      expect(dbCard.label).toBe(updateData.label);
      expect(dbCard.value).toBe(updateData.value);
      expect(dbCard.isSpecial).toBe(updateData.isSpecial);
    });

    it("should return 404 if card ID does not exist", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { label: "Updated Label" };

      await request(app)
        .put(`/api/cards/${nonExistentId}`)
        .send(updateData)
        .expect("Content-Type", /json/)
        .expect(404);
    });

    it("should return 400 if required fields are missing in update", async () => {
      const card = await new Card({ value: 1, label: "Original" }).save();
      const cardId = card._id.toString();
      const invalidUpdateData = { value: null, label: "" }; // Assuming value/label cannot be null/empty if required

      await request(app)
        .put(`/api/cards/${cardId}`)
        .send(invalidUpdateData)
        .expect("Content-Type", /json/)
        .expect(400); // Assuming validation prevents this
    });
  });

  // --- Test DELETE /cards/:id ---
  describe("DELETE /:id", () => {
    it("should delete the card and return 200 or 204", async () => {
      const card = await new Card({
        value: 100,
        label: "To Delete",
        description: "Delete me",
      }).save();
      const cardId = card._id.toString();

      await request(app)
        .delete(`/api/cards/${cardId}`)
        .expect((res) => {
          if (res.status !== 200 && res.status !== 204) {
            throw new Error(`Expected 200 or 204, but received ${res.status}`);
          }
        });

      // Verify DB
      const dbCard = await Card.findById(cardId);
      expect(dbCard).toBeNull();
    });

    it("should return 404 if card ID does not exist", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await request(app)
        .delete(`/api/cards/${nonExistentId}`)
        // Adjust expectation based on what your API returns on 404 for DELETE
        // It might be JSON or it might be plain text, or nothing if 204 was expected but ID not found
        // .expect('Content-Type', /json/) // This might fail if 404 response isn't JSON
        .expect(404);
    });
  });
});
