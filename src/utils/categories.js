export const DEFAULT_CATEGORY = "Sin categoría";

export function buildCategoryNames(categoryData = []) {
  const names = categoryData.map((category) => category.name);

  if (!names.includes(DEFAULT_CATEGORY)) {
    return [DEFAULT_CATEGORY, ...names];
  }

  return names;
}

export function sortCategoriesByDate(categoryData = []) {
  return [...categoryData].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function findCategoryIdByName(categoryName, categoryRecords = []) {
  if (!categoryName || categoryName === DEFAULT_CATEGORY) {
    const uncategorized = categoryRecords.find(
      (category) => category.name === DEFAULT_CATEGORY
    );

    return uncategorized?.id || null;
  }

  const found = categoryRecords.find((category) => category.name === categoryName);
  return found?.id || null;
}
