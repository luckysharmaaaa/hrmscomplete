import { React, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";  
import { ChevronUp, SquarePen } from "lucide-react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  MessageSquare,
  Phone,
  Mail,
  User,
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  Users,
  Shield,
  Heart,
  ChevronDown,
  Building,
  MoreVertical,
  Laptop,
  Mouse,
} from "lucide-react";
import { EMPLOYEE_DATA } from "../components/employeeList/employeeData";
import EditEmployeeDrawer from "../components/employeeDetails/EditEmployeeDrawer";
import EditBankModal from "../components/employeeDetails/EditBankModal";
import EditFamilyModal from "../components/employeeDetails/EditFamilyModal";
import EditEduModal from "../components/employeeDetails/EditEduModal";
import EditExperienceModal from "../components/employeeDetails/EditExperienceModal";
import EditPersonalInfoModal from "../components/employeeDetails/EditPersonalInfoModal";
import EditEmergencyModal from "../components/employeeDetails/EditEmergencyModal";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const emp = EMPLOYEE_DATA.find((e) => e.id === Number(id));
  const [openAbout, setOpenAbout] = useState(true);
  const [openBank, setOpenBank] = useState(true);
  const [openFamily, setOpenFamily] = useState(true);
  const [openEdu, setOpenEdu] = useState(true);
  const [openExp, setOpenExp] = useState(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);
  const [isEditFamilyModalOpen, setIsEditFamilyModalOpen] = useState(false);
  const [isEditEduModalOpen, setIsEditEduModalOpen] = useState(false);
  const [isEditExperienceModalOpen, setIsEditExperienceModalOpen] =
    useState(false);
  const [isEditPersonalInfoModalOpen, setIsEditPersonalInfoModalOpen] =
    useState(false);
  const [isEditEmergencyModalOpen, setIsEditEmergencyModalOpen] =
    useState(false);

  if (!emp) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-400 text-lg font-medium">Employee not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
        >
          <ArrowLeft size={15} /> Go Back
        </button>
      </div>
    );
  }

  const fieldRow = (icon, label, value, valClass = "text-gray-700") => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5 text-gray-500">
        {icon}
        <span className="text-[13px]">{label}</span>
      </div>
      <span className={`text-[13px] font-medium text-right ${valClass}`}>
        {value}
      </span>
    </div>
  );

  const sectionHeader = (title, onEdit) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-800 text-[15px]">{title}</h3>
      {onEdit ? (
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <Edit size={14} />
        </button>
      ) : (
        <button className="text-gray-400 hover:text-gray-600 transition">
          <Edit size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-[#0F265C]">Employee Details</h1>
        </div>
        <button
          onClick={() => setIsEditDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition shadow-sm"
        >
          Edit Info
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Profile, Basic, Personal, Emergency) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-28 bg-orange-500 relative flex justify-center">
              {/* Avatar protruding from banner */}
              <div className="absolute -bottom-12">
                <div className="relative">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt={emp.name}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md bg-blue-500"
                  />
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-[2px] border-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="pt-14 pb-5 px-5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <h2 className="text-[17px] font-bold text-gray-800">
                  {emp.name}
                </h2>
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
                  • {emp.designation}
                </span>
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-medium">
                  10+ years of Experience
                </span>
              </div>

              <div className="mt-6 space-y-1">
                {fieldRow(<FileText size={14} />, "Client ID", "CLT-0024")}
                {fieldRow(<Users size={14} />, "Team", emp.department)}
                {fieldRow(
                  <Calendar size={14} />,
                  "Date Of Join",
                  emp.joiningDate,
                )}
                <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5 text-gray-500">
                    <Building size={14} />
                    <span className="text-[13px]">Report Office</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[9px] font-bold">
                      DM
                    </div>
                    <span className="text-[13px] font-medium text-gray-700">
                      Doglas Martini
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {sectionHeader("Basic information", () =>
              setIsEditDrawerOpen(true),
            )}
            <div className="space-y-1">
              {fieldRow(<Phone size={14} />, "Phone", emp.phone)}
              {fieldRow(
                <Mail size={14} />,
                "Email",
                emp.email,
                "text-blue-500",
              )}
              {fieldRow(<User size={14} />, "Gender", "Male")}
              {fieldRow(<Calendar size={14} />, "Birthday", "24th July 2000")}
              {fieldRow(
                <MapPin size={14} />,
                "Address",
                "1861 Bayonne Ave, Manchester, NJ, 08759",
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {sectionHeader("Personal Information", () =>
              setIsEditPersonalInfoModalOpen(true),
            )}
            <div className="space-y-1">
              {fieldRow(<FileText size={14} />, "Passport No", "QRET4566FGRT")}
              {fieldRow(
                <Calendar size={14} />,
                "Passport Exp Date",
                "15 May 2029",
              )}
              {fieldRow(<User size={14} />, "Nationality", "Indian")}
              {fieldRow(<Building size={14} />, "Religion", "Christianity")}
              {fieldRow(<Heart size={14} />, "Marital status", "Yes")}
              {fieldRow(<Briefcase size={14} />, "Employment of spouse", "No")}
              {fieldRow(<Users size={14} />, "No. of children", "2")}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {sectionHeader("Emergency Contact Number", () =>
              setIsEditEmergencyModalOpen(true),
            )}
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[13px] text-gray-500">Primary</p>
                  <p className="text-[13px] font-semibold text-gray-800 mt-1">
                    Adrian Peralt{" "}
                    <span className="text-gray-400 font-normal ml-1">
                      • Father
                    </span>
                  </p>
                </div>
                <span className="text-[13px] font-medium text-gray-700">
                  +1 127 2685 598
                </span>
              </div>
              <div className="h-px bg-gray-50 w-full" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[13px] text-gray-500">Secondary</p>
                  <p className="text-[13px] font-semibold text-gray-800 mt-1">
                    Karen Wills{" "}
                    <span className="text-gray-400 font-normal ml-1">
                      • Mother
                    </span>
                  </p>
                </div>
                <span className="text-[13px] font-medium text-gray-700">
                  +1 989 7774 787
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* About */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-5">
              <h2 className="text-lg font-semibold text-gray-800">
                About Employee
              </h2>

              <div className="flex items-center gap-3">
                {/* Edit Icon */}
                <button
                  onClick={() => setIsEditDrawerOpen(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SquarePen size={18} strokeWidth={1.8} />
                </button>

                {/* Collapse Button */}
                <button
                  onClick={() => setOpenAbout(!openAbout)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {openAbout ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            {openAbout && (
              <div className="p-5">
                <p className="text-sm text-gray-500 leading-relaxed">
                  As an award-winning designer, I deliver exceptional quality
                  work and bring value to your brand! With 10 years of
                  experience and 350+ projects completed worldwide with
                  satisfied customers, I developed the 360° brand approach,
                  which helped me create numerous brands that are relevant,
                  meaningful, and loved.
                </p>
              </div>
            )}
          </div>

          {/* Bank */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Bank Information
              </h2>

              <div className="flex items-center gap-3">
                {/* Edit Icon */}
                <button
                  onClick={() => setIsEditBankModalOpen(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SquarePen size={18} strokeWidth={1.8} />
                </button>

                {/* Collapse Button */}
                <button
                  onClick={() => setOpenBank(!openBank)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {openBank ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            {openBank && (
              <div className="p-5 border-t border-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[13px] text-gray-400 mb-1">Bank Name</p>
                    <p className="text-[14px] font-medium text-gray-800">
                      Swiz Intenational Bank
                    </p>
                  </div>
                  <div>
                    <p className="text-[13px] text-gray-400 mb-1">
                      Bank account no
                    </p>
                    <p className="text-[14px] font-medium text-gray-800">
                      159843014641
                    </p>
                  </div>
                  <div>
                    <p className="text-[13px] text-gray-400 mb-1">IFSC Code</p>
                    <p className="text-[14px] font-medium text-gray-800">
                      ICI24504
                    </p>
                  </div>
                  <div>
                    <p className="text-[13px] text-gray-400 mb-1">Branch</p>
                    <p className="text-[14px] font-medium text-gray-800">
                      Alabama USA
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Family */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Family Information
              </h2>

              <div className="flex items-center gap-3">
                {/* Edit Icon */}
                <button
                  onClick={() => setIsEditFamilyModalOpen(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <SquarePen size={18} strokeWidth={1.8} />
                </button>

                {/* Collapse Button */}
                <button
                  onClick={() => setOpenFamily(!openFamily)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {openFamily ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            {openFamily && (
              <div className="p-5 border-t border-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[13px] text-gray-400 mb-1">Name</p>
                    <p className="text-[14px] font-medium text-gray-800">
                      Hendry Peralt
                    </p>
                  </div>
                  <div>
                    <p className="text-[13px] text-gray-400 mb-1">
                      Relationship
                    </p>
                    <p className="text-[14px] font-medium text-gray-800">
                      Brother
                    </p>
                  </div>
                  <div>
                    <p className="text-[13px] text-gray-400 mb-1">
                      Date of birth
                    </p>
                    <p className="text-[14px] font-medium text-gray-800">
                      25 May 2014
                    </p>
                  </div>
                  <div>
                    <p className="text-[13px] text-gray-400 mb-1">Phone</p>
                    <p className="text-[14px] font-medium text-gray-800">
                      +1 265 6956 961
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edu & Exp Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Education Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-5">
                <h2 className="text-[16px] font-semibold text-gray-800">
                  Education Details
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditEduModalOpen(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <SquarePen size={18} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={() => setOpenEdu(!openEdu)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {openEdu ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>
              {openEdu && (
                <div className="p-5 border-t border-gray-50 flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[13px] text-gray-400 mb-0.5">
                        Oxford University
                      </p>
                      <p className="text-[14px] font-medium text-[#0F265C]">
                        Computer Science
                      </p>
                    </div>
                    <span className="text-[13px] font-medium text-gray-600">
                      2020 - 2022
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[13px] text-gray-400 mb-0.5">
                        Cambridge University
                      </p>
                      <p className="text-[14px] font-medium text-[#0F265C]">
                        Computer Network & Systems
                      </p>
                    </div>
                    <span className="text-[13px] font-medium text-gray-600">
                      2016- 2019
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[13px] text-gray-400 mb-0.5">
                        Oxford School
                      </p>
                      <p className="text-[14px] font-medium text-[#0F265C]">
                        Grade X
                      </p>
                    </div>
                    <span className="text-[13px] font-medium text-gray-600">
                      2012 - 2016
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-5">
                <h2 className="text-[16px] font-semibold text-gray-800">
                  Experience
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditExperienceModalOpen(true)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <SquarePen size={18} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={() => setOpenExp(!openExp)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {openExp ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>
              {openExp && (
                <div className="p-5 border-t border-gray-50 flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[14px] font-medium text-[#0F265C] mb-1.5">
                        Google
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-[#0a5a73] rounded text-[12px] font-medium">
                        <span className="w-1 h-1 rounded-full bg-[#0a5a73]"></span>{" "}
                        UI/UX Developer
                      </span>
                    </div>
                    <span className="text-[13px] font-medium text-gray-600 mt-1">
                      Jan 2013 - Present
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[14px] font-medium text-[#0F265C] mb-1.5">
                        Salesforce
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-[#0a5a73] rounded text-[12px] font-medium">
                        <span className="w-1 h-1 rounded-full bg-[#0a5a73]"></span>{" "}
                        Web Developer
                      </span>
                    </div>
                    <span className="text-[13px] font-medium text-gray-600 mt-1">
                      Dec 2012- Jan 2015
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[14px] font-medium text-[#0F265C] mb-1.5">
                        HubSpot
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-[#0a5a73] rounded text-[12px] font-medium">
                        <span className="w-1 h-1 rounded-full bg-[#0a5a73]"></span>{" "}
                        Software Developer
                      </span>
                    </div>
                    <span className="text-[13px] font-medium text-gray-600 mt-1">
                      Dec 2011- Jan 2012
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <EditEmployeeDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        editData={emp}
        onSubmit={(data) => {
          console.log("Updated data", data);
        }}
      />
      <EditBankModal
        open={isEditBankModalOpen}
        onClose={() => setIsEditBankModalOpen(false)}
        bankData={{
          bankName: "Swiz Intenational Bank",
          accountNo: "159843014641",
          ifsc: "ICI24504",
          branch: "Alabama USA",
        }}
        onSubmit={(data) => {
          console.log("Updated bank data", data);
        }}
      />
      <EditFamilyModal
        open={isEditFamilyModalOpen}
        onClose={() => setIsEditFamilyModalOpen(false)}
        familyData={{
          name: "Hendry Peralt",
          relationship: "Brother",
          phone: "+1 265 6956 961",
          passportExpiryDate: "08-07-2026",
        }}
        onSubmit={(data) => {
          console.log("Updated family data", data);
        }}
      />
      <EditEduModal
        open={isEditEduModalOpen}
        onClose={() => setIsEditEduModalOpen(false)}
        eduData={{
          institution: "Oxford University",
          course: "Computer Science",
          startDate: "2020",
          endDate: "2022",
        }}
        onSubmit={(data) => {
          console.log("Updated education data", data);
        }}
      />
      <EditExperienceModal
        open={isEditExperienceModalOpen}
        onClose={() => setIsEditExperienceModalOpen(false)}
        expData={{
          company: "Web Designer",
          designation: "UI/UX Designer",
          startDate: "2012",
          endDate: "2016",
        }}
        onSubmit={(data) => {
          console.log("Updated experience data", data);
        }}
      />
      <EditPersonalInfoModal
        open={isEditPersonalInfoModalOpen}
        onClose={() => setIsEditPersonalInfoModalOpen(false)}
        personalInfoData={{
          passportNo: "QRET4566FGRT",
          passportExpDate: "15 May 2029",
          nationality: "Indian",
          religion: "Christianity",
          maritalStatus: "Yes",
          employmentSpouse: "No",
          children: "2",
        }}
        onSubmit={(data) => {
          console.log("Updated personal info", data);
        }}
      />
      <EditEmergencyModal
        open={isEditEmergencyModalOpen}
        onClose={() => setIsEditEmergencyModalOpen(false)}
        emergencyData={{
          primary: {
            name: "Adrian Peralt",
            relationship: "Father",
            phone1: "9876543210",
            phone2: "",
          },
          secondary: {
            name: "Adrian Peralt",
            relationship: "Father",
            phone1: "9876543210",
            phone2: "",
          },
        }}
        onSubmit={(data) => console.log("Updated emergency contacts", data)}
      />
    </div>
  );
}
