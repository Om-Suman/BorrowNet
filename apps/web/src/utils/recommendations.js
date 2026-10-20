export function selectUniqueRecommendations(recommendations, visibleItems, limit = 3) {
  const visibleIds = new Set(visibleItems.map((item) => item.id));

  return recommendations
    .filter((item) => !visibleIds.has(item.id))
    .slice(0, limit);
}
