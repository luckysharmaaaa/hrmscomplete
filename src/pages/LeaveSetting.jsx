import { Settings } from "lucide-react";
import React, { useState } from "react";
import { FiHome, FiChevronRight, FiPlusCircle } from "react-icons/fi";
import AddCustomPolicyModal from "../components/AddCustomPolicyModal";
import LeavePolicyModal from "../components/LeavePolicyModal";

const LeaveSettings = () => {
  const [leaveTypes, setLeaveTypes] = useState([
    {
      id: 1,
      type: "annual",
      name: "Annual Leave",
      enabled: false,
      settings: {
        days: 14,
        carryForward: true,
        maxCarryForward: 5,
        earnedLeave: true,
      },
    },
    {
      id: 2,
      type: "sick",
      name: "Sick Leave",
      enabled: false,
      settings: {
        days: 7,
        medicalCertificateRequired: true,
      },
    },
    {
      id: 3,
      type: "hospitalisation",
      name: "Hospitalisation",
      enabled: true,
      settings: {
        days: 60,
        hospitalizationProofRequired: true,
      },
    },
    {
      id: 4,
      type: "maternity",
      name: "Maternity",
      enabled: true,
      settings: {
        days: 90,
        carryForward: false,
        maxCarryForward: 0,
        earnedLeave: false,
      },
    },
    {
      id: 5,
      type: "paternity",
      name: "Paternity",
      enabled: false,
      settings: {
        days: 14,
        carryForward: false,
        maxCarryForward: 0,
        earnedLeave: false,
      },
    },
    {
      id: 6,
      type: "lop",
      name: "LOP",
      enabled: false,
      settings: {
        days: 0,
        carryForward: false,
        maxCarryForward: 0,
        earnedLeave: false,
      },
    },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedCustomLeave, setSelectedCustomLeave] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [customPolicies, setCustomPolicies] = useState([]);

  const handleToggle = (id) => {
    setLeaveTypes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5">
        <div>
          <h1 className="text-4xl font-bold text-[#0F265C]">Leave Settings</h1>

          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <FiHome size={14} />
            <FiChevronRight size={14} />
            <span>Leave</span>
            <FiChevronRight size={14} />
            <span className="font-medium text-[#0F265C]">Leave Settings</span>
          </div>
        </div>

        <button
          onClick={() => setOpenModal(true)} // this make the modal true to open the modal
          className="flex items-center gap-2 px-4 py-2 text-white font-semibold h-10 bg-orange-500 rounded-sm hover:bg-orange-600"
        >
          <FiPlusCircle size={16} />
          <span>Add Custom Policy</span>
        </button>
      </div>

      {/* Leave Cards */}
      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {leaveTypes.map((leave) => (
            <div
              key={leave.id}
              className="bg-white border border-gray-200 rounded-md p-6 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={leave.enabled}
                  onChange={() => handleToggle(leave.id)}
                  className="toggle checked:bg-orange-500 checked:text-white checked:border-orange-500"
                />

                <span className="font-semibold text-[#0F265C]">
                  {leave.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCustomLeave(leave);
                    setOpenModal(true);
                  }}
                  className="text-sm underline text-[#0F265C] hover:text-orange-500"
                >
                  Custom Policy
                </button>

                <Settings
                  size={14}
                  className="cursor-pointer text-slate-700"
                  onClick={() => {
                    setSelectedLeave(leave);
                    setOpenSettingsModal(true);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Policy Modal */}
      <AddCustomPolicyModal
        open={openModal}
        leave={selectedCustomLeave}
        onClose={() => {
          setOpenModal(false);
          setSelectedCustomLeave(null);
        }}
        onAdd={(policy) => {
          setCustomPolicies((prev) => [...prev, policy]);
          setOpenModal(false);
          setSelectedCustomLeave(null);
        }}
      />

      {/* Edit Leave Policy Modal */}
      <LeavePolicyModal
        open={openSettingsModal}
        leave={selectedLeave}
        onClose={() => {
          setOpenSettingsModal(false);
          setSelectedLeave(null);
        }}
        onSave={(updatedLeave) => {
          setLeaveTypes((prev) =>
            prev.map((item) =>
              item.id === updatedLeave.id ? updatedLeave : item,
            ),
          );

          setOpenSettingsModal(false);
          setSelectedLeave(null);
        }}
      />
    </div>
  );
};

export default LeaveSettings;
