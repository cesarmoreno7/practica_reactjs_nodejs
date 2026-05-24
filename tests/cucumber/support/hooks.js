const { BeforeAll, AfterAll, Before, setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');
const { ApiWorld } = require('./world');

const downloadDir = process.env.MONGOMS_DOWNLOAD_DIR || path.join(os.tmpdir(), 'mongodb-binaries');
process.env.MONGOMS_DOWNLOAD_DIR = downloadDir;
process.env.MONGOMS_PREFER_GLOBAL_PATH = 'false';
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

setWorldConstructor(ApiWorld);
setDefaultTimeout(300000);

BeforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { downloadDir },
    instance: { launchTimeout: 60000 }
  });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

Before(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

AfterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
