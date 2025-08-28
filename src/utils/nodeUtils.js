export const getShortId = (id, length = 3) => {
  if (!id) return '';
  return id.slice(-length);
};

export const formatNodeTitle = (baseTitle, id, length = 3) => {
  const shortId = getShortId(id, length);
  return shortId ? `${baseTitle} (${shortId})` : baseTitle;
};
