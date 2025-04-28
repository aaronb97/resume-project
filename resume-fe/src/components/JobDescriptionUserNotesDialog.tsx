import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getResumesByIdOptions,
  patchResumesByIdMutation,
} from "@/client/@tanstack/react-query.gen";
import { Route } from "@/routes/resumes/$resumeId";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function JobDescriptionUserNotesDialog({
  open,
  onOpenChange,
  onSave,
}: DialogProps & { onSave: () => void }) {
  const { resumeId } = Route.useParams();
  const { data: docData } = useQuery(
    getResumesByIdOptions({ path: { id: resumeId } }),
  );

  const updateDocument = useMutation(patchResumesByIdMutation());

  const [jobDescription, setJobDescription] = useState("");
  const [userNotes, setUserNotes] = useState("");

  useEffect(() => {
    if (docData) {
      setJobDescription(docData.jobDescription);
      setUserNotes(docData.userNotes);
    }
  }, [docData]);

  const isValid = Boolean(jobDescription);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Job Description / User Notes</DialogTitle>
        </DialogHeader>

        <div className="grid w-full gap-1.5">
          <Label>Job Description</Label>

          <Textarea
            placeholder="Enter the job description you would like to fine tune your resume towards"
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div className="grid w-full gap-1.5">
          <Label>User Notes (optional)</Label>

          <Textarea
            placeholder="Please enter anything else you would like the AI to know"
            id="userNotes"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
          />
        </div>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={!isValid || updateDocument.isPending}
            onClick={() => {
              updateDocument.mutate(
                { path: { id: resumeId }, body: { jobDescription, userNotes } },
                {
                  onSuccess: () => {
                    onSave();
                  },
                },
              );
            }}
          >
            Save & Regenerate Recommendations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
