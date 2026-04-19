import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import navylogo from "../../../assets/image/navylogo.png";
import api from "../../../lib/api";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { data } = response.data;
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user?.role || "");

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="grid items-center w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* LEFT PANEL */}
        <div
          style={{
            background: "linear-gradient(135deg, #0A2342 0%, #0747A6 100%)",
          }}
          className="p-8 text-white shadow-lg rounded-3xl md:py-20"
        >
          <div className="flex items-center px-3 py-1 mb-6 text-sm rounded-full gap-x-2 bg-white/10">
            <span>
              <svg
                width="10"
                height="12"
                viewBox="0 0 10 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.66667 11.6667C3.31528 11.3264 2.19965 10.551 1.31979 9.34062C0.439931 8.13021 0 6.78611 0 5.30833V1.75L4.66667 0L9.33333 1.75V5.30833C9.33333 6.78611 8.8934 8.13021 8.01354 9.34062C7.13368 10.551 6.01806 11.3264 4.66667 11.6667ZM4.66667 10.4417C5.60972 10.15 6.39722 9.57396 7.02917 8.71354C7.66111 7.85313 8.03056 6.89306 8.1375 5.83333H4.66667V1.23958L1.16667 2.55208V5.30833C1.16667 5.41528 1.16667 5.50278 1.16667 5.57083C1.16667 5.63889 1.17639 5.72639 1.19583 5.83333H4.66667V10.4417Z"
                  fill="white"
                />
              </svg>
            </span>
            <span> Secure Institutional Access</span>
          </div>

          <h1 className="mb-6 text-3xl font-bold leading-tight md:text-4xl">
            Drive team excellence <br /> with precision <br /> analytics.
          </h1>

          <p className="mb-8 text-blue-100">
            Access your Institutional Lead dashboard to monitor <br />{" "}
            performance, manage cohorts, and secure your <br /> organizational
            data.
          </p>

          <div className="flex gap-4">
            <div className="flex-1 p-6 bg-white/10 rounded-xl">
              <p className="mb-1 text-xs text-blue-200">TOTAL COHORT GROWTH</p>
              <p className="text-xl font-semibold">+24.8%</p>
            </div>

            <div className="flex-1 p-6 bg-white/10 rounded-xl">
              <p className="mb-1 text-xs text-blue-200">ACTIVE UNITS</p>
              <p className="text-xl font-semibold">12</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full max-w-md p-8 mx-auto bg-white shadow-md rounded-2xl">
          <div className="flex justify-center mb-4 ">
            <div className=" px-5 py-2  bg-[#0052CC1A] rounded-lg">
              <img src={navylogo} className="w-5" alt="Navy Logo" />
            </div>
          </div>

          <h2 className="mb-2 text-xl font-semibold text-center">
            Institutional Lead Login
          </h2>

          <p className="mb-6 text-sm text-center text-gray-500">
            Enter your credentials to access the secure portal.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu"
                className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-1 text-right">
               <Link to="/forgate-password" >
                 <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
               </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 font-medium text-white transition rounded-lg ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>

          <div className="flex items-center justify-center mt-6 text-xs text-gray-500">
            <span className="mr-2 text-green-500">
              <svg
                width="10"
                height="12"
                viewBox="0 0 10 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.05417 7.90417L7.35 4.60833L6.51875 3.77708L4.05417 6.24167L2.82917 5.01667L1.99792 5.84792L4.05417 7.90417ZM4.66667 11.6667C3.31528 11.3264 2.19965 10.551 1.31979 9.34062C0.439931 8.13021 0 6.78611 0 5.30833V1.75L4.66667 0L9.33333 1.75V5.30833C9.33333 6.78611 8.8934 8.13021 8.01354 9.34062C7.13368 10.551 6.01806 11.3264 4.66667 11.6667Z"
                  fill="#16A34A"
                />
              </svg>
            </span>
            Secure SSL encryption active
          </div>
        </div>
      </div>
    </div>
  );
}
