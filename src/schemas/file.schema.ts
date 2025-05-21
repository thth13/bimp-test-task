export const fileEntitySchema = {
  $id: 'FileEntity',
  type: 'object',
  properties: {
    id: { type: 'number' },
    filename: { type: 'string' },
    path: { type: 'string' },
    mimetype: { type: 'string' },
    size: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'filename', 'path', 'mimetype', 'size', 'createdAt'],
};
