import React, { useState } from "react";
import { X } from "lucide-react";
import {
  ChevronsRight,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
} from "lucide-react";

const ALL_EMPLOYEES = [
  "Bernardo Galaviz",
  "Sophie Anderson",
  "Cameron Blake",
  "Doris Chen",
  "Rufana Khan",
  "Michael Torres",
  "Alice Johnson",
  "John Doe",
  "John Smith",
  "Emma Wilson",
  "Oliver Martin",
  "Sarah Lee",
  "James Brown",
  "Mia Davis",
  "Ethan Clark",
  "Ava Walker",
  "Liam Hall",
  "Grace Allen",
  "Noah Young",
  "Mike Litorus",
  "Jeffrey Warden",
];

const AddCustomPolicyModal = ({ open, onClose, leave, onAdd }) => {
  const [policyName, setPolicyName] = useState("");
  const [days, setDays] = useState("");

  // Left panel = available, Right panel = assigned
  const [available, setAvailable] = useState(ALL_EMPLOYEES);
  const [assigned, setAssigned] = useState([]);

  // Selected items in each panel
  const [selectedLeft, setSelectedLeft] = useState([]);
  const [selectedRight, setSelectedRight] = useState([]);

  if (!open) return null;

  /* ── selection helpers ─────────────────────────── */
  const toggleLeft = (name) =>
    setSelectedLeft((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  const toggleRight = (name) =>
    setSelectedRight((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  /* ── transfer helpers ──────────────────────────── */
  // Move all available → assigned
  const moveAll = () => {
    setAssigned((prev) => [...prev, ...available]);
    setAvailable([]);
    setSelectedLeft([]);
  };

  // Move selected available → assigned
  const moveSelected = () => {
    setAssigned((prev) => [...prev, ...selectedLeft]);
    setAvailabhle((prev) => prev.filter((n) => !selectedLeft.includes(n)));
    setSelectedLeft([]);
  };

  // Move selected assigned → available
  const removeSelected = () => {
    setAvailable((prev) => [...prev, ...selectedRight]);
    setAssigned((prev) => prev.filter((n) => !selectedRight.includes(n)));
    setSelectedRight([]);
  };

  // Move all assigned → available
  const removeAll = () => {
    setAvailable((prev) => [...prev, ...assigned]);
    setAssigned([]);
    setSelectedRight([]);
  };

  /* ── submit ────────────────────────────────────── */
  const handleSubmit = () => {
    if (onAdd) {
      onAdd({ leave, policyName, days, employees: assigned });
    }
    // reset
    setPolicyName("");
    setDays("");
    setAvailable(ALL_EMPLOYEES);
    setAssigned([]);
    setSelectedLeft([]);
    setSelectedRight([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-205 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#0F265C]">
            Add Custom Policy
            {leave && (
              <span className="ml-2 text-base font-normal text-gray-500"></span>
            )}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Policy Name */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-[#0F265C]">
              Policy Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              placeholder=""
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Days */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-[#0F265C]">
              Days <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder=""
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Dual Listbox */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#0F265C]">
              Add employee
            </label>

            <div className="flex items-center gap-3">
              {/* Left — Available */}
              <div className="flex-1 border border-gray-300 rounded-md overflow-hidden">
                <div className="h-50 overflow-y-auto">
                  {available.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 mt-8">
                      No employees available
                    </p>
                  ) : (
                    available.map((name) => (
                      <div
                        key={name}
                        onClick={() => toggleLeft(name)}
                        className={`px-4 py-2 text-sm cursor-pointer select-none transition-colors ${
                          selectedLeft.includes(name)
                            ? "bg-orange-50 text-orange-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {name}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Arrow Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={moveAll}
                  disabled={available.length === 0}
                  title="Move all to assigned"
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight size={16} />
                </button>

                <button
                  onClick={moveSelected}
                  disabled={selectedLeft.length === 0}
                  title="Move selected to assigned"
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={removeSelected}
                  disabled={selectedRight.length === 0}
                  title="Remove selected from assigned"
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={removeAll}
                  disabled={assigned.length === 0}
                  title="Remove all from assigned"
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft size={16} />
                </button>
              </div>

              {/* Right — Assigned */}
              <div className="flex-1 border border-gray-300 rounded-md overflow-hidden">
                <div className="h-50 overflow-y-auto">
                  {assigned.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 mt-8">
                      No employees assigned
                    </p>
                  ) : (
                    assigned.map((name) => (
                      <div
                        key={name}
                        onClick={() => toggleRight(name)}
                        className={`px-4 py-2 text-sm cursor-pointer select-none transition-colors ${
                          selectedRight.includes(name)
                            ? "bg-orange-50 text-orange-600 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomPolicyModal;
