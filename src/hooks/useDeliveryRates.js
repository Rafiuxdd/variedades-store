import { useCallback, useEffect, useState } from "react";
import { DEFAULT_DELIVERY_RATES } from "../data/deliveryZones";
import { getDeliveryRates, updateDeliveryRates } from "../lib/api";

const DELIVERY_RATES_STORAGE_KEY = "deliveryRates";

function getInitialDeliveryRates() {
  try {
    const saved = localStorage.getItem(DELIVERY_RATES_STORAGE_KEY);
    return saved
      ? { ...DEFAULT_DELIVERY_RATES, ...JSON.parse(saved) }
      : DEFAULT_DELIVERY_RATES;
  } catch (error) {
    console.error("Error reading delivery rates:", error);
    return DEFAULT_DELIVERY_RATES;
  }
}

export function useDeliveryRates() {
  const [deliveryRates, setDeliveryRates] = useState(getInitialDeliveryRates);

  useEffect(() => {
    async function loadDeliveryRates() {
      try {
        const response = await getDeliveryRates();
        setDeliveryRates({
          ...DEFAULT_DELIVERY_RATES,
          ...(response.data || {})
        });
      } catch (error) {
        console.error("Error loading delivery rates:", error);
      }
    }

    loadDeliveryRates();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      DELIVERY_RATES_STORAGE_KEY,
      JSON.stringify(deliveryRates)
    );
  }, [deliveryRates]);

  const saveDeliveryRates = useCallback(async (nextRates) => {
    const response = await updateDeliveryRates({ rates: nextRates });
    const savedRates = {
      ...DEFAULT_DELIVERY_RATES,
      ...(response.data || nextRates)
    };

    setDeliveryRates(savedRates);
    localStorage.setItem(DELIVERY_RATES_STORAGE_KEY, JSON.stringify(savedRates));
  }, []);

  return {
    deliveryRates,
    saveDeliveryRates
  };
}
