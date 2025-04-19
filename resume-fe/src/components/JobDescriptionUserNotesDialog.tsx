import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";

interface Props extends DialogProps {}

export function JobDescriptionUserNotesDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Job Description / User Notes</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
