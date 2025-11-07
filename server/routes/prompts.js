const express = require('express');
const router = express.Router();
const { validatePrompt } = require('../utils/validators');
const { emitSocketEvent } = require('../utils/socketEvents');

function createPromptsRouter(jsonStore) {
  const FILENAME = 'prompts.json';

  router.get('/', async (req, res, next) => {
    try {
      const prompts = await jsonStore.read(FILENAME);
      res.json({
        success: true,
        data: prompts
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const prompts = await jsonStore.read(FILENAME);
      const prompt = prompts.find(p => p.id === req.params.id);
      
      if (!prompt) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Prompt "${req.params.id}" not found`
        });
      }
      
      res.json({
        success: true,
        data: prompt
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const prompt = req.body;

      const errors = validatePrompt(prompt);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Prompt validation failed',
          details: errors
        });
      }

      const prompts = await jsonStore.read(FILENAME);
      
      if (prompts.find(p => p.id === prompt.id)) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `Prompt "${prompt.id}" already exists`
        });
      }

      prompts.push(prompt);
      await jsonStore.write(FILENAME, prompts);

      emitSocketEvent(
        req,
        'prompts:updated',
        { data: prompts },
        { resourceType: 'prompt', action: 'create', resourceId: prompt.id }
      );

      res.status(201).json({
        success: true,
        message: 'Prompt created successfully',
        data: prompt
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const prompt = req.body;

      if (prompt.id && prompt.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Prompt ID in body must match URL parameter'
        });
      }

      prompt.id = id;

      const errors = validatePrompt(prompt);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Prompt validation failed',
          details: errors
        });
      }

      const prompts = await jsonStore.read(FILENAME);
      const index = prompts.findIndex(p => p.id === id);
      
      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Prompt "${id}" not found`
        });
      }

      prompts[index] = prompt;
      await jsonStore.write(FILENAME, prompts);

      emitSocketEvent(
        req,
        'prompts:updated',
        { data: prompts },
        { resourceType: 'prompt', action: 'update', resourceId: id }
      );

      res.json({
        success: true,
        message: 'Prompt updated successfully',
        data: prompt
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const prompts = await jsonStore.read(FILENAME);
      const index = prompts.findIndex(p => p.id === id);
      
      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Prompt "${id}" not found`
        });
      }

      prompts.splice(index, 1);
      await jsonStore.write(FILENAME, prompts);

      emitSocketEvent(
        req,
        'prompts:updated',
        { data: prompts },
        { resourceType: 'prompt', action: 'delete', resourceId: id }
      );

      res.json({
        success: true,
        message: 'Prompt deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createPromptsRouter;
