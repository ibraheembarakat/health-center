"use client";

import { useEffect, useState } from "react";

interface Complaint {
    id: number;
    title: string;
    description: string;
    status: string;
    status_display: string;
    reply: string | null;
    created_at: string;
}

function GetComplaints() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            const token = localStorage.getItem("accessToken");

            try {
                const response = await fetch(
                    "http://localhost:8000/api/complaints/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "ngrok-skip-browser-warning": "true"
                        },
                    }
                );

                const data = await response.json();

                setComplaints(data.results);
            } catch (error) {
                console.error(error);
            }

            setLoading(false);
        };

        fetchComplaints();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                Loading...
            </div>
        );
    }

    return (
        <div className=" p-6 space-y-6">
            <h1 className="text-4xl font-bold mb-6">
                My Complaints
            </h1>

            {complaints.map((item) => (
                <div
                    key={item.id}
                    className="bg-white shadow-lg rounded-2xl p-6 border"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-4xl font-bold">
                            {item.title}
                        </h2>

                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-2xl">
                            {item.status_display}
                        </span>
                    </div>

                    <p className="text-gray-700 mb-4 text-xl">
                        {item.description}
                    </p>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-3xl mb-2">
                            Reply:
                        </h3>

                        {item.reply ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
                                {item.reply}
                            </div>
                        ) : (
                            <div className="bg-gray-100 rounded-xl p-4 text-gray-500 italic">
                                Waiting for response...
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-gray-400 mt-4">
                        {new Date(item.created_at).toLocaleDateString()}
                    </p>
                </div>
            ))}
        </div>
    );
}


export default GetComplaints