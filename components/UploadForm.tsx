"use client";
import { useState } from "react";
import {
  FaCloudUploadAlt,
  FaFileImage,
  FaVideo,
  FaCheckCircle,
} from "react-icons/fa";
import { LoadingSpinner } from "@/components/common";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const endpoint =
      uploadType === "image" ? "/api/upload/image" : "/api/upload/video";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (data.secure_url) {
        setUploadedUrl(data.secure_url);
        setPreviewUrl(null);
        setFile(null);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setLoading(false);
      alert("Upload failed.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
    if (selected) setPreviewUrl(URL.createObjectURL(selected));
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleUpload}
        className="flex flex-col items-center gap-6 border border-white/10 p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-md shadow-[0_0_35px_-10px_rgba(255,0,150,0.4)] transition-all duration-300 hover:shadow-[0_0_45px_-5px_rgba(255,0,200,0.5)]"
      >
        {/* Upload Type Selector */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-2 flex-wrap">
          {[
            { type: "image", label: "Image", icon: <FaFileImage /> },
            { type: "video", label: "Video", icon: <FaVideo /> },
          ].map(({ type, label, icon }) => (
            <button aria-label="button"
              key={type}
              type="button"
              onClick={() => {
                setUploadType(type as "image" | "video");
                setPreviewUrl(null);
                setFile(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${
                uploadType === type
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105"
                  : "bg-white/10 text-gray-300 border border-white/10 hover:bg-white/20 hover:scale-105"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* File Input */}
        <label className="w-full max-w-xs sm:max-w-sm flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-6 cursor-pointer hover:border-pink-500/50 hover:bg-white/5 transition">
          <FaCloudUploadAlt className="w-10 h-10 text-[var(--accent)] opacity-80 mb-3" />
          <span className="text-sm text-gray-400">
            {file ? file.name : "Click to choose file"}
          </span>
          <input
            type="file"
            accept={uploadType === "image" ? "image/*" : "video/*"}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Upload Button */}
        <button aria-label="button"
          type="submit"
          disabled={loading || !file}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold shadow-lg hover:brightness-110 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" color="white" />
              Uploading...
            </span>
          ) : (
            <>
              <FaCloudUploadAlt />
              Upload {uploadType === "image" ? "Image" : "Video"}
            </>
          )}
        </button>
      </form>

      {/* Preview Section */}
      {previewUrl && (
        <div className="mt-10 text-center animate-fadeIn">
          <p className="text-gray-400 text-sm mb-3">
            Preview ({uploadType.toUpperCase()}):
          </p>
          <div className="flex justify-center">
            {uploadType === "image" ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-xl border border-white/10 shadow-lg hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <video
                controls
                src={previewUrl}
                className="w-72 h-48 sm:w-96 sm:h-60 rounded-xl border border-white/10 shadow-lg hover:scale-105 transition-transform duration-300"
              />
            )}
          </div>
        </div>
      )}

      {/* Uploaded Cloudinary URL */}
      {uploadedUrl && (
        <div className="mt-10 text-center animate-fadeIn">
          <div className="flex flex-col items-center gap-2">
            <FaCheckCircle className="text-green-500 w-6 h-6 animate-pulse" />
            <p className="text-gray-400 text-sm">Upload successful.</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-pink-400 underline hover:text-pink-300 text-xs sm:text-sm"
            >
              {uploadedUrl}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
