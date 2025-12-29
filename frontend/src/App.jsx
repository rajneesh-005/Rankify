import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = async () => {
    if (!file) {
      setError("Please select an Excel file first");
      return;
    }

    setError("");
    setStudents([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://127.0.0.1:8000/api/upload/",
        formData
      );
      setStudents(res.data.results);
    } catch (err) {
      console.log("UPLOAD ERROR -> ",err)
      setError("Upload failed. Check Excel format or backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <h1 className="text-3xl font-bold mb-6">
        Student Marks Analyzer
      </h1>

      {/* File selection */}
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx"
          disabled={loading}
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2"
        />
        {file && (
          <p className="text-sm text-gray-700">
            Selected file: <b>{file.name}</b>
          </p>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={uploadFile}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        Upload & Analyze
      </button>

      {/* Error message */}
      {error && (
        <p className="text-red-600 mt-4 font-semibold">{error}</p>
      )}

      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow text-lg font-semibold">
            Processing Excel…
          </div>
        </div>
      )}

      {/* Results table */}
      {students.length > 0 && (
        <div className="overflow-x-auto mt-8">
          <table className="w-full border border-gray-300 bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Rank</th>
                <th className="border p-2">USN</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={i}
                  className={s.passed ? "bg-green-100" : "bg-red-100"}
                >
                  <td className="border p-2 text-center">
                    {s.rank ?? "Fail"}
                  </td>
                  <td className="border p-2">{s.roll}</td>
                  <td className="border p-2">{s.name}</td>
                  <td className="border p-2">{s.total}</td>
                  <td className="border p-2 font-semibold">
                    {s.passed ? "Pass" : "Fail"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
