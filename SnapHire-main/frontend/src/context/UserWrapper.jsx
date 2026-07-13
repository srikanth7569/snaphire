// src/context/UserWrapper.jsx
import React, { useState } from "react";
import { UserDataContext } from "./UserContext";

const UserWrapper = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserWrapper;
