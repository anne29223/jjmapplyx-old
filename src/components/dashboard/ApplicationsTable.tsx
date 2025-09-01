import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

// TEMP: Replace with real hook after implementation
const useApplications = () => ({ data: [], isLoading: false });

export const ApplicationsTable = () => {
  const { data: applications = [], isLoading } = useApplications();

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interview</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Applied At</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.job_title}</TableCell>
                  <TableCell>{app.company}</TableCell>
                  <TableCell>{app.status}</TableCell>
                  <TableCell>{app.interview_date ? new Date(app.interview_date).toLocaleString() : "-"}</TableCell>
                  <TableCell>{app.shift_info || "-"}</TableCell>
                  <TableCell>{app.applied_at ? new Date(app.applied_at).toLocaleString() : "-"}</TableCell>
                  <TableCell>{app.name || "-"}</TableCell>
                  <TableCell>{app.contact || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {applications.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No applications found.</div>
        )}
      </CardContent>
    </Card>
  );
};
