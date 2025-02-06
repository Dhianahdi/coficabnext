"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tag } from "emblor";
import { Card } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import InputWithCancel from "@/components/JobManagement/components/InputWithCancel";
import { GenreInput } from "@/components/JobManagement/components/GenreInput";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { debounce } from "lodash";
import TextareaWithLimit from "@/components/JobManagement/components/TextareaWithLimit";
import BlockEditor from "@/components/BlockEditor";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function UpdateJobPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as Id<"jobs">;

    const job = useQuery(api.queries.jobs.getJobById, { id: jobId });
    const updateJob = useMutation(api.mutations.jobs.updateJob);
    const departments = useQuery(api.queries.departments.getDepartments) || [];

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [departmentId, setDepartmentId] = useState<Id<"departments"> | "">("");
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

    // Pre-fill form with job data
    useEffect(() => {
        if (job) {
            setTitle(job.title);
            setDescription(job.description);
            setDepartmentId(job.departmentId || "");
            setRequirements(job.requirements || "");
            setSalaryRange(job.salaryRange || "");
            setEmploymentType(job.employmentType || "");
            setLocation(job.location || "");
            setExperienceLevel(job.experienceLevel || "");
            setTags(job.tags?.map((tag) => ({ id: tag, text: tag })) || []);
            setApplicationDeadline(job.applicationDeadline ? new Date(job.applicationDeadline) : undefined);
            setInterviewProcess(job.interviewProcess || "");

            // Set initial content in the editor
            if (job.description) {
                let parsedInitialContent: PartialBlock[];
                try {
                    parsedInitialContent = JSON.parse(job.description);
                    editor.replaceBlocks(editor.document, parsedInitialContent);
                } catch (error) {
                    console.error("Failed to parse initial content:", error);
                }
            }
        }
    }, [job, editor]);

    // Debounced onChange handler for the editor
    const debouncedOnChange = useCallback(
        debounce(() => {
            const contentJSON = JSON.stringify(editor.document);
            setDescription(contentJSON);
        }, 300),
        [editor]
    );

    const handleEditorChange = useCallback(() => {
        debouncedOnChange();
    }, [debouncedOnChange]);

    const handleUpdate = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error("Title and description are required.");
            return;
        }

        try {
            setIsSaving(true);
            await updateJob({
                jobId,
                title: title.trim(),
                description: description.trim(),
                departmentId: departmentId || undefined,
                requirements: requirements || undefined,
                salaryRange: salaryRange || undefined,
                employmentType: employmentType || undefined,
                location: location || undefined,
                experienceLevel: experienceLevel || undefined,
                tags: tags.map((tag) => tag.text),
                applicationDeadline: applicationDeadline ? applicationDeadline.getTime() : undefined,
                interviewProcess: interviewProcess || undefined,
            });
            toast.success("Job updated successfully!");
            router.push("/jobs"); // Redirect to the jobs page after updating
        } catch (error) {
            console.error(error);
            toast.error("Failed to update job. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminPanelLayout>
            <ContentLayout title="Dashboard">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Update Job Posting</h1>
                    <Button onClick={handleUpdate} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" aria-hidden="true" />}
                        {isSaving ? "Updating..." : "Update Job"}
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Panel */}
                    <div className="space-y-6">
                        {/* Job Details Section */}
                        <Card className="p-6">
                            <div className="space-y-4">
                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Details</h3>
                                <p className="text-sm text-muted-foreground">
                                    Update essential information about the job.
                                </p>
                                <div className="flex items-center gap-4">
                                    <Label htmlFor="title" className="whitespace-nowrap font-bold">Title</Label>
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
                                        maxLength={500}
                                        value={requirements}
                                        onChange={setRequirements}
                                        placeholder="Enter job requirements"
                                        className="flex-1"
                                        height="150px"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Compensation & Location Section */}
                        <Card className="p-6">
                            <div className="space-y-4">
                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Compensation & Location</h3>
                                <p className="text-sm text-muted-foreground">Update salary range and location.</p>
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
                                <p className="text-sm text-muted-foreground">Update employment type, experience level, and tags.</p>
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
                                <p className="text-sm text-muted-foreground">Update application deadline and interview process.</p>
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
                                        maxLength={500}
                                        value={interviewProcess}
                                        onChange={setInterviewProcess}
                                        placeholder="Describe the interview process"
                                        className="flex-1"
                                        height="150px"
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
                                    Update the detailed description of the job.
                                </p>
                                <div className="flex-1 overflow-y-auto">
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