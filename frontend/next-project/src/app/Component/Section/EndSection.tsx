"use client";

import { useEffect, useRef, useState } from "react";

interface BeneficiarySchedule {
  id: number;
  beneficiary_id: number;
  beneficiary_name: string;
  national_id: string;
  schedule_date: string;
  status: string;
}

interface VerifyFaceResponse {
  matched: boolean;
  score: number;
  verification_token: string;
}

export default function EndSection() {
  const [nationalId, setNationalId] = useState("");
  const [beneficiary, setBeneficiary] =
    useState<BeneficiarySchedule | null>(null);

  const [verificationToken, setVerificationToken] = useState<string | null>(
    null
  );

  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingFace, setLoadingFace] = useState(false);

  const [message, setMessage] = useState("");
  const [faceResult, setFaceResult] = useState<boolean | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);

  const [photos, setPhotos] = useState<File[]>([]);


  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
  }, []);

  // باقي الكود...
  // =========================
  // Upload Images
  // =========================
  const handleUploadPhoto = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setMessage("Please select valid image files.");
      return;
    }

    setPhotos((prev) => [...prev, ...selectedFiles]);

    setFaceResult(null);
    setVerificationToken(null);
    setMessage(
      `${selectedFiles.length} photo(s) uploaded successfully.`
    );

    // حتى يستطيع المستخدم اختيار نفس الصورة مرة أخرى
    event.target.value = "";
  };

  // =========================
  // Remove Image
  // =========================
  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));

    setFaceResult(null);
    setVerificationToken(null);
    setMessage("");
  };

  // =========================
  // Lookup Beneficiary
  // =========================
  const handleLookup = async () => {
    if (!nationalId.trim()) {
      setMessage("Please enter the national ID.");
      return;
    }

    setLoadingLookup(true);
    setMessage("");
    setBeneficiary(null);
    setFaceResult(null);
    setVerificationToken(null);
    setPhotos([]);

    try {
      const response = await fetch(
        "http://localhost:8000/api/aid-schedules/lookup-pending/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            national_id: nationalId.trim(),
          }),
        }
      );

      if (response.status === 404) {
        setMessage(
          "No eligible beneficiary or pending appointment was found for this national ID."
        );
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();

        console.error("LOOKUP ERROR:", errorText);

        setMessage(
          "An error occurred while verifying the national ID."
        );

        return;
      }

      const data: BeneficiarySchedule = await response.json();

      setBeneficiary(data);
      setMessage("Beneficiary found successfully.");
    } catch (error) {
      console.error("LOOKUP ERROR:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoadingLookup(false);
    }
  };

  // =========================
  // Open Camera
  // =========================
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOpen(true);
      setMessage("");
    } catch (error) {
      console.error("CAMERA ERROR:", error);
      setMessage("Unable to access the camera.");
    }
  };

  // =========================
  // Close Camera
  // =========================
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  // =========================
  // Capture Photo
  // =========================
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setMessage("Unable to capture the image.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setMessage("Unable to create the image.");
          return;
        }

        const file = new File(
          [blob],
          `face-${beneficiary?.beneficiary_id ?? "user"}-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setPhotos((prev) => [...prev, file]);

        closeCamera();

        setFaceResult(null);
        setVerificationToken(null);

        setMessage("Photo captured successfully.");
      },
      "image/jpeg",
      0.9
    );
  };

  // =========================
  // Verify Face
  // =========================
  const handleVerifyFace = async () => {
    if (!beneficiary) {
      setMessage("No beneficiary was found.");
      return;
    }

    if (photos.length === 0) {
      setMessage("Please upload or capture at least one photo first.");
      return;
    }

    setLoadingFace(true);
    setMessage("");
    setFaceResult(null);
    setVerificationToken(null);

    try {
      /*
       * الـ API الحالي يستقبل صورة واحدة في:
       * image
       *
       * لذلك سنجرب الصور واحدة واحدة.
       *
       * إذا تطابقت أي صورة → Accepted
       */

      for (let i = 0; i < photos.length; i++) {
        const formData = new FormData();

        formData.append("photo", photos[i], photos[i].name);

        setMessage(
          `Verifying photo ${i + 1} of ${photos.length}...`
        );

        const response = await fetch(
          `http://localhost:8000/api/aid-schedules/${beneficiary.id}/verify-face/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error(
            `VERIFY FACE ERROR - PHOTO ${i + 1}:`,
            errorText
          );

          continue;
        }

        const data: VerifyFaceResponse = await response.json();

        console.log(
          `VERIFY FACE RESPONSE - PHOTO ${i + 1}:`,
          data
        );

        // إذا تطابقت الصورة
        if (data.matched === true) {
          setFaceResult(true);

          setVerificationToken(data.verification_token);

          setMessage("Face verification successful.");

          setLoadingFace(false);

          return;
        }
      }

      // إذا لم تتطابق أي صورة
      setFaceResult(false);
      setVerificationToken(null);

      setMessage(
        "The face does not match in any of the uploaded photos."
      );
    } catch (error) {
      console.error("VERIFY FACE ERROR:", error);

      setMessage("Unable to connect to the server.");
    } finally {
      setLoadingFace(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "25px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            color: "#1f2937",
          }}
        >
          Aid Distribution
        </h2>

        <p
          style={{
            marginTop: "8px",
            color: "#6b7280",
          }}
        >
          Verify the beneficiary before completing the aid distribution.
        </p>
      </div>

      {/* National ID Search */}
      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <label
          style={{
            display: "block",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          National ID
        </label>

        <input
          type="text"
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          placeholder="Enter national ID"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "15px",
            outline: "none",
          }}
        />

        <button
          type="button"
          onClick={handleLookup}
          disabled={loadingLookup}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "13px",
            border: "none",
            borderRadius: "8px",
            background: loadingLookup ? "#9ca3af" : "#2563eb",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: "600",
            cursor: loadingLookup ? "not-allowed" : "pointer",
          }}
        >
          {loadingLookup ? "Checking..." : "Check Beneficiary"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            marginTop: "15px",
            padding: "13px 16px",
            borderRadius: "8px",
            background: "#f3f4f6",
            color: "#374151",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      {/* Beneficiary */}
      {beneficiary && (
        <div
          style={{
            marginTop: "20px",
            padding: "25px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#111827",
            }}
          >
            Beneficiary Information
          </h3>

          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            <InfoRow
              label="Name"
              value={beneficiary.beneficiary_name}
            />

            <InfoRow
              label="National ID"
              value={beneficiary.national_id}
            />

            <InfoRow
              label="Beneficiary ID"
              value={String(beneficiary.beneficiary_id)}
            />

            <InfoRow
              label="Schedule Date"
              value={beneficiary.schedule_date}
            />

            <InfoRow
              label="Status"
              value={beneficiary.status}
            />
          </div>

          {/* Camera / Upload */}
          {!cameraOpen && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "22px",
              }}
            >
              {/* Camera */}
              <button
                type="button"
                onClick={openCamera}
                style={{
                  flex: 1,
                  padding: "13px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#111827",
                  color: "#ffffff",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Open Camera
              </button>

              {/* Upload Multiple Images */}
              <label
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: "8px",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "600",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                Upload Photo(s)

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadPhoto}
                  style={{
                    display: "none",
                  }}
                />
              </label>
            </div>
          )}

          {/* Camera */}
          {cameraOpen && (
            <div style={{ marginTop: "22px" }}>
              <div
                style={{
                  overflow: "hidden",
                  borderRadius: "12px",
                  background: "#000",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    display: "block",
                    width: "100%",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={capturePhoto}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Capture Photo
                </button>

                <button
                  type="button"
                  onClick={closeCamera}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Photos */}
          {photos.length > 0 && (
            <div style={{ marginTop: "22px" }}>
              <p
                style={{
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "12px",
                }}
              >
                Selected Photos ({photos.length})
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "12px",
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={`${photo.name}-${index}`}
                    style={{
                      position: "relative",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Selected ${index + 1}`}
                      style={{
                        display: "block",
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        width: "28px",
                        height: "28px",
                        border: "none",
                        borderRadius: "50%",
                        background: "#dc2626",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                {/* Add More */}
                <label
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid #2563eb",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#2563eb",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  Add More Photos

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadPhoto}
                    style={{
                      display: "none",
                    }}
                  />
                </label>

                {/* Verify */}
                <button
                  type="button"
                  onClick={handleVerifyFace}
                  disabled={loadingFace}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    borderRadius: "8px",
                    background: loadingFace
                      ? "#9ca3af"
                      : "#16a34a",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: loadingFace
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {loadingFace
                    ? "Verifying..."
                    : "Verify Face"}
                </button>
              </div>

              {/* Remove All */}
              <button
                type="button"
                onClick={() => {
                  setPhotos([]);
                  setFaceResult(null);
                  setVerificationToken(null);
                  setMessage("");
                }}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "11px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#374151",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Remove All Photos
              </button>
            </div>
          )}

          {/* Accepted */}
          {faceResult === true && (
            <div
              style={{
                marginTop: "22px",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #86efac",
                background: "#f0fdf4",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "8px",
                }}
              >
                ✓
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#15803d",
                }}
              >
                Accepted
              </h3>

              <p
                style={{
                  color: "#166534",
                  marginBottom: 0,
                }}
              >
                Face verification was successful.
              </p>

              {verificationToken && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#166534",
                    marginTop: "10px",
                  }}
                >
                  Verification token is ready for the delivery process.
                </p>
              )}
            </div>
          )}

          {/* Not Accepted */}
          {faceResult === false && (
            <div
              style={{
                marginTop: "22px",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #fca5a5",
                background: "#fef2f2",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "8px",
                }}
              >
                ✕
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#dc2626",
                }}
              >
                Not Accepted
              </h3>

              <p
                style={{
                  color: "#991b1b",
                  marginBottom: 0,
                }}
              >
                The face does not match the beneficiary.
              </p>

              <p
                style={{
                  color: "#991b1b",
                  fontSize: "14px",
                }}
              >
                The aid distribution cannot be completed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        padding: "12px 14px",
        background: "#f9fafb",
        borderRadius: "8px",
      }}
    >
      <span
        style={{
          fontWeight: "600",
          color: "#374151",
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: "#6b7280",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}