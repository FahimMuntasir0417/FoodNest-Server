import serverless from "serverless-http";
import app from "./app";

const handler = serverless(app);

// Works for Vercel Node functions
export default handler;
// Also helps if Vercel expects module.exports
module.exports = handler;
