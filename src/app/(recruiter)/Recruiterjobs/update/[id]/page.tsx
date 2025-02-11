"use client";

import { useState, useEffect } from "react";
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
import TextareaWithLimit from "@/components/JobManagement/components/TextareaWithLimit";
import BlockEditor from "@/components/BlockEditor";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Separator } from "@/components/ui/separator";
import ReusableSelect from "@/components/ReusableSelect";

interface Option {
    value: string;
    label: string;
}

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
    const [experienceLevel, setExperienceLevel] = useState("");
    const [employmentTypeOptions, setEmploymentTypeOptions] = useState<Option[]>([]);
    const [experienceLevelOptions, setExperienceLevelOptions] = useState<Option[]>([]);
    const [location, setLocation] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [applicationDeadline, setApplicationDeadline] = useState<Date | undefined>(undefined);
    const [interviewProcess, setInterviewProcess] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Fetch experience level options
    const fetchedExperienceLevelOptions = useQuery(api.queries.jobs.getExperienceLevelOptions);
    useEffect(() => {
        if (fetchedExperienceLevelOptions) {
            setExperienceLevelOptions(
                fetchedExperienceLevelOptions.map((option: any) => ({
                    value: option.value,
                    label: option.label,
                }))
            );
        }
    }, [fetchedExperienceLevelOptions]);

    // Fetch employment type options
    const fetchedEmploymentTypeOptions = useQuery(api.queries.jobs.getEmploymentTypeOptions);
    useEffect(() => {
        if (fetchedEmploymentTypeOptions) {
            setEmploymentTypeOptions(
                fetchedEmploymentTypeOptions.map((option: any) => ({
                    value: option.value,
                    label: option.label,
                }))
            );
        }
    }, [fetchedEmploymentTypeOptions]);

    // Handle employment type change
    const handleEmploymentTypeChange = (newOption: string) => {
        setEmploymentType(newOption);
    };

    // Handle adding new employment type option
    const addEmploymentTypeOption = useMutation(api.mutations.jobs.addEmploymentTypeOption);
    const handleAddNewEmploymentTypeOption = async (newOption: string) => {
        await addEmploymentTypeOption({
            value: newOption.toLowerCase(),
            label: newOption,
        });

        // Refetch employment type options
        if (fetchedEmploymentTypeOptions) {
            setEmploymentTypeOptions(
                fetchedEmploymentTypeOptions.map((option: any) => ({
                    value: option.value,
                    label: option.label,
                }))
            );
        }
    };

    // Handle experience level change
    const handleExperienceLevelChange = (newOption: string) => {
        setExperienceLevel(newOption);
    };

    // Handle adding new experience level option
    const addExperienceLevelOption = useMutation(api.mutations.jobs.addExperienceLevelOption);
    const handleAddNewExperienceLevelOption = async (newOption: string) => {
        await addExperienceLevelOption({
            value: newOption.toLowerCase(),
            label: newOption,
        });

        // Refetch experience level options
        if (fetchedExperienceLevelOptions) {
            setExperienceLevelOptions(
                fetchedExperienceLevelOptions.map((option: any) => ({
                    value: option.value,
                    label: option.label,
                }))
            );
        }
    };

    // Prefill form with job data
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
            setTags(job.tags?.map((tag) => ({ id: tag, text: tag })) || []); // Ensure tags are mapped correctly
            setApplicationDeadline(job.applicationDeadline ? new Date(job.applicationDeadline) : undefined);
            setInterviewProcess(job.interviewProcess || "");
        }
    }, [job]);

    // Debugging: Log tags state after it is set
    useEffect(() => {
        console.log("Tags State:", tags);
    }, [tags]);

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
                tags: tags.map((tag) => tag.text), // Ensure tags are mapped correctly
                applicationDeadline: applicationDeadline ? applicationDeadline.getTime() : undefined,
                interviewProcess: interviewProcess || undefined,
            });
            toast.success("Job updated successfully!");
            router.push("/Recruiterjobs");
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

                    {/* Right Panel */}
                    <div className="space-y-6">
                        {/* Job Details Section */}
                        <div className="space-y-4">
                            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Details</h3>
                            <p className="text-sm text-muted-foreground">
                                Update essential information about the job.
                            </p>
                            <div className="flex items-center gap-4">
                                <Label htmlFor="title" className="min-w-24 whitespace-nowrap font-bold">Title</Label>
                                <InputWithCancel inputValue={title} setInputValue={setTitle} inputId="title" placeholder="Enter job title" className="flex-1" />
                            </div>
                            <div className="flex items-center gap-4">
                                <Label htmlFor="department" className="min-w-24 whitespace-nowrap font-bold">Department</Label>
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
                                <Label htmlFor="requirements" className="min-w-24 whitespace-nowrap font-bold">Requirements</Label>
                                <TextareaWithLimit
                                    id="requirements"
                                    maxLength={150}
                                    value={requirements}
                                    onChange={setRequirements}
                                    placeholder="Enter job requirements"
                                    className="flex-1"
                                    height="150px"
                                />
                            </div>
                        </div>

                        <Separator className="my-4" />
                        {/* Compensation & Location Section */}
                        <div className="space-y-4">
                            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Compensation & Location</h3>
                            <p className="text-sm text-muted-foreground">Update salary range and location.</p>
                            <div className="flex items-center gap-4">
                                <Label htmlFor="salaryRange" className="min-w-24 whitespace-nowrap font-bold">Salary Range</Label>
                                <InputWithCancel inputValue={salaryRange} setInputValue={setSalaryRange} inputId="salaryRange" placeholder="Enter salary range" className="flex-1" />
                            </div>
                            <div className="flex items-center gap-4">
                                <Label htmlFor="location" className="min-w-24 whitespace-nowrap font-bold">Location</Label>
                                <InputWithCancel inputValue={location} setInputValue={setLocation} inputId="location" placeholder="Enter location" className="flex-1" />
                            </div>
                        </div>

                        <Separator className="my-4" />
                        {/* Employment Details Section */}
                        <div className="space-y-4">
                            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Employment Details</h3>
                            <p className="text-sm text-muted-foreground">Update employment type, experience level, and tags.</p>
                            <div className="flex items-center gap-4">
                                <Label htmlFor="employmentType" className="min-w-24 whitespace-nowrap font-bold">
                                    Employment Type
                                </Label>
                                <ReusableSelect
                                    options={employmentTypeOptions}
                                    value={employmentType}
                                    onChange={handleEmploymentTypeChange}
                                    onAddNewOption={handleAddNewEmploymentTypeOption}
                                    className="flex-1"
                                />
                            </div>

                            {/* Experience Level */}
                            <div className="flex items-center gap-4">
                                <Label htmlFor="experienceLevel" className="min-w-24 whitespace-nowrap font-bold">
                                    Experience Level
                                </Label>
                                <ReusableSelect
                                    options={experienceLevelOptions}
                                    value={experienceLevel}
                                    onChange={handleExperienceLevelChange}
                                    onAddNewOption={handleAddNewExperienceLevelOption}
                                    className="flex-1"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <Label htmlFor="tags" className="min-w-28 whitespace-nowrap font-bold">Tags</Label>
                                <GenreInput
                                    id="tags"
                                    initialTags={tags}
                                    onTagsChange={(newTags) => setTags(newTags)}
                                    placeholder="Add a tag"
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <Separator className="my-4" />
                        {/* Application & Interview Section */}
                        <div className="space-y-4">
                            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Application & Interview</h3>
                            <p className="text-sm text-muted-foreground">Update application deadline and interview process.</p>
                            <div className="flex items-center gap-4">
                                <Label htmlFor="applicationDeadline" className="min-w-24 whitespace-nowrap font-bold">Application Deadline</Label>
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
                                <Label htmlFor="interviewProcess" className="min-w-24 whitespace-nowrap font-bold">Interview Process</Label>
                                <TextareaWithLimit
                                    id="interviewProcess"
                                    maxLength={150}
                                    value={interviewProcess}
                                    onChange={setInterviewProcess}
                                    placeholder="Describe the interview process"
                                    className="flex-1"
                                    height="150px"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </ContentLayout>
        </AdminPanelLayout>
    );
}