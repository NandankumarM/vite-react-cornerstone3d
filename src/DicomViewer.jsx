//import { FaArrowLeft, FaUserCircle } from "react-icons/fa";

const PatientDetails = () => {
  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
        <button className="text-white">
          {/* <FaArrowLeft size={20} /> */}
        </button>
        <h1 className="text-lg font-semibold">Patients Details</h1>
        {/* <FaUserCircle size={24} /> */}
      </div>

      {/* Patient Info */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-medium">Sai Krishna</h2>
        <p className="text-gray-400 text-sm">UHID: KABHK0000242262</p>
      </div>

      {/* DICOM Image Viewer (Placeholder) */}
      <div className="flex justify-center items-center flex-1 p-4">
        <div className="w-full max-w-md h-80 bg-black flex items-center justify-center border border-gray-600">
          <p className="text-gray-500">DICOM Image</p>
        </div>
      </div>

      {/* RT Structure Sets */}
      <div className="p-4">
        <label className="block text-sm text-gray-400 mb-2">RTStructureSets</label>
        <select className="w-full p-2 bg-gray-700 text-white rounded-md">
          <option>CT_1</option>
        </select>

        {/* Color Indicator */}
        <div className="flex items-center gap-2 mt-3">
          <span className="w-4 h-4 bg-green-500 rounded-full"></span>
          <p>Body</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-around p-4 border-t border-gray-700">
        <button className="p-2 bg-orange-500 rounded-md">Button 1</button>
        <button className="p-2 bg-gray-600 rounded-md">Button 2</button>
        <button className="p-2 bg-gray-600 rounded-md">Button 3</button>
      </div>
    </div>
  );
};

export default PatientDetails;
