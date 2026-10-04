"use client";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    localStorage.clear();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/api/auth/login/",
        {
          method: "POST",
          
          headers: {
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("role", data.role);

        if (data.role === "registration") {
          router.push("/registration");
        } else if (data.role === "beneficiary") {
          router.push("/user");
        } else if (data.role === "helpdesk") {
          router.push("/helpdesk");
        } else if (data.role === "awareness") {
          router.push("/awareness");
        } else if (data.role === "manager") {
          window.location.href =
            "http://localhost:8000/admin/";
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("ERROR:", err);
      setError(`Server connection error: ${err}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-[calc(100dvh-70px)] flex justify-center items-center ">
      <div className="bg-orange-95 grid grid-cols-2 mx-auto rounded-4xl max-w-250 shadow-[0_20px_50px_rgba(0,0,0,0.35)]
                      max-[550px]:flex max-[550px]:flex-col-reverse max-[550px]:items-center max-[550px]:justify-start">

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-10 items-center px-10 py-15 max-[550px]:gap-5 max-[550px]:py-5"
        >
          <div className="text-[25px] font-bold">Sign In</div>
          <div className="text-[14px]">Enter your email and password</div>

          <input
            className="p-4 bg-white rounded-2xl"
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="p-4 bg-white rounded-2xl"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div>
            <a href="/forgotPassword" className="text-[14px]">
              Forgot Your Password?
            </a>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`bg-emerald-600 w-1/3 p-2 rounded-2xl transition-all duration-200 max-[850px]:w-full
              ${loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-emerald-700 active:scale-95"
              }`}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <div className="flex flex-col gap-10 justify-center items-center text-center bg-orange-65 h-full px-10 rounded-l-[400px] rounded-r-4xl max-[850px]:rounded-l-[200px] max-[550px]:rounded-l-4xl max-[550px]:py-4 max-[550px]:gap-4">
          <div className="text-[25px] font-bold">Hello</div>
          <div className="text-[14px]">
            Welcome to our charitable healthcare platform, where we work together to support those in need and provide essential medical care. Your login helps us continue spreading kindness and making a meaningful human impact.
          </div>
        </div>

      </div>
    </div>
  );
}

export default Page;