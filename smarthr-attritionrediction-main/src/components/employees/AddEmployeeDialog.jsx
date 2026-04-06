import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departments } from "@/data/mockData";
import { addEmployee } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export function AddEmployeeDialog({ onEmployeeAdded }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    jobRole: "",
    department: "",
    age: "",
    monthlyIncome: "",
    yearsAtCompany: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.jobRole || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newEmployee = {
        ...formData,
        age: parseInt(formData.age) || 0,
        monthlyIncome: parseInt(formData.monthlyIncome) || 0,
        yearsAtCompany: parseInt(formData.yearsAtCompany) || 0,
      };

      const addedEmployee = await addEmployee(newEmployee);

      toast({
        title: "Success",
        description: "Employee added successfully!",
      });

      // Reset form and close dialog
      setFormData({
        name: "",
        jobRole: "",
        department: "",
        age: "",
        monthlyIncome: "",
        yearsAtCompany: "",
      });
      setOpen(false);

      if (onEmployeeAdded) {
        onEmployeeAdded(addedEmployee);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out "All" from departments for the select options
  const departmentOptions = departments.filter((dept) => dept !== "All");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            {/* Job Role */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="jobRole">Job Role *</Label>
              <Input
                id="jobRole"
                placeholder="Enter job role"
                value={formData.jobRole}
                onChange={(e) => handleInputChange("jobRole", e.target.value)}
                required
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
              />
            </div>

            {/* Monthly Income */}
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="Enter income"
                min="0"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
              />
            </div>

            {/* Years at Company */}
            <div className="space-y-2">
              <Label htmlFor="yearsAtCompany">Years at Company</Label>
              <Input
                id="yearsAtCompany"
                type="number"
                placeholder="Enter years"
                min="0"
                value={formData.yearsAtCompany}
                onChange={(e) => handleInputChange("yearsAtCompany", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddEmployeeDialog;
