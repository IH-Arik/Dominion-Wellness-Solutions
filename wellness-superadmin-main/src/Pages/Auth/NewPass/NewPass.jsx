import { Form, Input, message } from "antd";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import navylogo from "../../../assets/image/navylogo.png";
import api from "../../../lib/api";

const RESET_EMAIL_STORAGE_KEY = "superadmin_reset_email";
const RESET_CODE_STORAGE_KEY = "superadmin_reset_code";

const NewPass = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiMessage, contextHolder] = message.useMessage();

  useEffect(() => {
    const email = sessionStorage.getItem(RESET_EMAIL_STORAGE_KEY);
    const code = sessionStorage.getItem(RESET_CODE_STORAGE_KEY);
    if (!email || !code) {
      navigate("/forgate-password");
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onFinish = async (values) => {
    const email = sessionStorage.getItem(RESET_EMAIL_STORAGE_KEY);
    const code = sessionStorage.getItem(RESET_CODE_STORAGE_KEY);

    if (!email || !code) {
      apiMessage.error("Reset session expired. Start again.");
      navigate("/forgate-password");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/superadmin-reset-password", {
        email,
        code,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword,
      });
      sessionStorage.removeItem(RESET_EMAIL_STORAGE_KEY);
      sessionStorage.removeItem(RESET_CODE_STORAGE_KEY);
      apiMessage.success("Password changed successfully.");
      navigate("/sign-in");
    } catch (err) {
      apiMessage.error(
        err.response?.data?.message ||
          "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-100">
      {contextHolder}
      <div className="grid items-center w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
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

        <div className="w-full max-w-md p-8 mx-auto bg-white shadow-md rounded-2xl">
          <div className="flex justify-center ">
            <div className=" px-5 py-2  bg-[#0052CC1A] rounded-lg">
              <img src={navylogo} className="w-5" alt="Navy Logo" />
            </div>
          </div>

          <Form
            name="new-password"
            onFinish={onFinish}
            layout="vertical"
            className="w-full max-w-lg px-6 bg-white md:py-20 md:px-10 rounded-2xl"
          >
            <div className="mx-auto">
              <h2 className="mb-4 text-2xl font-bold text-gray-700 md:text-3xl">
                Set new password
              </h2>
            </div>

            <Form.Item
              name="newPassword"
              label={<p className="text-md">New Password</p>}
              rules={[
                { required: true, message: "Please input your new password." },
                { min: 8, message: "Password must be at least 8 characters." },
              ]}
            >
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="text-md"
                />
                <div className="absolute right-0 pr-3">
                  <button type="button" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<p className="text-md">Confirm Password</p>}
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your password." },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match.")
                    );
                  },
                }),
              ]}
            >
              <div className="relative flex items-center">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="text-md"
                />
                <div className="absolute right-0 pr-3">
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
              </div>
            </Form.Item>

            <Form.Item className="mt-8 text-center">
              <button
                className="bg-[#0A2342] text-center w-full p-2 font-semibold text-white px-20 py-3 rounded-md disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NewPass;
