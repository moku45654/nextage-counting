function convertObjectsTo2DArray(objects, fields) {
  if (!objects || objects.length === 0) return [];
  const headers = fields || Object.keys(objects[0]);
  const data2D = [headers];
  objects.forEach((obj) => {
    data2D.push(headers.map((key) => obj[key]));
  });
  return data2D;
}
