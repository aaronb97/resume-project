import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { postResumesMutation } from "../client/@tanstack/react-query.gen";

export const Route = createFileRoute("/upload")({
  component: RouteComponent,
});

function RouteComponent() {
  const postResume = useMutation(postResumesMutation());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  const handleUpload = () => {
    if (selectedFile) {
      postResume.mutate({ body: { file: selectedFile } });
    } else {
      alert("Please select a file first.");
    }
  };

  return (
    <>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #cccccc",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : selectedFile ? (
          <p>Selected file: {selectedFile.name}</p>
        ) : (
          <p>Drag and drop a .docx file here, or click to select one</p>
        )}
        <button disabled={!selectedFile} onClick={handleUpload}>
          Upload
        </button>
      </div>
      {postResume.isPending && <p>Uploading...</p>}
      {postResume.error && <p>Error uploading file.</p>}
      {postResume.isSuccess && <p>Upload successful!</p>}
      {postResume.data && <p>{postResume.data.id}</p>}
    </>
  );
}
