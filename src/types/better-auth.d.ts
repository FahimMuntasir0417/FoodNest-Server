import "better-auth";

declare module "better-auth" {
  interface User {
    role?: string; // or: "ADMIN" | "PROVIDER" | "CUSTOMER"
  }
}
