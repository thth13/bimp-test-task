export const messageSchema = {
  $id: 'Message',
  type: 'object',
  properties: {
    id: { type: 'number' },
    content: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    user: { $ref: 'User#' },
    file: { $ref: 'FileEntity#', nullable: true },
  },
  required: ['id', 'createdAt', 'user'],
};

export const createTextMessageResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        username: { type: 'string' },
      },
      required: ['id', 'username'],
    },
    content: { type: 'string', nullable: true },
  },
  required: ['id', 'createdAt', 'user', 'content'],
};

export const createTextMessageSchema = {
  type: 'object',
  required: ['text'],
  properties: {
    text: { type: 'string' },
  },
};

export const getMessageQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'string', default: '1' },
    limit: { type: 'string', default: '10' },
  },
};

export const getMessageResposneSchema = {
  type: 'object',
  properties: {
    page: { type: 'number' },
    limit: { type: 'number' },
    total: { type: 'number' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          content: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          user: { type: 'string' },
          file: { $ref: 'FileEntity#', nullable: true },
        },
        required: ['id', 'createdAt', 'user'],
      },
    },
  },
};

export const createFileMessageBodySchema = {
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'binary',
      description: 'File to upload',
    },
  },
  required: ['file'],
};

export const createFileMessageResponseSchema = {
  201: {
    description: 'Message with uploaded file',
    type: 'object',
    properties: {
      message: { $ref: 'Message#' },
    },
  },
  400: {
    description: 'No file provided',
    type: 'object',
    properties: { error: { type: 'string' } },
  },
  401: {
    description: 'User not found',
    type: 'object',
    properties: { error: { type: 'string' } },
  },
};

export const getMessageContentQuerySchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', description: 'Message id' },
  },
};

export const getMessageContentResponseSchema = {
  200: {
    description: 'Raw message content (text or file stream)',
    content: {
      'text/plain': { schema: { type: 'string' } },
      'application/octet-stream': { schema: { type: 'string', format: 'binary' } },
    },
  },
  400: {
    description: 'Bad request',
    type: 'object',
    properties: { error: { type: 'string' } },
  },
  404: {
    description: 'Not found',
    type: 'object',
    properties: { error: { type: 'string' } },
  },
};
