import { signUp, login } from "../src/controllers/authController";
import User from "../src/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

jest.mock("../src/models/user");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

// ------SignUp-------
describe("signUp controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock })) as any;

    req = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      },
    };

    res = {
      status: statusMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if any field is missing", async () => {
    req.body = { name: "", email: "", password: "", role: "" };

    await signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: expect.any(Array), // expecting Zod error messages
    });
  });

  it("should return 400 if user already exists", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      email: "john@example.com",
    });

    await signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "User is already registered",
    });
  });

  it("should create a user if valid data is provided", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
    (User.create as jest.Mock).mockResolvedValue({
      name: "John Doe",
      email: "john@example.com",
      password: "hashedPassword123",
      role: "user",
    });

    await signUp(req as Request, res as Response);

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(User.create).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      password: "hashedPassword123",
      role: "user",
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User registered successfully",
        user: expect.any(Object),
      })
    );
  });

  it("should return 500 if an error occurs", async () => {
    (User.findOne as jest.Mock).mockRejectedValue(new Error("DB error"));

    await signUp(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "User cannot be registered, Please try again",
    });
  });
});

// ------Login-------
describe("login controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let cookieMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    cookieMock = jest.fn(() => ({ status: statusMock }));
    statusMock = jest.fn(() => ({ json: jsonMock }));

    req = {
      body: {
        email: "john@example.com",
        password: "password123",
      },
    };

    res = {
      status: statusMock,
      json: jsonMock,
      cookie: cookieMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if validation fails", async () => {
    req.body = {};

    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(Array), // expecting Zod error messages
      })
    );
  });

  it("should return 401 if user is not registered", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "User is not registered, please signup first",
    });
  });

  it("should return 401 if password is incorrect", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      userId: "123",
      email: "john@example.com",
      password: "hashedPassword",
      role: "user",
      name: "John Doe",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Password is incorrect",
    });
  });

  it("should return 200 and set cookie if login is successful", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      userId: "123",
      email: "john@example.com",
      password: "hashedPassword",
      role: "user",
      name: "John Doe",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mocked-jwt-token");

    await login(req as Request, res as Response);

    expect(jwt.sign).toHaveBeenCalledWith(
      { email: "john@example.com", id: "123", accountType: "user" },
      expect.any(String), // config.jwtSecret
      { expiresIn: "24h" }
    );

    expect(cookieMock).toHaveBeenCalledWith(
      "token",
      "mocked-jwt-token",
      expect.objectContaining({ httpOnly: true })
    );

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: "mocked-jwt-token",
        user: expect.objectContaining({
          id: "123",
          name: "John Doe",
          email: "john@example.com",
          role: "user",
        }),
      })
    );
  });

  it("should return 500 if an unexpected error occurs", async () => {
    (User.findOne as jest.Mock).mockRejectedValue(new Error("DB error"));

    await login(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Login Failure, please try again",
    });
  });
});
