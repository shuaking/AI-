const express = require('express');
const router = express.Router();
const { validateWorkflow } = require('../utils/validators');

function createWorkflowsRouter(jsonStore) {
  const FILENAME = 'workflows.json';

  router.get('/', async (req, res, next) => {
    try {
      const workflows = await jsonStore.read(FILENAME);
      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const workflows = await jsonStore.read(FILENAME);
      const workflow = workflows[req.params.id];
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Workflow "${req.params.id}" not found`
        });
      }
      
      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const { id, ...workflow } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Workflow ID is required'
        });
      }

      const errors = validateWorkflow(workflow, id);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Workflow validation failed',
          details: errors
        });
      }

      const workflows = await jsonStore.read(FILENAME);
      
      if (workflows[id]) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `Workflow "${id}" already exists`
        });
      }

      workflows[id] = workflow;
      await jsonStore.write(FILENAME, workflows);

      req.app.get('io').emit('workflows:updated', { data: workflows, timestamp: new Date().toISOString() });
      console.log('[Socket.IO] Emitted workflows:updated');

      res.status(201).json({
        success: true,
        message: 'Workflow created successfully',
        data: { id, ...workflow }
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const workflow = req.body;

      const errors = validateWorkflow(workflow, id);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Workflow validation failed',
          details: errors
        });
      }

      const workflows = await jsonStore.read(FILENAME);
      
      if (!workflows[id]) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Workflow "${id}" not found`
        });
      }

      workflows[id] = workflow;
      await jsonStore.write(FILENAME, workflows);

      req.app.get('io').emit('workflows:updated', { data: workflows, timestamp: new Date().toISOString() });
      console.log('[Socket.IO] Emitted workflows:updated');

      res.json({
        success: true,
        message: 'Workflow updated successfully',
        data: { id, ...workflow }
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const workflows = await jsonStore.read(FILENAME);
      
      if (!workflows[id]) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Workflow "${id}" not found`
        });
      }

      delete workflows[id];
      await jsonStore.write(FILENAME, workflows);

      req.app.get('io').emit('workflows:updated', { data: workflows, timestamp: new Date().toISOString() });
      console.log('[Socket.IO] Emitted workflows:updated');

      res.json({
        success: true,
        message: 'Workflow deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createWorkflowsRouter;
