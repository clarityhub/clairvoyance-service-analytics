const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
require('./v1_0/subscriptions');
const { settings } = require('service-claire/helpers/config');
const helmet = require('service-claire/middleware/helmet');
const errorHandler = require('service-claire/middleware/errors');
const logger = require('service-claire/helpers/logger');

logger.register('071a8e9325e47c770a12b277c22c8ed2');

const app = express();

app.enable('trust proxy');
app.use(helmet());
app.use(bodyParser.json());
app.use('/analytics', routes);
app.use(errorHandler);

const server = app.listen(
  settings.port,
  () => logger.log(`✅ 📈 service-analytics running on port ${settings.port}`)
);

module.exports = { app, server }; // For testing
