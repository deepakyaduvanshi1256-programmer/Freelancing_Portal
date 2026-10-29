import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { saveAuth } from "../utils/auth";

const schema = yup.object({
  type: yup
    .string()
    .oneOf(["client", "user", "admin"], "Please select account type")
    .required("Account type is required"),

  email: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(6, "Minimum 6 characters")
    .max(15, "Maximum 15 characters"),
});

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      type: "client",
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data) => {
    try {
      const res = await axiosInstance.post("/login", data);

      if (res?.data?.success) {
        const { user, token } = res?.data?.result || {};

        if (!user || !token) {
          console.error("Invalid login response from server.");
          return;
        }

        // Save authentication details
        saveAuth(user, token);

        reset();

        // Redirect according to user role
        if (user.type === "admin") {
          navigate("/admin-dashboard");
        } else if (user.type === "user") {
          navigate("/user-dashboard");
        } else if (user.type === "client") {
          navigate("/client-dashboard");
        } else {
          console.error("User role is invalid.");
        }
      } else {
        console.error(res?.data?.message || "Login failed!");
      }
    } catch (error) {
      console.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <div className="login-card shadow">
        <p className="welcome-text mb-2">WELCOME BACK</p>

        <h1 className="fw-bold mb-2">Sign In</h1>

        <p className="text-muted mb-4">
          Don't have an account?{" "}
          <Link to="/register" className="create-link">
            Create one free
          </Link>
        </p>

        <form onSubmit={handleSubmit(handleLogin)}>
          {/* Account Type */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Login As
            </label>

            <select
              className="form-select"
              {...register("type")}
              disabled={isSubmitting}
            >
              <option value="client">Client</option>
              <option value="user">Freelancer</option>
              <option value="admin">Admin</option>
            </select>

            <p className="text-danger">
              {errors.type?.message}
            </p>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Email Address
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              disabled={isSubmitting}
            />

            <p className="text-danger">
              {errors.email?.message}
            </p>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              autoComplete="current-password"
              {...register("password")}
              disabled={isSubmitting}
            />

            <p className="text-danger">
              {errors.password?.message}
            </p>
          </div>

          {/* Remember Me */}
          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="remember"
              disabled={isSubmitting}
            />

            <label
              className="form-check-label"
              htmlFor="remember"
            >
              Remember me
            </label>
          </div>

          {/* Login Button with Spinner */}
          <button
            type="submit"
            className="btn login-btn w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;





















// import React from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import Swal from "sweetalert2";
// import {Link ,  useNavigate} from 'react-router-dom'
// import axiosInstance from '../utils/axiosInstance'
// import { saveAuth } from '../utils/auth'

// const schema = yup.object({
//   type: yup
//     .string()
//     .oneOf(["client", "user","admin"], "Please select account type")
//     .required("Account type is required"),

//   email: yup
//     .string()
//     .email("Invalid email")
//     .required("Email is required"),

//   password: yup
//     .string()
//     .required("Password is required")
//     .min(6, "Minimum 6 characters")
//     .max(15, "Maximum 15 characters"),
// });

// const Login = () => {
//   const navigate = useNavigate()
//   const {register,handleSubmit,formState: { errors },reset,} = useForm({
//     resolver: yupResolver(schema),  mode: "onChange",
//     defaultValues: {
//       type: "",
//       email: "",
//       password: "",
//     },
//   });

//   const handleLogin = async (data) => {
//     try {
//       const res = await axiosInstance.post("/login", data);

//       if (res?.data?.success) {
//         const { user, token } = res?.data?.result || {};
//         Swal.fire({
//           title: "Login",
//           text: res?.data?.message,
//           icon: "success",
//         });
//         saveAuth(user, token);
//         if (user?.type === 'admin') {
//           navigate('/admin-dashboard')
//         }
//         else if (user?.type === 'user') {
//           navigate('/user-dashboard')
//         } else if (user?.type === 'client') {
//           navigate('/client-dashboard')
//         }
//         reset();
//       } else {
//         Swal.fire({
//           title: "Login",
//           text: res?.data?.message,
//           icon: "error",
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         title: "Error",
//         text: error.response?.data?.message || "Something went wrong",
//         icon: "error",
//       });
//     }
//   };

//   return (
//     <div className="login-page d-flex justify-content-center align-items-center">
//       <div className="login-card shadow">
//         <p className="welcome-text mb-2">WELCOME BACK</p>

//         <h1 className="fw-bold mb-2">Sign In</h1>

//         <p className="text-muted mb-4">
//           Don't have an account?{" "}
//           <a href="/register" className="create-link">
//             Create one free
//           </a>
//         </p>

//         <form onSubmit={handleSubmit(handleLogin)}>
//           <div className="mb-3">
//             <label className="form-label fw-semibold">
//               Login As
//             </label>

//             <select
//               className="form-select"
//               {...register("type")}
//             >
//               <option value="client">Client</option>
//               <option value="user">Freelancer</option>
//               <option value="admin">Admin</option>
//             </select>

//             <p className="text-danger">
//               {errors.type?.message}
//             </p>
//           </div>

//           <div className="mb-3">
//             <label className="form-label fw-semibold">
//               Email Address
//             </label>

//             <input
//               type="email"
//               className="form-control"
//               placeholder="you@example.com"
//               {...register("email")}
//             />

//             <p className="text-danger">
//               {errors.email?.message}
//             </p>
//           </div>

//           <div className="mb-3">
//             <label className="form-label fw-semibold">
//               Password
//             </label>

//             <input
//               type="password"
//               className="form-control"
//               placeholder="Enter password"
//               {...register("password")}
//             />

//             <p className="text-danger">
//               {errors.password?.message}
//             </p>
//           </div>

//           <div className="form-check mb-4">
//             <input
//               className="form-check-input"
//               type="checkbox"
//               id="remember"
//             />

//             <label
//               className="form-check-label"
//               htmlFor="remember"
//             >
//               Remember me
//             </label>
//           </div>

//           <button
//             type="submit"
//             className="btn login-btn w-100"
//           >
//             Sign In
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;