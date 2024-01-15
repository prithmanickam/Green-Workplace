import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { baseURL } from "../utils/constant";

export default function useUserTeamsData(userId) {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetch(`${baseURL}/getUserTeamsData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setTeams(data.data);
        } else {
          toast.error("Failed to fetch teams data. Please try again.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while fetching teams data.");
        setError(error);
      })
      .finally(() => setIsLoading(false));
    }
  }, [userId]);

  return { teams, isLoading, error };
}
