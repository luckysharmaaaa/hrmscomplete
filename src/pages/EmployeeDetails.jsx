import { useState } from "react";

const employeeData = {
  name: "Stephan Peralt",
  role: "Software Developer",
  experience: "10+ years of Experience",
  clientId: "CLT-0024",
  team: "UI/UX Design",
  dateOfJoin: "1st Jan 2023",
  reportOffice: "Doglas Martini",
  phone: "(163) 2459 315",
  email: "peralt12@example.com",
  gender: "Male",
  birthday: "24th July 2000",
  address: "1861 Bayonne Ave, Manchester, NJ, 08759",
  passportNo: "QRET4566FGRT",
  passportExpDate: "15 May 2029",
  nationality: "Indian",
  religion: "Christianity",
  maritalStatus: "Yes",
  employmentOfSpouse: "No",
  noOfChildren: "2",
  emergencyContacts: [
    { type: "Primary", name: "Adrian Peralt", relation: "Father", phone: "+1 127 2685 598" },
    { type: "Secondary", name: "Karen Wills", relation: "Mother", phone: "+1 989 7774 787" },
  ],
  projects: [
    { name: "World Health", color: "bg-blue-500", tasks: 8, completed: 15, deadline: "31 July 2025", lead: "Leona" },
    { name: "Hospital Administration", color: "bg-purple-500", tasks: 8, completed: 15, deadline: "31 July 2025", lead: "Leona" },
  ],
  bankDetails: {
    bankName: "Swiz Intenational Bank",
    accountNo: "159843014641",
    ifscCode: "ICI24504",
    branch: "Alabama USA"
  },
  familyMembers: [
    { name: "Hendry Peralt", relationship: "Brother", dateOfBirth: "25 May 2014", phone: "+1 265 6956 961" },
  ],
  educationDetails: [
    { institution: "Oxford University", course: "Computer Science", years: "2020 - 2022" },
    { institution: "Cambridge University", course: "Computer Network & Systems", years: "2016 - 2019" },
    { institution: "Oxford School", course: "Grade X", years: "2012 - 2016" },
  ],
  experienceDetails: [
    { company: "Google", role: "UI/UX Developer", years: "Jan 2013 - Present" },
    { company: "Salesforce", role: "Web Developer", years: "Dec 2012 - Jan 2015" },
    { company: "HubSpot", role: "Software Developer", years: "Dec 2011 - Jan 2012" },
  ]
};

// Reusable Input Component
const InputField = ({ label, name, value, onChange, error, placeholder, type = "text", disabled = false }) => (
  <div>
    <label className="block text-xs text-gray-500 mb-1">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// Reusable Checkbox Component
const CheckboxField = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
    />
    <label className="text-sm text-gray-600">{label}</label>
  </div>
);

// Reusable Modal Wrapper
const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-6 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Form Button
const FormButtons = ({ onCancel, onSave }) => (
  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
    <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors">
      Cancel
    </button>
    <button onClick={onSave} className="px-6 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
      Save
    </button>
  </div>
);

