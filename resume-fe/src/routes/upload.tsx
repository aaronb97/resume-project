import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { postResumesMutation } from "../client/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/upload")({
  component: RouteComponent,
});

function RouteComponent() {
  const postResume = useMutation(postResumesMutation());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

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
      postResume.mutate(
        { body: { file: selectedFile } },
        {
          onSuccess: (data) => {
            if (data.id) {
              router.navigate({
                to: "/resume/$resumeId",
                params: { resumeId: data.id },
              });
            }
          },
        }
      );
    } else {
      alert("Please select a file first.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 h-9/10 mt-12">
      <div
        {...getRootProps()}
        className="w-full h-80 flex flex-col justify-center border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer"
      >
        <input {...getInputProps()} />

        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : selectedFile ? (
          <p>Selected file: {selectedFile.name}</p>
        ) : (
          <p>Drag and drop a .docx file here, or click to select one</p>
        )}
      </div>

      {selectedFile && (
        <Button size={"lg"} onClick={handleUpload}>
          Upload
        </Button>
      )}

      {postResume.isPending && <p>Uploading...</p>}
      {postResume.error && <p>Error uploading file.</p>}
      {postResume.isSuccess && <p>Upload successful!</p>}
      {postResume.data && <p>{postResume.data.id}</p>}
    </div>
  );
}
