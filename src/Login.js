import { useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./css/Login.module.css";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      username: username,
      password: password,
    };

    try {
      const response = await fetch("http://quiz-env.eba-ijxspiej.us-east-1.elasticbeanstalk.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const token = await response.text();
      const decoded = jwtDecode(token);

      localStorage.setItem("token", token);
      localStorage.setItem("role", decoded.role);
      navigate("/home");
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Quiz App</h2>

        <div>
          <label>Username:</label>
          <br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="username"
          />
        </div>

        <div>
          <label>Password:</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="password"
          />
        </div>

        <div>
          <button type="submit">Login</button>
          <button type="button" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
