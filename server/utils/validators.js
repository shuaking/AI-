function isValidId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id);
}

function isValidHexColor(color) {
  return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color);
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function validateWorkflow(workflow, id) {
  const errors = [];

  if (!id || !isValidId(id)) {
    errors.push('Workflow ID must be alphanumeric');
  }

  if (!workflow.name || typeof workflow.name !== 'string' || !workflow.name.trim()) {
    errors.push('Workflow name is required');
  }

  if (!workflow.description || typeof workflow.description !== 'string') {
    errors.push('Workflow description is required');
  }

  if (!Array.isArray(workflow.stages) || workflow.stages.length === 0) {
    errors.push('Workflow must have at least one stage');
  } else {
    const stageIds = new Set();
    workflow.stages.forEach((stage, index) => {
      if (!stage.id || !isValidId(stage.id)) {
        errors.push(`Stage ${index}: Invalid stage ID`);
      } else if (stageIds.has(stage.id)) {
        errors.push(`Stage ${index}: Duplicate stage ID "${stage.id}"`);
      } else {
        stageIds.add(stage.id);
      }

      if (!stage.name || typeof stage.name !== 'string') {
        errors.push(`Stage ${index}: Stage name is required`);
      }

      if (typeof stage.duration !== 'number' || stage.duration < 0) {
        errors.push(`Stage ${index}: Duration must be a non-negative number`);
      }
    });
  }

  return errors;
}

function validateRole(role) {
  const errors = [];

  if (!role.id || !isValidId(role.id)) {
    errors.push('Role ID must be alphanumeric');
  }

  if (!role.name || typeof role.name !== 'string' || !role.name.trim()) {
    errors.push('Role name is required');
  }

  if (!role.emoji || typeof role.emoji !== 'string') {
    errors.push('Role emoji is required');
  }

  if (!role.color || !isValidHexColor(role.color)) {
    errors.push('Role color must be a valid hex color code');
  }

  if (!role.title || typeof role.title !== 'string') {
    errors.push('Role title is required');
  }

  if (!role.personality || typeof role.personality !== 'string') {
    errors.push('Role personality is required');
  }

  return errors;
}

function validatePrompt(prompt) {
  const errors = [];

  if (!prompt.id || !isValidId(prompt.id)) {
    errors.push('Prompt ID must be alphanumeric');
  }

  if (!prompt.name || typeof prompt.name !== 'string' || !prompt.name.trim()) {
    errors.push('Prompt name is required');
  }

  if (!prompt.description || typeof prompt.description !== 'string') {
    errors.push('Prompt description is required');
  }

  const validTypes = ['stage', 'role', 'system', 'editor'];
  if (!prompt.type || !validTypes.includes(prompt.type)) {
    errors.push(`Prompt type must be one of: ${validTypes.join(', ')}`);
  }

  if (!prompt.content || typeof prompt.content !== 'string') {
    errors.push('Prompt content is required');
  }

  if (!Array.isArray(prompt.variables)) {
    errors.push('Prompt variables must be an array');
  }

  return errors;
}

function validateSettings(settings) {
  const errors = [];

  if (settings.globalVariables && typeof settings.globalVariables !== 'object') {
    errors.push('Global variables must be an object');
  }

  if (settings.customApiConfigs) {
    if (typeof settings.customApiConfigs !== 'object') {
      errors.push('Custom API configs must be an object');
    } else {
      Object.entries(settings.customApiConfigs).forEach(([name, config]) => {
        if (!config.name || typeof config.name !== 'string') {
          errors.push(`API "${name}": Name is required`);
        }

        if (!config.endpoint || !isValidUrl(config.endpoint)) {
          errors.push(`API "${name}": Valid endpoint URL is required`);
        }

        if (!config.apiKey || typeof config.apiKey !== 'string') {
          errors.push(`API "${name}": API key is required`);
        }

        if (!config.modelName || typeof config.modelName !== 'string') {
          errors.push(`API "${name}": Model name is required`);
        }

        if (config.temperature !== undefined) {
          if (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 2) {
            errors.push(`API "${name}": Temperature must be between 0 and 2`);
          }
        }

        if (config.maxTokens !== undefined) {
          if (typeof config.maxTokens !== 'number' || config.maxTokens <= 0 || !Number.isInteger(config.maxTokens)) {
            errors.push(`API "${name}": Max tokens must be a positive integer`);
          }
        }
      });
    }
  }

  return errors;
}

module.exports = {
  isValidId,
  isValidHexColor,
  isValidUrl,
  validateWorkflow,
  validateRole,
  validatePrompt,
  validateSettings
};
