const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("./newserver"); // Make sure this is your Express file

let mongoServer;

describe("Simple Auth API Tests", () => {
  // 1. Start the in-memory database before tests run
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  // 2. Stop the in-memory database when tests are finished
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  // 3. Test Registration
  it("Registers a new user successfully", async () => {
    const res = await request(app)
      .post("/auth/v1/register")
      .send({ name: "Sam", email: "sam@example.com", password: "password123" });

    expect(res.statusCode).toBe(201);
  });

  // 4. Test Login (Negative Case)
  it("Rejects login with an incorrect password", async () => {
    const res = await request(app)
      .post("/auth/v1/login")
      .send({ email: "sam@example.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(400);
  });
});