// Experience Details Edit Modal
const ExperienceModal = ({ isOpen, onClose, onSave, experienceData, index }) => {
  const [formData, setFormData] = useState({
    company: experienceData?.company || "",
    designation: experienceData?.role || "",
    startDate: "",
    endDate: "",
    isPresent: false,
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company) newErrors.company = "Previous Company Name is required";
    if (!formData.designation) newErrors.designation = "Designation is required";
    if (!formData.startDate) newErrors.startDate = "Start Date is required";
    if (!formData.endDate && !formData.isPresent) newErrors.endDate = "End Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData, index);
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      if (checked) setErrors(prev => ({ ...prev, endDate: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Company Information</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-4">
            <InputField
              label="Previous Company Name *"
              name="company"
              value={formData.company}
              onChange={handleChange}
              error={errors.company}
              placeholder="Enter Company Name"
            />
            <InputField
              label="Designation *"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              error={errors.designation}
              placeholder="Enter Designation"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Start Date *"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />
              <InputField
                label="End Date *"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
                disabled={formData.isPresent}
              />
            </div>
            <CheckboxField
              checked={formData.isPresent}
              onChange={handleChange}
              label="Check if you working present"
            />
          </div>
        </div>
        <FormButtons onCancel={onClose} onSave={handleSubmit} />
      </div>
    </div>
  );
};

// Education Details Edit Modal
const EducationModal = ({ isOpen, onClose, onSave, educationData, index }) => {
  const parseYears = (years) => {
    if (!years) return { startDate: "", endDate: "" };
    const parts = years.split(" - ");
    return parts.length === 2 ? { startDate: parts[0].trim(), endDate: parts[1].trim() } : { startDate: "", endDate: "" };
  };

  const parsedDates = parseYears(educationData?.years || "");
  const [formData, setFormData] = useState({
    institution: educationData?.institution || "",
    course: educationData?.course || "",
    startDate: parsedDates.startDate || "",
    endDate: parsedDates.endDate || "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.institution) newErrors.institution = "Institution Name is required";
    if (!formData.course) newErrors.course = "Course is required";
    if (!formData.startDate) newErrors.startDate = "Start Date is required";
    if (!formData.endDate) newErrors.endDate = "End Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData, index);
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Education Information</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-4">
            <InputField
              label="Institution Name *"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              error={errors.institution}
              placeholder="Enter Institution Name"
            />
            <InputField
              label="Course *"
              name="course"
              value={formData.course}
              onChange={handleChange}
              error={errors.course}
              placeholder="Enter Course Name"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Start Date *"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />
              <InputField
                label="End Date *"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
              />
            </div>
          </div>
        </div>
        <FormButtons onCancel={onClose} onSave={handleSubmit} />
      </div>
    </div>
  );
};

// Family Details Edit Modal
const FamilyDetailsModal = ({ isOpen, onClose, onSave, familyData }) => {
  const [formData, setFormData] = useState({
    name: familyData?.name || "",
    relationship: familyData?.relationship || "",
    phone: familyData?.phone || "",
    passportExpiryDate: "16-06-2026",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.relationship) newErrors.relationship = "Relationship is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.passportExpiryDate) newErrors.passportExpiryDate = "Passport Expiry Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Family Information</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-4">
            <InputField
              label="Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter Name"
            />
            <InputField
              label="Relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              error={errors.relationship}
              placeholder="Enter Relationship"
            />
            <InputField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Enter Phone Number"
            />
            <InputField
              label="Passport Expiry Date *"
              name="passportExpiryDate"
              type="date"
              value={formData.passportExpiryDate}
              onChange={handleChange}
              error={errors.passportExpiryDate}
            />
          </div>
        </div>
        <FormButtons onCancel={onClose} onSave={handleSubmit} />
      </div>
    </div>
  );
};

// Bank Details Edit Modal
const BankDetailsModal = ({ isOpen, onClose, onSave, bankData }) => {
  const [formData, setFormData] = useState({
    bankName: bankData?.bankName || "",
    accountNo: bankData?.accountNo || "",
    ifscCode: bankData?.ifscCode || "",
    branch: bankData?.branch || "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bankName) newErrors.bankName = "Bank Name is required";
    if (!formData.accountNo) newErrors.accountNo = "Bank account No is required";
    if (!formData.ifscCode) newErrors.ifscCode = "IFSC Code is required";
    if (!formData.branch) newErrors.branch = "Branch Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Bank Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-4">
            <InputField
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              error={errors.bankName}
              placeholder="Enter Bank Name"
            />
            <InputField
              label="Bank account No"
              name="accountNo"
              value={formData.accountNo}
              onChange={handleChange}
              error={errors.accountNo}
              placeholder="Enter Bank Account Number"
            />
            <InputField
              label="IFSC Code"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              error={errors.ifscCode}
              placeholder="Enter IFSC Code"
            />
            <InputField
              label="Branch Address"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              error={errors.branch}
              placeholder="Enter Branch Address"
            />
          </div>
        </div>
        <FormButtons onCancel={onClose} onSave={handleSubmit} />
      </div>
    </div>
  );
};

// Edit Employee Modal
const EditEmployeeModal = ({ isOpen, onClose, onSave, employee }) => {
  const [formData, setFormData] = useState({
    firstName: "Anthony",
    lastName: "Lewis",
    employeeId: "Emp-001",
    username: "Anthony",
    joiningDate: "2022-10-17",
    email: "anthony@example.com",
    password: "",
    confirmPassword: "",
    phoneNumber: "(123) 4567 890",
    company: "Company",
    department: "Finance",
    designation: "Finance",
    about: "As an award winning designer, I deliver exceptional quality work and bring value to your brand! With 10 years of experience and 350+ projects completed worldwide with satisfied customers, I developed the 360° brand approach, which helped me to create numerous brands that are relevant, meaningful and loved.",
  });
  const [errors, setErrors] = useState({});
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.employeeId) newErrors.employeeId = "Employee ID is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.joiningDate) newErrors.joiningDate = "Joining Date is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone Number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.about) newErrors.about = "About is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Image should be below 4 MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Edit Employee</h2>
            <p className="text-sm text-gray-500">Employee ID: {formData.employeeId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload Profile Image</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-gray-400">📷</span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Image should be below 4 mb</p>
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-colors">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <button onClick={() => setUploadedImage(null)} className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name *"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
              />
              <InputField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              <InputField
                label="Employee ID *"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                error={errors.employeeId}
              />
              <InputField
                label="Joining Date *"
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleChange}
                error={errors.joiningDate}
              />
              <InputField
                label="Username *"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
              />
              <InputField
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
              <InputField
                label="Phone Number *"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={errors.phoneNumber}
              />
              <InputField
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option>Select</option>
                  <option>Finance</option>
                  <option>Developer</option>
                  <option>Executive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Designation</label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option>Select</option>
                  <option>Finance</option>
                  <option>Developer</option>
                  <option>Executive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">About *</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-3 py-2 border ${errors.about ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none`}
                />
                {errors.about && <p className="text-xs text-red-500 mt-1">{errors.about}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Bank & Statutory Modal
const BankStatutoryModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Bank & Statutory</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2.5">Basic Salary Information</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Salary basis *</label>
                <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Select</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Annually</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Salary basis</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Payment type</label>
                <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Select</option>
                  <option>Cash</option>
                  <option>Debit Card</option>
                  <option>Mobile Payment</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2.5">PF Information</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">PF contribution *</label>
                <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Select</option>
                  <option>Employee Contribution</option>
                  <option>Employer Contribution</option>
                  <option>Provident Fund Interest</option>
                </select>
              </div>
              <InputField label="PF No" name="pfNo" placeholder="Enter PF Number" />
              <InputField label="Employee PF rate" name="pfRate" placeholder="Enter Employee PF rate" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Additional rate</label>
                <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Select</option>
                  <option>ESI</option>
                  <option>EPS</option>
                  <option>EPF</option>
                </select>
              </div>
              <InputField label="Total rate" name="totalRate" placeholder="Enter total rate" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2.5">ESI Information</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">ESI contribution *</label>
                <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Select</option>
                  <option>Employee Contribution</option>
                  <option>Employer Contribution</option>
                  <option>Maternity Contribution</option>
                </select>
              </div>
              <InputField label="ESI Number" name="esiNumber" placeholder="Enter ESI Number" />
              <InputField label="Employee ESI rate *" name="esiRate" placeholder="Enter Employee ESI rate" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Additional rate</label>
                <select className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Select</option>
                  <option>ESI</option>
                  <option>EPS</option>
                  <option>EPF</option>
                </select>
              </div>
              <InputField label="Total rate" name="totalRate" placeholder="Enter total rate" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors">
            Cancel
          </button>
          <button onClick={() => { onSave(); onClose(); }} className="px-5 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const Avatar = ({ name, size = "lg", imageUrl }) => {
  const sizeClasses = size === "lg" ? "w-20 h-20 text-xl" : "w-10 h-10 text-xs";
  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={`${sizeClasses} rounded-full border-2 border-white object-cover shadow-lg`} />;
  }
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-white shadow-lg`}>
      {name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3 text-gray-400 min-w-[160px]">
      <span className="text-sm">{icon}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <span className="text-sm text-gray-700 text-right flex-1">{value}</span>
  </div>
);

const SectionCard = ({ title, children, defaultOpen = false, onEdit }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors">
        <span className="text-base font-medium text-gray-700">{title}</span>
        <div className="flex gap-2 items-center">
          <span className="text-gray-400 text-sm cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(); }}>✎</span>
          <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && <div className="px-5 pb-4 bg-white">{children}</div>}
    </div>
  );
};

const ProjectCard = ({ project }) => (
  <div className="border border-gray-200 rounded-xl p-5 flex-1 min-w-[280px]">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-8 h-8 rounded-full ${project.color} flex items-center justify-center`}>
        <span className="text-white text-sm">✦</span>
      </div>
      <div>
        <p className="text-base font-semibold text-gray-800">{project.name}</p>
        <p className="text-sm text-gray-400">{project.tasks} tasks • {project.completed} Completed</p>
      </div>
    </div>
    <div className="flex gap-8 mt-3">
      <div>
        <p className="text-sm text-gray-400 mb-1">Deadline</p>
        <p className="text-sm font-medium text-gray-700">{project.deadline}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-1">Project Lead</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-orange-300 flex items-center justify-center text-xs text-white font-bold">
            {project.lead[0]}
          </div>
          <span className="text-sm font-medium text-gray-700">{project.lead}</span>
        </div>
      </div>
    </div>
  </div>
);

export default function EmployeeDetails() {
  const [activeTab, setActiveTab] = useState("Projects");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBankDetailsModalOpen, setIsBankDetailsModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [selectedEducationIndex, setSelectedEducationIndex] = useState(null);
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState(null);
  const [bankDetails, setBankDetails] = useState(employeeData.bankDetails);
  const [familyMembers, setFamilyMembers] = useState(employeeData.familyMembers);
  const [educationDetails, setEducationDetails] = useState(employeeData.educationDetails);
  const [experienceDetails, setExperienceDetails] = useState(employeeData.experienceDetails);
  const emp = employeeData;

  const profileImageUrl = "https://randomuser.me/api/portraits/men/32.jpg";

  const handleSaveBankDetails = () => alert("Bank & Statutory details saved successfully!");
  const handleSaveEmployee = (data) => { console.log("Employee data saved:", data); alert("Employee details saved successfully!"); };
  const handleSaveBankInfo = (data) => { console.log("Bank details saved:", data); setBankDetails(data); emp.bankDetails = data; alert("Bank details saved successfully!"); };
  const handleSaveFamilyInfo = (data) => {
    console.log("Family details saved:", data);
    const updatedFamily = [...familyMembers];
    if (updatedFamily.length > 0) updatedFamily[0] = data;
    else updatedFamily.push(data);
    setFamilyMembers(updatedFamily);
    emp.familyMembers = updatedFamily;
    alert("Family details saved successfully!");
  };
  const handleSaveEducation = (data, index) => {
    console.log("Education details saved:", data);
    const updatedEducation = [...educationDetails];
    if (index !== null && index !== undefined) {
      updatedEducation[index] = { institution: data.institution, course: data.course, years: `${data.startDate} - ${data.endDate}` };
    } else {
      updatedEducation.push({ institution: data.institution, course: data.course, years: `${data.startDate} - ${data.endDate}` });
    }
    setEducationDetails(updatedEducation);
    emp.educationDetails = updatedEducation;
    alert("Education details saved successfully!");
  };
  const handleSaveExperience = (data, index) => {
    console.log("Experience details saved:", data);
    const updatedExperience = [...experienceDetails];
    const yearsStr = `${data.startDate} - ${data.isPresent ? "Present" : data.endDate}`;
    const entry = { company: data.company, role: data.designation, years: yearsStr };
    if (index !== null && index !== undefined) updatedExperience[index] = entry;
    else updatedExperience.push(entry);
    setExperienceDetails(updatedExperience);
    emp.experienceDetails = updatedExperience;
    alert("Experience details saved successfully!");
  };

  const openEducationModal = (index) => { setSelectedEducationIndex(index); setIsEducationModalOpen(true); };
  const openExperienceModal = (index) => { setSelectedExperienceIndex(index); setIsExperienceModalOpen(true); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 rounded-t-xl">
        <button className="flex items-center gap-2 text-base text-gray-600 hover:text-gray-900">
          <span>‹</span> Employee Details
        </button>
        <button onClick={() => setIsBankModalOpen(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          <span>⚙</span> Bank &amp; Statutory
        </button>
      </div>

      <div className="flex gap-6 p-6">
        <div className="w-[400px] flex-shrink-0 space-y-4">
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
            <div className="h-28 bg-gradient-to-r from-orange-400 to-yellow-400 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <Avatar name={emp.name} size="lg" imageUrl={profileImageUrl} />
              </div>
            </div>
            <div className="pt-12 pb-5 px-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg font-semibold text-gray-800">{emp.name}</span>
                <span className="text-green-500 text-sm">●</span>
              </div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">{emp.role}</span>
                <span className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full font-medium">{emp.experience}</span>
              </div>
              <div className="text-left space-y-1.5 mb-4 px-2">
                {[
                  { icon: "🪪", label: "Client ID", value: emp.clientId },
                  { icon: "⭐", label: "Team", value: emp.team },
                  { icon: "📅", label: "Date Of Join", value: emp.dateOfJoin },
                  { icon: "🏢", label: "Report Office", value: emp.reportOffice },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2"><span>{item.icon}</span> {item.label}</span>
                    <span className="text-gray-700 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-1 bg-gray-900 text-white text-sm py-2.5 rounded-lg hover:bg-gray-700 transition-colors">
                  ✎ Edit Info
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 bg-orange-500 text-white text-sm py-2.5 rounded-lg hover:bg-orange-600 transition-colors">
                  ✉ Message
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-700">Basic Information</span>
              <span className="text-gray-400 text-sm cursor-pointer">✎</span>
            </div>
            <div className="space-y-1">
              {[
                { icon: "📞 Phone", label: "Phone", value: emp.phone },
                { icon: "✉ Email", label: "Email", value: emp.email },
                { icon: "⚧ Gender", label: "Gender", value: emp.gender },
                { icon: "🎂 Birthday", label: "Birthday", value: emp.birthday },
                { icon: "📍 Address", label: "Address", value: emp.address },
              ].map((item) => <InfoRow key={item.label} icon={item.icon} value={item.value} />)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-700">Personal Information</span>
              <span className="text-gray-400 text-sm cursor-pointer">✎</span>
            </div>
            <div className="space-y-1">
              {[
                { icon: "🪪 Passport No", label: "Passport No", value: emp.passportNo },
                { icon: "📅 Passport Exp Date", label: "Passport Exp Date", value: emp.passportExpDate },
                { icon: "🌍 Nationality", label: "Nationality", value: emp.nationality },
                { icon: "✝ Religion", label: "Religion", value: emp.religion },
                { icon: "💍 Martial status", label: "Marital status", value: emp.maritalStatus },
                { icon: "👤 Employment of spouse", label: "Employment of spouse", value: emp.employmentOfSpouse },
                { icon: "👶 No. of children", label: "No. of children", value: emp.noOfChildren },
              ].map((item) => <InfoRow key={item.label} icon={item.icon} value={item.value} />)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-700">Emergency Contact Number</span>
              <span className="text-gray-400 text-sm cursor-pointer">✎</span>
            </div>
            <div className="space-y-3">
              {emp.emergencyContacts.map((contact) => (
                <div key={contact.type} className="border border-gray-100 rounded-lg p-3.5">
                  <p className="text-xs text-gray-400 mb-1.5">{contact.type}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400">{contact.relation}</span>
                    </div>
                    <span className="text-sm text-gray-600">{contact.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <SectionCard title="About Employee" defaultOpen={true} onEdit={() => setIsEditModalOpen(true)}>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p>As an award winning designer, I deliver exceptional quality work and bring value to your brand! With 10 years of experience and 350+ projects completed worldwide with satisfied customers, I developed the 360° brand approach, which helped me to create numerous brands that are relevant, meaningful and loved.</p>
            </div>
          </SectionCard>

          <SectionCard title="Bank Information" defaultOpen={true} onEdit={() => setIsBankDetailsModalOpen(true)}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Bank Name</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Bank account no</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">IFSC Code</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Branch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 text-sm text-gray-700">{bankDetails.bankName}</td>
                    <td className="py-2.5 px-3 text-sm text-gray-700">{bankDetails.accountNo}</td>
                    <td className="py-2.5 px-3 text-sm text-gray-700">{bankDetails.ifscCode}</td>
                    <td className="py-2.5 px-3 text-sm text-gray-700">{bankDetails.branch}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Family Information" defaultOpen={true} onEdit={() => setIsFamilyModalOpen(true)}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Name</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Relationship</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Date of birth</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {familyMembers.map((member, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 text-sm text-gray-700">{member.name}</td>
                      <td className="py-2.5 px-3 text-sm text-gray-700">{member.relationship}</td>
                      <td className="py-2.5 px-3 text-sm text-gray-700">{member.dateOfBirth}</td>
                      <td className="py-2.5 px-3 text-sm text-gray-700">{member.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="flex gap-4">
            <div className="flex-1">
              <SectionCard title="Education Details" defaultOpen={true} onEdit={() => openEducationModal(0)}>
                <div className="space-y-4">
                  {educationDetails.map((edu, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <p className="text-sm font-medium text-gray-800">{edu.institution}</p>
                      <p className="text-sm font-bold text-gray-900">{edu.years}</p>
                      <p className="text-sm text-gray-600">- {edu.course}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
            <div className="flex-1">
              <SectionCard title="Experience" defaultOpen={true} onEdit={() => openExperienceModal(0)}>
                <div className="space-y-4">
                  {experienceDetails.map((exp, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <p className="text-sm font-semibold text-gray-800">{exp.company}</p>
                      <p className="text-sm text-gray-600 mt-1">• {exp.role}</p>
                      <p className="text-xs text-gray-500 mt-1">{exp.years}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex gap-6 border-b border-gray-100 mb-4">
              {["Projects", "Assets"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 text-base font-medium transition-colors ${activeTab === tab ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === "Projects" && (
              <div className="flex flex-wrap gap-4">
                {emp.projects.map((project) => <ProjectCard key={project.name} project={project} />)}
              </div>
            )}
            {activeTab === "Assets" && (
              <div className="text-center text-gray-400 text-base py-10">No assets assigned yet.</div>
            )}
          </div>
        </div>
      </div>

      <BankStatutoryModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} onSave={handleSaveBankDetails} />
      <EditEmployeeModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveEmployee} employee={emp} />
      <BankDetailsModal isOpen={isBankDetailsModalOpen} onClose={() => setIsBankDetailsModalOpen(false)} onSave={handleSaveBankInfo} bankData={bankDetails} />
      <FamilyDetailsModal isOpen={isFamilyModalOpen} onClose={() => setIsFamilyModalOpen(false)} onSave={handleSaveFamilyInfo} familyData={familyMembers[0]} />
      <EducationModal isOpen={isEducationModalOpen} onClose={() => setIsEducationModalOpen(false)} onSave={handleSaveEducation} educationData={selectedEducationIndex !== null ? educationDetails[selectedEducationIndex] : null} index={selectedEducationIndex} />
      <ExperienceModal isOpen={isExperienceModalOpen} onClose={() => setIsExperienceModalOpen(false)} onSave={handleSaveExperience} experienceData={selectedExperienceIndex !== null ? experienceDetails[selectedExperienceIndex] : null} index={selectedExperienceIndex} />
    </div>
  );
}