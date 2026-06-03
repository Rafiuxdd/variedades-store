import { useCallback, useEffect, useState } from "react";
import {
  getCategories,
  getProducts,
  getDeliveryPoints
} from "../lib/api";
import { mapProductFromApi } from "../lib/mapper";
import initialProducts from "../data/products";

const DEFAULT_CATEGORY = "Sin categoría";

const INITIAL_CATEGORIES = [
  DEFAULT_CATEGORY,
  ...Array.from(new Set(initialProducts.map((product) => product.category)))
];

function buildCategoryNames(categoryData = []) {
  const names = categoryData.map((category) => category.name);

  if (!names.includes(DEFAULT_CATEGORY)) {
    return [DEFAULT_CATEGORY, ...names];
  }

  return names;
}

export function useStoreData() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [products, setProducts] = useState(initialProducts);
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [isLoadingStore, setIsLoadingStore] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoadingStore(true);

      const [categoriesResponse, productsResponse, deliveryPointsResponse] =
        await Promise.all([
          getCategories(),
          getProducts(),
          getDeliveryPoints(false)
        ]);

      const categoryData = categoriesResponse.data || [];
      const productData = productsResponse.data || [];
      const deliveryPointsData = deliveryPointsResponse.data || [];
      const mappedProducts = productData.map(mapProductFromApi);

      setCategoryRecords(categoryData);
      setCategories(categoryData.length > 0 ? buildCategoryNames(categoryData) : INITIAL_CATEGORIES);
      setProducts(mappedProducts.length > 0 ? mappedProducts : initialProducts);
      setDeliveryPoints(deliveryPointsData);
    } catch (error) {
      console.error(error);
      setCategories(INITIAL_CATEGORIES);
      setProducts(initialProducts);
    } finally {
      setIsLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    categories,
    categoryRecords,
    products,
    deliveryPoints,
    isLoadingStore,
    loadData,
    setCategoryRecords,
    setCategories,
    setProducts,
    setDeliveryPoints
  };
}
