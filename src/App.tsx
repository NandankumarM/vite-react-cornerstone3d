import React, { useEffect, useRef, useState } from "react";
import dcmjs from "dcmjs";
// import createImageIdsAndCacheMetaData from "./lib/createImageIdsAndCacheMetaData";
import loadRTStruct from "./utils/LoadRTStruct";
import {
  RenderingEngine,
  Enums,
  Types,
  volumeLoader,
} from "@cornerstonejs/core";
import { init as csRenderInit, geometryLoader } from "@cornerstonejs/core";
import { init as csToolsInit, addTool, ToolGroupManager } from "@cornerstonejs/tools";
import * as cornerstoneTools from "@cornerstonejs/tools";
import * as cornerstoneDicomImageLoader from "@cornerstonejs/dicom-image-loader";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import ObjectsManager from "./services/objectsManager";
import PatientDetails from "./DicomViewer";
import Patient from "./patient";
import { viewport } from "@cornerstonejs/tools/utilities";
import { Dialog ,DialogTitle,DialogContent,FormControlLabel,Radio,RadioGroup,FormControl,DialogActions, Button} from "@mui/material";
import Textarea from '@mui/joy/Textarea';
import {getEnabledElement,
  getRenderingEngine,
} from "@cornerstonejs/core";
import params from "./params.js"
import createImageIdsAndCacheMetaData from "./util/createImageIdsAndCacheMetaData.js"
//volumeLoader.registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);

const { Events: csToolsEnumsEvents } = cornerstoneTools.Enums;
const renderingEngineId = "mprRenderingEngine";
const { wadouri } = cornerstoneDicomImageLoader;
const volumeLoaderScheme = "cornerstoneStreamingImageVolume";
const volumeId = `${volumeLoaderScheme}:CT_VOLUME_ID`;
const segmentationId = "NEW_SEGMENTATION_ID";
 // Create and configure ToolGroup
 const toolGroupId = "mprToolGroup";
 
 const DEFAULT_SEGMENTATION_CONFIG = {
  fillAlpha: 0.5,
  //fillAlphaInactive: 0.3,
  outlineOpacity: 1,
  //outlineOpacityInactive: 0.85,
  outlineWidthActive: 2.4,
  //outlineWidthInactive: 2.4,
  //outlineDashActive: undefined,
  //outlineDashInactive: undefined,
  renderFill: false,
};

const {
  Enums: csToolsEnums,
  WindowLevelTool,
  ZoomTool,
  StackScrollTool,
  PanTool,
  segmentation
} = cornerstoneTools;

