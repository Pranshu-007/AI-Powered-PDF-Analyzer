"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([""]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleQuestionChange = (value: string, index: number) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const submitData = async () => {
    if (!file) {
      alert("Upload a PDF file!");
      return;
    }
    if (!questions.length || questions.some(q => q.trim() === "")) {
      alert("Please fill in all questions!");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("questions", JSON.stringify(questions));

    try {
      const res = await axios.post("http://localhost:8000/process", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResponse(res.data);
    } catch (error) {
      console.error(error);
      alert("Error processing PDF");
    }

    setLoading(false);
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">PDF Facts Analyzer</h1>

      {/* FILE UPLOAD SECTION */}
      <div className="mb-6 border p-4 rounded-lg">
        <label className="font-semibold">Upload PDF:</label>
        <input type="file" onChange={handleFileChange} className="mt-2" accept="application/pdf" />
      </div>

      <div className="mb-6 border p-4 rounded-lg">
  <label className="font-semibold">Enter Questions:</label>

  {questions.map((q, index) => (
    <div key={index} className="flex items-center gap-2 mt-2">
      <input
        value={q}
        onChange={(e) => handleQuestionChange(e.target.value, index)}
        className="w-full border p-2 rounded"
        placeholder={`Question ${index + 1}`}
      />

      {/* DELETE BUTTON */}
      {questions.length > 1 && (
        <button
          onClick={() => {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
          }}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          ✕
        </button>
      )}
    </div>
  ))}

  <button
    onClick={addQuestion}
    className="mt-3 px-3 py-1 bg-gray-800 text-white rounded"
  >
    + Add Question
  </button>
</div>

      {/* SUBMIT BUTTON */}
      <button
        onClick={submitData}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Processing..." : "Analyze PDF"}
      </button>

      {/* RESULTS */}
      {response && (
        <div className="mt-8 border p-4 rounded-lg bg-black">
          <h2 className="text-lg font-semibold">Results:</h2>

          <pre className="mt-4 p-2 bg-black rounded text-sm overflow-x-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
