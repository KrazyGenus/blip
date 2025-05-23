import { useState } from "react";
import { PlayCircle } from "lucide-react";

const violationsMock = [
  {
    id: 1,
    start: 45,
    end: 52,
    type: "Hate Speech",
    description: "Detected language that may violate YouTube's hate speech policy.",
    solution: "Consider muting or rephrasing this segment. Use YouTube’s editor to trim or blur.",
  },
  {
    id: 2,
    start: 180,
    end: 188,
    type: "Copyright Music",
    description: "Auto-detected copyrighted audio track.",
    solution: "Replace music with royalty-free alternatives or use YouTube’s music library.",
  },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function ViolationDetailPage() {
  const [activeViolation, setActiveViolation] = useState(violationsMock[0]);
  const [activeTab, setActiveTab] = useState("solution");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-100 min-h-screen">
      {/* LEFT: Video Player + Clip List */}
      <div className="space-y-6">
        {/* Video Player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
          <video
            controls
            className="w-full h-full"
            src="/sample-violated-video.mp4"
            onLoadedMetadata={(e) => {
              e.target.currentTime = activeViolation.start;
            }}
            onTimeUpdate={(e) => {
              if (e.target.currentTime > activeViolation.end) {
                e.target.pause();
              }
            }}
          />
        </div>

        {/* Clip Cards */}
        <div className="space-y-3">
          {violationsMock.map((v) => (
            <div
              key={v.id}
              onClick={() => setActiveViolation(v)}
              className={`cursor-pointer rounded-xl border p-4 flex justify-between items-center shadow-sm transition hover:bg-gray-100 ${
                activeViolation.id === v.id ? "border-blue-600 bg-blue-50" : "border-gray-200"
              }`}
            >
              <div>
                <p className="font-semibold text-gray-800">{v.type}</p>
                <p className="text-sm text-gray-500">
                  {formatTime(v.start)} - {formatTime(v.end)}
                </p>
              </div>
              <PlayCircle className="w-5 h-5 text-blue-600" />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Details */}
      <div className="space-y-6">
        {/* Violation Detail Card */}
        <div className="rounded-xl bg-white shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Violation Detail</h2>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              activeViolation.type === "Hate Speech"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {activeViolation.type}
            </span>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">⏱ Timestamp</p>
            <p className="text-gray-800 text-sm">
              {formatTime(activeViolation.start)} – {formatTime(activeViolation.end)}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">📋 Description</p>
            <p className="text-gray-800 text-sm">{activeViolation.description}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">💡 Suggested Fix</p>
            <p className="text-gray-800 text-sm">{activeViolation.solution}</p>
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "solution"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("solution")}
            >
              Suggested Fix
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "tools"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("tools")}
            >
              Fix Tools
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "solution" ? (
            <div className="rounded-xl bg-white shadow p-5 text-sm text-gray-700">
              <p>{activeViolation.solution}</p>
            </div>
          ) : (
            <div className="rounded-xl bg-white shadow p-5 text-sm text-gray-700">
              <p>Future tools like mute, cut, or blur will be added here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
