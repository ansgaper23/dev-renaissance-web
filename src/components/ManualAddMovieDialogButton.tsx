
import React, { useState } from "react";
import ManualAddMovie from "./ManualAddMovie";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const ManualAddMovieDialogButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-cuevana-blue hover:bg-cuevana-blue/90 flex items-center gap-2 w-full md:w-auto"
        >
          <Plus size={16} /> Agregar película manualmente
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[80vh] overflow-y-auto">
        <ManualAddMovie forceDialog open={open} setOpen={setOpen} hideHeading />
      </DialogContent>
    </Dialog>
  );
};

export default ManualAddMovieDialogButton;
