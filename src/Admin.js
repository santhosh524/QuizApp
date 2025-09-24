import { useEffect, useState } from "react";
import styles from "./css/Admin.module.css";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isUserView, setIsUserView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch all users on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found, redirect to login if needed");
      return;
    }

    async function assignNotifications(user) {
      try {
        const response = await fetch(
          `/.netlify/functions/proxy/getnotifications/${user.username}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        user["notifications"] = await response.text();
        console.log(user);
      } catch (error) {
        console.error("Something went wrong:", error.message);
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch("/.netlify/functions/proxy/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();

        for (const user of data) {
          await assignNotifications(user);
        }

        setUsers(data);
        setIsUserView(true);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDivClick = async (username) => {
    const token = localStorage.getItem("token");
    const url = `/.netlify/functions/proxy/${username}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user courses");
      }

      const data = await response.json();
      setCourses(data);
      setIsUserView(false);
      setSelectedUser(username);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {loading ? (
        <h1>Loading the Page...</h1>
      ) : (
        <>
          {isUserView ? (
            <div className={styles.cards}>
              {users.map((user) => (
                <div
                  key={user.username}
                  className={styles.coursecard}
                  onClick={() => handleDivClick(user.username)}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "red",
                      color: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {user.notifications}
                  </div>

                  <h3>UserName: {user.username}</h3>
                  <p>Role: {user.role}</p>
                  <p>Email: {user.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <RenderCourses
                selectedUser={selectedUser}
                courses={courses}
                handleDivClick={handleDivClick}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

function RenderCourses({ selectedUser, courses, handleDivClick }) {
  const handleAssign = async (courseId) => {
    const token = localStorage.getItem("token");
    const url = `/.netlify/functions/proxy/${selectedUser}/${courseId}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user courses");
      }
      handleDivClick(selectedUser);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.cards}>
      {courses.map((C) => (
        <div key={C.course_id} className={styles.coursecard}>
          <h2>Course Name: {C.c_name}</h2>
          <p>Difficulty: {C.c_difficulty}</p>
          <p>{C.c_marks !== 0 ? C.c_marks : ""}</p>
          <p s>Status: {C.c_status}</p>
          {localStorage.getItem("role") === "ADMIN" &&
          C.c_status === "Request Raised" ? (
            <button onClick={() => handleAssign(C.course_id)}>Assign</button>
          ) : (
            ""
          )}
        </div>
      ))}
    </div>
  );
}
