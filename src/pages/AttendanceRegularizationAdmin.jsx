
import React from "react";
import { ClipboardCheck } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import RegularizationReview from "../components/attendanceAdmin/RegularizationReview";

const AttendanceRegularizationAdmin = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Regularization Requests"
        breadcrumbs={[
          { label: "Attendance" },
          { label: "Regularization Requests" },
        ]}
      />

      <RegularizationReview />
    </div>
  );
};

export default AttendanceRegularizationAdmin;