function App(props) {
  const axialRef = useRef(null);  
  const running = useRef(false);
  const [ids,setIDs] = useState('')
  const[windowLevelWidth,setwindowLevelWidth] = useState(0);
  const[windowLevelCenter,setwindowLevelCenter] = useState(0);
  const stackScroll = useRef(null);
  const[ScrollSliceIndex, setScrollSliceIndex] = useState(0);
  const[YAXIS,setYAXIS] = useState('');
  const [viewType, setViewType] = useState("stackview");
  const [TotalScrollIndex, setTotalScrollIndex] = useState(0);
  const [labelsArray, setLabelsArray] = useState([]);
 

  

   // Add mouse click and scroll event listeners
    const handleMouseClick = (event) => {
      // Handle mouse click event for window level changes
      const viewports = getRenderingEngine(renderingEngineId);
      console.log(viewports);
      const viewportElement = viewports.getViewport('axialViewport').element;
      // console.log('viewport from render', viewports._viewports);
      // const viewPortIds = Array.from(viewports._viewports.values()).map(item => item.element);
      // //Get the current window level settings
      // viewPortIds.forEach((element) => {
        const enabledElement = getEnabledElement(viewportElement);
        console.log("Mouse Clicked for Window Level", event);
        const voiDetails = enabledElement.viewport?.getProperties().voiRange;
        console.log(viewportElement + " width " + voiDetails?.lower);
        console.log(viewportElement + " center " + voiDetails?.upper);
        setwindowLevelWidth(Math.round(voiDetails?.lower));
        setwindowLevelCenter(Math.round(voiDetails?.upper));
      // });
    };

    function Reset() {
      // cornerstoneTools.clearToolState(viewports[0].element, cornerstoneTools.BidirectionalTool.toolName);
      // cornerstone.updateImage(viewports[0].element);
      //cornerstoneTools.destroy();
      // const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
      const renderingEngine = getRenderingEngine(renderingEngineId);
      //var viewports = getViewportsWithVolumeId(volumeId, renderingEngineId);
      // Get the volume actor from the viewport
     
          const viewport = renderingEngine.getViewport("axialViewport");
          const resetPan = true;
          const resetZoom = true;
          const resetToCenter = true;
          const storeAsInitialCamera = true;
  
          if (viewport) {
            viewport.resetCamera(
             {
              resetPan,
              resetZoom,
              resetToCenter,
              storeAsInitialCamera,
             }
            );
            viewport.render();
          }
        
      
      SetWindowlevel(239, -160)
  
      //clearAllToolData(viewports[0].element)
      //cornerstoneTools.removeTool(LengthTool,viewports[0].element);
    }

    async function RunAIContour() {
      
    }


    // useEffect(()=>{
    //   if(props.aiContouringData){
    //   importSegmentation(
    //     props.aiContouringData.sopId,
    //     props.aiContouringData.seriesid,
    //     props.aiContouringData.studyid
    //   );

    //   }
    // })
    const Setscrollconfigvalue = () => {
      
      const viewports = getRenderingEngine(renderingEngineId);
      const viewportElement = viewports.getViewport('axialViewport').element

      console.log('viewport from render', viewportElement);
      // const viewPortIds = Array.from(viewports._viewports.values()).map(item => item.element);
      // viewPortIds.forEach((element) => {
        let enabledElement = getEnabledElement(viewportElement);
        if (viewType === 'mprview') {
          enabledElement = getEnabledElement(viewportElement);
        }
  
        const Slice = enabledElement.viewport.getSliceIndex();
        console.log('enabledviewport Slice data ,', Slice);
        console.log('enabledviewport ,', enabledElement.viewport.getProperties());
        // debugger;
        //const YAXISArray = enabledElement.viewport.getCamera();
        const YAXISArray = enabledElement.viewport.getCamera();
        console.log("camera ", YAXISArray);
        const YAXIS = YAXISArray.focalPoint[2];
        const absoluteValue = Math.abs(YAXIS);
        const fixedValue = absoluteValue.toFixed(2);
        const substringValue = fixedValue.substring(0, 5); // '19.63'
        setScrollSliceIndex(Slice + 1);
        setYAXIS(substringValue);
      // });
    }

    async function SetWindowlevel(windowWidth, windowCenter) {
      // const renderingEngine = getRenderingEngine(renderingEngineId);
      // var viewports = getViewportsWithVolumeId(volumeId, renderingEngineId);
      const renderingEngine = getRenderingEngine(renderingEngineId);
      console.log(renderingEngine);
      // console.log('viewport from render', renderingEngine._viewports);
      //  const viewPortIds = Array.from(renderingEngine._viewports.values()).map(item => item.id);
      // console.log(renderingEngine);
      // console.log('viewport from render', renderingEngine._viewports);
      //const viewPortIds = Array.from(viewports).map(item => item.id);
      //const voiDetails = enabledElement.viewport.voiRange;
      setwindowLevelWidth(windowCenter);
      setwindowLevelCenter(windowWidth);
    
        const viewport = 
          renderingEngine.getViewport("axialViewport");

          viewport.reset(true);
      
        // Set a range to highlight bones
        //viewport.setProperties({ voiRange: { upper: windowWidth, lower: windowCenter } });
  
        viewport.render();
      
      // await setVolumesForViewports(
      //   renderingEngine,
      //   [
      //     {
      //       volumeId,
      //       callback: ({ volumeActor }) => {
      //         volumeActor
      //           .getProperty()
      //           .getRGBTransferFunction(0)
      //           .setMappingRange(windowWidth, windowCenter);
      //       },
      //     },
      //   ],
      //   viewPortIds
      // );
  
      //renderingEngine.renderViewports(viewPortIds);
    }

    React.useEffect(() => {
      const divElement = stackScroll.current;
      const handleScroll = () => {
        // Handle scroll event for window level changes
        // Get the current window level settings
        Setscrollconfigvalue();
      };
   
      // Attach the click event listener
      if (divElement) {
        // Attach click event listener to the specific div
        divElement.addEventListener('click', handleMouseClick);
        divElement.addEventListener('touchstart', handleMouseClick);
        divElement.addEventListener('wheel', handleScroll)
        divElement.addEventListener('touchmove', handleScroll); 
      }
  
      // Cleanup event listener on component unmount
      return () => {
        if (divElement) {
          divElement.removeEventListener('click', handleMouseClick);
          divElement.removeEventListener('touchstart', handleMouseClick);
          divElement.addEventListener('wheel', handleScroll)
          divElement.addEventListener('touchmove', handleScroll); 
        }
      };
    }, []);
   
    const getInstanceValue = (url) => {
      const parts = url.split("/");
      const instanceIndex = parts.indexOf("instances");
      return instanceIndex !== -1 ? parts[instanceIndex + 1] : null;
    };

    const compareInstanceUIDs = (a, b) => {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aValue = aParts[i] || 0;
        const bValue = bParts[i] || 0;

        if (aValue !== bValue) {
          return aValue - bValue;
        }
      }
      
      return 0;
    };

    const getLabels = (position, view) => {
      const labels = { top: '', bottom: '', left: '', right: '' };

      if (position === 'HFS') {
        if (view === 'axial') {
          labels.top = 'A';
          labels.bottom = 'P';
          labels.left = 'R';
          labels.right = 'L';
        } else if (view === 'sagittal') {
          labels.top = 'S';
          labels.bottom = 'I';
          labels.left = 'A';
          labels.right = 'P';
        } else if (view === 'coronal') {
          labels.top = 'S';
          labels.bottom = 'I';
          labels.left = 'R';
          labels.right = 'L';
        }
      } else if (position === 'FFS') {
        if (view === 'axial') {
          labels.top = 'P';
          labels.bottom = 'A';
          labels.left = 'R';
          labels.right = 'L';
        } else if (view === 'sagittal') {
          labels.top = 'I';
          labels.bottom = 'S';
          labels.left = 'A';
          labels.right = 'P';
        } else if (view === 'coronal') {
          labels.top = 'I';
          labels.bottom = 'S';
          labels.left = 'R';
          labels.right = 'L';
        }
      }
      return labels;
    }
 
  const setup = async (studyId:string,seriesId:string) => {
  //   if (running.current) {
  //     return;
  //   }
  //  running.current = true;

    // Initialize Core and Tools
    await csRenderInit();
    await csToolsInit();
    dicomImageLoaderInit({ maxWebWorkers: 1 });

    // Add and configure Crosshairs Tool
    //addTool(BrushTool);
    addTool(StackScrollTool);
    addTool(ZoomTool);
    addTool(WindowLevelTool);
    addTool(PanTool)

    // Fetch Cornerstone imageIds and metadata
    // const imageIds = await createImageIdsAndCacheMetaData({
    //   StudyInstanceUID:
    //     "1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463",
    //   SeriesInstanceUID:
    //     "1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561",
    //   wadoRsRoot: "https://d3t6nz73ql33tx.cloudfront.net/dicomweb",
    // });

   // const {study_instance_uid,series_instance_uid} = params
    
   
    const {imageIds ,patientPosition} = await createImageIdsAndCacheMetaData({
      StudyInstanceUID:studyId,
     //"1.2.840.113619.2.290.3.2831157764.91.1718322867.247",
   
      SeriesInstanceUID:seriesId,
      //"1.2.840.113619.2.290.3.2831157764.91.1718322867.251.3",
      //"1.2.246.352.205.5526048065145736042.11151684161370865538",
   
     //   "1.2.840.113619.2.290.3.2831157764.250.1535507756.914.3",
      wadoRsRoot: "https://radinsightai.com:3014",
    });

    const sortedArray = [...imageIds].sort((a, b) => {
      const instanceA = getInstanceValue(a);
      const instanceB = getInstanceValue(b);
    
      return compareInstanceUIDs(instanceA, instanceB);
    });
    if(sortedArray){
      setTotalScrollIndex(sortedArray.length);
      
    }

    setIDs(studyId);
    

   
 
    // Create the rendering engine
    const renderingEngineId = "mprRenderingEngine";
    const renderingEngine = new RenderingEngine(renderingEngineId);
   console.log(renderingEngine.getViewport("axialviewport"))
    // Volume ID
    const volumeId = "mprStreamingImageVolume";
    const volume = await volumeLoader.createAndCacheVolume(volumeId, {
      imageIds,
    });


    // await addSegmentationToState(
    //   "MY_SEGMENTATION_ID",
    //   csToolsEnums.SegmentationRepresentations.Contour,
    //   toolGroupId
    // );


    // Load the volume data
    await volume.load();

    // Viewport configuration
    const viewports = [
      {
        viewportId: "axialViewport",
        type: Enums.ViewportType.ORTHOGRAPHIC,
        element: axialRef.current,
        defaultOptions: {
          orientation: Enums.OrientationAxis.AXIAL,
        },
      },       
      
    ];

    const newLabelsArray = viewports.map((element) => getLabels(patientPosition, element.defaultOptions.orientation));
    console.log('labels , ', newLabelsArray);
    setLabelsArray(newLabelsArray);
    // Enable viewports
    viewports.forEach((viewportInput) => {
      renderingEngine.enableElement(viewportInput);
    });

    // Set volume for each viewport
    viewports.forEach(({ viewportId }) => {
      const viewport = renderingEngine.getViewport(viewportId) as Types.IVolumeViewport;
      viewport.setVolumes([{ volumeId }]);
      viewport.render();
    });

  
    const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

    toolGroup.addTool(ZoomTool.toolName);
    toolGroup.addTool(WindowLevelTool.toolName);
    toolGroup.addTool(StackScrollTool.toolName);
    toolGroup.addTool(PanTool.toolName);
    

    // Set the tool group for all viewports
    viewports.forEach(({ viewportId }) => {
      toolGroup.addViewport(viewportId, renderingEngineId);
    });

    // Activate the CrosshairsTool
   toolGroup.setToolActive(ZoomTool.toolName, {
     bindings: [{  numTouchPoints: 2  }],
    });

    toolGroup.setToolActive(StackScrollTool.toolName, {
      bindings: [{  numTouchPoints: 3  }],
     });

    let cornerstoneElement = axialRef;
    let content = document.getElementById('content');

   //toolGroup.setToolEnabled(AnnotationDisplayTool.toolName);

   toolGroup.setToolActive(StackScrollTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
  });

  
  cornerstoneElement.current.addEventListener(csToolsEnumsEvents.TOUCH_SWIPE, (evt: Event) => {
    const swiped = document.createElement('p');
    swiped.innerText = `Swiped: ${(evt as CustomEvent).detail.swipe}`;
    content.append(swiped);
    setTimeout(() => {
      swiped.remove();
    }, 1000);
  });

  cornerstoneElement.current.addEventListener(csToolsEnumsEvents.TOUCH_TAP, (evt: Event) => {
    const swiped = document.createElement('p');
    swiped.innerText = `Swiped: ${(evt as CustomEvent).detail.swipe}`;
    content.append(swiped);
    setTimeout(() => {
      swiped.remove();
    }, 1000);
  }); 

 // props.setisLoading(false);

  };

  useEffect(() => {
    console.log("Parent value received in Child:", props.RTStructOptions);
    if (props.RTStructOptions.length > 0) {
      const latestSet = getLatestDate(props.RTStructOptions);
      if (latestSet.modality == 'CT' || latestSet.modality == 'RTSTRUCT') {
        importSegmentation(latestSet.imageIdValue, latestSet.value, latestSet.label, latestSet.studyUId, props.RTStructOptions, props.setcontourList, props.setsegmentationid, props.currentsegmentationId);
      }
      else {
        props.setisLoading(false);
      }
    }
    else {
      props.setisLoading(false);
    }
  }, [props.RTStructOptions])

  

  useEffect(() => {
    
  setup(props?.patientData?.study_instance_uid,props?.patientData?.series_instance_uid);

  },[props.patientData]);

  useEffect(() => {
    if (props.selectedRTStruct) {
      const selectedRTStruct = props.selectedRTStruct;
      if (selectedRTStruct.modality == 'CT' || selectedRTStruct.modality == 'RTSTRUCT') {
        importSegmentation(selectedRTStruct.imageIdValue, selectedRTStruct.value, selectedRTStruct.label, selectedRTStruct.studyUId, props.RTStructOptions, props.setcontourList, props.setsegmentationid, props.currentsegmentationId);
      }
      else if(props.aiContouringData){
        window.ReactNativeWebView.postMessage(
            ` Ai contouring new Data ${JSON.stringify(props.aiContouringData)}`
          );
        debugger
          importSegmentation(props.aiContouringData.sopId,props.aiContouringData.seriesid , selectedRTStruct.label, props.aiContouringData.studyid, props.RTStructOptions, props.setcontourList, props.setsegmentationid, props.currentsegmentationId);

      }
    }

  }, [props.selectedRTStruct,props.aiContouringData])

  useEffect(()=>{
    if(props.selecteButton === "Zoom"){
      ActiveToolZoom()
    }else if(props.selecteButton === "Stackscroll"){
      ActiveToolStackScroll()
    }else if(props.selecteButton === "Win Level"){
      ActiveToolWindowLevel()
    }
   else if (props.selecteButton === "Pan"){
    ActiveToolPan()
  }else if(props.selecteButton === "Comment"){
      setDialogFlag(true)
    }
    else if(props.selecteButton === "Reset"){
      Reset()
    }
    else if(props.selecteButton === "AI Contour"){
      Reset()
    }

  },[props.selecteButton])

  const addSegmentationToState = async (
    segmentationId,
    representationType,
    toolGroupId
  ) => {
    /** Create a segmentation of the same resolution as the source data */
    const derivedVolume =
      await volumeLoader.createAndCacheDerivedLabelmapVolume(volumeId, {
        volumeId: segmentationId,
      });

    /** Add the segmentations to state */
    segmentation.addSegmentations([
      {
        segmentationId,
        representation: {
          type: representationType,
          data: {
            volumeId: segmentationId,
          },
        },
      },
    ]);

    /** Add the segmentation representation to the toolgroup */
    await segmentation.addSegmentationRepresentations(toolGroupId, [
      {
        segmentationId,
        type: representationType,
      },
    ]);

    return derivedVolume;
  };


  const importSegmentation = async (newState, newId, rtstructLabel, studyUId, RTStructOptions, setcontourList, setsegmentationid, currentsegmentationId) => {
    const studyInstanceUID = studyUId;
    const seriesInstanceUID =
    newId;
    const sOPInstanceUID = newState;
    // sessionStorage.setItem("SelectedStudyInstanceUID", studyInstanceUID);
    // sessionStorage.setItem("SelectedSeriesInstanceUID", seriesInstanceUID);
     try {
      const arrayBuffer = await ObjectsManager.retrieveDicomInstanceData(
        studyInstanceUID,
        seriesInstanceUID,
        sOPInstanceUID
      );
      //loadSegmentation(arrayBuffer);
      await importRT(arrayBuffer, setcontourList, setsegmentationid, currentsegmentationId);
    } catch (e) {
      console.log(e);
      //setIsLoading(false);
    }
  };


  const getLatestDate = (options) => {
    if (!options || options.length === 0) return null;

    // Convert date strings to Date objects and find the object with the latest date
    const latest = options.reduce((latestOption, currentOption) => {
      const latestDate = new Date(latestOption.date);
      const currentDate = new Date(currentOption.date);

      return currentDate > latestDate ? currentOption : latestOption;
    });

    return latest;
  };

  const ActiveToolStackScroll = () => {
     let toolGroup;
     toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
     toolGroup.setToolPassive(ZoomTool.toolName);
     toolGroup.setToolPassive(WindowLevelTool.toolName);
     toolGroup.setToolPassive(PanTool.toolName);
     toolGroup.setToolActive(StackScrollTool.toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
    });
    
  }

  const ActiveToolPan = () => {
    let toolGroup;
    toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    toolGroup.setToolPassive(ZoomTool.toolName);
    toolGroup.setToolPassive(WindowLevelTool.toolName);
    toolGroup.setToolPassive(StackScrollTool.toolName);
    toolGroup.setToolActive(PanTool.toolName, {
     bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
   });
   
 }

  
  const ActiveToolWindowLevel = () => {
  let toolGroup;
  toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
  toolGroup.setToolPassive(ZoomTool.toolName);
  toolGroup.setToolPassive(StackScrollTool.toolName);
  toolGroup.setToolPassive(PanTool.toolName);
  toolGroup.setToolActive(WindowLevelTool.toolName, {
   bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
 });
 
}


