"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tag } from "emblor";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import InputWithCancel from "@/components/JobManagement/components/InputWithCancel";
import { GenreInput } from "@/components/JobManagement/components/GenreInput";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView, Theme } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { debounce } from "lodash";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes"; // Import useTheme
import BlockEditor from "@/components/BlockEditor";
import TextareaWithLimit from "@/components/JobManagement/components/TextareaWithLimit";

export default function AddJobPage() {
    const router = useRouter();
    const createJob = useMutation(api.mutations.jobs.createJob);
    const departments = useQuery(api.queries.departments.getDepartments) || [];

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [departmentId, setDepartmentId] = useState("" as Id<"departments"> | "");
    const [requirements, setRequirements] = useState("");
    const [salaryRange, setSalaryRange] = useState("");
    const [employmentType, setEmploymentType] = useState("");
    const [location, setLocation] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [applicationDeadline, setApplicationDeadline] = useState<Date | undefined>(undefined);
    const [interviewProcess, setInterviewProcess] = useState("");
    const [isSaving, setIsSaving] = useState(false);


    // BlockNote Editor Logic
    const editor = useCreateBlockNote();

    // Ref to track if the initial content has been set
    const isInitialContentSet = useRef(false);

    // Parse initial content and set it in the editor (only once)
    useEffect(() => {
        if (!description || isInitialContentSet.current) return;

        let parsedContent: PartialBlock[];
        try {
            parsedContent = JSON.parse(description);
        } catch (error) {
            console.error("Failed to parse description:", error);
            parsedContent = [];
        }

        editor.replaceBlocks(editor.document, parsedContent);
        isInitialContentSet.current = true;
    }, [description, editor]);


    // Debounced onChange handler
    const debouncedOnChange = useCallback(
        debounce(() => {
            const contentJSON = JSON.stringify(editor.document);
            setDescription(contentJSON);
        }, 300),
        [editor]
    );

    // Handle editor changes
    const handleEditorChange = useCallback(() => {
        debouncedOnChange();
    }, [debouncedOnChange]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setDepartmentId("");
        setRequirements("");
        setSalaryRange("");
        setEmploymentType("");
        setLocation("");
        setExperienceLevel("");
        setTags([]);
        setApplicationDeadline(undefined);
        setInterviewProcess("");
    };

    const handleSave = async () => {
        const latestDescription = JSON.stringify(editor.document);
        setDescription(latestDescription);
      
        if (!title.trim() || !latestDescription.trim()) {
          toast.error("Title and description are required.");
          return;
        }
      
        try {
          setIsSaving(true);
          await createJob({
            title: title.trim(),
            description: latestDescription,
            departmentId: departmentId || undefined,
            requirements: requirements || undefined,
            salaryRange: salaryRange || undefined,
            employmentType: employmentType || undefined,
            location: location || undefined,
            experienceLevel: experienceLevel || undefined,
            tags: tags.map((tag) => tag.text),
            applicationDeadline: applicationDeadline ? applicationDeadline.getTime() : undefined,
          });
      
          toast.success("Job saved successfully!");
          resetForm();
        } catch (error) {
          toast.error("Failed to save job.");
          console.error(error);
        } finally {
          setIsSaving(false);
        }
      };
      


    return (
        <AdminPanelLayout>
            <ContentLayout title="Dashboard">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Create a New Job Posting</h1>


                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" aria-hidden="true" />}
                        {isSaving ? "Saving Changes..." : "Save Changes"}
                    </Button>
                </div>
                <div className="mt-6 flex justify-end gap-4">

                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Panel */}
                    <div className="space-y-6">
                        {/* Job Details Section */}
                        <Card className="p-6">
                            <div className="space-y-4">
                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Details</h3>
                                <p className="text-sm text-muted-foreground">
                                    Provide essential information about the job, including its title, description, department, and requirements.
                                </p>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="title" className="whitespace-nowrap font-bold ">Title</Label>
                                    <InputWithCancel inputValue={title} setInputValue={setTitle} inputId="title" placeholder="Enter job title" className="flex-1" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="department" className="whitespace-nowrap font-bold">Department</Label>
                                    <Select value={departmentId} onValueChange={(value) => setDepartmentId(value as Id<"departments">)}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept._id} value={dept._id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="requirements" className="whitespace-nowrap font-bold">Requirements</Label>
                                    <TextareaWithLimit
                                        id="requirements"
                                        maxLength={500} // Adjust the limit as needed
                                        value={requirements}
                                        onChange={setRequirements} // Pass the setter function directly
                                        placeholder="Enter job requirements"
                                        className="flex-1" // Ensures it takes up remaining space
                                        height="150px" // Set a specific height
                                    />
                                </div>

                            </div>
                        </Card>

                        {/* Compensation & Location Section */}
                        <Card className="p-6">
                            <div className="space-y-4">
                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Compensation & Location</h3>
                                <p className="text-sm text-muted-foreground">Specify the salary range and location for the job.</p>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="salaryRange" className="whitespace-nowrap font-bold">Salary Range</Label>
                                    <InputWithCancel inputValue={salaryRange} setInputValue={setSalaryRange} inputId="salaryRange" placeholder="Enter salary range" className="flex-1" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="location" className="whitespace-nowrap font-bold">Location</Label>
                                    <InputWithCancel inputValue={location} setInputValue={setLocation} inputId="location" placeholder="Enter location" className="flex-1" />
                                </div>
                            </div>
                        </Card>

                        {/* Employment Details Section */}
                        <Card className="p-6">
                            <div className="space-y-4">
                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Employment Details</h3>
                                <p className="text-sm text-muted-foreground">Define the type of employment, required experience level, and relevant tags.</p>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="employmentType" className="whitespace-nowrap font-bold">Employment Type</Label>
                                    <InputWithCancel inputValue={employmentType} setInputValue={setEmploymentType} inputId="employmentType" placeholder="Enter employment type" className="flex-1" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="experienceLevel" className="whitespace-nowrap font-bold">Experience Level</Label>
                                    <InputWithCancel inputValue={experienceLevel} setInputValue={setExperienceLevel} inputId="experienceLevel" placeholder="Enter experience level" className="flex-1" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="tags" className="whitespace-nowrap font-bold">Tags</Label>
                                    <GenreInput
                                        id="tags"
                                        initialTags={tags}
                                        onTagsChange={(newTags) => setTags(newTags)}
                                        placeholder="Add a tag"
                                        className="flex-1"
                                    />
                                </div>

                            </div>
                        </Card>

                        {/* Application & Interview Section */}
                        <Card className="p-6">
                            <div className="space-y-4">
                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Application & Interview</h3>
                                <p className="text-sm text-muted-foreground">Set the application deadline and describe the interview process.</p>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="applicationDeadline" className="whitespace-nowrap font-bold">Application Deadline</Label>
                                    <div className="flex-1">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    {applicationDeadline ? format(applicationDeadline, "PPP") : "Select a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={applicationDeadline} onSelect={setApplicationDeadline} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="interviewProcess" className="whitespace-nowrap font-bold">Interview Process</Label>
                                    <TextareaWithLimit
                                        id="interviewProcess"
                                        maxLength={500} // Adjust the limit as needed
                                        value={interviewProcess}
                                        onChange={setInterviewProcess} // Pass the setter function directly
                                        placeholder="Describe the interview process"
                                        className="flex-1" // Ensures it takes up remaining space
                                        height="150px" // Set a specific height
                                    />
                                </div>

                            </div>
                        </Card>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-6">
                        {/* Description Section */}
                        <Card className="p-6 h-full flex flex-col">
                            <div className="space-y-4 flex-1 flex flex-col">
                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Description</h3>
                                <p className="text-sm text-muted-foreground">
                                    Provide a detailed description of the job, including responsibilities, qualifications, and any other relevant information.
                                </p>

                                <div className="flex-1 overflow-y-auto"> {/* Make the editor scrollable */}
                                    <BlockEditor value={description} onChange={setDescription} editable />

                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

            </ContentLayout>
        </AdminPanelLayout>
    );
}