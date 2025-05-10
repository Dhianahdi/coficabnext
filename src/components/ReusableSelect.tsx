"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useId, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Option {
  value: string;
  label: string;
}

interface ReusableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onAddNewOption?: (newOption: string) => Promise<void>;
  className?: string; // Add className as an optional prop
}

export default function ReusableSelect({
  options,
  value,
  onChange,
  onAddNewOption,
  className, // Destructure className
}: ReusableSelectProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [newOption, setNewOption] = useState<string>("");

  const handleAddNewOption = async () => {
    if (onAddNewOption) {
      await onAddNewOption(newOption);
    }
    onChange(newOption.toLowerCase());
    setNewOption("");
    setDialogOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value ? options.find((option) => option.value === value)?.label : `Select option`}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full border-input p-0" align="start">
          <Command>
            <CommandInput placeholder="Find option" />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    {value === option.value && (
                      <Check size={16} strokeWidth={2} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus
                    size={16}
                    strokeWidth={2}
                    className="-ms-2 me-2 opacity-60"
                    aria-hidden="true"
                  />
                  New option
                </Button>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Option</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter new option"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddNewOption}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
