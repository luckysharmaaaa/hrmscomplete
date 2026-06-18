import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const leaveFieldConfig = {
  annual: [
    { key: "days", label: "No of Days", type: "number" },
    { key: "carryForward", label: "Carry Forward", type: "boolean" },
    {
      key: "maxCarryForward",
      label: "Maximum No of Days",
      type: "number",
    },
    { key: "earnedLeave", label: "Earned leave", type: "boolean" },
  ],

  sick: [{ key: "days", label: "Days", type: "number" }],

  hospitalisation: [
    { key: "days", label: "Days", type: "number" },
    {
      key: "hospitalizationProofRequired",
      label: "Hospitalization Proof Required",
      type: "boolean",
    },
  ],

  maternity: [
    { key: "days", label: "No of Days", type: "number" },
    { key: "carryForward", label: "Carry Forward", type: "boolean" },
    {
      key: "maxCarryForward",
      label: "Maximum No of Days",
      type: "number",
    },
    { key: "earnedLeave", label: "Earned leave", type: "boolean" },
  ],

  paternity: [
    { key: "days", label: "No of Days", type: "number" },
    { key: "carryForward", label: "Carry Forward", type: "boolean" },
    {
      key: "maxCarryForward",
      label: "Maximum No of Days",
      type: "number",
    },
    { key: "earnedLeave", label: "Earned leave", type: "boolean" },
  ],

  lop: [
    { key: "days", label: "No of Days", type: "number" },
    { key: "carryForward", label: "Carry Forward", type: "boolean" },
    {
      key: "maxCarryForward",
      label: "Maximum No of Days",
      type: "number",
    },
    { key: "earnedLeave", label: "Earned leave", type: "boolean" },
  ],
};

const LeavePolicyModal = ({ open, leave, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("settings");
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (leave) {
      setSettings(leave.settings || {});
    }
  }, [leave]);

  if (!open || !leave) return null;

  const fields = leaveFieldConfig[leave.type] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-125 rounded shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-5 border-b border-gray-200">
          <h2 className="text-[20px] font-bold text-[#25314C]">
            {leave.name} Settings
          </h2>

          <button onClick={onClose}>
            <X size={28} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-6">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-3 font-semibold ${
                activeTab === "settings"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500"
              }`}
            >
              Settings
            </button>

            <button
              onClick={() => setActiveTab("policy")}
              className={`pb-3 font-semibold ${
                activeTab === "policy"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-500"
              }`}
            >
              View Custom Policy
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-8">
          {activeTab === "settings" ? (
            <div className="space-y-7">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-[#25314C] font-semibold mb-3">
                    {field.label}
                  </label>

                  {field.type === "number" && (
                    <input
                      type="number"
                      value={settings[field.key] ?? ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [field.key]: Number(e.target.value),
                        })
                      }
                      className="w-full h-11 border border-gray-300 rounded px-4 focus:outline-none focus:border-orange-500"
                    />
                  )}

                  {field.type === "boolean" && (
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={field.key}
                          checked={settings[field.key] === true}
                          onChange={() =>
                            setSettings({
                              ...settings,
                              [field.key]: true,
                            })
                          }
                          className="radio radio-sm checked:bg-orange-500 text-white"
                        />
                        <span className="font-semibold text-[#25314C]">
                          Yes
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={field.key}
                          checked={settings[field.key] === false}
                          onChange={() =>
                            setSettings({
                              ...settings,
                              [field.key]: false,
                            })
                          }
                          className="radio radio-sm"
                        />
                        <span className="font-semibold text-[#25314C]">No</span>
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-gray-600">
              No custom policy assigned yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-4 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded text-[#4B5563] font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onSave({
                ...leave,
                settings,
              })
            }
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeavePolicyModal;
