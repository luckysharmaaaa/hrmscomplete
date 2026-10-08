import { createContext, useContext } from "react";

const SidebarContext = createContext({
  open: false,
  setOpen: () => {},
  toggle: () => {},
  close: () => {},
  collapsed: false,
  toggleCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default SidebarContext;
