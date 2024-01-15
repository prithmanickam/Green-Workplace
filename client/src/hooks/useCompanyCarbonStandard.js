import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { baseURL } from "../utils/constant";

export default function useCompanyCarbonStandard(companyId) {
  const [companyCarbonStandard, setCompanyCarbonStandard] = useState({});

  useEffect(() => {
    if (companyId) {
      fetch(`${baseURL}/getCompanyCarbonStandard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_id: companyId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setCompanyCarbonStandard(data.companyCarbonStandard);
          } else {
            toast.error("Failed to fetch company carbon standard.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching company carbon standard.");
        });
    }
  }, [companyId]);

  return { companyCarbonStandard };
}
