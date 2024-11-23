import React from "react";

const Greeting = ({ message }) => {
  return <div>{message || "Hello, world!"}</div>;
};

export default Greeting;