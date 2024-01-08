import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

function useAuth(allowedRoles) {
  const navigate = useNavigate(); 

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('userData'));

    if (!allowedRoles.includes(data?.type)) {
      navigate("/homepage", { replace: true }); 
    }
  }, [allowedRoles, navigate]);
}

export default useAuth;
