import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  const errorDetails = err;

  // Prisma transaction busy / timeout (your current issue)
  if (
    err instanceof Error &&
    err.message?.includes("Unable to start a transaction")
  ) {
    statusCode = 503;
    errorMessage = "Database is busy. Please try again.";
  }

  // PrismaClientValidationError
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provided incorrect field type or missing fields!";
  }

  // PrismaClientKnownRequestError
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 404;
      errorMessage =
        "Record not found. The operation depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 409;
      errorMessage = "Duplicate key error.";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed.";
    } else if (err.code === "P1001") {
      statusCode = 503;
      errorMessage = "Can't reach database server.";
    } else if (err.code === "P1002") {
      statusCode = 504;
      errorMessage = "Database request timed out.";
    } else {
      statusCode = 400;
      errorMessage = `Database error (${err.code}).`;
    }
  }

  // PrismaClientUnknownRequestError
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution.";
  }

  // PrismaClientInitializationError
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your credentials!";
    } else if (err.errorCode === "P1001") {
      statusCode = 503;
      errorMessage = "Can't reach database server.";
    } else {
      statusCode = 503;
      errorMessage = "Database initialization failed.";
    }
  }

  res.status(statusCode).json({
    message: errorMessage,
    error: errorDetails,
  });
}

export default errorHandler;
