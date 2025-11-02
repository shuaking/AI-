const express = require('express');
const router = express.Router();
const { validateRole } = require('../utils/validators');

function createRolesRouter(jsonStore) {
  const FILENAME = 'roles.json';

  router.get('/', async (req, res, next) => {
    try {
      const roles = await jsonStore.read(FILENAME);
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const roles = await jsonStore.read(FILENAME);
      const role = roles.find(r => r.id === req.params.id);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Role "${req.params.id}" not found`
        });
      }
      
      res.json({
        success: true,
        data: role
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const role = req.body;

      const errors = validateRole(role);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Role validation failed',
          details: errors
        });
      }

      const roles = await jsonStore.read(FILENAME);
      
      if (roles.find(r => r.id === role.id)) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `Role "${role.id}" already exists`
        });
      }

      roles.push(role);
      await jsonStore.write(FILENAME, roles);

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: role
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const role = req.body;

      if (role.id && role.id !== id) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Role ID in body must match URL parameter'
        });
      }

      role.id = id;

      const errors = validateRole(role);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Role validation failed',
          details: errors
        });
      }

      const roles = await jsonStore.read(FILENAME);
      const index = roles.findIndex(r => r.id === id);
      
      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Role "${id}" not found`
        });
      }

      roles[index] = role;
      await jsonStore.write(FILENAME, roles);

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: role
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const roles = await jsonStore.read(FILENAME);
      const index = roles.findIndex(r => r.id === id);
      
      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Role "${id}" not found`
        });
      }

      const role = roles[index];
      if (role.required) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Cannot delete required role'
        });
      }

      roles.splice(index, 1);
      await jsonStore.write(FILENAME, roles);

      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createRolesRouter;
