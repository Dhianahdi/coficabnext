"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
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
import { Spinner } from "@/components/spinner";
import { Skeleton } from "@/components/ui/skeleton";

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
    const isLoading =
        !departments || !fetchedExperienceLevelOptions || !fetchedEmploymentTypeOptions;

    return (
        <AdminPanelLayout>
            <ContentLayout title="Dashboard">


                <div className="flex items-center justify-between mb-4">
                    {isLoading ? (
                        <Skeleton className="w-[490px] h-[48px] rounded-md" /> // Matches title size
                    ) : (
                        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                            Update Job Posting
                        </h1>
                    )}

                    {isLoading ? (
                        <Skeleton className="w-[160px] h-[40px] rounded-md" /> // Matches button size
                    ) : (
                        <Button
                            onClick={handleUpdate}
                            className="flex items-center justify-center w-[160px] h-[40px] gap-2"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Spinner variant="ring" size={24} />
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <Skeleton className="w-[820px] h-[20px] rounded-md" />
                ) : (
                    <p className="leading-7 [&:not(:first-child)]:mb-6">
                        Modify and manage existing job postings seamlessly. Update the details to keep job listings accurate and up to date.
                    </p>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-[300px] w-full">
                        <Spinner variant="ring" size={40} className="text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Panel */}
                        <div className="space-y-6">
                            {/* Description Section */}
                            <Card className="p-6 h-full flex flex-col">
                                <div className=" flex-1 flex flex-col">
                                    <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Description</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Update the detailed description of the job.
                                    </p>
                                    <div className="flex-1 overflow-y-auto">
                                        <BlockEditor initialContent={description} onChange={setDescription} editable />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Panel */}
                        <div className="space-y-6">
                            {/* Job Details Section */}
                            <div className=" flex-1 flex flex-col">

                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Job Details</h3>
                                <p className="text-sm text-muted-foreground">
                                    Update essential information about the job.
                                </p>
                            </div>
                            <div className="space-y-4">

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
                            <div className=" flex-1 flex flex-col">

                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Compensation & Location</h3>
                                <p className="text-sm text-muted-foreground">Update salary range and location.</p>
                            </div>
                            <div className="space-y-4">
                                {/* Salary Range Field */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-4">
                                        <Label htmlFor="salaryRange" className="min-w-24 whitespace-nowrap font-bold">
                                            Salary Range
                                        </Label>
                                        <div className="flex-1">
                                            <InputWithCancel
                                                inputValue={salaryRange}
                                                setInputValue={setSalaryRange}
                                                inputId="salaryRange"
                                                placeholder="Enter salary range"
                                                className="w-full"
                                            />
                                            <p className="mt-2 text-xs text-muted-foreground" role="region" aria-live="polite">
                                                Please enter the expected salary range per month. This helps candidates understand the compensation offered.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Field */}
                                <div className="flex items-center gap-4">
                                    <Label htmlFor="location" className="min-w-24 whitespace-nowrap font-bold">
                                        Location
                                    </Label>
                                    <InputWithCancel
                                        inputValue={location}
                                        setInputValue={setLocation}
                                        inputId="location"
                                        placeholder="Enter location"
                                        className="flex-1"
                                    />
                                </div>
                            </div>


                            <Separator className="my-4" />
                            {/* Employment Details Section */}
                            <div className=" flex-1 flex flex-col">

                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Employment Details</h3>
                                <p className="text-sm text-muted-foreground">Update employment type, experience level, and tags.</p>
                            </div>
                            <div className="space-y-4">

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
                            <div className=" flex-1 flex flex-col">

                                <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Application & Interview</h3>
                                <p className="text-sm text-muted-foreground">Update application deadline and interview process.</p>
                            </div>
                            <div className="space-y-4">

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
                )}
            </ContentLayout>
        </AdminPanelLayout>
    );
}