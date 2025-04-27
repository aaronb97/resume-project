import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { postResumesMutation } from "../../client/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/resumes/upload")({
  component: RouteComponent,
});

function RouteComponent() {
  const postResume = useMutation(postResumesMutation());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [userNotes, setUserNotes] = useState("");

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

  const missingResume = !selectedFile;
  const missingJob = !jobDescription.trim();

  const tooltipMessage = (() => {
    if (missingResume && missingJob)
      return "Please upload your resume and paste the job description before continuing.";
    if (missingResume) return "Please upload your resume before continuing.";
    if (missingJob)
      return "Please paste the job description before continuing.";
    return "";
  })();

  const handleUpload = () => {
    if (!selectedFile) return alert("Please upload a resume first.");

    postResume.mutate(
      { body: { file: selectedFile, jobDescription, userNotes } },
      {
        onSuccess: (data) => {
          if (data.id) {
            router.navigate({
              to: "/resumes/$resumeId",
              params: { resumeId: data.id },
            });
          }
        },
      }
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full flex-1">
      {/* Resume Upload */}
      <div
        {...getRootProps()}
        className="w-full flex-1 flex flex-col justify-center rounded-lg p-4 text-center cursor-pointer bg-stone-900/50 border"
      >
        <div className="border-2 border-dashed border-stone-500 rounded-lg h-full flex flex-col gap-2 items-center justify-center">
          <input {...getInputProps()} />
          <Upload />

          {isDragActive ? (
            <p className="px-4">Release to upload your resume…</p>
          ) : selectedFile ? (
            <p className="px-4">Selected resume: {selectedFile.name}</p>
          ) : (
            <p className="px-4">
              Drag & drop your resume (.docx) here, or click to browse
            </p>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex-1 flex flex-col gap-8 rounded-lg border p-4 bg-stone-900/50 justify-center">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="jobDescription">Job Description</Label>

          <Textarea
            id="jobDescription"
            placeholder="Paste the job description you want to target"
            className="min-h-48"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div className="grid w-full gap-1.5">
          <Label htmlFor="userNotes">Additional Notes (optional)</Label>

          <Textarea
            id="userNotes"
            placeholder="Let us know anything else the AI should consider"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
          />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  size="lg"
                  onClick={handleUpload}
                  disabled={!!tooltipMessage || postResume.isPending}
                  type="button"
                  className="w-full"
                >
                  {postResume.isPending ? "Uploading…" : "Optimize My Resume"}
                </Button>
              </div>
            </TooltipTrigger>

            {tooltipMessage && (
              <TooltipContent side="bottom">{tooltipMessage}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
