import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postResumesMutation } from "./client/@tanstack/react-query.gen";

function HomePage() {
  const postResume = useMutation(postResumesMutation());

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (selectedFile) {
      postResume.mutate({ body: { file: selectedFile } });
    } else {
      alert("Please select a file first.");
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".docx"
        onChange={(e) => {
          setSelectedFile(e.target.files![0]);
        }}
      />
      <button disabled={!selectedFile} onClick={handleUpload}>
        Upload
      </button>
      {postResume.isPending && <p>Uploading...</p>}
      {postResume.error && <p>Error uploading file.</p>}
      {postResume.isSuccess && <p>Upload successful!</p>}
      {postResume.data && <p>{postResume.data.id}</p>}
    </>
  );
}

export default HomePage;
