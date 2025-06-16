import "./index.css";
import Chevronleft from "./assets/chevron-left.svg";
import Profile from "./assets/profile.svg";
import Zoom from "./assets/zoom.svg";
import Pen from "./assets/pen.svg";
import StackScrollSvg from "./assets/StackScrollSvg.svg";
import Reset from "./assets/reset.svg";
import React, { useRef, useState } from "react";
import Graph from "./assets/graph.svg";
import WinLevelSvg from "./assets/WinLevelSvg.svg"
import Monitor from "./assets/monitor.svg";
import Message from "./assets/message.svg";
import Ai from "./assets/ai.svg";
import App from "./App";
import ObjectsManager from "./services/objectsManager";
import dataset from "./utils/TestData.json";
import PatientInstanceData from "./util/PatientInstanceData";
import params from "./params.js";
import Multiselect from "multiselect-react-dropdown";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Loader from "react-js-loader";
import ApiService from "./services/ApiService";
import axios from "axios";
import PanSvg from "./assets/PanSvg.svg";
import ResetSvg from "./assets/ResetSvg.svg";
import CommentsSvg from "./assets/CommentsSvg.svg";
import AiSvg from "./assets/AiSvg.svg"


import {
  init as csToolsInit,
  addTool,
  ToolGroupManager,
  segmentation,
} from "@cornerstonejs/tools";
import * as cornerstoneTools from "@cornerstonejs/tools";
import  SearchSvg from "./assets/SearchSvg.svg"
import { Alert, Tooltip } from "@mui/material";

const { Events: csToolsEnumsEvents } = cornerstoneTools.Enums;
const viewportId = "axialViewport";
const {
  Enums: csToolsEnums,
  AnnotationDisplayTool,
  BrushTool,
  PanTool,
  WindowLevelTool,
  ZoomTool,
  StackScrollTool,
} = cornerstoneTools;

const buttonsArray = [
  {
    icon: SearchSvg,
    label: "Zoom",
  },
  {
    icon: StackScrollSvg,
    label: "Stackscroll",
  },
  {
    icon: WinLevelSvg,
    label: "Win Level",
  },
  {
    icon: PanSvg,
    label: "Pan",
  },
  {
    icon: ResetSvg,
    label: "Reset",
  },
  {
    icon: CommentsSvg,
    label: "Comment",
  },
  {
    icon: AiSvg,
    label: "AI Contour",
  },
];

