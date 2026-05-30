import { useCallback, useEffect, useState } from "react";
import {
  getCategories,
  getProducts,
  getDeliveryPoints
} from "../lib/api";
import { mapProductFromApi } from "../lib/mapper";
import initialProducts from "../data/products";

const INITIAL_CATEGORIES = [
  "Sin categoría",
  ...Array.from(new Set(initialProducts.map((product) => product.category)))
];
const APPROVED_PRODUCT_NAMES = new Set(initialProducts.map((product) => product.name));

function buildCategoryNames(categoryData = []) {
  const names = categoryData.map((category) => category.name);

  if (!names.includes("Sin categoría")) {
    return ["Sin categoría", ...names];
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

      setCategoryRecords(categoryData);
      setCategories(buildCategoryNames(categoryData));
      setProducts(
        productData
          .map(mapProductFromApi)
          .filter((product) => APPROVED_PRODUCT_NAMES.has(product.name))
      );
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
