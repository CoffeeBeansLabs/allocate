import { FormikReactSelect } from "@allocate-core/ui-components";
import React, { useEffect, useState } from "react";

import { getCurrencies } from "../../api/dropdowns";

const CurrencySelect = ({ currencyValue, dirty, setFieldValue }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await getCurrencies();
        setCurrencyOptions(
          response.filter(
            (currency, index, self) =>
              index ===
              self.findIndex((currCurrency) => currCurrency.value === currency.value),
          ),
        );
      } catch (error) {
        setCurrencyOptions([]);
      } finally {
        setIsLoading(false);
      }
    })();
    if (dirty && currencyValue?.value && currencyValue?.label) {
      setFieldValue("currency", "");
    }
  }, []);

  return (
    <div className="pt-20">
      <FormikReactSelect
        requied
        isLoading={isLoading}
        loadingMessage="Loading options…"
        name="currency"
        value={currencyValue}
        label="Currency"
        placeholder="Select Currency"
        options={currencyOptions}
        controlShouldRenderValue={!(currencyValue === "")}
      />
    </div>
  );
};

export default CurrencySelect;
