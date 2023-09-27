import React, { useEffect, useState } from "react";
import { baseURL } from "../utils/constant";
import TopNavbar from '../components/TopNavbar';

export default function UserDetails() {
  const [userData, setUserData] = useState("");

  useEffect(() => {
    fetch(`${baseURL}/userData`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        token: window.localStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        //console.log(data)

        console.log(data, "userData");
        setUserData(data.data);
      });
  }, []);

  const logout = () => {
    window.localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div>
      <TopNavbar />
      <h1>Account Page</h1>
      <h2>Name: {userData.firstname}</h2>
      <h2>Email: {userData.email}</h2>
      <button onClick={logout}>Log out</button>
    </div>

  );
}