const ActiveToolZoom = () => {
let toolGroup;
toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
toolGroup.setToolPassive(StackScrollTool.toolName);
toolGroup.setToolPassive(WindowLevelTool.toolName);
toolGroup.setToolPassive(PanTool.toolName);
toolGroup.setToolActive(ZoomTool.toolName, {
 bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
});

}

  function mapROIContoursToRTStructData(structureSet) {
    return structureSet.ROIContours.map(
      ({ contourPoints, ROINumber, ROIName, colorArray }) => {
        const data = contourPoints.map(({ points, ...rest }) => {
          const newPoints = points.map(({ x, y, z }) => {
            return [x, y, z];
          });
          return {
            ...rest,
            points: newPoints,
          };
        });
        return {
          data,
          id: ROIName || ROINumber,
          segmentIndex: ROINumber,
          color: colorArray,
        };
      }
    );
  }

  const importRT = async (arrayBuffer, setcontourList, setsegmentationid, currentsegmentationId) => {
    ;
    // const file = event.target.files[0];
    // const imageId = wadouri.fileManager.add(file);
    // const dicomFile = await wadouri.loadFileRequest(imageId);
    const dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
    const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
      dicomData.dict
    );
    //dataset.url = imageId;
    dataset._meta = dcmjs.data.DicomMetaDictionary.namifyDataset(
      dicomData.meta
    );
    dataset.AvailableTransferSyntaxUID =
      dataset.AvailableTransferSyntaxUID ||
      dataset._meta.TransferSyntaxUID?.Value?.[0];
    const structureSet = await loadRTStruct(dataset);
    const allRTStructData = mapROIContoursToRTStructData(structureSet);

    const geometryIds = [];
    const promises = allRTStructData.map((contourSet) => {
      const geometryId = contourSet.id;
      geometryIds.push(geometryId);
      return geometryLoader.createAndCacheGeometry(geometryId, {
        type: Enums.GeometryType.CONTOUR,
        geometryData: contourSet,
      });
    });
    await Promise.all(promises);

    let segmentArr = [];
    allRTStructData.map((contourSet) => {
      const geometryId = contourSet.id;

      const { data, id, color, segmentIndex } = contourSet;

      segmentArr.push({
        index: segmentIndex,
        lock: false,
        color: rgbaToHex(color),
        name: id,
        rgbacolor: color,
      });
      //addContourDetail(structureSet.StructureSetLabel, segmentIndex, id, rgbaToHex(color), false);
    });
    //console.log(contourDetailsList);

    setcontourList(segmentArr);

    let segmentationId = structureSet.StructureSetLabel;
    setsegmentationid(segmentationId);

    // type SegmentationPublicInput =
    // {
    //   segmentationId: string;
    //   representation: {
    //     type: csToolsEnums.SegmentationRepresentations.Contour;
    //     data?: RepresentationData;
    //   };
    //   config?: {
    //     segments?: {
    //       [segmentIndex: number]: Partial<Segment>;
    //     };
    //     label?: string;
    //   };
    // };
    let viewportId = "axialViewport";

    if(currentsegmentationId)
      {
    
    //segmentation.removeAllSegmentationRepresentations();
    //segmentation.removeSegmentation(currentsegmentationId);
    //segmentation.state.removeContourRepresentation(viewportId, currentsegmentationId, true);
    //segmentation.removeContourRepresentation(viewportId, currentsegmentationId, true);
    segmentation.removeSegmentationRepresentation(viewportId, {
      segmentationId : currentsegmentationId,
      type : csToolsEnums.SegmentationRepresentations.Contour,
    },
    true
  )
    //segmentation.removeAllSegmentations();
    const segmentRepresentations = segmentation.state.getSegmentationRepresentations(viewportId);
    const getactiveSegmentation = segmentation.activeSegmentation.getActiveSegmentation(viewportId);
    segmentation.state.removeSegmentationRepresentation(viewportId, 
      {
        segmentationId : currentsegmentationId,
        type : csToolsEnums.SegmentationRepresentations.Contour,
      },
    );
  }
  const checksegmentation = segmentation.state.getSegmentation(currentsegmentationId);
  if (checksegmentation != undefined) {
    segmentation.state.removeSegmentation(checksegmentation.segmentationId);
  }
    /** Add the segmentations to state */
    await segmentation.addSegmentations([
      {
        segmentationId : segmentationId,
        representation: {
          type: csToolsEnums.SegmentationRepresentations.Contour,
          data: {
            geometryIds,
          },
        },
        config: {
          segments: segmentArr.reduce((acc, segment) => {
            acc[segment.index] = { 
              color: segment.color, 
              //rgbacolor: segment.rgbacolor,
              label: segment.name,
              locked: segment.lock,
              segmentIndex: segment.index,
              active: segment.lock,
            };
            return acc;
          }, {}),
        }
      },
    ]);

    const segmentTypeInput = {
      segmentationId: segmentationId,
      representation: {
        type: cornerstoneTools.Enums.SegmentationRepresentations.Contour, // Contour segmentation type
      },
      config: {
        segments: segmentArr.reduce((acc, segment) => {
          acc[segment.index] = { 
            color: segment.color, 
            rgbacolor: segment.rgbacolor,
            label: segment.name,
            lock: segment.lock
          };
          return acc;
        }, {}),
        label: segmentationId,
      },
    };
    

    /** Add the segmentation representation to the toolgroup */
    await segmentation.addSegmentationRepresentations(viewportId, [
      {
        segmentationId : segmentationId,
        type : csToolsEnums.SegmentationRepresentations.Contour,
      },
    ]);

    initializeGlobalConfig(segmentationId, viewportId);
    const getactiveSegment = segmentation.activeSegmentation.getActiveSegmentation(viewportId);
      allRTStructData.map((segmentData) => {
        segmentation.config.color.setSegmentIndexColor(viewportId, getactiveSegment.segmentationId,
          segmentData.segmentIndex, segmentData.color);
      })

  };

  function initializeGlobalConfig(segmentationId, viewportId) {
    ;
      // const globalSegmentationConfig = segmentation.config.style.getStyle( {
      //   viewportId: viewportId,
      //   segmentationId: segmentationId,
      //   type: csToolsEnums.SegmentationRepresentations.Contour,
      // });
      segmentation.config.style.setStyle({ type: csToolsEnums.SegmentationRepresentations.Contour }, DEFAULT_SEGMENTATION_CONFIG);
      segmentation.config.style.setStyle(
        {
          viewportId: viewportId,
          segmentationId:segmentationId,
          type: csToolsEnums.SegmentationRepresentations.Contour,
        },
        DEFAULT_SEGMENTATION_CONFIG
      );
    }

    function rgbaToHex(vec3Array) {
      const toHex = (num) => {
        const hex = Math.round(num).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };

      const hexColor = `#${vec3Array
        .map(value => value.toString(16).padStart(2, '0'))
        .join('')}`;

      console.log(hexColor);


      return hexColor;
    }

  // const ImportButtonRT = () => {
  //   const fileInputRef = useRef(null);
  //   return (
  //     <>
  //       <button onClick={() => fileInputRef.current.click()}>Import RT</button>
  //       {/* <input
  //         onChange={importRT}
  //         multiple={false}
  //         ref={fileInputRef}
  //         type="file"
  //         hidden
  //       /> */}
  //     </>
  //   );
  // };

  const[dialogFlag,setDialogFlag] = useState(false);
  const handleClose = () =>{
    setDialogFlag(false)
  }

  const [comment,setComment] = useState('')
  const handleComments = (event) =>{
    setComment(event.target.value)
  }

  return (
    <>
      
    {/* <button onClick={()=> ActiveToolStackScroll()}>stackscroll</button>
    <button onClick={()=> ActiveToolWindowLevel()}>WindowLevel</button>
    <button onClick={()=> ActiveToolZoom()}>Zoom</button> */}
    {/* <ImportButtonRT /> */}
    {/* {JSON.stringify(props.patientData)} */}
  
    {/* <PatientDetails /> */}
    <div
    ref={stackScroll}
    id = "content"
      style={{
        display: "flex",
        flexWrap: "wrap", // Allows wrapping on smaller screens
        justifyContent: "center", // Centers horizontally
        alignItems: "center", // Centers vertically
        gap: "10px",
        padding: "10px",
        width: "100%", // Ensures the container spans full width
        boxSizing: "border-box", // Includes padding in width/height calculations
      }}
    >
      <div
        ref={axialRef}
        style={{
          width: "80vw", // Dynamic width based on viewport width
          height: "80vw", // Matches width dynamically (square shape)
          maxWidth: "400px", // Maximum size for larger devices
          maxHeight: "400px", // Matches max width for square shape
          backgroundColor: "#000",
          flex: "1 1 auto", // Allows resizing proportionally
        }}
      >
          <span
                style={{
                  position: "absolute", // Use absolute positioning for the span
                  bottom: 0, // Align to the bottom
                  right: 0, // Align to the right
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "#A2A2A2",
                  padding: "5px",
                  zIndex: 1,
                  fontSize: 15,
                }}
              >
                {`W : ${windowLevelWidth} L : ${windowLevelCenter}`}
              </span>

              <span
                style={{
                  position: "absolute", // Use absolute positioning for the span
                  bottom: 0, // Align to the bottom
                  left: 0, // Align to the left
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "#A2A2A2",
                  padding: "5px",
                  zIndex: 1,
                  fontSize: 15
                }}
              >
                {`Y : ${YAXIS}`}
              </span>
              <span
                style={{
                  position: "absolute", // Use absolute positioning for the span
                  bottom: 25, // Align to the bottom
                  left: 0, // Align to the right
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "#A2A2A2",
                  padding: "5px",
                  zIndex: 1,
                  fontSize: 15
                }}
              >
                {`I : ${ScrollSliceIndex}/${TotalScrollIndex}`}
              </span>
               {/* Top Label */}
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "#A2A2A2",
                padding: "5px",
                zIndex: 1,
                fontSize: 15,
              }}
            >
              {labelsArray.length >= 1 ? labelsArray[0]?.top : ''}
            </span>

            {/* Bottom Label */}
            <span
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "#A2A2A2",
                padding: "5px",
                zIndex: 1,
                fontSize: 15,
              }}
            >
              {labelsArray.length >= 1 ? labelsArray[0]?.bottom : ''}
            </span>

            {/* Left Label */}
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "#A2A2A2",
                padding: "5px",
                zIndex: 1,
                fontSize: 15,
              }}
            >
              {labelsArray.length >= 1 ? labelsArray[0]?.left : ''}
            </span>
            {/* Right Label */}
            <span
              style={{
                position: "absolute",
                top: "50%",
                right: 0,
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "#A2A2A2",
                padding: "5px",
                zIndex: 1,
                fontSize: 15,
              }}
            >
              {labelsArray.length >= 1 ? labelsArray[0]?.right : ''}
            </span>
      </div>
      <style>{`
        @media (max-width: 768px) {
          div[ref="${axialRef}"] {
            width: 90vw; // For tablet screens, 90% of viewport width
            height: 90vw; // Maintains square shape
          }
        }
  
        @media (max-width: 480px) {
          div[ref="${axialRef}"] {
            width: 100vw; // For mobile screens, 100% of viewport width
            height: 100vw; // Matches the width
          }
        }
      `}</style>
    </div>

    <Dialog open={dialogFlag} onClose={handleClose} >
      <div className="dialogBox">
       <DialogTitle style={{color:"white"}}>Comments</DialogTitle>
        <DialogContent>
        <FormControl>
      <RadioGroup
        aria-labelledby="gender-radio-group"
        name="radio-buttons-group"
        value={comment} // Controlled value
        onChange={handleComments} // Change handler
        style={{color:'white'}}
      >
        <FormControlLabel  value="approved" control={<Radio style={{color:'white'}}/>} label="Approved" />
        <FormControlLabel value="reject" control={<Radio style={{color:'white'}}/>} label="Reject" />
      </RadioGroup>
    </FormControl>
    <Textarea placeholder="Comments" minRows={3} ></Textarea>
  
      <div>
      <button className="dialogButton submitbutton">
        Submit
      </button>
     </div>
      <div>
      <button className="dialogButton cancelButton" onClick={handleClose}>
        Cancel
      </button>
      </div>
     
  

        </DialogContent>

       </div>
       
    </Dialog>
   
    </>
    // <>
    // {/* <Patient/> */}
    // </>
  );
  
  
}

export default App;