import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id?: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  salary: number;
  date_of_joining: string;
  last_day_of_working?: string;
}

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    designation: employee?.designation || "",
    department: employee?.department || "",
    salary: employee?.salary || 0,
    date_of_joining: employee?.date_of_joining || "",
    last_day_of_working: employee?.last_day_of_working || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to manage employees.",
          variant: "destructive",
        });
        return;
      }

      const employeeData = {
        ...formData,
        user_id: user.id,
        last_day_of_working: formData.last_day_of_working || null,
      };

      if (employee?.id) {
        const { error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", employee.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Employee updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from("employees")
          .insert([employeeData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Employee added successfully!",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "Failed to save employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{employee ? "Edit Employee" : "Add New Employee"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_joining">Date of Joining</Label>
              <Input
                id="date_of_joining"
                type="date"
                value={formData.date_of_joining}
                onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="last_day_of_working">Last Day of Working (Optional)</Label>
              <Input
                id="last_day_of_working"
                type="date"
                value={formData.last_day_of_working}
                onChange={(e) => setFormData({ ...formData, last_day_of_working: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : employee ? "Update" : "Add"} Employee
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}