import { Request, Response } from "express";
import { signUp, login } from "../src/controllers/authController";
import User from "../src/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as jwtUtils from "../src/utils/jwt";

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
      orgId: "Curvvtech",
      password: "hashedPassword123",
      role: "user",
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "User registered successfully",
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
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { body: { email: "john@example.com", password: "password123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("should return 403 if validation fails", async () => {
    req.body = {};

    await login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(Array), // expecting Zod error messages
      })
    );
  });

  it("should return 401 if user is not registered", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User is not registered, please signup first",
    });
  });

  it("should return 200 and set cookie if login is successful", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      userId: "u4",
      email: "john@example.com",
      password: "hashedPassword",
      role: "user",
      name: "John Doe",
      orgId: "Curvvtech",
      save: jest.fn(),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    jest
      .spyOn(jwtUtils, "generateAccessToken")
      .mockReturnValue("mocked-access-token");
    jest
      .spyOn(jwtUtils, "generateRefreshToken")
      .mockReturnValue("mocked-refresh-token");

    await login(req, res);

    expect(jwtUtils.generateAccessToken).toHaveBeenCalledWith({
      email: "john@example.com",
      id: "u4",
      accountType: "user",
      orgId: "Curvvtech",
    });

    expect(jwtUtils.generateRefreshToken).toHaveBeenCalledWith({
      email: "john@example.com",
      id: "u4",
      accountType: "user",
      orgId: "Curvvtech",
    });

    expect(res.cookie).toHaveBeenCalledWith(
      "accessToken",
      "mocked-access-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    );

    expect(res.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "mocked-refresh-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      accessToken: "mocked-access-token",
      user: {
        id: "u4",
        name: "John Doe",
        email: "john@example.com",
        role: "user",
      },
    });
  });

  it("should return 500 if an unexpected error occurs", async () => {
    (User.findOne as jest.Mock).mockRejectedValue(new Error("DB error"));

    await login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Login Failure, please try again",
    });
  });
});
