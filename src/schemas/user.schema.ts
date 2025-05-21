export const userSchema = {
  $id: 'User',
  type: 'object',
  properties: {
    id: { type: 'number' },
    username: { type: 'string' },
  },
  required: ['id', 'username'],
};

export const registerUserBodySchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: { type: 'string' },
    password: { type: 'string' },
  },
};

export const registrUserResponseSchema = {
  200: {
    description: 'User created',
    type: 'object',
    properties: {
      id: { type: 'number' },
      username: { type: 'string' },
    },
    required: ['id', 'username'],
  },
  400: {
    description: 'User already exists',
    type: 'object',
    properties: {
      error: { type: 'string' },
    },
    required: ['error'],
  },
};
