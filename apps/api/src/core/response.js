export function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ data });
}

export function created(res, data) {
  return success(res, data, 201);
}

export function paginated(res, data, meta) {
  return res.status(200).json({ data, meta });
}

export function noContent(res) {
  return res.status(204).send();
}
