import api from './api';

export const getPositions = () =>
  api.get('/employer/positions.php');

export const createPosition = (payload) =>
  api.post('/employer/positions.php', payload);

export const updatePosition = (payload) =>
  api.put('/employer/positions.php', payload);

export const deletePosition = (id) =>
  api.delete('/employer/positions.php?id=' + id);
