"use client";

import React, { useState } from "react";
import HeaderSection from "../UI/HeaderSection";

function AddUser() {
    const [formData, setFormData] = useState({
        user: {
            username: "",
            email: "",
            first_name: "",
            last_name: "",
            phone: "",
            national_id: "",
            address: "",
        },
        date_of_birth: "",
        gender: "",
        height: "",
        weight: "",
        image: null as File | null,
    });

    const [loading, setLoading] = useState(false);

    const [statusMessage, setStatusMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    // =========================
    // Normal fields
    // =========================
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // =========================
    // User fields
    // =========================
    const handleUserChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({
            ...formData,
            user: {
                ...formData.user,
                [e.target.name]: e.target.value,
            },
        });
    };

    // =========================
    // Image
    // =========================
    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0] || null;

        setFormData({
            ...formData,
            image: file,
        });
    };

    // =========================
    // Submit
    // =========================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setStatusMessage(null);

        try {
            const token = localStorage.getItem("accessToken");

            const body = new FormData();

            // User nested fields
            body.append("user.username", formData.user.username);
            body.append("user.email", formData.user.email);
            body.append("user.first_name", formData.user.first_name);
            body.append("user.last_name", formData.user.last_name);
            body.append("user.phone", formData.user.phone);
            body.append("user.national_id", formData.user.national_id);
            body.append("user.address", formData.user.address);

            // Beneficiary fields
            body.append("date_of_birth", formData.date_of_birth);
            body.append("gender", formData.gender);
            body.append("height", formData.height);
            body.append("weight", formData.weight);

            // Photo
            if (formData.image) {
                body.append("photo", formData.image);
            }

            const response = await fetch(
                "http://localhost:8000/api/beneficiaries/",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "ngrok-skip-browser-warning": "true",
                    },
                    body,
                }
            );

            const responseText = await response.text();

            let data: any;

            try {
                data = JSON.parse(responseText);
            } catch {
                data = responseText;
            }

            console.log("STATUS:", response.status);
            console.log("API RESPONSE:", data);

            if (!response.ok) {
                throw new Error(
                    typeof data === "object"
                        ? JSON.stringify(data)
                        : data || "Failed to add beneficiary"
                );
            }

            setStatusMessage({
                type: "success",
                text: "Beneficiary added successfully!",
            });

            setFormData({
                user: {
                    username: "",
                    email: "",
                    first_name: "",
                    last_name: "",
                    phone: "",
                    national_id: "",
                    address: "",
                },
                date_of_birth: "",
                gender: "",
                height: "",
                weight: "",
                image: null,
            });

        } catch (error: any) {
            console.error("ERROR:", error);

            setStatusMessage({
                type: "error",
                text: error.message || "An error occurred while saving.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8">

            <HeaderSection
                head="Add New Beneficiary"
                text="Enter the beneficiary's information accurately to ensure the data is saved correctly and can be easily accessed later."
            />

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8"
            >

                {/* =========================
                    Feedback
                ========================== */}
                {statusMessage && (
                    <div
                        className={`p-4 rounded-xl text-sm font-medium ${statusMessage.type === "success"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                    >
                        {statusMessage.text}
                    </div>
                )}

                {/* =========================
                    Account Details
                ========================== */}
                <div>

                    <h3 className="text-lg font-semibold text-slate-800 pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
                        <span>👤</span>
                        Account Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Username */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Username *
                            </label>

                            <input
                                type="text"
                                name="username"
                                placeholder="e.g. john_doe"
                                required
                                value={formData.user.username}
                                onChange={handleUserChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Email *
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="john@example.com"
                                required
                                value={formData.user.email}
                                onChange={handleUserChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* First Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                First Name
                            </label>

                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                value={formData.user.first_name}
                                onChange={handleUserChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Last Name
                            </label>

                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                value={formData.user.last_name}
                                onChange={handleUserChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Phone Number
                            </label>

                            <input
                                type="text"
                                name="phone"
                                placeholder="+123..."
                                value={formData.user.phone}
                                onChange={handleUserChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* National ID */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                National ID *
                            </label>

                            <input
                                type="text"
                                name="national_id"
                                placeholder="National ID"
                                required
                                value={formData.user.national_id}
                                onChange={handleUserChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Address
                            </label>

                            <input
                                type="text"
                                name="address"
                                placeholder="Full Address"
                                value={formData.user.address}
                                onChange={handleUserChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Photo */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Beneficiary Photo
                            </label>

                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />

                            {formData.image && (
                                <p className="mt-2 text-xs text-slate-500">
                                    Selected:{" "}
                                    <span className="font-medium">
                                        {formData.image.name}
                                    </span>
                                </p>
                            )}
                        </div>

                    </div>
                </div>

                {/* =========================
                    Health Details
                ========================== */}
                <div>

                    <h3 className="text-lg font-semibold text-slate-800 pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
                        <span>📋</span>
                        Health & Personal Metrics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Gender
                            </label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            >
                                <option value="">
                                    Select Gender
                                </option>

                                <option value="M">
                                    Male
                                </option>

                                <option value="F">
                                    Female
                                </option>
                            </select>
                        </div>

                        {/* Height */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Height (cm)
                            </label>

                            <input
                                type="number"
                                name="height"
                                placeholder="e.g. 175"
                                value={formData.height}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Weight (kg)
                            </label>

                            <input
                                type="number"
                                name="weight"
                                placeholder="e.g. 70"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                    </div>
                </div>

                {/* =========================
                    Submit Button
                ========================== */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-3 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-600/20"
                    >
                        {loading
                            ? "Saving Beneficiary..."
                            : "Save Beneficiary"}
                    </button>

                </div>

            </form>
        </div>
    );
}

export default AddUser;