const Patient = () => {
  const childRef = React.useRef();
  interface DataType {
    patientName: string;
    patientID: string;
    study_instance_uid: string;
    series_instance_uid: string;
  }

  type RTStruct = {
    imageIdValue: string;
    label: string;
    modality: string;
    seriesDate: string;
    studyUId: string;
    value: string;
  };
  const [selectedItem, setSelectItem] = React.useState("");
  const [selectedRTStruct, setSelectRTStruct] = React.useState<RTStruct | null>(
    null
  );
  const [RTStructOptions, setRtStructOptions] = React.useState([]);
  const [isLoading, setisLoading] = React.useState(false);
  const [aiContour, setAiContour] = React.useState(false);
  const [regionData, setregionData] = React.useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [data, setData] = useState<DataType | null>(null);
  const [token, setToken] = useState("");
  const [sourceImages, setSourceImage] = React.useState([]);
  const [selectedStudy, setSelectedStudy] = useState({});
  const [seriesList, setSeriesList] = useState([]);
  const [contourList, setcontourList] = useState([]);
  const [segmentationId, setsegmentationid] = useState("NEW_SEGMENTATION_ID");
  const [selectedValues, setselectedValues] = React.useState([]);
  const multiselector = useRef(null);
  const [selectedRt, setSelectedRt] = useState("");

  const handleButtonClick = (event, label) => {
    if (label === "AI Contour") {
      setAnchorEl(event.currentTarget);
    } else {
      setAnchorEl(null); // Close if not AI
    }
    setSelectItem(label);
  };

  const isTooltipOpen = Boolean(anchorEl);

  async function retrieveSingleImageId(seriesInstanceUID, studyInstanceUID) {
    const patientInstanceData = await PatientInstanceData({
      StudyInstanceUID: studyInstanceUID,
      SeriesInstanceUID: seriesInstanceUID,
      wadoRsRoot: `${params.backendUrl}`,
      thumbNailFlag: true,
    });
    return patientInstanceData;
  }

  // React.useEffect(() => {

  //    }, [selectedStudy]);

  const convertDate = (inputDate) => {
    if (inputDate !== "Unknown") {
      const year = inputDate.substring(0, 4);
      const month = inputDate.substring(4, 6);
      const day = inputDate.substring(6, 8);
      return `${day}/${month}/${year}`;
    } else {
      return "";
    }
  };

  async function fetchSeriesData1(instanceID) {
    let listOfSeries = [];
    //listOfSeries = await ApiService.getDataById('fetchPatientSeriesby',instanceID)
    await ObjectsManager.fetchSeriesData(instanceID).then((series) => {
      listOfSeries = ObjectsManager.processSeriesResults(series);
    });
    listOfSeries.map((data) => {
      return {
        id: data.seriesInstanceUID,
        modality: data.modality,
        seriesDate: data.seriesDate,
        label: data.seriesDescription,
      };
    });

    // setRtStructOptions(options);
    return listOfSeries;
  }

  const fetchContourBasedOnRegion = async (regionId) => {
    let data = await ApiService.getDataById("getContoursByRegionId", regionId);
    try {
      if (data.status == 200) {
        let contourList = data.data.data;
        return contourList;
      } else {
        return;
      }
    } catch (e) {
      console.log(e);
    }
  };
   

  const [ aiContourResponse, setAiContourResponse] = useState({})
  async function OnChangeAIContour(regionId) {
    setAnchorEl(null); 
    setisLoading(true);
    setAiContour(true);
    console.log(selectedRTStruct);

   
      try {
        
        let contours = await fetchContourBasedOnRegion(regionId);
        const organ_names = contours.map((contour) => contour.contoursName);

        const studyUID = selectedRTStruct?.studyUId;
        const seriesUID = selectedRTStruct?.value;

        const payload = {
          organ_names: organ_names,
          url: "https://radinsightai.com:3014",
          study_uid: CTstudId,
          series_uid: CTseriesId,
          patientPath: "Cloud",
        };
        if (window.ReactNativeWebView?.postMessage) {
          window.ReactNativeWebView.postMessage(
            `✅ Ai contouring called with payload ${JSON.stringify(payload)}`
          );
        }
        // https://145d4e2987022.notebooks.jarvislabs.net/run-segmentation/
                try {
                  

                 
                  const response = await axios.post(
                    "https://radinsightai.com:3011/run-segmentation/",
                    payload,
                    {
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  if(response) {
                    setAiContourResponse({
                      sopId:response.data.sopid,
                      studyid:CTstudId,
                      seriesid:CTseriesId
                    })
                  }

                  //  {"data":{"status":"success","sopid":"1.2.826.0.1.3680043.8.498.28994349077073933684529291291330469182","organ_names":["Left Eye","RightParotid","LeftParotid","Right Eye","SpinalCord","Lips","Brainstem","BoneMandible","Larynx","Brain","OralCavity","Body"],"elapsed_time":1418.76},"status":200,"statusText":"","headers":{"content-length":"270","content-type":"application/json"},"config":{"transitional":{"silentJSONParsing":true,"forcedJSONParsing":true,"clarifyTimeoutError":false},"adapter":["xhr","http","fetch"],"transformRequest":[null],"transformResponse":[null],"timeout":0,"xsrfCookieName":"XSRF-TOKEN","xsrfHeaderName":"X-XSRF-TOKEN","maxContentLength":-1,"maxBodyLength":-1,"env":{},"headers":{"Accept":"application/json, text/plain, */*","Content-Type":"application/json"},"method":"post","url":"https://radinsightai.com:3011/run-segmentation/","data":"{\"organ_names\":[\"Left Eye\",\"RightParotid\",\"LeftParotid\",\"Right Eye\",\"SpinalCord\",\"Lips\",\"Brainstem\",\"BoneMandible\",\"Larynx\",\"Brain\",\"OralCavity\"],\"url\":\"https://radinsightai.com:3014\",\"study_uid\":\"1.3.12.2.1107.5.1.4.153767.30000025011705125742100000040\",\"series_uid\":\"1.3.12.2.1107.5.1.4.153767.30000025011704484345000005908\",\"patientPath\":\"Cloud\"}","allowAbsoluteUrls":true},"request":{}}
                 
                  console.log(response)
                  

                  // ✅ Refresh the page after success
                  if (response && window.ReactNativeWebView?.postMessage) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(response));
                   
                    console.log("Segmentation response:", response.data);
                  }
                } catch (e) {
                  console.log(e);
                  if (window.ReactNativeWebView?.postMessage) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(e));
                  }
                } finally {
                 // window.location.reload();
                  // setisLoading(false);
                  // setAiContour(false)
                  fetchDataAsync()
                }
      } catch (error) {
        window.ReactNativeWebView.postMessage(
          `Unable to get response from backend server ${error}`
        );
        console.error("Request failed:", error);
      }
    
    //props.RunAIContour(e)
    //props.setRegion(e.value);
  }

  async function fetchThumbNailImages(seriesList) {
   
    
     
    let options = [];
    for (let index = 0; index < seriesList?.length; index++) {
      const seriesModality = seriesList[index]?.modality.toString();
      let patientMetadata = await retrieveSingleImageId(
        seriesList[index]?.seriesInstanceUID,
        seriesList[index]?.studyInstanceUID
      );
      const seriesDate = seriesList[index]?.seriesDate.toString();
      const imageId = patientMetadata.imageIds[0];
      if (seriesModality === "RTSTRUCT") {
        options = await populateThumbnailInfo(
          index,
          seriesModality,
          seriesModality,
          patientMetadata.date,
          true,
          imageId,
          patientMetadata.rtstructLabel,
          patientMetadata.time,
          seriesList
        );

        if (options) {
            if (window.ReactNativeWebView?.postMessage) {
              window.ReactNativeWebView?.postMessage(JSON.stringify(options))
            }
          setRtStructOptions(options);
         
        }
        


      }
    }
    console.log("struturedata", options);

    
     return true;
    //  setRTStructuresSetOptions(options);
  }

  async function populateThumbnailInfo(
    index,
    seriesModality,
    imagesrc,
    seriesDate,
    nonCTSeries,
    imageIdUrl,
    rtstructLabel,
    time,
    seriesList
  ) {
    const seriesUId = seriesList[index]?.seriesInstanceUID?.toString();
    const seriesDesc = seriesList[index]?.seriesDescription?.toString();
    const studyUId = seriesList[index]?.studyInstanceUID?.toString();
    let resultIds = imageIdUrl.split("/");

    sourceImages.push({
      id: seriesUId,
      src: imagesrc,
      imgDesc: seriesDesc,
      imageVisible: nonCTSeries,
      modality: seriesModality,
      seriesDate: convertDate(seriesDate),
      imageUrlValue: resultIds[8],
      label: rtstructLabel,
      studyUId: studyUId,
    });

    // Filter out images where imageVisible is false
    const filteredImages = sourceImages.filter((image) => image.imageVisible);

    const options = filteredImages.map((image) => ({
      label: image.label, // or any other property you want to use as label
      value: image.id,
      imageIdValue: image.imageUrlValue,
      seriesDate: seriesDate,
      modality: image.modality,
      studyUId: studyUId,
      // or any other property you want to use as value
    }));

    if (options.length > 0) {
      //sethasRtSructure(true);
    }

    return options;
  }

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        console.log("📥 Received from React Native:", event.data);

        // Send acknowledgement back to React Native
        if (window.ReactNativeWebView?.postMessage) {
          window.ReactNativeWebView.postMessage("✅ Data received in WebView");
        }

        const receivedData = JSON.parse(event.data);
        console.log("Parsed data:", receivedData);
        console.log("Token:", receivedData?.token);

        if (receivedData) {
          setisLoading(true);
          setData(receivedData);
          setToken(receivedData.token);
        }
      } catch (error) {
        console.error("❌ Error parsing received data", error);
      }
    };

    // Android uses 'message' on document; iOS uses 'message' on window
    window.addEventListener("message", handleMessage);
    document.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("message", handleMessage);
    };
  }, []);

  // Dependency array remains empty to run only on mount

  React.useEffect(() => {
    const fetchRegionList = async () => {
      try {
        let data = await ApiService.getData("regions", token);
        // let data = await axios.get(APPCONFIG.HOST + "regions", config);
        if (data.status == 200) {
          let regionList = data.data.data;
          let reversedRegionList = [];
          for (let i = regionList.length - 1; i >= 0; i--) {
            reversedRegionList.push(regionList[i]);
          }
          setregionData(reversedRegionList);
        } else {
          return;
        }
      } catch (error) {
        // toast.error(error, {
        //   position: "bottom-right",
        //   autoClose: 1000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        //   theme: "dark",
        // });
      }
    };
    fetchRegionList();
  }, [token]);

  const [CTstudId, setStudyId] = useState("");
  const [CTseriesId, setSeriesId] = useState("");


   const fetchDataAsync = async () => {
      try {
        setisLoading(true)
        const series = await fetchSeriesData1(dataset?.study_instance_uid);
        setStudyId(dataset?.study_instance_uid);
        setSeriesId(dataset?.series_instance_uid);
        if (window.ReactNativeWebView?.postMessage) {
          window.ReactNativeWebView.postMessage(
            `StudyId ${data.study_instance_uid},SeriesId ${data.series_instance_uid}`
          );
        }

        if (series) {
          setSeriesList(series);
        const fetchingImages =   await fetchThumbNailImages(series);
        if(fetchingImages){
          setTimeout(()=>{

            setisLoading(false)
          },3000)
           
        }
        }
      } catch (error) {
        console.error("Error fetching series data:", error);
      }
    };
  React.useEffect(() => {
    if (!dataset) return; // Prevent calling if data is not set
   

    fetchDataAsync(); // Call the async function inside useEffect
  }, [dataset]);

  React.useEffect(() => {
    if (contourList.length) {
      const data = contourList.map((contour) => contour.index);
      setselectedValues(data);
      setisLoading(false);
    }
  }, [contourList]);

 
  React.useEffect(() => {
    if (RTStructOptions.length) {
      setSelectedRt(RTStructOptions[0].value);
      setSelectRTStruct(RTStructOptions[0]);

    }
  }, [RTStructOptions]);

  const handleSelectedValue = (e) => {
    setisLoading(true);
    setSelectedRt(e.value);
    setSelectRTStruct(e);
  };

  const SetSegmentVisiblity = (index, checked) => {
    segmentation.config.visibility.setSegmentIndexVisibility(
      viewportId,
      {
        segmentationId: segmentationId,
        type: csToolsEnums.SegmentationRepresentations.Contour,
      },
      index,
      checked
    );
    let getsegmentdata =
      segmentation.config.visibility.getSegmentIndexVisibility(
        viewportId,
        {
          segmentationId: segmentationId,
          type: csToolsEnums.SegmentationRepresentations.Contour,
        },
        9
      );
  };

  const Coloroptions = [
    { name: "Red Option", id: 1, color: "red" },
    { name: "Green Option", id: 2, color: "green" },
    { name: "Blue Option", id: 3, color: "blue" },
    { name: "Yellow Option", id: 4, color: "yellow" },
  ];

  const handleChange = (event) => {
    const { value } = event.target; // New array of selected values

    setselectedValues(value); // Update state
  };

  const handleItemClick = (event, index) => {
    const isChecked =
      event.target.checked !== undefined
        ? event.target.checked
        : !selectedValues.includes(index);

    console.log("Selected Index:", index);
    console.log("Checked:", isChecked);

    SetSegmentVisiblity(index, isChecked);
  };

  // const handleChange = (event) => {
  //   debugger;
  //   const {
  //     target: { value },
  //   } = event;
  //   setselectedValues(
  //     // On autofill we get a stringified value.
  //     value
  //   );
  //   value.map
  //   ((data)=>
  //      SetSegmentVisiblity(data)
  //   )
  // };

  const handleGoBack = () => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage("goBack");
    }
    // Manually trigger the popstate event to make sure it works
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const [time,setTime] = useState(0);

  React.useEffect(() => {
    let timerId;

    if (isLoading) {
      setTime(0); // reset timer
      timerId = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerId); // clear timer when loading changes or unmounts
  }, [isLoading]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        height: "100vh",
      }}
    >
      {isLoading && (
        <div className="loader-wrapper">
          <div className="loader-opacity-wrapper">
          {aiContour ? <div
              style={{
                position: "fixed",
                top: "20%",
                left: "13%",
                color: "#fc6614",
                display: "flex",
                gap: "8px",
                fontSize: "medium",
              }}
            >
              <span>
                AI Contouring is running...
              </span>
              <span style={{ color: "white" }}>{time} seconds</span>
            </div>
            :""}
          </div>
          
          <div className="loader-container">
            <Loader
              type="spinner-cub"
              //bgColor={""}
              color={"black"}
              // title={"Loading scan details"}
              size={50}
            />
          </div>
        </div>
      )}
      <div className="container">
        <div className="heading">
          {/* <div className="patientInfo"> */}
          {/* <span className="icon">
            <img
              src={Profile}
              style={{
                height: "22.5px",
                width: "20px",
              }}
            />
          
          </span> */}
          <span className="text">
            {/* <div className="Name">{data?.patientName}</div> */}
            <div className="uhid">UHID:{data?.patientID}</div>
            {/* <div className="uhid">{data ? JSON.stringify(data) : "nodata"}</div> */}
          </span>
        </div>
        <div className="imageBox">
          <App
            patientData={dataset}
            RTStructOptions={RTStructOptions}
            setcontourList={setcontourList}
            selecteButton={selectedItem}
            setsegmentationid={setsegmentationid}
            currentsegmentationId={segmentationId}
            selectedRT={selectedRt}
            selectedRTStruct={selectedRTStruct}
            setisLoading={setisLoading}
            aiContouringData = {aiContourResponse}
            ref={childRef}
          />
        </div>


        <div className="buttons">
          {buttonsArray.map((data, index) => (
            <div>

            
            <button
              key={index}
              className={`button ${
                selectedItem === data.label ? "selected" : ""
              }`}
              onClick={(e) => handleButtonClick(e, data.label)}
            >
              <img
                src={data.icon}
                alt={data.label}
                key={index}
                className="buttonIcons"
              />
            </button>
            <p style={{fontSize:"8px",display: "flex",justifyContent: "center",marginTop:"0.5vh",color:"#7AA8CC"}}>{data.label}</p>
            </div>
          ))}
        </div>

         <div className="dropdowns">
          <label className="label">RTStructureSets</label>
          <div className="drops">
            <Select
              sx={{ color: "white", fontSize: "14px" }}
              value={selectedRt}
              //onChange={handleSelectedValue}
              className="dropItems"
              MenuProps={{
                disableScrollLock: true, // Prevents layout shift
              }}
            >
             {RTStructOptions.length > 0 ? (
                RTStructOptions.map((option, index) => (
                  <MenuItem
                    key={option.value || index} // Use option.value as key if unique
                    value={option.value}
                    onClick={() => handleSelectedValue(option)}
                  >
                    {option.label}
                  </MenuItem>
                ))
              ) : (
                <MenuItem className="dropItems" disabled>No options available</MenuItem>
              )}

            </Select>

            <Select
              className="dropItems"
              labelId="demo-multiple-checkbox-label"
              id="demo-multiple-checkbox"
              multiple
              value={selectedValues}
              onChange={handleChange}
              // input={<OutlinedInput label="Tag" />}
              renderValue={() => null}
              MenuProps={{
                disableScrollLock: true, // Prevents layout shift
              }}
            >
              {/* <MenuItem value="" disabled>
               Contours {/* Placeholder */}
              {/* </MenuItem> */}
              {contourList.map((data, index) => (
                <MenuItem
                  key={index}
                  value={data.index}
                  className="multiOptions"
                >
                  <Checkbox
                    checked={selectedValues.includes(data.index)}
                    onClick={(event) => handleItemClick(event, data.index)}
                  />
                  <span
                    style={{
                      backgroundColor: data.color,
                      width: "16px",
                      height: "16px",
                      display: "inline-block",
                      borderRadius: "50%",
                      marginRight: "8px",
                    }}
                  ></span>
                  <ListItemText primary={data.name} />
                </MenuItem>
              ))}
            </Select>
            <span
              style={{
                position: "absolute",
                top: "53%",
                left: "57%",

                pointerEvents: "none",
                fontWeight: "400",
                fontSize: "14px",
                color: "white",
              }}
            >
              Contours
            </span>

            {/* <select className="dropItems">
            {contourList.map((option, index) => (
                <option key={option.index} value={option.name}>
                  {option.name}
                </option>
              ))} 
            </select> */}
          </div>
        </div>
        {isTooltipOpen && (
          <>
            <div
              style={{
                position: "absolute",
                //top: anchorEl?.getBoundingClientRect().bottom + window.scrollY + 5,
                //left: anchorEl?.getBoundingClientRect().left + window.scrollX -100,
                background: "black",
                boxShadow: "0 0 10px rgba(0,0,0,0.15)",
                padding: "10px[",
                borderRadius: "6px",
                zIndex: 1000,
                top: `calc(85vh - ${regionData.length * 3}vh)`,
                left: "57vw",
                width: "17vw !important",
                overflow: "auto",
              }}
            >
              {regionData.map((data, index) => (
                <MenuItem
                  key={index}
                  onClick={() => OnChangeAIContour(data?.regionId)}
                  style={{ color: "white" }}
                  // sx={{width:'17vw'}} // ✅ Only the text color is white
                >
                  {data?.regionName}
                </MenuItem>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Patient;
