import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirm_password] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const fields =
        method === "login"
          ? { username, password }
          : { username, email, password, confirm_password };

      const res = await api.post(route, fields);

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.log(error.response?.data);
      alert(JSON.stringify(error.response?.data));
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex justify-center items-center p-4 md:p-0">
        <div className="border border-secondary border-2 rounded-2xl flex flex-col md:flex-row w-[90%] md:w-[70%] h-automd:min-h-[80vh] overflow-hidden bg-primary shadow-xl">

          {/* Left Side - Hidden on Mobile */}
          <div className="hidden md:flex w-[50%] flex-col justify-center items-center text-white md:text-lg">
            <Heart size={40} />
            <div className="text-3xl mb-3">EventHub</div>
            <p className="text-center px-6 md:px-10 lg:px-16 leading-6 md:leading-7 max-w-xs lg:max-w-md">
  Plan your perfect day with elegance. Manage guests, vendors,
  budgets and inspiration – all in one place.
</p>
          </div>

          {/* Right Side */}
<div className="flex flex-col gap-6 md:gap-8 py-6 sm:py-8 md:py-15 px-5 sm:px-8 md:px-0 items-center bg-white w-full md:w-[50%]">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center md:hidden">
              <Heart size={36} className="text-primary" />
              <h1 className="sm:text-3xl text-2xl  font-bold text-primary mt-2">
                EventHub
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-10 md:gap-15 w-full md:w-[70%] justify-center text-xl font-semibold mt">
              <button
                className={`border-primary p-1 ${
                  name === "Login" ? "border-b-0" : "border-b-4"
                }`}
                onClick={() => navigate("/register")}
              >
                Register
              </button>

              <button
                className={`border-primary p-1 ${
                  name === "Login" ? "border-b-4" : "border-b-0"
                }`}
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>
{method === "login" && (
  <div className="hidden md:block text-lg sm:text-xl mt-2 md:mt-5 font-semibold text-primary text-center">
    Welcome Back to EventHub ♡
  </div>
)}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 justify-center w-full sm:w-[85%] md:w-[70%]"
            >
              <label className="font-medium">Username :</label>

              <input
                type="text"
                placeholder="Username"
                className="w-full border rounded border-gray-200 p-2.5 md:p-2 text-sm md:text-base md:mb-2 shadow-xs"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              {method !== "login" && (
                <div>
                  <label className="font-medium">Email :</label>
                  <br />
                  <input
                    type="email"
                    placeholder="Email ID"
                    className="w-full border rounded border-gray-200 p-2.5 md:p-2 text-sm md:text-base md:my-2 shadow-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              <label className="font-medium">Password :</label>

              <input
                type="password"
                placeholder="Password"
                className="w-full border rounded border-gray-200 p-2.5 md:p-2 text-sm md:text-base md:mb-2 shadow-xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {method !== "login" && (
                <div>
                  <label className="font-medium">
                    Confirm Password :
                  </label>
                  
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirm_password}
                    className="w-full border rounded border-gray-200 p-2.5 md:p-2 text-sm md:text-base  my-2 shadow-xs"
                    onChange={(e) =>
                      setConfirm_password(e.target.value)
                    }
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-primary p-2 border border-primary text-white font-semibold mt-7 rounded shadow"
              >
                {loading ? "Please wait..." : name}
              </button>
            </form>

            {method === "login" && (
              <div className="text-sm md:text-base text-center px-4">
                Don't have any account?{" "}
                <a href="/register" className="font-semibold">
                  Register here
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Form;