const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const fabricantesRoutes = require('./routes/fabricantes.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/fabricantes', fabricantesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
