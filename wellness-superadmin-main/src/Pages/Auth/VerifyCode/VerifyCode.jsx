import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import navylogo from "../../../assets/image/navylogo.png";

const VerifyCode = () => {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 5);
  }, []);
  const handleChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handleResend = (e) => {
    e.preventDefault();
    alert("Verification code resent!");
  };
  const handleVerify = (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    navigate("/new-password");
    alert(`Verifying code: ${verificationCode}`);
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

          <h2 className="mb-2 text-xl font-bold ">
            Verify OTP
          </h2>

          <p className="mb-6 text-sm text-gray-500">
            Please check your email. We have sent a code to contact @gmail.com
          </p>

          <form onSubmit={handleVerify} className="mt-6">
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={code[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-xl font-semibold text-center text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                  maxLength={1}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="text-gray-500 ">Didn't receive the email? </p>
              <p
                href="#"
                onClick={handleResend}
                className="text-sky-400 hover:text-sky-500 focus:outline-none"
              >
                Resend
              </p>
            </div>

            <button
              type="submit"
              className=" py-3 px-20 w-full mt-8 text-white transition-colors rounded-md bg-[#012B5D]  focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
            >
              Verify Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
