const express = require('express');
const router = express.Router();
const { validateSettings } = require('../utils/validators');

function createSettingsRouter(jsonStore) {
  const FILENAME = 'settings.json';

  router.get('/', async (req, res, next) => {
    try {
      const settings = await jsonStore.read(FILENAME);
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/variables', async (req, res, next) => {
    try {
      const settings = await jsonStore.read(FILENAME);
      res.json({
        success: true,
        data: settings.globalVariables || {}
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/variables', async (req, res, next) => {
    try {
      const variables = req.body;

      if (!variables || typeof variables !== 'object' || Array.isArray(variables)) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Variables must be a key-value object'
        });
      }

      const settings = await jsonStore.read(FILENAME);
      settings.globalVariables = variables;

      const errors = validateSettings(settings);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Settings validation failed',
          details: errors
        });
      }

      await jsonStore.write(FILENAME, settings);

      res.json({
        success: true,
        message: 'Variables updated successfully',
        data: settings.globalVariables
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/variables/:key', async (req, res, next) => {
    try {
      const settings = await jsonStore.read(FILENAME);
      const value = settings.globalVariables?.[req.params.key];

      if (value === undefined) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Variable "${req.params.key}" not found`
        });
      }

      res.json({
        success: true,
        data: { key: req.params.key, value }
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/variables/:key', async (req, res, next) => {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Variable value is required'
        });
      }

      const settings = await jsonStore.read(FILENAME);
      if (!settings.globalVariables) {
        settings.globalVariables = {};
      }

      settings.globalVariables[key] = value;
      await jsonStore.write(FILENAME, settings);

      res.json({
        success: true,
        message: 'Variable updated successfully',
        data: { key, value }
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/variables/:key', async (req, res, next) => {
    try {
      const { key } = req.params;
      const settings = await jsonStore.read(FILENAME);

      if (!settings.globalVariables || settings.globalVariables[key] === undefined) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Variable "${key}" not found`
        });
      }

      delete settings.globalVariables[key];
      await jsonStore.write(FILENAME, settings);

      res.json({
        success: true,
        message: 'Variable deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/api-configs', async (req, res, next) => {
    try {
      const settings = await jsonStore.read(FILENAME);
      res.json({
        success: true,
        data: settings.customApiConfigs || {}
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/api-configs', async (req, res, next) => {
    try {
      const configs = req.body;

      if (!configs || typeof configs !== 'object' || Array.isArray(configs)) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'API configs must be a key-value object'
        });
      }

      const settings = await jsonStore.read(FILENAME);
      settings.customApiConfigs = configs;

      const errors = validateSettings(settings);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'API config validation failed',
          details: errors
        });
      }

      await jsonStore.write(FILENAME, settings);

      res.json({
        success: true,
        message: 'API configs updated successfully',
        data: settings.customApiConfigs
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/api-configs/:name', async (req, res, next) => {
    try {
      const settings = await jsonStore.read(FILENAME);
      const config = settings.customApiConfigs?.[req.params.name];

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `API config "${req.params.name}" not found`
        });
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/api-configs/:name', async (req, res, next) => {
    try {
      const { name } = req.params;
      const config = req.body;

      if (!config || typeof config !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'API config must be an object'
        });
      }

      const settings = await jsonStore.read(FILENAME);
      if (!settings.customApiConfigs) {
        settings.customApiConfigs = {};
      }

      settings.customApiConfigs[name] = config;

      const errors = validateSettings(settings);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'API config validation failed',
          details: errors
        });
      }

      await jsonStore.write(FILENAME, settings);

      res.json({
        success: true,
        message: 'API config updated successfully',
        data: config
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/api-configs/:name', async (req, res, next) => {
    try {
      const { name } = req.params;
      const settings = await jsonStore.read(FILENAME);

      if (!settings.customApiConfigs || !settings.customApiConfigs[name]) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `API config "${name}" not found`
        });
      }

      delete settings.customApiConfigs[name];
      await jsonStore.write(FILENAME, settings);

      res.json({
        success: true,
        message: 'API config deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createSettingsRouter;
