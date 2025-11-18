import { AlertDialog, AlertDialogTitle, AlertDialogDescription } from "@/_components/ui/Alert-dialog";

export default function AlertNormalHours({ divisions }) {
  return (
    <AlertDialog className="mt-4 bg-blue-50 border-blue-200">
      <AlertDialogTitle>Normal Hours</AlertDialogTitle>
      <AlertDialogDescription>
        Showing work hours for all divisions.
      </AlertDialogDescription>
    </AlertDialog>
  );
}
