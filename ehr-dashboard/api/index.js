const serverless = require('serverless-http');
const app = require('../server/app');
const { connectDB } = require('../server/utils/connect');

let prepared = false;
const handler = serverless(app);

async function ensureConnection() {
  if (!prepared) {
    await connectDB();
    prepared = true;
  }
}

module.exports = async (req, res) => {
  await ensureConnection();
  return handler(req, res);
};
