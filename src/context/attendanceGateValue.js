import { createContext, useContext } from "react";

export const GateContext = createContext(null);

export const useAttendanceGate = () => {
  const ctx = useContext(GateContext);
  if (!ctx) throw new Error("useAttendanceGate must be used inside AttendanceGateProvider");
  return ctx;
};
